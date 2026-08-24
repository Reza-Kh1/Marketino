import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchProductsDto } from './dto/search.dto';

@ApiTags('Search & Filters') // گروه‌بندی در Swagger
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'جستجوی عمومی در تمامی محصولات' })
  @ApiResponse({ status: 200, description: 'لیست محصولات با موفقیت دریافت شد.' })
  async searchGlobal(@Query() queryDto: SearchProductsDto) {
    return this.searchService.searchProducts(queryDto);
  }
}