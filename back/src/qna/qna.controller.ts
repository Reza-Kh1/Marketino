import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { QnaService } from './qna.service';
import { CreateQnaDto, UpdateQnaDto } from './dto/qna.create.dto';
import { SearchQnaDto } from './dto/qna.search.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { Roles } from '@/common/decorators/roles.decorator';

@ApiTags('Q&A')
@Controller('qna')
export class QnaController {
  constructor(private readonly qnaService: QnaService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'ایجاد پرسش یا پاسخ' })
  create(@CurrentUser('id') userId: string, @CurrentUser('role') role: UserRole, @Body() dto: CreateQnaDto) {
    return this.qnaService.create(userId, role, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/product/:productId')
  @ApiOperation({ summary: 'دریافت پرسش و پاسخ‌های محصول' })
  @ApiParam({ name: 'productId', description: 'شناسه محصول' })
  findByProduct(@Param('productId') productId: string, @Query() query: SearchQnaDto) {
    return this.qnaService.findByProduct(productId, query);
  }

  @UseGuards(JwtAuthGuard)
  @Roles('admin', 'seller', 'superAdmin')
  @Get('admin')
  @ApiOperation({ summary: 'دریافت پرسش و پاسخ‌های محصول ادمین' })
  findByProductAdmin(@Query() query: SearchQnaDto) {
    return this.qnaService.findByAdmin(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'دریافت یک پرسش یا پاسخ' })
  findOne(@Param('id') id: string) {
    return this.qnaService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Roles('admin', 'seller', 'superAdmin')
  @Put(':id')
  @ApiOperation({ summary: 'ویرایش پرسش یا پاسخ' })
  update(@Param('id') id: string, @Body() dto: UpdateQnaDto) {
    return this.qnaService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف پرسش یا پاسخ' })
  remove(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as any;
    return this.qnaService.remove(id, user.id);
  }
}