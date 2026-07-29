/**
 * NotificationsController - کنترلر اطلاع‌رسانی‌ها
 */
import { Controller, Get, Put, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'لیست اطلاع‌رسانی‌ها' })
  async getNotifications(@CurrentUser('id') userId: string, @Query('page') page?: number) {
    return this.notificationsService.getUserNotifications(userId, page);
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'علامت‌گذاری به عنوان خوانده شده' })
  async markAsRead(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.notificationsService.markAsRead(userId, id);
  }

  @Put('read-all')
  @ApiOperation({ summary: 'خواندن همه اطلاع‌رسانی‌ها' })
  async markAllAsRead(@CurrentUser('id') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'تعداد خوانده نشده' })
  async getUnreadCount(@CurrentUser('id') userId: string) {
    return this.notificationsService.getUnreadCount(userId);
  }
}
