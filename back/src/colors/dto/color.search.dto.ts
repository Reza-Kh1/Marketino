import { DefaultQueryDto } from '@/common/dtos/defualt.query.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';
export class ColorSearchDto extends DefaultQueryDto {
  @ApiProperty({ description: 'نام رنگ', required: false })
  @IsString()
  @IsOptional()
  search?: string;
}