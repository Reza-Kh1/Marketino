import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { BrandService } from './brand.service';
import { BrandDto, SearchBrandDto } from './dto/brand.dts';

@ApiTags('Brand')
@Controller('brand')
export class BrandsController {
    constructor(private readonly brandsService: BrandService) { }

    /**
     * دریافت تمام برند‌های فعال - عمومی
     */
    @Public()
    @Get()
    @ApiOperation({ summary: 'لیست برند‌های فعال (درختی)' })
    async findAll(@Query() query: SearchBrandDto) {
        return this.brandsService.findAll(query);
    }

    /**
 * دریافت تمام برند‌های ادمین
 */
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'superAdmin', 'seller')
    @Get('/admin')
    @ApiOperation({ summary: 'لیست برند‌های admin' })
    async findAllAdmin() {
        return this.brandsService.findAllAdmin();
    }

    /**
     * ایجاد برند جدید - فقط ادمین
     */
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'superAdmin')
    @Post()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'ایجاد برند جدید (ادمین)' })
    async create(@Body() dto: BrandDto) {
        return this.brandsService.create(dto);
    }

    /**
     * ویرایش برند - فقط ادمین
     */
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'superAdmin')
    @Put(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'ویرایش برند (ادمین)' })
    async update(@Param('id') id: string, @Body() dto: BrandDto) {
        return this.brandsService.update(id, dto);
    }

    /**
     * حذف برند - فقط ادمین
     */
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'superAdmin')
    @Delete(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'حذف برند (ادمین)' })
    async delete(@Param('id') id: string) {
        return this.brandsService.delete(id);
    }
}
