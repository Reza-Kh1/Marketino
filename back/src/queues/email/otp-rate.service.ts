import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import Redis from 'ioredis';
import {
  OTP_COOLDOWN_SEC,
  OTP_MAX_PER_HOUR,
  OTP_MAX_PER_DAY,
  OTP_MAX_ATTEMPTS,
  OTP_LOCK_SEC,
} from './email.constants';

@Injectable()
export class OtpRateService {
  constructor(private readonly redis: Redis) {} // مسیر inject پروژه خودتان

  private coolKey(email: string, purpose: string) {
    return `otp:cd:${purpose}:${email}`;
  }
  private hourKey(email: string, purpose: string) {
    return `otp:h:${purpose}:${email}`;
  }
  private dayKey(email: string, purpose: string) {
    return `otp:d:${purpose}:${email}`;
  }
  private attemptKey(email: string, purpose: string) {
    return `otp:att:${purpose}:${email}`;
  }
  private lockKey(email: string, purpose: string) {
    return `otp:lock:${purpose}:${email}`;
  }

  /** قبل از ارسال — اگر رد شد exception */
  async assertCanSend(email: string, purpose: string) {
    const e = email.toLowerCase().trim();

    if (await this.redis.get(this.lockKey(e, purpose))) {
      throw new HttpException('تعداد تلاش بیش از حد؛ کمی بعد دوباره امتحان کنید', HttpStatus.TOO_MANY_REQUESTS);
    }

    const cd = await this.redis.ttl(this.coolKey(e, purpose));
    if (cd > 0) {
      throw new HttpException(`لطفاً ${cd} ثانیه صبر کنید`, HttpStatus.TOO_MANY_REQUESTS);
    }

    const hour = Number((await this.redis.get(this.hourKey(e, purpose))) || 0);
    if (hour >= OTP_MAX_PER_HOUR) {
      throw new HttpException('سقف ارسال ساعتی پر شده است', HttpStatus.TOO_MANY_REQUESTS);
    }

    const day = Number((await this.redis.get(this.dayKey(e, purpose))) || 0);
    if (day >= OTP_MAX_PER_DAY) {
      throw new HttpException('سقف ارسال روزانه پر شده است', HttpStatus.TOO_MANY_REQUESTS);
    }
  }

  /** بعد از enqueue موفق */
  async markSent(email: string, purpose: string) {
    const e = email.toLowerCase().trim();
    const pipe = this.redis.pipeline();
    pipe.set(this.coolKey(e, purpose), '1', 'EX', OTP_COOLDOWN_SEC);
    pipe.incr(this.hourKey(e, purpose));
    pipe.expire(this.hourKey(e, purpose), 3600, 'NX');
    pipe.incr(this.dayKey(e, purpose));
    pipe.expire(this.dayKey(e, purpose), 86400, 'NX');
    // attempt را با ارسال جدید ریست می‌کنیم
    pipe.del(this.attemptKey(e, purpose));
    await pipe.exec();
  }

  /** روی verify اشتباه */
  async registerFailedAttempt(email: string, purpose: string) {
    const e = email.toLowerCase().trim();
    const n = await this.redis.incr(this.attemptKey(e, purpose));
    if (n === 1) await this.redis.expire(this.attemptKey(e, purpose), OTP_LOCK_SEC);
    if (n >= OTP_MAX_ATTEMPTS) {
      await this.redis.set(this.lockKey(e, purpose), '1', 'EX', OTP_LOCK_SEC);
      throw new HttpException('کد بیش از حد اشتباه وارد شد؛ ۱۵ دقیقه قفل شد', HttpStatus.TOO_MANY_REQUESTS);
    }
  }

  async clearAttempts(email: string, purpose: string) {
    const e = email.toLowerCase().trim();
    await this.redis.del(this.attemptKey(e, purpose), this.lockKey(e, purpose));
  }
}