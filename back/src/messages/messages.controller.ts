/**
 * MessagesController - کنترلر پیام‌ها
 */
import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Messages')
@Controller('messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('conversations')
  @ApiOperation({ summary: 'لیست گفتگوهای کاربر' })
  async getConversations(@CurrentUser('id') userId: string) {
    return this.messagesService.getUserConversations(userId);
  }

  @Post('start')
  @ApiOperation({ summary: 'شروع گفتگوی جدید' })
  async startConversation(@CurrentUser('id') userId: string, @Body() body: { sellerId: string; productId?: string; message?: string }) {
    return this.messagesService.startConversation(userId, body.sellerId, body.productId, body.message);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'پیام‌های یک گفتگو' })
  async getMessages(@CurrentUser('id') userId: string, @Param('id') id: string, @Query('page') page?: number) {
    return this.messagesService.getMessages(id, userId, page);
  }

  @Post('conversations/:id')
  @ApiOperation({ summary: 'ارسال پیام' })
  async sendMessage(@CurrentUser('id') userId: string, @Param('id') id: string, @Body('text') text: string) {
    return this.messagesService.sendMessage(id, userId, text);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'تعداد پیام‌های خوانده نشده' })
  async getUnreadCount(@CurrentUser('id') userId: string) {
    return this.messagesService.getUnreadCount(userId);
  }
}
