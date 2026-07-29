/**
 * Address DTOs - اشیاء انتقال داده آدرس‌ها
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsNotEmpty } from 'class-validator';

export class CreateAddressDto {
  @ApiPropertyOptional({ description: 'عنوان آدرس (مثلاً: خانه، محل کار)' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'نام و نام خانوادگی گیرنده' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ description: 'شماره تلفن' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: 'استان' })
  @IsString()
  @IsNotEmpty()
  province: string;

  @ApiProperty({ description: 'شهر' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'آدرس کامل' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiPropertyOptional({ description: 'کد پستی' })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional({ description: 'آدرس پیش‌فرض', default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateAddressDto {
  @ApiPropertyOptional({ description: 'عنوان آدرس' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'نام و نام خانوادگی گیرنده' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ description: 'شماره تلفن' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'استان' })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({ description: 'شهر' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'آدرس کامل' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'کد پستی' })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional({ description: 'آدرس پیش‌فرض' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}