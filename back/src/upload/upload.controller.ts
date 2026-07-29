/**
 * UploadController - کنترلر آپلود فایل (قدیمی)
 * این ماژول با MediaModule جایگزین شده است.
 * برای آپلود از /media/images/multiple و /media/files/multiple استفاده کنید.
 */
import { Controller, Post, UseInterceptors, UploadedFile, UploadedFiles, UseGuards, BadRequestException } from '@nestjs/common';
// import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'; // کامنت: آپلود قدیمی، از media استفاده شود
// import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
// import { UploadService } from './upload.service';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// @ApiTags('Upload')
// @Controller('upload')
// export class UploadController {
//   constructor(private readonly uploadService: UploadService) {}

//   /**
//    * آپلود یک فایل
//    */
//   @UseGuards(JwtAuthGuard)
//   @Post('single')
//   @ApiBearerAuth()
//   @ApiOperation({ summary: 'آپلود یک فایل' })
//   @ApiConsumes('multipart/form-data')
//   @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
//   async uploadSingle(@UploadedFile() file: Express.Multer.File) {
//     const url = await this.uploadService.saveFile(file, 'products');
//     return { success: true, url };
//   }

//   /**
//    * آپلود چند فایل همزمان
//    */
//   @UseGuards(JwtAuthGuard)
//   @Post('multiple')
//   @ApiBearerAuth()
//   @ApiOperation({ summary: 'آپلود چند فایل' })
//   @ApiConsumes('multipart/form-data')
//   @UseInterceptors(FilesInterceptor('files', 10, { limits: { fileSize: 10 * 1024 * 1024 } }))
//   async uploadMultiple(@UploadedFiles() files: Express.Multer.File[]) {
//     if (!files || files.length === 0) throw new BadRequestException('فایلی آپلود نشده است');
//     const urls = await this.uploadService.saveFiles(files, 'products');
//     return { success: true, urls };
//   }

//   /**
//    * آپلود آواتار
//    */
//   @UseGuards(JwtAuthGuard)
//   @Post('avatar')
//   @ApiBearerAuth()
//   @ApiOperation({ summary: 'آپلود آواتار' })
//   @ApiConsumes('multipart/form-data')
//   @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 2 * 1024 * 1024 } }))
//   async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
//     const url = await this.uploadService.saveFile(file, 'avatars');
//     return { success: true, url };
//   }
// }

// کامنت: کلاس اصلی به دلیل جایگزینی با MediaModule حذف شد
export class UploadController {}
