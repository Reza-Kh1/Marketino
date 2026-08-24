/**
 * AuthService - سرویس احراز هویت
 * مدیریت ثبت‌نام، ورود، تغییر رمز، ورود با گوگل و OTP
 */
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { PhoneService } from '../phone/phone.service';
import {
  RegisterDto, LoginDto, ChangePasswordDto,
  SendEmailOtpDto, SendPhoneOtpDto,
  VerifyEmailOtpDto, VerifyPhoneOtpDto,
  RegisterSellerOtpDto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly phoneService: PhoneService,
  ) {}

  /**
   * ثبت‌نام کاربر جدید
   * نام کاربری و ایمیل باید یکتا باشند
   */
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

    // Send welcome email
    this.emailService.sendWelcomeEmail(user.email, user.username, 'fa').catch(() => {});

    const token = this.generateToken(user);
    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  /**
   * ورود کاربر با نام کاربری/ایمیل و رمز عبور
   */
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
  async sendEmailOTP(dto: SendEmailOtpDto, lang: string = 'fa') {
    const code = this.generateOTP();

    // Delete any existing OTP for this contact
    await this.prisma.otpCode.deleteMany({
      where: { contact: dto.email, type: 'email' },
    });

    // Create new OTP
    await this.prisma.otpCode.create({
      data: {
        contact: dto.email,
        code,
        type: 'email',
        purpose: 'auth',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min
      },
    });

    // Send email
    await this.emailService.sendOTPEmail(dto.email, code, lang);

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
    await this.phoneService.sendOTP(cleanPhone, code, lang);

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
        this.emailService.sendWelcomeEmail(user.email, user.username, 'fa').catch(() => {});
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
        this.emailService.sendWelcomeEmail(user.email, user.username, 'fa').catch(() => {});
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
   * تغییر رمز عبور کاربر
   */
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.password) {
      throw new BadRequestException('حساب کاربری رمز عبور ندارد');
    }

    const isOldValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isOldValid) {
      throw new BadRequestException('رمز عبور فعلی اشتباه است');
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(dto.newPassword, salt);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword, hasSetPassword: true },
    });

    return { message: 'رمز عبور با موفقیت تغییر کرد' };
  }

  /**
   * فراموشی رمز عبور - ارسال توکن به ایمیل
   */
  async forgotPassword(email: string, lang: string = 'fa') {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal whether email exists (security best practice)
      return { message: 'اگر این ایمیل در سیستم ثبت شده باشد، لینک بازنشانی ارسال خواهد شد' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetExpires },
    });

    // Send password reset email
    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3001');
    const resetLink = `${frontendUrl}/auth/reset-password?token=${resetToken}`;
    this.emailService.sendPasswordResetEmail(user.email, resetLink, user.username, lang).catch(() => {});

    return { message: 'لینک بازنشانی رمز عبور به ایمیل شما ارسال شد' };
  }

  /**
   * بازنشانی رمز عبور با توکن
   */
  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('توکن نامعتبر یا منقضی شده است');
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetExpires: null,
        hasSetPassword: true,
      },
    });

    return { message: 'رمز عبور با موفقیت بازنشانی شد' };
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
