import { IsString, IsOptional, IsNumber, IsBoolean, Min, IsUUID, IsInt, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateShippingMethodDto {
  @ApiProperty({ example: 'ارسال با پست' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 'Post Shipping' })
  @IsOptional()
  @IsString()
  nameEn?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isFreeMethod?: boolean;
}

export class UpdateStoreShippingDto {
  @ApiProperty({ example: 'ارسال با پست' })
  @IsString()
  description!: string;

  @ApiPropertyOptional({ example: 'Post Shipping' })
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive!: boolean;

  @ApiPropertyOptional({ example: 'اقتصادی' })
  @IsOptional()
  @IsString()
  phrase?: string;

  @ApiPropertyOptional({ example: 0, required: true })
  @IsInt()
  minDays!: number;

  @ApiPropertyOptional({ example: 0, required: true })
  @IsInt()
  maxDays!: number;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  @IsInt()
  defaultPrice?: number;

}

export class CreateStoreShippingDto extends UpdateStoreShippingDto {
  @ApiPropertyOptional({ example: '' })
  @IsString()
  shippingMethodId!: string;
}

export class CreateStoreShippingRateDto {
  @ApiProperty({ example: 'ارسال با پست', required: true })
  @IsInt()
  price!: number;

  @ApiProperty({ example: 'حداکثر زمان ارسال', required: true })
  @IsInt()
  deliveryMaxDays!: number;

  @ApiPropertyOptional({ example: 'Post Shipping', required: true })
  @IsString()
  storeShippingMethodId!: string;

  @ApiPropertyOptional({ example: '', required: true })
  @IsString()
  provinceId!: string;
}