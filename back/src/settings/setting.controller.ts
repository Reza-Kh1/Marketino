import { Controller, Get, Post, Body, Delete, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SettingsService } from './setting.service';
import { CreateShippingMethodDto } from './dto/shipping.dto';

@ApiTags('Settings')
@Controller('settings')
export class SettingController {
    constructor(private readonly settingsService: SettingsService) {}

    @Post('shipping')
    @ApiOperation({ summary: 'Create a new shipping method' })
    @ApiResponse({ status: 201, description: 'Created' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    create(@Body() dto: CreateShippingMethodDto) {
        return this.settingsService.create(dto);
    }

    @Get('shipping')
    @ApiOperation({ summary: 'Get all shipping methods' })
    @ApiResponse({ status: 200, description: 'Success' })
    findAll() {
        return this.settingsService.findAll();
    }

    @Delete('shipping/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a shipping method' })
    @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
    @ApiResponse({ status: 204, description: 'Deleted' })
    @ApiResponse({ status: 404, description: 'Not found' })
    remove(@Param('id') id: string) {
        return this.settingsService.remove(id);
    }
}