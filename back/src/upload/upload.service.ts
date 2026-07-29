/**
 * UploadService - سرویس آپلود فایل
 * مدیریت آپلود و ذخیره‌سازی فایل‌های تصویری
 */
import { Injectable, BadRequestException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private readonly uploadDir = process.env.UPLOAD_DIR || './uploads';
  private readonly allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  private readonly maxSize = parseInt(process.env.MAX_FILE_SIZE || '10485760', 10); // 10MB default

  /**
   * ذخیره فایل آپلود شده
   */
  async saveFile(file: Express.Multer.File, subfolder: string = 'products'): Promise<string> {
    if (!file) throw new BadRequestException('فایلی آپلود نشده است');
    if (!this.allowedMimes.includes(file.mimetype)) throw new BadRequestException('فرمت فایل مجاز نیست');
    if (file.size > this.maxSize) throw new BadRequestException('حجم فایل بیش از حد مجاز است');

    const dir = path.join(this.uploadDir, subfolder);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const ext = path.extname(file.originalname);
    const filename = `${subfolder}-${Date.now()}-${uuidv4().substring(0, 8)}${ext}`;
    const filepath = path.join(dir, filename);

    fs.writeFileSync(filepath, file.buffer);
    return `/uploads/${subfolder}/${filename}`;
  }

  /**
   * ذخیره چند فایل همزمان
   */
  async saveFiles(files: Express.Multer.File[], subfolder: string = 'products'): Promise<string[]> {
    const urls: string[] = [];
    for (const file of files) {
      const url = await this.saveFile(file, subfolder);
      urls.push(url);
    }
    return urls;
  }

  /**
   * حذف فایل
   */
  async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      const filepath = path.join(process.cwd(), fileUrl.replace(/^\//, ''));
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}
