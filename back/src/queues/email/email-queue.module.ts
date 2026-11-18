import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EMAIL_QUEUE } from './email.constants';
import { EmailQueueService } from './email-queue.service';
import { EmailProcessor } from './email.processor';
import { EmailModule } from '../../email/email.module';
import { OtpRateService } from './otp-rate.service';

@Module({
  imports: [
    BullModule.registerQueue({ name: EMAIL_QUEUE }),
    EmailModule,
  ],
  providers: [EmailQueueService, EmailProcessor],
  exports: [EmailQueueService],
})
export class EmailQueueModule { }