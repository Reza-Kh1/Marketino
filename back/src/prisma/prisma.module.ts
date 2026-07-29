/**
 * PrismaModule - ماژول ارتباط با دیتابیس
 * این ماژول به صورت Global تعریف شده تا در تمام ماژول‌های دیگر قابل استفاده باشد
 */
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
