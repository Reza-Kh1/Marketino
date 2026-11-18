import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';
import {
  RELEASE_QUEUE,
  RELEASE_SCAN_EVERY_MS,
  RELEASE_SCAN_JOB,
  RELEASE_SCHEDULER_ID,
} from './release.constants';

@Injectable()
export class ReleaseQueueService implements OnModuleInit {
  private readonly logger = new Logger(ReleaseQueueService.name);

  constructor(@InjectQueue(RELEASE_QUEUE) private readonly queue: Queue) {}

  async onModuleInit() {
    try {
      await this.queue.waitUntilReady();
      await this.queue.upsertJobScheduler(
        RELEASE_SCHEDULER_ID,
        { every: RELEASE_SCAN_EVERY_MS },
        {
          name: RELEASE_SCAN_JOB,
          data: {},
          opts: {
            removeOnComplete: { count: 5 },
            removeOnFail: { count: 20 },
          },
        },
      );
      this.logger.log('unpaid-order release scheduler ready (12h)');
    } catch (e) {
      this.logger.error('release-queue redis failed', e as Error);
    }
  }
}