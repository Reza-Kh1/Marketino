/**
 * AiService - سرویس هوش مصنوعی
 * چت، توصیه محصول و تولید توضیحات با OpenAI
 */
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly apiKey = process.env.OPENAI_API_KEY;
  private readonly baseUrl = 'https://api.openai.com/v1';

  constructor(private readonly prisma: PrismaService) {}

  /**
   * چت با هوش مصنوعی (پشتیبانی از فارسی)
   */
  async chat(messages: { role: string; content: string }[]) {
    if (!this.apiKey) return { reply: this.getFallbackResponse(messages) };

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.apiKey}` },
        body: JSON.stringify({ model: 'gpt-3.5-turbo', messages, max_tokens: 500, temperature: 0.7 }),
      });
      const data = await response.json();
      return { reply: data.choices?.[0]?.message?.content || 'متوجه نشدم، لطفاً دوباره بپرسید.' };
    } catch (error) {
      this.logger.error('AI Chat Error:', error);
      return { reply: this.getFallbackResponse(messages) };
    }
  }

  /**
   * توصیه محصولات بر اساس تاریخچه کاربر
   */
  async getRecommendations(userId: string) {
    const [userOrders, allProducts] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        include: { items: { include: { product: { include: { category: true } } } } },
        take: 10,
      }),
      this.prisma.product.findMany({
        where: { status: 'approved' },
        include: { category: true, images: { take: 1 } },
        take: 50,
      }),
    ]);

    if (!this.apiKey || userOrders.length === 0) {
      return { recommendations: allProducts.slice(0, 8) };
    }

    // استخراج دسته‌بندی‌های خریداری شده
    const purchasedCategories = new Set<string>();
    userOrders.forEach(order => order.items.forEach(item => {
      if (item.product?.category) purchasedCategories.add(item.product.category.name);
    }));

    // اولویت‌بندی: محصولات دسته‌بندی‌های خریداری شده اول
    const scored = allProducts.map(p => ({
      ...p,
      score: purchasedCategories.has(p.category?.name || '') ? 2 : 1,
    }));
    scored.sort((a, b) => b.score - a.score);

    return { recommendations: scored.slice(0, 8) };
  }

  /**
   * پاسخ پیش‌فرض در صورت نبود API Key
   */
  private getFallbackResponse(messages: { role: string; content: string }[]): string {
    const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || '';

    if (lastMsg.includes('سلام') || lastMsg.includes('hello')) return 'سلام! چطور می‌تونم کمکتون کنم؟';
    if (lastMsg.includes('قیمت') || lastMsg.includes('تخفیف')) return 'برای اطلاع از قیمت‌ها و تخفیف‌ها، لطفاً از بخش جستجوی سایت استفاده کنید.';
    if (lastMsg.includes('سفارش') || lastMsg.includes('خرید')) return 'می‌تونید محصولات رو به سبد خرید اضافه کنید و سفارش خودتون رو ثبت کنید.';
    if (lastMsg.includes('فروشنده') || lastMsg.includes('فروشگاه')) return 'برای فروشنده شدن می‌تونید از پنل کاربری خودتون درخواست بدید.';
    return 'من دستیار هوش مصنوعی بازارچه هستم. چطور می‌تونم کمکتون کنم؟';
  }
}
