/**
 * Review DTOs
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional, Min, Max, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReviewDto {
  @ApiProperty({ description: 'شناسه محصول' })
  @IsString()
  productId: string;

  @ApiProperty({ description: 'امتیاز (۱ تا ۵)' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ description: 'عنوان نظر' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  title?: string;

  @ApiProperty({ description: 'متن نظر' })
  @IsString()
  body: string;
}
