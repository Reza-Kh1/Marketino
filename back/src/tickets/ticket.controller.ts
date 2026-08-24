/**
 * TicketsController - کنترلر مدیریت تیکت‌ها
 */
import { Controller, Get, Post, Put, Patch, Body, Param, Query, UseGuards, BadRequestException, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TicketService } from './ticket.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateTicketDto, QueryTicketsDto, UpdateTicketDto } from './dto/create-ticket.dto';
import { CreateTicketMessageDto } from './dto/create-ticket-message.dto';

@ApiTags('Tickets')
@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) { }

  /**
   * ایجاد تیکت جدید
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ایجاد تیکت جدید' })
  async create(@CurrentUser('id') userId: string, @Body() dto: CreateTicketDto) {
    return this.ticketService.create(userId, dto);
  }

  /**
   * دریافت لیست تیکت‌ها برای کاربر
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'لیست تیکت‌های کاربر' })
  async getUserTickets(
    @CurrentUser('id') userId: string,
    @Query() query: QueryTicketsDto,
  ) {
    return this.ticketService.getUserTickets(userId, query);
  }

  /**
   * دریافت تیکت با شناسه
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'جزئیات تیکت' })
  async findOne(@Param('id') id: string, @CurrentUser('id') userId: string, @CurrentUser('role') role: string) {
    return this.ticketService.findOne(id, userId, role);
  }

  /**
   * Update تیکت
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ویرایش تیکت' })
  async update(@Param('id') id: string, @Body() dto: UpdateTicketDto, @CurrentUser('id') userId: string, @CurrentUser('role') role: string) {
    return this.ticketService.update(id, dto, userId, role);
  }

  /**
   * Mark تیکت به عنوان خوانده شده
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id/read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'برچسب‌گذاری تیکت به عنوان خوانده شده' })
  async markAsRead(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.ticketService.markAsRead(id, userId);
  }

  /**
   * ایجاد پیام جدید در تیکت
   */
  @UseGuards(JwtAuthGuard)
  @Post('/:id/messages')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'افزودن پیام به تیکت' })
  async createMessage(
    @Param('id') ticketId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateTicketMessageDto,
    @CurrentUser('role') role: string,
  ) {
    return this.ticketService.createMessage(ticketId, dto, userId, role);
  }

  /**
   * GetAll تیکت‌ها (ادمین/فروشنده - admin view)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superAdmin')
  @Get('admin/all')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تمام تیکت‌ها (ادمین)' })
  async getAllTickets(
    @CurrentUser('id') userId: string,
    @Query() query: QueryTicketsDto,
  ) {
    return this.ticketService.getAllTickets(userId, query);
  }

  /**
   * آمار تیکت‌ها برای ادمین
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superAdmin')
  @Get('admin/stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'آمار تیکت‌ها (ادمین)' })
  async getStats(@CurrentUser('id') userId: string) {
    return this.ticketService.getStats();
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
    return this.ticketService.deleteTicket(id);
  }
}