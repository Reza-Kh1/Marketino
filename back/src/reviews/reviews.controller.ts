import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import {
  CreateReviewDto,
  GetReviewsQueryDto,
  ModerateReviewDto,
  AnswerReviewDto,
} from './dto/review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { ReviewSearchDto } from './dto/review.search.dto';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) { }

  @Public()
  @Get('product/:productId')
  @ApiOperation({ summary: 'دریافت نظرات تاییدشده یک محصول' })
  async getProductReviews(
    @Param('productId') productId: string,
    @Query() query: GetReviewsQueryDto,
  ) {
    return this.reviewsService.getProductReviews(productId, query);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ثبت نظر جدید توسط کاربر' })
  async create(@CurrentUser('id') userId: string, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(userId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superAdmin', 'seller')
  @Patch(':id/moderate')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تایید یا رد نظر (مخصوص ادمین)' })
  async moderate(@Param('id') id: string, @Body() dto: ModerateReviewDto) {
    return this.reviewsService.moderateReview(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superAdmin', 'seller')
  @Post(':id/answer')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'پاسخ به نظر (مخصوص ادمین/فروشنده)' })
  async answer(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: AnswerReviewDto,
  ) {
    return this.reviewsService.answerReview(id, adminId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superAdmin')
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'حذف نظر' })
  async delete(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    const isAdmin = role === 'admin' || role === 'superAdmin';
    return this.reviewsService.delete(id, userId, isAdmin);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superAdmin')
  @Get('admin/all')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'دریافت تمام نظرات برای پنل ادمین' })
  async getAllForAdmin(@Query() query: ReviewSearchDto) {
    return this.reviewsService.getAllReviewsForAdmin(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller')
  @Get('seller/my-reviews')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'دریافت نظرات مربوط به محصولات فروشنده جاری' })
  async getSellerReviews(
    @CurrentUser('id') sellerId: string,
    @Query() query: ReviewSearchDto,
  ) {
    return this.reviewsService.getSellerProductReviews(sellerId, query);
  }
}