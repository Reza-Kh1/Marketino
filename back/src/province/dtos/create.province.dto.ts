import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProvinceDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'نام استان به فارسی',
        example: 'تهران',
        required: true
    })
    name!: string;

    @IsOptional()
    @IsString()
    @ApiProperty({
        description: 'نام استان به انگلیسی',
        example: 'tehran',
        required: false
    })
    nameEn?: string;
}

export class CreateCityDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'نام استان به فارسی',
        example: 'تهران',
        required: true
    })
    name!: string;

    @IsOptional()
    @IsString()
    @ApiProperty({
        description: 'نام استان به انگلیسی',
        example: 'tehran',
        required: false
    })
    nameEn?: string;


    @IsString()
    @ApiProperty({
        description: 'آیدی شهرستان',
        example: 'tehran',
        required: true
    })
    provinceId!: string;
}