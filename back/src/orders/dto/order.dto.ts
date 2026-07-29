/**
 * Order DTOs - اشیاء انتقال داده سفارشات
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ description: 'آدرس ارسال' })
  @IsString()
  shippingAddress: string;

  @ApiPropertyOptional({ description: 'شهر' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  shippingCity?: string;

  @ApiPropertyOptional({ description: 'استان' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  shippingProvince?: string;

  @ApiPropertyOptional({ description: 'کد پستی' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  shippingPostal?: string;

  @ApiPropertyOptional({ description: 'تلفن گیرنده' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  shippingPhone?: string;

  @ApiPropertyOptional({ description: 'نام گیرنده' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  shippingName?: string;

  @ApiPropertyOptional({ description: 'یادداشت سفارش' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'کد تخفیف' })
  @IsOptional()
  @IsString()
  discountCode?: string;

  @ApiPropertyOptional({ description: 'روش پرداخت', default: 'card' })
  @IsOptional()
  @IsString()
  paymentMethod?: PaymentMethod;


  @ApiPropertyOptional({ description: 'آیدی آدرس' })
  @IsOptional()
  @IsString()
  addressId?: PaymentMethod;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ description: 'وضعیت جدید', enum: ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] })
  @IsString()
  status: string;

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
  method: string;

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
  reason: string;
}
