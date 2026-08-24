import { DefaultQueryDto } from '@/common/dtos/defualt.query.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class ReviewSearchDto extends DefaultQueryDto {
    @ApiPropertyOptional({ description: 'وضعیت تایید نظر' })
    @IsOptional()
    @IsString()
    isApproved!: string;

    @ApiPropertyOptional({ description: 'فیلتر بر اساس شناسه محصول' })
    @IsOptional()
    @IsString()
    productId?: string;
}