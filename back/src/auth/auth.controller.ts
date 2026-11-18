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
  RegisterDto, LoginDto,
  ForgotPasswordDto, ResetPasswordDto,
  SendEmailOtpDto, SendPhoneOtpDto,
  VerifyEmailOtpDto, VerifyPhoneOtpDto,
  RegisterSellerOtpDto,
  VerifyResetCodeDto,
  VerifyEmailDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

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

  // ============================================
  // 🆕 OTP ENDPOINTS
  // ============================================

  /**
   * ارسال کد OTP به ایمیل
   */
  // @Public()
  // @Post('send-email-otp')
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({ summary: 'ارسال کد تأیید به ایمیل' })
  // @ApiBody({ type: SendEmailOtpDto })
  // async sendEmailOTP(@Body() dto: SendEmailOtpDto) {
  //   return this.authService.sendEmailOTP(dto);
  // }

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
  async googleAuth() { }

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

  @Public()
  @Post('forgot-password')
  @ApiOperation({ summary: 'درخواست کد بازیابی رمز عبور', description: 'یک کد ۶ رقمی به ایمیل کاربر ارسال می‌شود.' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 200, description: 'کد بازیابی ارسال شد.' })
  @ApiResponse({ status: 400, description: 'ایمیل نامعتبر است.' })
  @ApiResponse({ status: 429, description: 'تعداد درخواست‌ها بیش از حد مجاز.' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Post('verify-reset-code')
  @ApiOperation({ summary: 'بررسی صحت کد بازیابی', description: 'کد ارسال شده به ایمیل را اعتبارسنجی می‌کند.' })
  @ApiBody({ type: VerifyResetCodeDto })
  @ApiResponse({ status: 200, description: 'کد معتبر است.' })
  @ApiResponse({ status: 400, description: 'کد نامعتبر یا منقضی شده.' })
  @ApiResponse({ status: 429, description: 'تعداد تلاش بیش از حد.' })
  async verifyResetCode(@Body() body: VerifyResetCodeDto) {
    return this.authService.verifyResetCode(body.email, body.code);
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'تنظیم رمز عبور جدید', description: 'با استفاده از کد معتبر، رمز عبور جدید تنظیم می‌شود.' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'رمز عبور با موفقیت تغییر کرد.' })
  @ApiResponse({ status: 400, description: 'کد نامعتبر یا رمز ضعیف.' })
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPasswordWithCode(body.email, body.code, body.newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Post('send-verify-email')
  @ApiOperation({ summary: 'ارسال کد تأیید ایمیل', description: 'برای کاربر لاگین‌شده، کد تأیید به ایمیل ارسال می‌شود.' })
  @ApiResponse({ status: 200, description: 'کد تأیید ارسال شد.' })
  @ApiResponse({ status: 401, description: 'توکن نامعتبر است.' })
  @ApiResponse({ status: 429, description: 'تعداد درخواست بیش از حد.' })
  async sendVerify(@CurrentUser('id') userId: string) {
    return this.authService.sendVerifyEmail(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-email')
  @ApiOperation({ summary: 'تأیید ایمیل با کد', description: 'کد ارسال شده را بررسی و ایمیل را تأیید می‌کند.' })
  @ApiBody({ type: VerifyEmailDto })
  @ApiResponse({ status: 200, description: 'ایمیل تأیید شد.' })
  @ApiResponse({ status: 400, description: 'کد نامعتبر.' })
  @ApiResponse({ status: 401, description: 'توکن نامعتبر است.' })
  async verifyEmail(@CurrentUser('id') userId: string, @Body() body: VerifyEmailDto) {
    return this.authService.confirmVerifyEmail(userId, body.code);
  }
}