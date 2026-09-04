import { Controller, Get, Post, Body, Delete, Param, HttpCode, HttpStatus, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SettingsService } from './setting.service';
import { CreateShippingMethodDto } from './dto/shipping.dto';

@ApiTags('Settings')
@Controller('settings')
export class SettingController {
    constructor(private readonly settingsService: SettingsService) { }

}