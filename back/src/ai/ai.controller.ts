/**
 * AiController - کنترلر هوش مصنوعی
 */
import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Public()
  @Post('chat')
  @ApiOperation({ summary: 'چت با هوش مصنوعی' })
  async chat(@Body() body: { messages: { role: string; content: string }[] }) {
    return this.aiService.chat(body.messages);
  }

  @UseGuards(JwtAuthGuard)
  @Get('recommendations')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'توصیه محصولات بر اساس خریدهای قبلی' })
  async getRecommendations(@CurrentUser('id') userId: string) {
    return this.aiService.getRecommendations(userId);
  }
}
