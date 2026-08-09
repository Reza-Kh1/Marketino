import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReviewApproval } from '@prisma/client';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateQnaDto {
  @ApiProperty({
    example: 'آیا این محصول گارانتی دارد؟',
    description: 'متن پرسش یا پاسخ',
  })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiProperty({
    example: '7c9d7e9e-6e5a-4f4b-9c6a-123456789abc',
    description: 'شناسه محصول',
  })
  @IsUUID()
  productId!: string;

  @ApiPropertyOptional({
    nullable: true,
    example: null,
    description:
      'اگر مقدار داشته باشد، این Q&A به عنوان پاسخ به Q&A والد ثبت می‌شود',
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}

export class UpdateQnaDto {
  @ApiProperty({
    example: 'آیا این محصول گارانتی دارد؟',
    description: 'متن پرسش یا پاسخ',
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ description: 'فیلتر بر اساس وضعیت', enum: Object.values(ReviewApproval) })
  @IsOptional()
  status?: ReviewApproval;
}