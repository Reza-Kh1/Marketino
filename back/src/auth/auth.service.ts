
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import {
  RegisterDto, LoginDto,
  SendEmailOtpDto, SendPhoneOtpDto,
  VerifyEmailOtpDto, VerifyPhoneOtpDto,
  RegisterSellerOtpDto,
} from './dto/auth.dto';
import { EmailQueueService } from '@/queues/email/email-queue.service';
import { OtpRateService } from '@/queues/email/otp-rate.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailQueue: EmailQueueService,
    private readonly otpRate: OtpRateService,
  ) { }

  private async upsertOtp(contact: string, purpose: 'auth' | 'reset' | 'verify', code: string) {
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    // باطل کردن قبلی‌ها
    await this.prisma.otpCode.updateMany({
      where: { contact, purpose, used: false },
      data: { used: true },
    });
    return this.prisma.otpCode.create({
      data: {
        contact,
        code,
        type: 'email',
        purpose,
        expiresAt,
      },
    });
  }

  // ---- فراموشی رمز: فقط کد ۶ رقمی ----
  async forgotPassword(email: string, lang = 'fa') {
    const normalized = email.toLowerCase().trim();

    // rate limit قبل از هر DB
    await this.otpRate.assertCanSend(normalized, 'reset');

    // یک کوئری: فقط id لازم است؛ وجود/عدم وجود را لو نده
    const user = await this.prisma.user.findUnique({
      where: { email: normalized },
      select: { id: true },
    });

    // پاسخ یکسان (security)
    const publicMsg = { message: 'اگر این ایمیل ثبت شده باشد، کد بازنشانی ارسال می‌شود', expiresIn: 300 };

    if (!user) {
      // برای جلوگیری از email enumeration، cooldown را هم اعمال کنید
      await this.otpRate.markSent(normalized, 'reset');
      return publicMsg;
    }

    const code = this.generateOTP();
    await this.upsertOtp(normalized, 'reset', code);
    await this.emailQueue.enqueueOtp({ to: normalized, code, purpose: 'reset', lang });
    await this.otpRate.markSent(normalized, 'reset');

    return publicMsg;
  }

  /** مرحله ۲: تأیید کد → اجازه تنظیم رمز */
  async verifyResetCode(email: string, code: string) {
    const normalized = email.toLowerCase().trim();

    const otp = await this.prisma.otpCode.findFirst({
      where: {
        contact: normalized,
        code,
        purpose: 'reset',
        used: false,
        expiresAt: { gt: new Date() },
      },
      select: { id: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp) {
      await this.otpRate.registerFailedAttempt(normalized, 'reset');
      throw new BadRequestException('کد نامعتبر یا منقضی شده است');
    }

    await this.otpRate.clearAttempts(normalized, 'reset');
    // کد را هنوز used نمی‌کنیم تا در resetPassword مصرف شود
    // (یا می‌توانید یک ticket کوتاه در Redis بگذارید)
    return { valid: true, message: 'کد تأیید شد؛ رمز جدید را وارد کنید' };
  }

  /** مرحله ۳: تنظیم رمز جدید با همان کد */
  async resetPasswordWithCode(email: string, code: string, newPassword: string) {
    const normalized = email.toLowerCase().trim();

    return this.prisma.$transaction(async (tx) => {
      const otp = await tx.otpCode.findFirst({
        where: {
          contact: normalized,
          code,
          purpose: 'reset',
          used: false,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });
      if (!otp) throw new BadRequestException('کد نامعتبر یا منقضی شده است');

      const user = await tx.user.findUnique({
        where: { email: normalized },
        select: { id: true },
      });
      if (!user) throw new BadRequestException('کاربر یافت نشد');

      const hashed = await bcrypt.hash(newPassword, 12);

      await tx.otpCode.update({ where: { id: otp.id }, data: { used: true } });
      await tx.user.update({
        where: { id: user.id },
        data: {
          password: hashed,
          hasSetPassword: true,
          resetToken: null,
          resetExpires: null,
        },
      });

      return { message: 'رمز عبور با موفقیت تغییر کرد' };
    });
  }

  // ---- وریفای ایمیل (کاربر لاگین‌شده) ----
  async sendVerifyEmail(userId: string, lang = 'fa') {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, emailVerified: true },
    });
    if (!user) throw new BadRequestException('کاربر یافت نشد');
    if (user.emailVerified) return { message: 'ایمیل قبلاً تأیید شده است' };

    const normalized = user.email.toLowerCase().trim();
    await this.otpRate.assertCanSend(normalized, 'verify');

    const code = this.generateOTP();
    await this.upsertOtp(normalized, 'verify', code);
    await this.emailQueue.enqueueOtp({ to: normalized, code, purpose: 'verify', lang });
    await this.otpRate.markSent(normalized, 'verify');

    return { message: 'کد تأیید به ایمیل ارسال شد', expiresIn: 300 };
  }

  async confirmVerifyEmail(userId: string, code: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, emailVerified: true },
    });
    if (!user) throw new BadRequestException('کاربر یافت نشد');
    if (user.emailVerified) return { message: 'قبلاً تأیید شده' };

    const normalized = user.email.toLowerCase().trim();

    const otp = await this.prisma.otpCode.findFirst({
      where: {
        contact: normalized,
        code,
        purpose: 'verify',
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp) {
      await this.otpRate.registerFailedAttempt(normalized, 'verify');
      throw new BadRequestException('کد نامعتبر یا منقضی شده است');
    }

    await this.prisma.$transaction([
      this.prisma.otpCode.update({ where: { id: otp.id }, data: { used: true } }),
      this.prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true, isVerified: true },
      }),
    ]);
    await this.otpRate.clearAttempts(normalized, 'verify');

    return { message: 'ایمیل با موفقیت تأیید شد' };
  }

  async register(dto: RegisterDto) {
    const existingUsername = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });
    if (existingUsername) {
      throw new ConflictException('این نام کاربری قبلاً ثبت شده است');
    }

    const existingEmail = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingEmail) {
      throw new ConflictException('این ایمیل قبلاً ثبت شده است');
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: 'buyer',
        isVerified: false,
        emailVerified: false,
        hasSetPassword: true,
      },
    });

    const token = this.generateToken(user);
    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.login, dto.password);
    if (!user) {
      throw new UnauthorizedException('نام کاربری یا رمز عبور اشتباه است');
    }

    const token = this.generateToken(user);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });
    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  /**
   * اعتبارسنجی کاربر با login (username یا email) و رمز عبور
   */
  async validateUser(login: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: login },
          { email: login },
        ],
      },
      include: {
        store: { select: { slug: true, id: true } }
      }
    });

    if (!user) return null;
    if (!user.password) return null;
    // If user has no hasSetPassword flag but has a password, allow login (legacy support)
    if (!user.isActive) return null;

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return null;

    return user;
  }

  // ============================================
  // 🆕 OTP METHODS
  // ============================================

  /**
   * ارسال کد OTP به ایمیل
   */
  async sendEmailOTP(dto: SendEmailOtpDto, lang = 'fa') {
    const normalized = dto.email.toLowerCase().trim();
    await this.otpRate.assertCanSend(normalized, 'auth');

    const code = this.generateOTP();
    await this.upsertOtp(normalized, 'auth', code);
    await this.emailQueue.enqueueOtp({ to: normalized, code, purpose: 'auth', lang });
    await this.otpRate.markSent(normalized, 'auth');

    return { message: 'کد تأیید به ایمیل شما ارسال شد', expiresIn: 300 };
  }

  /**
   * ارسال کد OTP به شماره تلفن
   */
  async sendPhoneOTP(dto: SendPhoneOtpDto, lang: string = 'fa') {
    const code = this.generateOTP();

    // Clean phone number - remove +98 or 98 prefix
    const cleanPhone = dto.phone.replace(/^(\+98|98)/, '0');

    // Delete any existing OTP for this contact
    await this.prisma.otpCode.deleteMany({
      where: { contact: cleanPhone, type: 'phone' },
    });

    // Create new OTP
    await this.prisma.otpCode.create({
      data: {
        contact: cleanPhone,
        code,
        type: 'phone',
        purpose: 'auth',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    // Send SMS
    // await this.phoneService.sendOTP(cleanPhone, code, lang);

    return { message: 'کد تأیید به شماره شما ارسال شد', expiresIn: 300 };
  }

  /**
   * تأیید OTP ایمیل - ورود یا ثبت‌نام
   */
  async verifyEmailOTP(dto: VerifyEmailOtpDto) {
    // Verify OTP
    const otpRecord = await this.prisma.otpCode.findFirst({
      where: {
        contact: dto.email,
        code: dto.code,
        type: 'email',
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new BadRequestException('کد تأیید نامعتبر یا منقضی شده است');
    }

    // Mark OTP as used
    await this.prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    // Check if user exists
    let user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    let isNewUser = false;

    if (user) {
      // Existing user - update last login
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date(), emailVerified: true },
      });
    } else {
      // New registration
      if (!dto.isRegister) {
        // Auto-register with email-based username
        const username = await this.generateUniqueUsername(dto.email.split('@')[0]);
        user = await this.prisma.user.create({
          data: {
            username,
            email: dto.email,
            firstName: dto.firstName || '',
            lastName: dto.lastName || '',
            password: dto.password ? await bcrypt.hash(dto.password, 12) : null,
            role: dto.role || 'buyer',
            isVerified: true,
            emailVerified: true,
            hasSetPassword: !!dto.password,
          },
        });
        isNewUser = true;
      } else {
        // Explicit registration
        if (!dto.username || !dto.password) {
          throw new BadRequestException('نام کاربری و رمز عبور برای ثبت‌نام الزامی است');
        }

        // Check username uniqueness
        const existingUser = await this.prisma.user.findUnique({
          where: { username: dto.username },
        });
        if (existingUser) {
          throw new ConflictException('این نام کاربری قبلاً ثبت شده است');
        }

        user = await this.prisma.user.create({
          data: {
            username: dto.username,
            email: dto.email,
            password: await bcrypt.hash(dto.password, 12),
            firstName: dto.firstName || '',
            lastName: dto.lastName || '',
            role: dto.role || 'buyer',
            isVerified: true,
            emailVerified: true,
            hasSetPassword: true,
          },
        });
        isNewUser = true;
      }
    }

    const token = this.generateToken(user);
    const { password, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token, isNewUser };
  }

  /**
   * تأیید OTP تلفن - ورود یا ثبت‌نام
   */
  async verifyPhoneOTP(dto: VerifyPhoneOtpDto) {
    const cleanPhone = dto.phone.replace(/^(\+98|98)/, '0');

    const otpRecord = await this.prisma.otpCode.findFirst({
      where: {
        contact: cleanPhone,
        code: dto.code,
        type: 'phone',
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new BadRequestException('کد تأیید نامعتبر یا منقضی شده است');
    }

    await this.prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    // Find user by phone
    let user = await this.prisma.user.findFirst({
      where: { phone: cleanPhone },
    });

    let isNewUser = false;

    if (user) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });
    } else {
      if (!dto.isRegister) {
        // Auto-register
        const username = await this.generateUniqueUsername(`user_${cleanPhone.slice(-6)}`);
        user = await this.prisma.user.create({
          data: {
            username,
            email: `${cleanPhone}@phone.user`,
            phone: cleanPhone,
            firstName: dto.firstName || '',
            lastName: dto.lastName || '',
            password: dto.password ? await bcrypt.hash(dto.password, 12) : null,
            role: dto.role || 'buyer',
            isVerified: true,
            hasSetPassword: !!dto.password,
          },
        });
        isNewUser = true;
      } else {
        if (!dto.username || !dto.password) {
          throw new BadRequestException('نام کاربری و رمز عبور برای ثبت‌نام الزامی است');
        }

        const existingUser = await this.prisma.user.findUnique({
          where: { username: dto.username },
        });
        if (existingUser) {
          throw new ConflictException('این نام کاربری قبلاً ثبت شده است');
        }

        user = await this.prisma.user.create({
          data: {
            username: dto.username,
            email: `${cleanPhone}@phone.user`,
            phone: cleanPhone,
            password: await bcrypt.hash(dto.password, 12),
            firstName: dto.firstName || '',
            lastName: dto.lastName || '',
            role: dto.role || 'buyer',
            isVerified: true,
            hasSetPassword: true,
          },
        });
        isNewUser = true;
      }
    }

    const token = this.generateToken(user);
    const { password, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token, isNewUser };
  }
  /**
   * ورود با Google OAuth
   */
  async validateGoogleUser(googleData: {
    googleId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  }) {
    let user = await this.prisma.user.findUnique({
      where: { googleId: googleData.googleId },
    });

    if (user) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });
      return user;
    }

    user = await this.prisma.user.findUnique({
      where: { email: googleData.email },
    });

    if (user) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: googleData.googleId,
          avatar: user.avatar || googleData.avatar,
          emailVerified: true,
          lastLogin: new Date(),
        },
      });
      return user;
    }

    const username = await this.generateUniqueUsername(
      googleData.firstName || googleData.email.split('@')[0],
    );

    user = await this.prisma.user.create({
      data: {
        username,
        email: googleData.email,
        googleId: googleData.googleId,
        firstName: googleData.firstName,
        lastName: googleData.lastName,
        avatar: googleData.avatar,
        role: 'buyer',
        isVerified: true,
        emailVerified: true,
        hasSetPassword: false,
      },
    });

    return user;
  }

  /**
   * تولید توکن JWT
   */
  private generateToken(user: any): string {
    const payload = { sub: user.id, username: user.username, role: user.role };
    return this.jwtService.sign(payload);
  }

  /**
   * تولید نام کاربری یکتا
   */
  private async generateUniqueUsername(base: string): Promise<string> {
    let username = base.toLowerCase().replace(/[^a-z0-9_]/g, '_').substring(0, 30) || 'user';
    let counter = 1;
    const MAX_ITERATIONS = 1000;

    while (counter <= MAX_ITERATIONS) {
      const existing = await this.prisma.user.findUnique({ where: { username } });
      if (!existing) return username;
      username = `${base.toLowerCase().substring(0, 25)}_${counter}`;
      counter++;
    }

    // Fallback to UUID-based name if all attempts exhausted
    return `user_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
  }

  /**
   * تولید کد OTP ۶ رقمی
   */
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
