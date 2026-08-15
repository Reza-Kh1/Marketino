import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { CreateProductVariantDto, UpdateProductVariantDto } from './dto/ProductVariant.dto';
import { VariantsService } from './variants.service';
import { AttributeDefinitionDto, AttributeDefinitionSearch } from './dto/AttributeDefinition.dto';

@ApiTags('Variants')
@Controller('variants')
export class VariantsController {
  constructor(private readonly variantsService: VariantsService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller', 'admin')
  @Post('/')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ایجاد Variant محصول' })
  @ApiBody({ type: CreateProductVariantDto })
  async createVariant(@Body() dto: CreateProductVariantDto) {
    return this.variantsService.createVariant(dto);
  }

  /** ############### AttributeDefinition (روت‌های ثابت باید قبل از :id بیان) ############### */

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller', 'admin')
  @Get('attribute-definition')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'دریافت لیست AttributeDefinition' })
  async getAttributeDefinition(@Query() query: AttributeDefinitionSearch) {
    return this.variantsService.getAttributeDefinition(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller', 'admin')
  @Post('attribute-definition')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ایجاد AttributeDefinition' })
  async createAttributeDefinition(@Body() body: AttributeDefinitionDto) {
    return this.variantsService.createAttributeDefinition(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller', 'admin')
  @Put('attribute-definition/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ویرایش AttributeDefinition' })
  async updateAttributeDefinition(@Param('id') id: string, @Body() body: AttributeDefinitionDto) {
    return this.variantsService.updateAttributeDefinition(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller', 'admin')
  @Delete('attribute-definition/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'حذف AttributeDefinition' })
  async deleteAttributeDefinition(@Param('id') id: string) {
    return this.variantsService.deleteAttributeDefinition(id);
  }

  /** ############### Variant (روت داینامیک :id/:variantId — باید آخر بمونه) ############### */

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'دریافت لیست Variantهای یک محصول' })
  async getVariants(@Param('id') id: string) {
    return this.variantsService.getVariants(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller', 'admin')
  @Put(':variantId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ویرایش Variant' })
  async updateVariant(@Param('variantId') variantId: string, @Body() dto: UpdateProductVariantDto) {
    return this.variantsService.updateVariant(variantId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller', 'admin')
  @Delete(':variantId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'حذف Variant' })
  async deleteVariant(@Param('variantId') variantId: string) {
    return this.variantsService.deleteVariant(variantId);
  }
}