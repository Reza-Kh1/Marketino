/**
 * PeriodQueryDto - DTO برای فیلتر دوره زمانی
 */
import { IsOptional, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PeriodQueryDto {
  @ApiPropertyOptional({ description: 'دوره زمانی', enum: ['week', 'month', 'year'], default: 'month' })
  @IsOptional()
  @IsIn(['week', 'month', 'year'])
  period?: string = 'month';
}
