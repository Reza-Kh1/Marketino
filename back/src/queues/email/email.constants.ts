export const EMAIL_QUEUE = 'email-queue';

export const EMAIL_JOB = {
  OTP: 'send-otp',
  WELCOME: 'send-welcome',
  GENERIC: 'send-generic',
} as const;

/** Gmail-safe: یک worker، حداکثر ~15 ایمیل در دقیقه */
export const EMAIL_WORKER_CONCURRENCY = 1;
export const EMAIL_LIMITER = { max: 15, duration: 60_000 };

/** Rate limit per recipient (Redis) */
export const OTP_COOLDOWN_SEC = 60;        // حداقل فاصله بین دو ارسال
export const OTP_MAX_PER_HOUR = 5;
export const OTP_MAX_PER_DAY = 10;
export const OTP_TTL_SEC = 5 * 60;         // اعتبار کد
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_LOCK_SEC = 15 * 60;       // قفل بعد از attempt زیاد