/**
 * CreateColleagueDto - DTO برای ایجاد همکار ادمین
 */
import { IsString, IsEmail, IsArray, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateColleagueDto {
  @ApiProperty({ description: 'نام کاربری', example: 'colleague1' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @ApiProperty({ description: 'ایمیل', example: 'colleague@bazarche.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'رمز عبور', example: 'securePassword123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'لیست دسترسی‌ها', example: ['dashboard', 'users', 'products'] })
  @IsArray()
  permissions: string[];

  @ApiPropertyOptional({ description: 'نام', example: 'علی' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ description: 'نام خانوادگی', example: 'محمدی' })
  @IsOptional()
  @IsString()
  lastName?: string;
}
