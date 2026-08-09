/**
 * AuthController - کنترلر احراز هویت
 * مدیریت ثبت‌نام، ورود، خروج، تغییر رمز و OTP
 */
import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Res,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import {
  RegisterDto, LoginDto, ChangePasswordDto,
  ForgotPasswordDto, ResetPasswordDto,
  SendEmailOtpDto, SendPhoneOtpDto,
  VerifyEmailOtpDto, VerifyPhoneOtpDto,
  RegisterSellerOtpDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * ثبت‌نام کاربر جدید
   */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'ثبت‌نام کاربر جدید' })
  @ApiBody({ type: RegisterDto })
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(dto);
    res.cookie('token-marketino', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    return { success: true, user: result.user, token: result.token };
  }

  /**
   * ورود کاربر
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ورود کاربر' })
  @ApiBody({ type: LoginDto })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto);
    res.cookie('token-marketino', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    return { success: true, user: result.user, token: result.token };
  }

  /**
   * خروج کاربر
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'خروج کاربر' })
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token-marketino', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    return { success: true, message: 'با موفقیت خارج شدید' };
  }

  /**
   * دریافت اطلاعات کاربر فعلی
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'اطلاعات کاربر فعلی' })
  async me(@CurrentUser() user: any) {
    return { success: true, user };
  }

  /**
   * تغییر رمز عبور
   */
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @ApiOperation({ summary: 'تغییر رمز عبور' })
  async changePassword(@CurrentUser('id') userId: string, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(userId, dto);
  }

  /**
   * فراموشی رمز عبور
   */
  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'فراموشی رمز عبور' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  /**
   * بازنشانی رمز عبور
   */
  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'بازنشانی رمز عبور با توکن' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  // ============================================
  // 🆕 OTP ENDPOINTS
  // ============================================

  /**
   * ارسال کد OTP به ایمیل
   */
  @Public()
  @Post('send-email-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ارسال کد تأیید به ایمیل' })
  @ApiBody({ type: SendEmailOtpDto })
  async sendEmailOTP(@Body() dto: SendEmailOtpDto) {
    return this.authService.sendEmailOTP(dto);
  }

  /**
   * ارسال کد OTP به شماره تلفن
   */
  @Public()
  @Post('send-phone-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ارسال کد تأیید به شماره تلفن' })
  @ApiBody({ type: SendPhoneOtpDto })
  async sendPhoneOTP(@Body() dto: SendPhoneOtpDto) {
    return this.authService.sendPhoneOTP(dto);
  }

  /**
   * تأیید OTP ایمیل و ورود/ثبت‌نام
   */
  @Public()
  @Post('verify-email-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'تأیید کد OTP ایمیل و ورود' })
  @ApiBody({ type: VerifyEmailOtpDto })
  async verifyEmailOTP(@Body() dto: VerifyEmailOtpDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.verifyEmailOTP(dto);
    res.cookie('token-marketino', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    return { success: true, user: result.user, isNewUser: result.isNewUser, token: result.token };
  }

  /**
   * تأیید OTP تلفن و ورود/ثبت‌نام
   */
  @Public()
  @Post('verify-phone-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'تأیید کد OTP تلفن و ورود' })
  @ApiBody({ type: VerifyPhoneOtpDto })
  async verifyPhoneOTP(@Body() dto: VerifyPhoneOtpDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.verifyPhoneOTP(dto);
    res.cookie('token-marketino', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    return { success: true, user: result.user, isNewUser: result.isNewUser, token: result.token };
  }

  /**
   * ثبت‌نام فروشنده با OTP
   */
  @Public()
  @Post('register-seller-otp')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'ثبت‌نام فروشنده با کد OTP' })
  @ApiBody({ type: RegisterSellerOtpDto })
  async registerSellerOTP(@Body() dto: RegisterSellerOtpDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.registerSellerOTP(dto);
    res.cookie('token-marketino', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    return { success: true, user: result.user, token: result.token };
  }

  // ============================================
  // GOOGLE OAUTH
  // ============================================

  /**
   * ورود با Google - ریدایرکت به گوگل
   */
  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'ورود با گوگل - ریدایرکت' })
  async googleAuth() {}

  /**
   * Callback گوگل پس از احراز هویت
   */
  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Callback گوگل' })
  async googleAuthRedirect(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req.user as any;
    const token = this.authService['generateToken'](user);

    res.cookie('token-marketino', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    return res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  }
}
