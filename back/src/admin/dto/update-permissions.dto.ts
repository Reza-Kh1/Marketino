/**
 * UpdatePermissionsDto - DTO برای به‌روزرسانی دسترسی‌های همکار
 */
import { IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePermissionsDto {
  @ApiProperty({ description: 'لیست دسترسی‌ها', example: ['dashboard', 'users', 'products', 'orders'] })
  @IsArray()
  permissions: string[];
}
