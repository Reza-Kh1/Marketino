/**
 * main.ts - نقطه ورودی اصلی NestJS Application
 * تنظیمات CORS، Validation، Swagger و Static Files در این فایل انجام می‌شود
 */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ============================================
  // تنظیمات CORS - اجازه دسترسی از فرانت Next.js
  // ============================================
  app.enableCors({
    origin: [process.env.FRONTEND_URL || 'http://localhost:3001', process.env.SITE_URL || 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language'],
  });

  // ============================================
  // Cookie Parser - پردازش کوکی‌ها
  // ============================================
  app.use(cookieParser());

  // ============================================
  // Global Validation Pipe - اعتبارسنجی خودکار DTOها
  // ============================================
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // حذف فیلدهای اضافی
      forbidNonWhitelisted: false, // قبول فیلدهای اضافی (برای سازگاری با فرانت‌اند)
      transform: true,            // تبدیل خودکار تایپ‌ها
      transformOptions: {
        enableImplicitConversion: true, // تبدیل خودکار string به number و غیره
      },
    }),
  );

  // ============================================
  // Static Files - فایل‌های استاتیک (uploads)
  // ============================================
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // ============================================
  // Swagger Documentation - مستندات API
  // ============================================
  const config = new DocumentBuilder()
    .setTitle('Marketplace API')
    .setDescription('مستندات API بازارچه آنلاین - NestJS + Prisma')
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('token')
    .addTag('Auth', 'احراز هویت')
    .addTag('Users', 'مدیریت کاربران')
    .addTag('Products', 'محصولات')
    .addTag('Categories', 'دسته‌بندی‌ها')
    .addTag('Cart', 'سبد خرید')
    .addTag('Orders', 'سفارشات')
    .addTag('Reviews', 'نظرات')
    .addTag('Blog', 'وبلاگ')
    .addTag('Brand', 'برند')
    .addTag('Wishlist', 'علاقه‌مندی‌ها')
    .addTag('Compare', 'مقایسه')
    .addTag('Messages', 'پیام‌ها')
    .addTag('Notifications', 'اطلاع‌رسانی‌ها')
    .addTag('Wallet', 'کیف پول')
    .addTag('Discounts', 'کدهای تخفیف')
    .addTag('Admin', 'پنل مدیریت')
    .addTag('Seller', 'پنل فروشنده')
    .addTag('AI', 'هوش مصنوعی')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      docExpansion: 'none',
      displayRequestDuration: true,
      filter: true,
      syntaxHighlight: {
        activated: true,
        theme: 'obsidian',
      },
    },
  });

  // ============================================
  // Start Server
  // ============================================
  const port = parseInt(process.env.PORT || '3000', 10);
  await app.listen(port);
  logger.log(`🚀 سرور روی http://localhost:${port} راه‌اندازی شد`);
  logger.log(`📚 مستندات Swagger: http://localhost:${port}/api/docs`);
}

bootstrap();