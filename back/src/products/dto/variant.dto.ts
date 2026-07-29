import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';
import { Prisma } from '@prisma/client';

export class CreateVariantDto {
    @ApiProperty({ description: 'عنوان فارسی' })
    @IsString()
    name!: string;

    @ApiProperty({ description: 'عنوان انگلیسی' })
    @IsOptional() // <--- این حتما لازم بود!
    @IsString()
    nameEn?: string;

    @ApiProperty({ description: 'آدرس عکس' })
    @IsOptional()
    @IsString()
    image?: string;

    @ApiProperty({ description: 'آیدی کد تخفیف' })
    @IsOptional()
    @IsString()
    discountId?: string;

    @ApiProperty({ description: 'آیدی محصول' })
    @IsString()
    productId!: string;

    @ApiProperty({ description: 'تعداد محصول' })
    @IsOptional()
    @Transform(({ value }) => (value !== null && value !== undefined ? String(value) : '0'))
    @IsString()
    quantity!: string;

    @ApiProperty({ description: 'قیمت محصول' })
    @IsOptional()
    @Transform(({ value }) => (value !== null && value !== undefined ? String(value) : '0'))
    @IsString()
    price!: string;

    @ApiProperty({ description: 'مشخصات محصول' })
    @IsOptional()
    @IsArray() // <--- اصلاح شد به IsArray چون شما [] می‌فرستید
    attributes?: Prisma.InputJsonValue;

    @ApiProperty({ description: 'مشخصات محصول' })
    @IsOptional()
    @IsArray() // <--- اصلاح شد به IsArray
    attributesEn?: Prisma.InputJsonValue;
}