import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { RELEASE_QUEUE } from './release.constants';
import { ReleaseQueueService } from './release-queue.service';
import { ReleaseProcessor } from './release.processor';
import { PrismaModule } from '../../prisma/prisma.module'; // مسیر خودتان

@Module({
  imports: [
    BullModule.registerQueue({ name: RELEASE_QUEUE }),
    PrismaModule,
  ],
  providers: [ReleaseQueueService, ReleaseProcessor],
  exports: [ReleaseQueueService],
})
export class ReleaseQueueModule {}