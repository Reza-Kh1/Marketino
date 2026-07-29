/**
 * RegisterDto - DTO ثبت‌نام کاربر جدید
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { IsString, IsEmail, IsOptional, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ description: 'نام کاربری', example: 'rezakhani', minLength: 3, maxLength: 50 })
  @IsString()
  @MinLength(3, { message: 'نام کاربری باید حداقل ۳ کاراکتر باشد' })
  @MaxLength(50, { message: 'نام کاربری حداکثر ۵۰ کاراکتر است' })
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'نام کاربری فقط شامل حروف انگلیسی، اعداد و زیرخط است' })
  username: string;

  @ApiProperty({ description: 'ایمیل', example: 'reza@example.com' })
  @IsEmail({}, { message: 'فرمت ایمیل نامعتبر است' })
  email: string;

  @ApiProperty({ description: 'رمز عبور', minLength: 6, maxLength: 100 })
  @IsString()
  @MinLength(6, { message: 'رمز عبور باید حداقل ۶ کاراکتر باشد' })
  @MaxLength(100)
  password: string;

  @ApiPropertyOptional({ description: 'نام' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional({ description: 'نام خانوادگی' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;
}

/**
 * LoginDto - DTO ورود کاربر
 */
export class LoginDto {
  @ApiProperty({ description: 'ایمیل یا نام کاربری', example: 'rezakhani' })
  @IsString()
  login: string;

  @ApiProperty({ description: 'رمز عبور' })
  @IsString()
  password: string;
}

/**
 * ChangePasswordDto - DTO تغییر رمز عبور
 */
export class ChangePasswordDto {
  @ApiProperty({ description: 'رمز عبور فعلی' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ description: 'رمز عبور جدید', minLength: 6 })
  @IsString()
  @MinLength(6)
  newPassword: string;
}

/**
 * ForgotPasswordDto - DTO فراموشی رمز عبور
 */
export class ForgotPasswordDto {
  @ApiProperty({ description: 'ایمیل حساب کاربری' })
  @IsEmail()
  email: string;
}

/**
 * ResetPasswordDto - DTO بازنشانی رمز عبور
 */
export class ResetPasswordDto {
  @ApiProperty({ description: 'توکن بازنشانی (ارسال شده به ایمیل)' })
  @IsString()
  token: string;

  @ApiProperty({ description: 'رمز عبور جدید', minLength: 6 })
  @IsString()
  @MinLength(6)
  newPassword: string;
}

/**
 * SendOtpDto - DTO ارسال کد OTP
 */
export class SendOtpDto {
  @ApiProperty({ description: 'ایمیل یا شماره تلفن', example: 'user@example.com' })
  @IsString()
  contact: string;

  @ApiProperty({ description: 'نوع تماس: email یا phone', example: 'email' })
  @IsString()
  @Matches(/^(email|phone)$/, { message: 'نوع باید email یا phone باشد' })
  type: 'email' | 'phone';
}

/**
 * SendEmailOtpDto - DTO ارسال کد به ایمیل
 */
export class SendEmailOtpDto {
  @ApiProperty({ description: 'ایمیل', example: 'user@gmail.com' })
  @IsEmail({}, { message: 'فرمت ایمیل نامعتبر است' })
  email: string;
}

/**
 * SendPhoneOtpDto - DTO ارسال کد به تلفن
 */
export class SendPhoneOtpDto {
  @ApiProperty({ description: 'شماره تلفن', example: '09123456789' })
  @IsString()
  @MinLength(10, { message: 'شماره تلفن نامعتبر است' })
  phone: string;
}

/**
 * VerifyEmailOtpDto - DTO تأیید OTP ایمیل
 */
export class VerifyEmailOtpDto {
  @ApiProperty({ description: 'ایمیل' })
  @IsEmail({}, { message: 'فرمت ایمیل نامعتبر است' })
  email: string;

  @ApiProperty({ description: 'کد ۶ رقمی' })
  @IsString()
  @MinLength(4)
  code: string;

  @ApiPropertyOptional({ description: 'آیا ثبت‌نام جدید است؟' })
  @IsOptional()
  isRegister?: boolean;

  @ApiPropertyOptional({ description: 'نام کاربری (برای ثبت‌نام)' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ description: 'نام' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ description: 'نام خانوادگی' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ description: 'رمز عبور (برای ثبت‌نام)' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({ description: 'نقش کاربر', example: 'buyer' })
  @IsOptional()
  @IsString()
  role?: UserRole;
}

/**
 * VerifyPhoneOtpDto - DTO تأیید OTP تلفن
 */
export class VerifyPhoneOtpDto {
  @ApiProperty({ description: 'شماره تلفن' })
  @IsString()
  @MinLength(10)
  phone: string;

  @ApiProperty({ description: 'کد ۶ رقمی' })
  @IsString()
  @MinLength(4)
  code: string;

  @ApiPropertyOptional({ description: 'آیا ثبت‌نام جدید است؟' })
  @IsOptional()
  isRegister?: boolean;

  @ApiPropertyOptional({ description: 'نام کاربری (برای ثبت‌نام)' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ description: 'نام' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ description: 'نام خانوادگی' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ description: 'رمز عبور (برای ثبت‌نام)' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({ description: 'نقش کاربر', example: 'buyer' })
  @IsOptional()
  @IsString()
  role?: UserRole;
}

/**
 * RegisterSellerOtpDto - DTO ثبت‌نام فروشنده با OTP
 */
export class RegisterSellerOtpDto {
  @ApiPropertyOptional({ description: 'ایمیل' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'شماره تلفن' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'کد تأیید' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'نام کاربری' })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({ description: 'رمز عبور' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'نام' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'نام خانوادگی' })
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'نام فروشگاه' })
  @IsString()
  storeName: string;

  @ApiProperty({ description: 'نوع کسب‌وکار' })
  @IsString()
  businessType: string;
}
