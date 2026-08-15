/**
 * DiscountsModule - ماژول کدهای تخفیف
 */
import { Module } from '@nestjs/common';
import { DiscountsController } from './discounts.controller';
import { DiscountsService } from './discounts.service';
import { DiscountQueueService } from '@/queues/discount/discount-queue.service';
import { DiscountQueueModule } from '@/queues/discount/discount-queue.module';

@Module({
    imports: [DiscountQueueModule],
    controllers: [DiscountsController],
    providers: [DiscountsService],
    exports: [DiscountsService]
})
export class DiscountsModule { }
