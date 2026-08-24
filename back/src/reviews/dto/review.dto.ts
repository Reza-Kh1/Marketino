import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, Min, Max, IsOptional, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReviewDto {
  @ApiProperty({ description: 'شناسه محصول' })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiPropertyOptional({ description: 'شناسه سفارش مرتبط' })
  @IsString()
  @IsOptional()
  orderId?: string;

  @ApiProperty({ description: 'امتیاز از ۱ تا ۵', minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiPropertyOptional({ description: 'عنوان نظر' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'متن اصلی نظر' })
  @IsString()
  @IsNotEmpty()
  body!: string;
}

export class GetReviewsQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}

export class ReviewSearchDto extends GetReviewsQueryDto {
  @ApiPropertyOptional({ description: 'وضعیت تایید (true یا false)' })
  @IsOptional()
  @IsString()
  isApproved?: string;

  @ApiPropertyOptional({ description: 'فیلتر بر اساس محصول' })
  @IsOptional()
  @IsString()
  productId?: string;
}

export class ModerateReviewDto {
  @ApiProperty({ description: 'وضعیت تایید نظر', enum: ['true', 'false'] })
  @IsString()
  @IsIn(['true', 'false'], {
    message: 'مقدار isApproved باید یکی از مقادیر true یا false باشد',
  })
  isApproved!: string;
}

export class AnswerReviewDto {
  @ApiProperty({ description: 'پاسخ ادمین/فروشنده به نظر' })
  @IsString()
  @IsNotEmpty()
  answer!: string;
}