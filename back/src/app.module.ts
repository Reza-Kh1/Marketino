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
import { SellerModule } from './seller/seller.module';
import { AdminModule } from './admin/admin.module';
// import { UploadModule } from './upload/upload.module'; // کامنت: از ماژول media استفاده می‌شود
import { MediaModule } from './media/media.module';
import { AiModule } from './ai/ai.module';
import { ShopsModule } from './shops/shops.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BrandsModule } from './brand/brand.module';
import { ConfigModules } from './common/config/config.module';

@Module({
  imports: [
    // ماژول‌های برنامه
    PrismaModule,
    EmailModule,
    PhoneModule,
    AuthModule,
    UsersModule,
    ProductsModule,
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
    SellerModule,
    AdminModule,
    ConfigModules,
    // UploadModule, // کامنت: از MediaModule استفاده می‌شود
    MediaModule,
    AiModule,
    ShopsModule,
    AddressesModule,
    BrandsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
