import { DefaultQueryDto } from '@/common/dtos/defualt.query.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReviewApproval } from '@prisma/client';
import {
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class SearchQnaDto extends DefaultQueryDto {
  @ApiPropertyOptional({
    example: '7c9d7e9e-6e5a-4f4b-9c6a-123456789abc',
    description: 'شناسه محصول',
    nullable: true,
    required: false
  })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiPropertyOptional({
    nullable: true,
    example: null,
    description:
      'اگر مقدار داشته باشد، این Q&A به عنوان پاسخ به Q&A والد ثبت می‌شود',
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiProperty({ description: 'فیلتر بر اساس وضعیت', required: false, enum: ['ALL', ...Object.values(ReviewApproval)] })
  @IsOptional()
  status?: ReviewApproval | "ALL";
}