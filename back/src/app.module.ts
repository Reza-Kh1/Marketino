/**
 * AppModule - ماژول اصلی برنامه
 * تمام ماژول‌های برنامه در اینجا import می‌شوند
 */
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { EmailModule } from './email/email.module';
import { PhoneModule } from './phone/phone.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AddressesModule } from './addresses/addresses.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { ReviewsModule } from './reviews/reviews.module';
import { BlogModule } from './blog/blog.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { CompareModule } from './compare/compare.module';
import { MessagesModule } from './messages/messages.module';
import { NotificationsModule } from './notifications/notifications.module';
import { WalletModule } from './wallet/wallet.module';
import { DiscountsModule } from './discounts/discounts.module';
import { AdminModule } from './admin/admin.module';
import { MediaModule } from './media/media.module';
import { AiModule } from './ai/ai.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BrandsModule } from './brand/brand.module';
import { ConfigModules } from './common/config/config.module';
import { ReportModule } from './report/report.module';
import { TicketModule } from './tickets/ticket.module';
import { QnaModule } from './qna/qna.module';
import { ColorsModule } from './colors/colors.module';
import { RedisModule } from './redis/redis.module';
import { DiscountQueueModule } from './queues/discount/discount-queue.module';
import { VariantsModule } from './variants/variants.module';
import { SearchModule } from './search/search.module';
import { SettingModule } from './settings/setting.module';
import { StoreModule } from './store/store.module';

@Module({
  imports: [
    // ماژول‌های برنامه
    RedisModule,
    DiscountQueueModule,
    PrismaModule,
    EmailModule,
    PhoneModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    VariantsModule,
    CategoriesModule,
    CartModule,
    OrdersModule,
    ReviewsModule,
    BlogModule,
    WishlistModule,
    CompareModule,
    MessagesModule,
    NotificationsModule,
    WalletModule,
    DiscountsModule,
    AdminModule,
    ConfigModules,
    MediaModule,
    AiModule,
    AddressesModule,
    BrandsModule,
    ReportModule,
    TicketModule,
    QnaModule,
    ColorsModule,
    SearchModule,
    SettingModule,
    StoreModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
