/**
 * User DTOs - اشیاء انتقال داده کاربران
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsNumber, IsIn, Min, Max, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { StoreStatus as PrismaStoreStatus } from '@prisma/client';

export class UpdateProfileDto {
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

  @ApiPropertyOptional({ description: 'شماره تلفن' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ description: 'زبان', enum: ['fa', 'en'] })
  @IsOptional()
  @IsString()
  @IsIn(['fa', 'en'])
  language?: string;

  @ApiPropertyOptional({ description: 'آدرس آواتار' })
  @IsOptional()
  @IsString()
  avatar?: string;
}

export class BecomeSellerDto {
  @ApiProperty({ description: 'نام فروشگاه' })
  @IsString()
  @MaxLength(200)
  storeName: string;

  @ApiPropertyOptional({ description: 'توضیحات فروشگاه (فارسی)' })
  @IsOptional()
  @IsString()
  storeDescription?: string;

  @ApiPropertyOptional({ description: 'توضیحات فروشگاه (انگلیسی)' })
  @IsOptional()
  @IsString()
  storeDescriptionEn?: string;
}

export class VerifySellerDto {
  @IsOptional()
  @ApiProperty({ description: 'وضعیت', enum: ['approved', 'rejected'] })
  @IsString()
  @IsIn(['approved', 'rejected'])
  status?: PrismaStoreStatus;

  @ApiPropertyOptional({ description: 'دلیل رد درخواست' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ description: 'درصد کمیسیون (۰ تا ۱۰۰)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  commissionRate?: number;
}

export class UserFilterDto {
  @ApiPropertyOptional({ description: 'نقش کاربر', enum: ['buyer', 'seller', 'admin'] })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({ description: 'وضعیت فروشنده', enum: ['pending', 'approved', 'rejected'] })
  @IsOptional()
  @IsString()
  sellerStatus?: string;

  @ApiPropertyOptional({ description: 'عبارت جستجو' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'شماره صفحه', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'تعداد در صفحه', default: 15 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;
}
