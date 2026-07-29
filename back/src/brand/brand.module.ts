/**
 * BrandsModule - ماژول دسته‌بندی‌ها
 */
import { Module } from '@nestjs/common';
import { BrandsController } from './brand.controller';
import { BrandService } from './brand.service';


@Module({
  controllers: [BrandsController],
  providers: [BrandService],
  exports: [BrandService],
})
export class BrandsModule {}
