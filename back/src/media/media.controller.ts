import {
  Controller, Post, Delete, Get,
  UseInterceptors, UploadedFile,
  Body, Param, Query,
  UseGuards, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiParam, ApiOkResponse } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { UploadImageDto } from './dto/upload-image.dto';
import { SearchMediaDto } from './dto/search.media.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';

@ApiTags('Media')
@Controller('media')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class MediaController {
  constructor(private readonly mediaService: MediaService) { }

  @Post('/')
  @ApiOperation({ summary: 'آپلود یک تصویر' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024, files: 1 },
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new BadRequestException('فقط فایل تصویری مجاز است'), false);
      }
      cb(null, true);
    },
  }))
  uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadImageDto,
  ) {
    if (!file) throw new BadRequestException('فایلی آپلود نشده است');
    return this.mediaService.uploadImage(file, dto);
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'حذف فایل از S3 و دیتابیس' })
  deleteMedia(
    @Param('id') id: string,
  ) {
    return this.mediaService.deleteMedia(id);
  }

  @Get('/')
  @ApiOperation({ summary: 'فیلتر و نمایش لیست رسانه‌های کاربر', description: 'جستجوی تمام فایل ها و عکس ها' })
  @ApiOkResponse({ type: SearchMediaDto, description: 'لیست پست‌ها' })
  async getAll(@Query() query: SearchMediaDto) {
    return this.mediaService.getAllMedia(query);
  }
}
