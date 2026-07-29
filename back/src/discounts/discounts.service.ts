/**
 * DiscountsService - سرویس مدیریت کدهای تخفیف
 */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDiscountDto } from './dto/discount.dto';
import pagination from '../common/utils/pagination';
import { ValidateDiscountDto } from './dto/validate.discount.dto';

@Injectable()
export class DiscountsService {
  constructor(private readonly prisma: PrismaService) { }

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

    return this.prisma.discountCode.create({
      data: {
        ...dto,
        code: dto.code.toUpperCase(),
        startsAt: new Date(dto.startsAt),
        endsAt: new Date(dto.endsAt),
        creatorId,
      },
    });
  }

  /** حذف کد تخفیف */
  async delete(id: string) {
    const discount = await this.prisma.discountCode.findUnique({ where: { id } });
    if (!discount) throw new NotFoundException('کد تخفیف یافت نشد');
    return this.prisma.discountCode.delete({ where: { id } });
  }

  /** فعال/غیرفعال کردن کد تخفیف */
  async toggleActive(id: string) {
    const discount = await this.prisma.discountCode.findUnique({ where: { id } });
    if (!discount) throw new NotFoundException('کد تخفیف یافت نشد');
    return this.prisma.discountCode.update({ where: { id }, data: { isActive: !discount.isActive } });
  }
}
