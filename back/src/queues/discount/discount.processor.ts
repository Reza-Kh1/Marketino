// queues/discount/discount.processor.ts
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { VariantsService } from '../../variants/variants.service';
import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import pLimit from 'p-limit';
@Processor('discount-queue', {
  concurrency: 3,                      // ✅ حداکثر ۳ تخفیف همزمان پردازش بشه
  limiter: { max: 10, duration: 1000 }, // ✅ حداکثر ۱۰ job در ثانیه شروع بشه
})
export class DiscountProcessor extends WorkerHost {
  private readonly logger = new Logger(DiscountProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly variantsService: VariantsService,
  ) {
    super();
  }

  async process(job: Job) {
    switch (job.name) {
      case 'expire-discount':
        await this.prisma.discountCode.update({
          where: { id: job.data.discountId },
          data: { isActive: false },
        });
        await this.syncAffectedProducts(job.data.discountId);
        break;

      case 'activate-discount':
        await this.prisma.discountCode.update({
          where: { id: job.data.discountId },
          data: { isActive: true },
        });
        await this.syncAffectedProducts(job.data.discountId);
        break;

      case 'sync-discount': // 👈 جدید — برای deactivate دستی
        await this.syncAffectedProducts(job.data.discountId);
        break;

      case 'sync-products': // 👈 جدید — برای remove (که دیگه discountId نداره)
        await this.syncProductsBatch(job.data.productIds);
        break;

      default:
        this.logger.warn(`Unknown job name received: ${job.name}`)
    }
  }

  private async syncAffectedProducts(discountId: string) {
    const variants = await this.prisma.productVariant.findMany({
      where: { discountId },
      select: { productId: true },
      distinct: ['productId'],
    });
    await this.syncProductsBatch(variants.map((v) => v.productId));
  }

  private async syncProductsBatch(productIds: string[]) {
    if (productIds.length === 0) return;

    const limit = pLimit(5);
    const results = await Promise.allSettled(
      productIds.map((id) => limit(() => this.variantsService.syncProductPricing(id))),
    );

    const failed = results
      .map((r, i) => ({ r, productId: productIds[i] }))
      .filter(({ r }) => r.status === 'rejected');

    if (failed.length > 0) {
      this.logger.warn(
        `Sync failed for products: ${failed.map((f) => f.productId).join(', ')}`,
      );
      throw new Error(`${failed.length}/${productIds.length} محصول sync نشد`);
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    this.logger.error(`Job ${job.id} (${job.name}) failed: ${err.message}`);
  }
}