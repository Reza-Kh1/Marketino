import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SettlementQueueService } from './settlement-queue.service.js';
import { SETTLEMENT_QUEUE } from './settlement.constants.js';
import { PrismaModule } from '../../prisma/prisma.module';
import { SettlementProcessor } from './settlement.processor.js';

@Module({
  imports: [
    BullModule.registerQueue({
      name: SETTLEMENT_QUEUE,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 30_000 },
        removeOnComplete: { count: 5 },                  // قبلاً: ۲۰۰۰ تا / ۲۴ ساعت
        removeOnFail: { count: 20, age: 7 * 24 * 3600 }, // قبلاً: ۵۰۰۰ تا
      },
    }),
    PrismaModule,
  ],
  providers: [SettlementQueueService, SettlementProcessor],
  exports: [SettlementQueueService],
})
export class SettlementQueueModule { }
