import { IsString, IsOptional, IsNumber, IsBoolean, Min, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateShippingMethodDto {
  @ApiProperty({ example: 'ارسال با پست' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 'Post Shipping' })
  @IsOptional()
  @IsString()
  nameEn?: string;

  @ApiPropertyOptional({ example: 'ارسال از طریق پست پیشتاز' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Express Post Shipping' })
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiProperty({ example: 25000, minimum: 0 })
  @IsNumber()
  @Min(0)
  cost!: number;

  @ApiPropertyOptional({ example: 'سریع‌ترین روش ارسال' })
  @IsOptional()
  @IsString()
  phrase?: string;

  @ApiPropertyOptional({ example: 500000, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  freeThreshold?: number;

  @ApiPropertyOptional({ example: '2-3 روز' })
  @IsOptional()
  @IsString()
  estimatedDays?: string;

  @ApiPropertyOptional({ example: '2-3 days' })
  @IsOptional()
  @IsString()
  estimatedDaysEn?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}