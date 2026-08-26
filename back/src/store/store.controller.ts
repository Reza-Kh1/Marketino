import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StoreService } from './store.service';
import { AnswerStoreReviewDto, CreateStoreDto, CreateStoreReviewDto, SearchAdminStore, SearchAdminStoreReview, SearchUserStore, UpdateStoreDto, UpdateStoreStatusDto } from './dto/store.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { DefaultQueryDto } from '@/common/dtos/defualt.query.dto';

@ApiTags('Stores')
@Controller('stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create store', description: 'Create a seller store. New stores are created as pending and inactive.' })
  @ApiBody({ type: CreateStoreDto })
  @ApiResponse({ status: 201, description: 'Store created successfully.' })
  async createStore(@CurrentUser('id') id: string, @Body() dto: CreateStoreDto) {
    return this.storeService.createStore(id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get stores', description: 'Search, filter and sort stores for users.' })
  @ApiResponse({ status: 200, description: 'Paginated list of stores.' })
  async getStoreUsers(@Query() query: SearchUserStore) {
    return this.storeService.getStoreUsers(query);
  }

  @Get('/admin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Roles('admin', 'superAdmin')
  @ApiOperation({ summary: 'Get stores (admin)', description: 'Search, filter and sort stores for the admin panel.' })
  @ApiResponse({ status: 200, description: 'Paginated list of stores.' })
  async getStoreAdmin(@Query() query: SearchAdminStore) {
    return this.storeService.getStoreAdmin(query);
  }

  @Get('reviews/:id')
  @ApiOperation({ summary: 'Get store review' })
  @ApiParam({ name: 'id', description: 'Store ID' })
  async getStoreReview(@Param('storeId') storeId: string, @Query('page') page: string) {
    return this.storeService.getStoreReview(storeId, page);
  }

  @Get('reviews-admin/')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Roles('admin', 'superAdmin')
  @ApiOperation({ summary: 'Get Admin store review' })
  async getStoreReviewAdmin(@Query() query: SearchAdminStoreReview) {
    return this.storeService.getStoreReviewAdmin(query);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get store by slug' })
  @ApiParam({ name: 'slug', description: 'Store slug' })
  @ApiResponse({ status: 200, description: 'Store information.' })
  @ApiResponse({ status: 404, description: 'Store not found.' })
  async getStore(@Param('slug') slug: string) {
    return this.storeService.getStore(slug);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update store', description: 'Update store information.' })
  @ApiParam({ name: 'id', description: 'Store ID' })
  @ApiBody({ type: UpdateStoreDto })
  async updateStore(@Param('id') id: string, @Body() dto: UpdateStoreDto) {
    return this.storeService.updateStore(id, dto);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Roles('admin', 'superAdmin')
  @ApiOperation({ summary: 'Update store status' })
  @ApiParam({ name: 'id', description: 'Store ID' })
  @ApiBody({ type: UpdateStoreStatusDto })
  async updateStoreStatus(@Param('id') id: string, @Body() dto: UpdateStoreStatusDto) {
    return this.storeService.updateStoreStatus(id, dto);
  }

  @Post(':storeId/reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create store review' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiBody({ type: CreateStoreReviewDto })
  async createStoreReview(@CurrentUser('id') userId: string, @Param('storeId') storeId: string, @Body() dto: CreateStoreReviewDto) {
    return this.storeService.createStoreReview(userId, storeId, dto);
  }

  @Put('reviews/:reviewId/approve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Roles('admin', 'superAdmin')
  @ApiOperation({ summary: 'Approve store review' })
  @ApiParam({ name: 'reviewId', description: 'Store review ID' })
  async approveStoreReview(@Param('reviewId') reviewId: string) {
    return this.storeService.approveStoreReview(reviewId);
  }

  @Put('reviews/:reviewId/reject')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Roles('admin', 'superAdmin')
  @ApiOperation({ summary: 'Reject store review' })
  @ApiParam({ name: 'reviewId', description: 'Store review ID' })
  async rejectStoreReview(@Param('reviewId') reviewId: string) {
    return this.storeService.rejectStoreReview(reviewId);
  }

  @Put('reviews/:reviewId/answer')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Roles('seller', 'admin', 'superAdmin')
  @ApiOperation({ summary: 'Answer store review', description: 'Answering a pending review also approves it.' })
  @ApiParam({ name: 'reviewId', description: 'Store review ID' })
  @ApiBody({ type: AnswerStoreReviewDto })
  async answerStoreReview(@Param('reviewId') reviewId: string, @Body() dto: AnswerStoreReviewDto) {
    return this.storeService.answerStoreReview(reviewId, dto.answerReview);
  }
}