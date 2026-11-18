import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EMAIL_JOB, EMAIL_QUEUE, EMAIL_WORKER_CONCURRENCY } from './email.constants';
import { EmailService } from '../../email/email.service';

@Processor(EMAIL_QUEUE, {
  concurrency: EMAIL_WORKER_CONCURRENCY,
  limiter: { max: 15, duration: 60_000 }, // Gmail-safe
})
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(
    private readonly emailService: EmailService
  ) {
    super();
  }

  async process(job: Job) {
    switch (job.name) {
      case EMAIL_JOB.OTP: {
        const { to, code, lang } = job.data;
        await this.emailService.sendOTPEmail(to, code, lang ?? 'fa');
        return { ok: true };
      }
      default:
        this.logger.warn(`unknown job ${job.name}`);
        return { skipped: true };
    }
  }
}