/**
 * Blog DTOs
 */
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { BlogPostStatus } from '@prisma/client';
import { IsString, IsOptional, MaxLength, IsEnum } from 'class-validator';

export class CreateBlogDto {
  @ApiProperty({ description: 'عنوان فارسی' })
  @IsString()
  @MaxLength(300)
  title: string;

  @ApiPropertyOptional({ description: 'عنوان انگلیسی' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  titleEn?: string;

  @ApiPropertyOptional({ description: 'خلاصه فارسی' })
  @IsOptional()
  @IsString()
  excerpt?: string;

  @ApiPropertyOptional({ description: 'خلاصه انگلیسی' })
  @IsOptional()
  @IsString()
  excerptEn?: string;

  @ApiProperty({ description: 'متن کامل فارسی' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: 'متن کامل انگلیسی' })
  @IsOptional()
  @IsString()
  contentEn?: string;

  @ApiPropertyOptional({ description: 'تصویر کاور' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ description: 'تگ‌ها (با کاما جدا شوند)' })
  @IsOptional()
  @IsString()
  tags?: string;

  @IsOptional()
  @IsEnum(BlogPostStatus, { message: 'وضعیت نامعتبر است' })
  status?: BlogPostStatus;
}

export class UpdateBlogDto extends PartialType(CreateBlogDto) { }
