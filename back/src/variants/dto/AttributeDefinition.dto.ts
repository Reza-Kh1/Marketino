import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class AttributeDefinitionDto {
  @ApiProperty({ description: 'کلید انگلیسی (یکتا)', example: 'size' })
  @IsString()
  key!: string;

  @ApiProperty({ description: 'برچسب فارسی', example: 'سایز' })
  @IsString()
  label!: string;

  @ApiPropertyOptional({ description: 'آیدی دسته‌بندی‌ها', example: ['01'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[];
}

export class AttributeDefinitionSearch {
  @ApiPropertyOptional({
    description: 'آیدی دسته‌بندی‌ها (ارسال به‌صورت کاما جدا شده یا پارامترهای متعدد)',
    type: [String],
    required: false
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((id) => id.trim());
    }
    return value;
  })
  @IsArray()
  @IsString({ each: true })
  categoryId?: string[];

  @ApiProperty({ description: 'جستجو برای label , key', required: false })
  @IsString()
  @IsOptional()
  search?: string

  @ApiProperty({ description: 'زمانی که نیازی به جزئیات نیست و فقط لیست ارسال میشه', required: false })
  @IsString()
  @IsOptional()
  noDetail?: string
}