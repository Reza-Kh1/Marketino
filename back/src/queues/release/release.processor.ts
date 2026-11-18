import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import {
  RELEASE_AFTER_MS,
  RELEASE_BATCH,
  RELEASE_MAX_BATCHES_PER_RUN,
  RELEASE_QUEUE,
  RELEASE_SCAN_JOB,
} from './release.constants';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Processor(RELEASE_QUEUE, { concurrency: 1 })
export class ReleaseProcessor extends WorkerHost {
  private readonly logger = new Logger(ReleaseProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job) {
    if (job.name !== RELEASE_SCAN_JOB) return { skipped: 'unknown-job' };
    return this.releaseUnpaid();
  }

  /**
   * هر batch اتمیک:
   * 1) checkoutهای pending قدیمی را با SKIP LOCKED قفل می‌کند
   * 2) status → cancelled
   * 3) موجودی وریانت + saleCount محصول/وریانت برمی‌گردد
   */
  async releaseUnpaid() {
    const cutoff = new Date(Date.now() - RELEASE_AFTER_MS);
    let total = 0;

    for (let i = 0; i < RELEASE_MAX_BATCHES_PER_RUN; i++) {
      const released = await this.prisma.$transaction(async (tx) => {
        // 1) قفل checkoutهای واجد شرایط
        const due = await tx.$queryRaw<{ id: string }[]>`
          SELECT c.id
          FROM checkouts c
          WHERE c.payment_status = 'pending'
            AND c.status = 'pending'
            AND c.created_at <= ${cutoff}
          ORDER BY c.created_at
          LIMIT ${RELEASE_BATCH}::int
          FOR UPDATE OF c SKIP LOCKED
        `;

        if (!due.length) return 0;

        const checkoutIds = due.map((d) => d.id);

        // 2) آیتم‌های سفارش برای restore موجودی
        const items = await tx.orderItem.findMany({
          where: { order: { checkoutId: { in: checkoutIds } } },
          select: {
            quantity: true,
            productId: true,
            variantId: true,
          },
        });

        // 3) cancel checkout + orders (فقط اگر هنوز pending باشند — idempotent)
        await tx.checkout.updateMany({
          where: {
            id: { in: checkoutIds },
            paymentStatus: 'pending',
            status: 'pending',
          },
          data: {
            status: 'cancelled',
            // paymentStatus را pending می‌گذاریم یا به یک وضعیت cancelled_payment اگر دارید
          },
        });

        await tx.order.updateMany({
          where: {
            checkoutId: { in: checkoutIds },
            status: 'pending',
          },
          data: {
            status: 'cancelled',
            cancelledAt: new Date(),
          },
        });

        // 4) restore موجودی و saleCount
        // گروه‌بندی برای کمتر کردن round-trip
        const byVariant = new Map<string, { qty: number; productId: string }>();
        for (const it of items) {
          const prev = byVariant.get(it.variantId) ?? { qty: 0, productId: it.productId };
          prev.qty += it.quantity;
          byVariant.set(it.variantId, prev);
        }

        for (const [variantId, { qty, productId }] of byVariant) {
          await tx.productVariant.update({
            where: { id: variantId },
            data: {
              quantity: { increment: qty },
              saleCount: { decrement: qty },
            },
          });
          await tx.product.update({
            where: { id: productId },
            data: { saleCount: { decrement: qty } },
          });
        }

        return checkoutIds.length;
      }, {
        // برای جلوگیری از deadlock طولانی
        timeout: 30_000,
      });

      total += released;
      if (released < RELEASE_BATCH) break;
    }

    if (total) this.logger.log(`released ${total} unpaid checkouts`);
    return { released: total };
  }
}