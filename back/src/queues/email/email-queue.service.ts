import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { EMAIL_JOB, EMAIL_QUEUE } from './email.constants';

export type OtpEmailJob = {
  to: string;
  code: string;
  purpose: 'auth' | 'reset' | 'verify';
  lang?: string;
};

@Injectable()
export class EmailQueueService {
  constructor(@InjectQueue(EMAIL_QUEUE) private readonly queue: Queue) {}

  /** فقط enqueue — API را بلاک نمی‌کند */
  async enqueueOtp(data: OtpEmailJob) {
    await this.queue.add(EMAIL_JOB.OTP, data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5_000 },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 200 },
      // jobId ثابت → جلوگیری از duplicate هم‌زمان برای یک ایمیل+purpose
      jobId: `otp:${data.purpose}:${data.to}`,
    });
  }

  async enqueueWelcome(to: string, username: string, lang = 'fa') {
    await this.queue.add(
      EMAIL_JOB.WELCOME,
      { to, username, lang },
      {
        attempts: 2,
        removeOnComplete: { count: 50 },
        removeOnFail: { count: 50 },
      },
    );
  }
}