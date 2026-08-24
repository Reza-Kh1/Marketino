import { Body, Controller, Get, Param, Put, Post, UseGuards, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { StoreService } from './store.service'
import { AnswerStoreReviewDto, CreateStoreDto, CreateStoreReviewDto, SearchAdminStore, SearchUserStore, UpdateStoreDto, UpdateStoreReviewStatusDto, UpdateStoreStatusDto } from './dto/store.dto'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard'
import { Roles } from '@/common/decorators/roles.decorator'

@ApiTags('Stores')
@Controller('stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create store', description: 'Create a seller store. New stores are always created with pending status and inactive state.' })
  @ApiBody({ type: CreateStoreDto })
  @ApiResponse({ status: 201, description: 'Store created successfully.' })
  @ApiBearerAuth()
  async createStore(@CurrentUser('id') id: string, @Body() dto: CreateStoreDto) {
    return this.storeService.createStore(id, dto)
  }

  @Get()
  @ApiOperation({ summary: 'Get store (user)', description: 'Search, filter and sort stores for the admin panel.' })
  @ApiResponse({ status: 200, description: 'Paginated list of stores.' })
  async getStoreUsers(@Query() query: SearchUserStore) {
    return this.storeService.getStoreUsers(query)
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

  @Get(':slug')
  @ApiOperation({ summary: 'Get store by Slug' })
  @ApiParam({ name: 'slug', description: 'Store Slug', example: '5783a255-e039-41d7-a5ed-0d950c1d591a', })
  @ApiResponse({ status: 200, description: 'Store information.' })
  @ApiResponse({ status: 404, description: 'Store not found.' })
  async getStore(@Param('slug') slug: string) {
    return this.storeService.getStore(slug);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update store', description: 'Update store information. Status and activation are not changed by this endpoint.' })
  @ApiParam({ name: 'id', description: 'Store ID' })
  @ApiBody({ type: UpdateStoreDto })
  async updateStore(@Param('id') id: string, @Body() dto: UpdateStoreDto) {
    return this.storeService.updateStore(id, dto)
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Roles('admin', 'superAdmin')
  @ApiOperation({ summary: 'Update store status', description: 'Approve or reject a seller store.' })
  @ApiParam({ name: 'id', description: 'Store ID' })
  @ApiBody({ type: UpdateStoreStatusDto })
  async updateStoreStatus(@Param('id') id: string, @Body() dto: UpdateStoreStatusDto) {
    return this.storeService.updateStoreStatus(id, dto)
  }

  @Post(':storeId/reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create store review', description: 'Create a review for a store. The review is created with pending status.' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiBody({ type: CreateStoreReviewDto })
  async createStoreReview(@Param('storeId') storeId: string, @Body() dto: CreateStoreReviewDto) {
    throw new Error('Connect userId to your authentication system')
  }

  @Put('reviews/:reviewId/approve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Roles('admin', 'superAdmin')
  @ApiOperation({ summary: 'Approve store review', description: 'Approve a store review and update store rating statistics.' })
  @ApiParam({ name: 'reviewId', description: 'Store review ID' })
  async approveStoreReview(@Param('reviewId') reviewId: string) {
    return this.storeService.approveStoreReview(reviewId)
  }

  @Put('reviews/:reviewId/reject')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Roles('admin', 'superAdmin')
  @ApiOperation({ summary: 'Reject store review', description: 'Reject a store review. If it was previously approved, its rating statistics are reverted.' })
  @ApiParam({ name: 'reviewId', description: 'Store review ID' })
  async rejectStoreReview(@Param('reviewId') reviewId: string) {
    return this.storeService.rejectStoreReview(reviewId)
  }

  @Put('reviews/:reviewId/answer')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Answer store review', description: 'Add seller answer to a store review. Response statistics are updated only when the review is approved.' })
  @ApiParam({ name: 'reviewId', description: 'Store review ID' })
  @ApiBody({ type: AnswerStoreReviewDto })
  async answerStoreReview(@Param('reviewId') reviewId: string, @Body() dto: AnswerStoreReviewDto) {
    return this.storeService.answerStoreReview(reviewId, dto.answerReview)
  }

  @Put('qna/:qnaId/approve')
  @ApiOperation({ summary: 'Approve Q&A', description: 'Approve a Q&A question. If the seller has already answered it, response statistics will be calculated.' })
  @ApiParam({ name: 'qnaId', description: 'Q&A question ID' })
  async approveQna(@Param('qnaId') qnaId: string) {
    return this.storeService.approveQna(qnaId)
  }

  @Put('qna/:qnaId/reject')
  @ApiOperation({ summary: 'Reject Q&A', description: 'Reject a Q&A question. If it was previously approved, its response statistics are reverted.' })
  @ApiParam({ name: 'qnaId', description: 'Q&A question ID' })
  async rejectQna(@Param('qnaId') qnaId: string) {
    return this.storeService.rejectQna(qnaId)
  }
}