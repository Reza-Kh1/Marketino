import { DefaultQueryDto } from '@/common/dtos/defualt.query.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, IsInt, Min, Max, IsOptional, IsBoolean } from 'class-validator';

export class ReviewSearchDto extends DefaultQueryDto {
    @ApiPropertyOptional({ description: 'فیلتر بر اساس وضعیت تایید (true/false)' })
    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value;
    })
    @IsBoolean()
    isApproved?: boolean;

    @ApiPropertyOptional({ description: 'فیلتر بر اساس شناسه محصول' })
    @IsOptional()
    @IsString()
    productId?: string;
}
