import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { StorageService } from './storage/storage.service';
import { buildKey } from './storage/media.helper';
import { UploadImageDto } from './dto/upload-image.dto';
import { SearchMediaDto } from './dto/search.media.dto';
import { PrismaService } from '../prisma/prisma.service';
import pagination from '@/common/utils/pagination';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MediaService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
    private configService: ConfigService,
  ) { }

  private async safeDelete(key: string) {
    const deleted = await this.storageService.delete(key);
    if (!deleted) {
      console.error(`[MediaService] فایل یتیم روی S3: ${key}`);
    }
  }

  async uploadImage(file: Express.Multer.File, dto: UploadImageDto) {
    if (!file) throw new BadRequestException('فایلی آپلود نشده است');
    const { alt, isMain, productId, sortOrder = 0 } = dto;
    const key = buildKey(file.mimetype, file.originalname);
    try {
      await this.storageService.upload(key, file.buffer, file.mimetype);
    } catch (err) {
      console.error(err);
      throw new BadRequestException('خطا در آپلود فایل');
    }

    let mediaRecord;
    try {
      mediaRecord = await this.prisma.productImage.create({
        data: {
          alt,
          url: key,
          isMain,
          productId,
          sortOrder: Number(sortOrder)
        },
      });
    } catch (error) {
      await this.safeDelete(key);
      throw error;
    }
    return mediaRecord;
  }

  async deleteMedia(id: string) {
    const media = await this.prisma.productImage.findUnique({ where: { url: id } });

    if (!media) throw new NotFoundException('فایل پیدا نشد');

    await this.prisma.productImage.delete({ where: { url: id } });

    const deleted = await this.storageService.delete(media.url);
    if (!deleted) {
      console.error(`[MediaService] حذف از S3 ناموفق: ${media.url}`);
    }

    return { success: true, message: 'فایل حذف شد' };
  }

  async getAllMedia(query: SearchMediaDto) {
    const { page = 1, order = 'desc', limit, isMain, productId, url, useCase } = query;
    const where: any = {
      ...((isMain && isMain !== 'All') && { isMain: isMain === "true" ? true : false }),
      ...(productId && { productId: productId }),
      ...(url && { url: url }),
      ...((useCase !== "ALL" && useCase) && { useCase: useCase })
    }
    const limitPage = Number(limit) || this.configService.get('limit.medias')
    const skip = (Number(page) - 1) * Number(limitPage);
    const take = Number(limitPage);

    const [data, count] = await this.prisma.$transaction([
      this.prisma.productImage.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: order || 'desc' },
      }),
      this.prisma.productImage.count({ where }),
    ]);
    return {
      data,
      pagination: pagination(count, Number(page), Number(limitPage)),
    };
  }
}