import { Transform, Type } from 'class-transformer';
import { IsEnum, IsOptional, IsNumberString, IsInt, IsBoolean, IsString } from 'class-validator';

export class UploadImageDto {
    @IsOptional()
    @IsString()
    url?: string;

    @IsOptional()
    @IsString()
    alt?: string;

    @IsOptional()
    @Transform(({ value }) => value === '' ? undefined : value)
    @Type(() => Number)
    @IsInt()
    sortOrder?: string;

    @IsOptional()
    @IsBoolean()
    isMain?: boolean;

    @IsOptional()
    @Transform(({ value }) => value === '' ? undefined : value)
    @Type(() => Number)
    @IsInt()
    productId?: string;
}