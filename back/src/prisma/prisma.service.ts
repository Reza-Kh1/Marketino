/**
 * PrismaService - سرویس اصلی ارتباط با دیتابیس
 * این سرویس PrismaClient را مدیریت کرده و lifecycle hooks را پیاده‌سازی می‌کند
 */
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  /**
   * اتصال به دیتابیس هنگام شروع ماژول
   */
  async onModuleInit() {
    await this.$connect();
    this.logger.log('✅ اتصال به PostgreSQL با موفقیت برقرار شد');
  }

  /**
   * قطع اتصال از دیتابیس هنگام خاموش شدن ماژول
   */
  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('🔌 اتصال PostgreSQL بسته شد');
  }
}
