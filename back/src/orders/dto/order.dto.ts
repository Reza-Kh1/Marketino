/**
 * Order DTOs - اشیاء انتقال داده سفارشات
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn, IsUUID, ValidateIf, IsNotEmpty } from 'class-validator';

export class CreateOrderDto {
  @ApiPropertyOptional({
    description: 'شناسه آدرس ذخیره‌شده کاربر (در صورت انتخاب آدرس قبلی)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  addressId?: string;

  @ApiPropertyOptional({
    description: 'نام گیرنده (در صورت عدم انتخاب آدرس قبلی الزامی است)',
    example: 'علی محمدی',
  })
  @ValidateIf((o) => !o.addressId)
  @IsNotEmpty({ message: 'نام گیرنده الزامی است' })
  @IsString()
  shippingName?: string;

  @ApiPropertyOptional({
    description: 'شماره تلفن گیرنده (در صورت عدم انتخاب آدرس قبلی الزامی است)',
    example: '09123456789',
  })
  @ValidateIf((o) => !o.addressId)
  @IsNotEmpty({ message: 'شماره تلفن الزامی است' })
  @IsString()
  shippingPhone?: string;

  @ApiPropertyOptional({
    description: 'شهر (در صورت عدم انتخاب آدرس قبلی الزامی است)',
    example: 'تهران',
  })
  @ValidateIf((o) => !o.addressId)
  @IsNotEmpty({ message: 'شهر الزامی است' })
  @IsString()
  shippingCity?: string;

  @ApiPropertyOptional({
    description: 'استان (در صورت عدم انتخاب آدرس قبلی الزامی است)',
    example: 'تهران',
  })
  @ValidateIf((o) => !o.addressId)
  @IsNotEmpty({ message: 'استان الزامی است' })
  @IsString()
  shippingProvince?: string;

  @ApiPropertyOptional({
    description: 'آدرس دقیق (در صورت عدم انتخاب آدرس قبلی الزامی است)',
    example: 'خیابان ولیعصر، پلاک ۱۲۳، واحد ۵',
  })
  @ValidateIf((o) => !o.addressId)
  @IsNotEmpty({ message: 'آدرس الزامی است' })
  @IsString()
  shippingAddress?: string;

  @ApiPropertyOptional({
    description: 'کد پستی (اختیاری)',
    example: '1234567890',
  })
  @IsOptional()
  @IsString()
  shippingPostal?: string;

  @ApiPropertyOptional({
    description: 'یادداشت سفارش (اختیاری)',
    example: 'لطفاً قبل از تحویل تماس بگیرید',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'کد تخفیف (اختیاری)',
    example: 'SUMMER1405',
  })
  @IsOptional()
  @IsString()
  discountCode?: string;

  @ApiProperty({
    description: 'روش ارسال',
    example: 'standard',
    required: true,
  })
  @IsString()
  shippingMethod!: string;

  @ApiProperty({
    description: 'روش پرداخت',
    enum: ['card', 'wallet', 'cod', 'zarinpal'],
    example: 'zarinpal',
    required: true,
  })
  @IsIn(['card', 'wallet', 'cod', 'zarinpal'])
  paymentMethod!: string;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ description: 'وضعیت جدید', enum: ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] })
  @IsString()
  status!: string;

  @ApiPropertyOptional({ description: 'کد پیگیری' })
  @IsOptional()
  @IsString()
  trackingCode?: string;

  @ApiPropertyOptional({ description: 'یادداشت فروشنده' })
  @IsOptional()
  @IsString()
  sellerNotes?: string;
}


// ============================================
// Payment DTOs
// ============================================

export class CreatePaymentDto {
  @ApiProperty({ description: 'روش پرداخت', enum: ['card', 'wallet', 'zarinpal'] })
  @IsString()
  method!: string;

  @ApiPropertyOptional({ description: 'شماره ارجاع درگاه' })
  @IsOptional()
  @IsString()
  gatewayRef?: string;
}

export class ConfirmPaymentDto {
  @ApiPropertyOptional({ description: 'شماره ارجاع نهایی درگاه' })
  @IsOptional()
  @IsString()
  gatewayRef?: string;
}

// ============================================
// Refund DTOs
// ============================================

export class CreateRefundDto {
  @ApiProperty({ description: 'دلیل مرجوعی' })
  @IsString()
  reason!: string;
}
