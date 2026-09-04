import { DefaultQueryDto } from '@/common/dtos/defualt.query.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WalletTransactionStatus, WalletTransactionType } from '@prisma/client';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, MinLength, MaxLength, IsEnum, } from 'class-validator';

export class WalletSearchDto extends DefaultQueryDto {
    @ApiProperty({ description: 'نام صاحب حساب (مطابق با کارت بانکی)', required: false })
    @IsOptional()
    @IsString()
    userId!: string;
}

export class WalletTransactionSearchDto extends DefaultQueryDto {
    @ApiProperty({ description: 'اولویت تیکت', required: false })
    @IsOptional()
    @IsEnum(WalletTransactionType)
    @IsString()
    type!: WalletTransactionType | 'all';

    @ApiProperty({ description: 'اولویت تیکت', required: false })
    @IsOptional()
    @IsEnum(WalletTransactionStatus)
    @IsString()
    status!: WalletTransactionStatus | 'all';

    @ApiProperty({ description: 'نام صاحب حساب (مطابق با کارت بانکی)', required: false })
    @IsOptional()
    @IsString()
    trackingCode!: string;

    @ApiProperty({ description: 'نام صاحب حساب (مطابق با کارت بانکی)', required: false })
    @IsOptional()
    @IsString()
    userId!: string;
}