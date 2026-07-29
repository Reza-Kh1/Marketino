/**
 * Discount DTOs
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsDateString, Min, Max, MaxLength, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { DiscountType } from '@prisma/client';

export class CreateDiscountDto {
  @ApiProperty({ description: 'کد تخفیف' })
  @IsString()
  @MaxLength(50)
  code!: string;

  @IsOptional()
  @IsEnum(DiscountType, { message: 'نوع تخفیف نامعتبر است' })
  type!: DiscountType;

  @ApiProperty({ description: 'مقدار (درصد یا تومان)' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  value!: number;

  @ApiPropertyOptional({ description: 'حداقل مبلغ سفارش', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  @ApiPropertyOptional({ description: 'حداکثر تخفیف (برای نوع درصدی)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxDiscount?: number;

  @ApiPropertyOptional({ description: 'محدودیت تعداد استفاده (۰ = نامحدود)', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  usageLimit?: number;

  @ApiProperty({ description: 'تاریخ شروع' })
  @IsDateString()
  startsAt!: string;

  @ApiProperty({ description: 'تاریخ پایان' })
  @IsDateString()
  endsAt!: string;

  @ApiPropertyOptional({ description: 'توضیحات' })
  @IsOptional()
  @IsString()
  description?: string;
}
