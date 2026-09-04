/**
 * Order DTOs - اشیاء انتقال داده سفارشات
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsOptional, IsIn, IsUUID, ValidateIf, IsNotEmpty, IsArray, ValidateNested, ArrayMinSize, IsNumber } from 'class-validator';

export class OrderItemDto {
  @ApiProperty({
    description: 'شناسه فروشگاه',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  storeId!: string;

  @ApiProperty({
    description: 'شناسه روش ارسال',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  shippingId!: string;

  @ApiProperty({ description: 'نام روش ارسال', })
  @IsOptional()
  @IsString()
  shippingName!: string;

  @ApiProperty({ description: 'هزینه روش ارسال', })
  @IsOptional()
  @IsString()
  shippingCost!: string;

  @ApiProperty({ description: 'زمان ارسال (تعداد روز)' })
  @IsOptional()
  @IsNumber()
  shippingTime!: number;

  @ApiProperty({ description: 'توضیحات سفارش', })
  @IsOptional()
  @IsString()
  note?: string;
}

export class CreateOrderDto {
  @ApiPropertyOptional({
    description: 'شناسه آدرس ذخیره‌شده کاربر (در صورت انتخاب آدرس قبلی)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  addressId?: string;

  @ApiProperty({
    description: 'لیست سفارشات',
    type: [OrderItemDto],
    example: [
      {
        storeId: '123e4567-e89b-12d3-a456-426614174000',
        shippingId: '123e4567-e89b-12d3-a456-426614174001',
      },
      {
        storeId: '123e4567-e89b-12d3-a456-426614174002',
        shippingId: '123e4567-e89b-12d3-a456-426614174003',
      },
    ],
    required: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @ArrayMinSize(1)
  orders!: OrderItemDto[];

  @ApiPropertyOptional({
    description: 'کد تخفیف (اختیاری)',
    nullable: true
  })
  @IsOptional()
  @IsString()
  discountId?: string | null;

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
