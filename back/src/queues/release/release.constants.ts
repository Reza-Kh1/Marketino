export const RELEASE_QUEUE = 'order-release-queue';
export const RELEASE_SCAN_JOB = 'release-unpaid-scan';
export const RELEASE_SCHEDULER_ID = 'release-unpaid-scan-scheduler';

/** هر ۱۵ دقیقه یک‌بار اسکن (سبک؛ فقط ردیف‌های سررسید را می‌گیرد) */
export const RELEASE_SCAN_EVERY_MS = 15 * 60 * 1000;

/** سفارش‌هایی که بیش از ۱۲ ساعت pending مانده‌اند */
export const RELEASE_AFTER_MS = 12 * 60 * 60 * 1000;

export const RELEASE_BATCH = 50;
export const RELEASE_MAX_BATCHES_PER_RUN = 20;