/**
 * Discount DTOs
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsDateString, Min, Max, MaxLength, IsEnum } from 'class-validator';

export class ValidateDiscountDto {
    @ApiProperty({ description: 'کد تخفیف' })
    @IsString()
    code!: string;

    @ApiProperty({ description: 'هزینه سفارش' })
    @IsString()
    orderAmount!: string;
}
