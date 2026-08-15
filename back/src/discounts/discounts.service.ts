/**
 * DiscountsService - سرویس مدیریت کدهای تخفیف
 */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDiscountDto } from './dto/discount.dto';
import pagination from '../common/utils/pagination';
import { ValidateDiscountDto } from './dto/validate.discount.dto';
import { DiscountQueueService } from '@/queues/discount/discount-queue.service';

@Injectable()
export class DiscountsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly discountQueueService: DiscountQueueService,
  ) { }

  /** دریافت تمام کدهای تخفیف */
  async findAll(page: number = 1, limit: number = 10) {
    const skip = (Number(page) - 1) * Number(limit);
    const [discounts, total] = await Promise.all([
      this.prisma.discountCode.findMany({ take: limit, orderBy: { createdAt: 'desc' }, skip }),
      this.prisma.discountCode.count(),
    ]);
    const pages = pagination(total, page, limit)
    return { discounts, total, pagination: pages };
  }

  async listDiscount() {
    const discounts = await this.prisma.discountCode.findMany({
      select: {
        id: true,
        code: true,
        isActive: true,
      }
    })
    return discounts
  }

  /** بررسی و اعتبارسنجی کد تخفیف */
  async validate(body: ValidateDiscountDto) {
    const { code, orderAmount } = body
    const discount = await this.prisma.discountCode.findUnique({ where: { code: code.toUpperCase() } });
    if (!discount) throw new NotFoundException('کد تخفیف نامعتبر است');
    if (!discount.isActive) throw new BadRequestException('کد تخفیف غیرفعال است');
    if (new Date() < discount.startsAt) throw new BadRequestException('کد تخفیف هنوز فعال نشده است');
    if (new Date() > discount.endsAt) throw new BadRequestException('کد تخفیف منقضی شده است');
    if (discount.usageLimit > 0 && discount.usedCount >= discount.usageLimit) throw new BadRequestException('سقف استفاده از کد تخفیف تمام شده');
    if (Number(orderAmount) < discount.minOrderAmount) throw new BadRequestException(`حداقل مبلغ سفارش ${discount.minOrderAmount.toLocaleString()} تومان است`);

    let discountAmount = 0;
    if (discount.type === 'percentage') {
      discountAmount = Number(orderAmount) * (discount.value / 100);
      if (discount.maxDiscount) discountAmount = Math.min(discountAmount, discount.maxDiscount);
    } else {
      discountAmount = discount.value;
    }

    return { ...discount, discountAmount };
  }

  /** ایجاد کد تخفیف جدید */
  async create(creatorId: string, dto: CreateDiscountDto) {
    const existing = await this.prisma.discountCode.findUnique({ where: { code: dto.code.toUpperCase() } });
    if (existing) throw new BadRequestException('این کد تخفیف قبلاً ثبت شده است');
    const now = new Date();
    const discount = await this.prisma.discountCode.create({
      data: {
        ...dto,
        code: dto.code.toUpperCase(),
        startsAt: new Date(dto.startsAt),
        endsAt: new Date(dto.endsAt),
        creatorId,
      },
    });

    if (discount.endsAt) {
      await this.discountQueueService.scheduleExpire(discount.id, discount.endsAt);
    }

    if (discount.startsAt > now) {
      await this.discountQueueService.scheduleActivate(discount.id, discount.startsAt);
    }

    return { success: true }
  }

  /** حذف کد تخفیف */
  async delete(id: string) {
    const discount = await this.prisma.discountCode.findUnique({ where: { id } });
    if (!discount) throw new NotFoundException('کد تخفیف یافت نشد');
    const variants = await this.prisma.productVariant.findMany({
      where: { discountId: id },
      select: { productId: true },
      distinct: ['productId'],
    });
    const productIds = variants.map((v) => v.productId);
    await this.discountQueueService.cancelJobs(id);
    await this.prisma.discountCode.delete({ where: { id } });
    await this.discountQueueService.enqueueSyncForProducts(productIds);
    return { success: true }
  }

  /** فعال/غیرفعال کردن کد تخفیف */
  async toggleActive(id: string) {
    const discount = await this.prisma.discountCode.findUnique({ where: { id } });
    if (!discount) throw new NotFoundException('کد تخفیف یافت نشد');
    await this.prisma.discountCode.update({ where: { id }, data: { isActive: !discount.isActive } });
    await this.discountQueueService.enqueueImmediateSync(id);
    return { success: true }
  }
}