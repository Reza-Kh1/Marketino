/**
 * ReportsController - کنترلر مدیریت گزارش‌ها
 */
import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, BadRequestException, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportService } from './report.service';
import { CreateReportDto, UpdateReportDto, QueryReportsDto } from './dto/report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ReportsStatus } from '@prisma/client';

@ApiTags('Reports')
@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) { }

  /**
   * ایجاد گزارش جدید
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ایجاد گزارش جدید' })
  async create(@Body() dto: CreateReportDto) {
    return this.reportService.create(dto);
  }

  /**
   * GetAll گزارش‌ها (ادمین view)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superAdmin')
  @Get('admin/all')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تمام گزارش‌ها (ادمین)' })
  async getAllReports(
    @Query() query: QueryReportsDto,
  ) {
    return this.reportService.getAllReports(query);
  }

  /**
   * Get single report by ID
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superAdmin')
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'جزئیات گزارش' })
  async findOne(@Param('id') id: string) {
    return this.reportService.findOne(id);
  }

  /**
   * Update report status (ادمین)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superAdmin')
  @Patch(':id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تغییر وضعیت گزارش' })
  async updateStatus(@Param('id') id: string, @Body('status') status: ReportsStatus) {
    return this.reportService.update(id, status);
  }

  /**
   * آمار گزارش‌ها برای ادمین
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superAdmin')
  @Get('admin/stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'آمار گزارش‌ها (ادمین)' })
  async getStats() {
    return this.reportService.getStats();
  }

  /**
 * آمار تیکت‌ها برای ادمین
 */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superAdmin')
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'حذف تیکت‌ها (ادمین)' })
  async deleteTicket(@Param('id') id: string) {
    return this.reportService.deleteReport(id);
  }
}