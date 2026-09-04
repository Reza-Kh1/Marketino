import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiExtraModels, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ProvinceService } from './province.service';
import type { Request } from 'express';
import { CreateCityDto, CreateProvinceDto } from './dtos/create.province.dto';

/** * کنترلر برای ساخت و آپدیت تمام استان‌های سایت */
@ApiTags('Province')
@Controller('province')
export class ProvinceController {
  constructor(private readonly ProvinceService: ProvinceService) { }

  /**
   * دریافت همه استان‌ها
   */
  @Get('/')
  @ApiOperation({
    summary: 'Get all provinces',
    description: 'دریافت لیست تمام استان ها دسترسی: تمام کاربران'
  })
  getProvince() {
    return this.ProvinceService.getAllProvince();
  }

  /**
   * ایجاد استان جدید
   */
  @Post('/')
  @ApiOperation({
    summary: 'Create a new province',
    description: 'ایجاد استان جدید در سایت. دسترسی: فقط ادمین و نویسنده'
  })
  @ApiBody({ type: CreateProvinceDto, description: 'اطلاعات استان جدید باید ارسال شود' })
  @ApiOkResponse({ schema: { example: { success: true } }, description: 'در صورت موفقیت، پیام تایید برگردانده می‌شود' })
  PostProvince(@Body() Province: CreateProvinceDto) {
    return this.ProvinceService.createProvince(Province);
  }

  /**
   * حذف استان با ایدی
   */
  @Delete('/:id')
  @ApiOperation({
    summary: 'Delete province by ID',
    description: 'حذف استان از دیتابیس با استفاده از ایدی. دسترسی: فقط ادمین و نویسنده. در صورت وجود شهر یا پورتفولیو یا پروژه مرتبط با این استان، عملیات با خطا مواجه می‌شود.'
  })
  @ApiParam({ name: 'id', description: 'ایدی عددی استان مورد نظر برای حذف', example: 5, type: Number })
  @ApiOkResponse({ schema: { example: { success: true } }, description: 'پیام تایید حذف' })
  deleteProvince(@Param('id') id: string) {
    return this.ProvinceService.deleteProvince(id);
  }

  /**
   * بروزرسانی استان
   */
  @Put('/:id')
  @ApiOperation({
    summary: 'Update province information',
    description: 'بروزرسانی اطلاعات استان. دسترسی: ادمین و نویسنده. همه فیلدها اختیاری هستند و فقط فیلدهای ارسال شده به‌روز می‌شوند. برای ویرایش، ایدی استان در مسیر ارسال شود.'
  })
  @ApiParam({ name: 'id', description: 'ایدی استان مورد نظر برای ویرایش', example: 5, type: Number })
  @ApiBody({ type: CreateProvinceDto, description: 'فیلدهای قابل ویرایش: تمام اطلاعات استان' })
  @ApiOkResponse({ schema: { example: { success: true } }, description: 'پیام تایید ویرایش' })
  updateProvince(@Body() body: CreateProvinceDto, @Param('id') id: string) {
    return this.ProvinceService.updateProvince(body, id);
  }

  /**
   * دریافت همه شهرها
   */
  @Get('/city')
  @ApiOperation({
    summary: 'Get all cities',
    description: 'دریافت لیست تمام شهرها دسترسی: تمام کاربران و دریافت با آیدی '
  })
  getCity(@Query('idProvince') idProvince: string) {
    return this.ProvinceService.getAllCity(idProvince);
  }

  /**
   * ایجاد شهر جدید
   */
  @Post('/city')
  @ApiOperation({
    summary: 'Create a new city',
    description: 'ایجاد شهر جدید در سایت. دسترسی: فقط ادمین و نویسنده'
  })
  @ApiBody({ type: CreateCityDto, description: 'اطلاعات شهر جدید باید ارسال شود' })
  @ApiOkResponse({ schema: { example: { success: true } }, description: 'در صورت موفقیت، پیام تایید برگردانده می‌شود' })
  PostCity(@Body() City: CreateCityDto) {
    return this.ProvinceService.createCity(City);
  }

  /**
   * حذف شهر با ایدی
   */
  @Delete('/city/:id')
  @ApiOperation({
    summary: 'Delete city by ID',
    description: 'حذف شهر از دیتابیس با استفاده از ایدی. دسترسی: فقط ادمین و نویسنده. در صورت وجود پورتفولیو یا پروژه یا کاربر مرتبط با این شهر، عملیات با خطا مواجه می‌شود.'
  })
  @ApiParam({ name: 'id', description: 'ایدی عددی شهر مورد نظر برای حذف', example: 5, type: Number })
  @ApiOkResponse({ schema: { example: { success: true } }, description: 'پیام تایید حذف' })
  deleteCity(@Param('id') id: string) {
    return this.ProvinceService.deleteCity(id);
  }

  /**
   * بروزرسانی شهر
   */
  @Put('/city/:id')
  @ApiOperation({
    summary: 'Update city information',
    description: 'بروزرسانی اطلاعات شهر. دسترسی: ادمین و نویسنده. همه فیلدها اختیاری هستند و فقط فیلدهای ارسال شده به‌روز می‌شوند. برای ویرایش، ایدی شهر در مسیر ارسال شود.'
  })
  @ApiParam({ name: 'id', description: 'ایدی شهر مورد نظر برای ویرایش', example: 5, type: Number })
  @ApiBody({ type: CreateCityDto, description: 'فیلدهای قابل ویرایش: تمام اطلاعات شهر' })
  @ApiOkResponse({ schema: { example: { success: true } }, description: 'پیام تایید ویرایش' })
  updateCity(@Body() body: CreateCityDto, @Param('id') id: string) {
    return this.ProvinceService.updateCity(body, id);
  }
}