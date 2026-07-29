/**
 * WalletService - سرویس کیف پول
 */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  /** دریافت موجودی و تراکنش‌های کیف پول کاربر */
  async getWallet(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [transactions, total, user] = await Promise.all([
      this.prisma.walletTransaction.findMany({
        where: { userId },
        skip, take: limit, orderBy: { createdAt: 'desc' },
      }),
      this.prisma.walletTransaction.count({ where: { userId } }),
      this.prisma.user.findUnique({ where: { id: userId }, select: { id: true } }),
    ]);

    // محاسبه موجودی از مجموع تراکنش‌ها
    const balanceResult = await this.prisma.walletTransaction.aggregate({
      where: { userId, status: 'completed' },
      _sum: { amount: true },
    });

    return {
      balance: balanceResult._sum.amount || 0,
      transactions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /** درخواست برداشت از کیف پول */
  async requestWithdrawal(userId: string, amount: number) {
    if (amount < 50000) throw new BadRequestException('حداقل مبلغ برداشت ۵۰,۰۰۰ تومان است');

    // محاسبه موجودی
    const balanceResult = await this.prisma.walletTransaction.aggregate({
      where: { userId, status: 'completed' },
      _sum: { amount: true },
    });
    const balance = balanceResult._sum.amount || 0;

    if (amount > balance) throw new BadRequestException('موجودی کافی نیست');

    // ایجاد تراکنش برداشت
    const transaction = await this.prisma.walletTransaction.create({
      data: {
        userId,
        type: 'withdraw',
        amount: -amount,
        balanceBefore: balance,
        balanceAfter: balance - amount,
        description: 'درخواست برداشت',
        status: 'pending',
      },
    });

    return transaction;
  }

  /** دریافت کارمزد فروشنده */
  async getSellerEarnings(sellerId: string) {
    const [commissionSum, totalBalance] = await Promise.all([
      this.prisma.walletTransaction.aggregate({
        where: { userId: sellerId, type: 'commission' },
        _sum: { amount: true },
      }),
      this.prisma.walletTransaction.aggregate({
        where: { userId: sellerId, status: 'completed' },
        _sum: { amount: true },
      }),
    ]);
    return { totalCommission: commissionSum._sum.amount || 0, balance: totalBalance._sum.amount || 0 };
  }
}
