
import { EmailService } from "@/email/email.service";
import { PrismaService } from "@/prisma/prisma.service";
import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CreateOrderDto } from "./dto/order.dto";
import { Prisma } from "@prisma/client";

@Injectable()
export class OrdersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly emailService: EmailService,
        private readonly configService: ConfigService,
    ) { }

    private async calculateCheckout(userId: string, body: CreateOrderDto) {
        const { addressId, orders, discountId } = body
        const storeIds = [...new Set(orders.map(x => x.storeId))]

        const [address, stores, cartItems, rawDiscount] = await Promise.all([
            this.prisma.address.findFirst({ where: { id: addressId, userId } }),
            this.prisma.store.findMany({ where: { id: { in: storeIds } }, select: { id: true, name: true, nameEn: true, commissionRate: true, taxRate: true } }),
            this.prisma.cartItem.findMany({
                where: { userId, product: { storeId: { in: storeIds } } },
                select: {
                    quantity: true,
                    variant: {
                        select: {
                            id: true, sku: true, price: true,
                            discount: { select: { status: true, isActive: true, value: true, type: true } },
                            color: { select: { name: true, hexCode: true } },
                            attributes: { take: 1, select: { value: true, valueEn: true, attribute: { select: { key: true, label: true } } } }
                        }
                    },
                    product: { select: { id: true, title: true, titleEn: true, storeId: true } }
                }
            }),
            discountId ? this.prisma.discountCode.findUnique({
                where: { id: discountId },
                select: {
                    id: true, type: true, status: true, value: true, minOrderAmount: true, maxDiscount: true,
                    usageLimit: true, usedCount: true, perUserLimit: true, startsAt: true, endsAt: true, isActive: true,
                    discountCodeStores: { select: { storeId: true } }
                }
            }) : null
        ]) as any

        if (!address) throw new BadRequestException('آدرس نامعتبر است')
        if (stores.length !== storeIds.length) throw new BadRequestException('فروشگاه نامعتبر است')
        if (orders.length !== storeIds.length) throw new BadRequestException('فروشگاه تکراری وجود دارد')
        if (!cartItems.length) throw new BadRequestException('سبد خرید خالی است')
        if (discountId && !rawDiscount) throw new BadRequestException('کد تخفیف معتبر نیست')

        const discount = rawDiscount?.status === 'PRODUCT' ? null : rawDiscount
        const now = new Date()
        if (discount) {
            if (!discount.isActive || discount.startsAt > now || discount.endsAt < now) throw new BadRequestException('کد تخفیف معتبر نیست')
            if (discount.usageLimit > 0 && discount.usedCount >= discount.usageLimit) throw new BadRequestException('سقف استفاده از کد تخفیف تکمیل شده است')
            if (discount.perUserLimit > 0) {
                const used = await this.prisma.discountCodeUsage.count({ where: { discountCodeId: discount.id, userId } })
                if (used >= discount.perUserLimit) throw new BadRequestException('سقف استفاده شما از این کد تخفیف تکمیل شده است')
            }
        }

        const D = (v: any) => new Prisma.Decimal(v || 0)
        const R = (v: Prisma.Decimal) => v.toDecimalPlaces(0, Prisma.Decimal.ROUND_HALF_UP)
        const isPercent = (t: any) => String(t).toLowerCase() === 'percentage'
        const cap = (base: Prisma.Decimal, type: any, value: Prisma.Decimal, max: Prisma.Decimal | null) => {
            if (base.lte(0)) return D(0)
            let amount = isPercent(type) ? base.mul(value).div(100) : value
            if (max?.gt(0)) amount = Prisma.Decimal.min(amount, max)
            return Prisma.Decimal.min(Prisma.Decimal.max(amount, D(0)), base).toDecimalPlaces(0, Prisma.Decimal.ROUND_FLOOR)
        }

        const grouped = new Map<string, { originalPrice: Prisma.Decimal; productDiscount: Prisma.Decimal; items: any[] }>()
        for (const item of cartItems) {
            const storeId = item.product.storeId || ''
            const g = grouped.get(storeId) || { originalPrice: D(0), productDiscount: D(0), items: [] }
            const originalPrice = D(item.variant.price)
            const d = item.variant.discount
            const pd = d?.isActive && d.status === 'PRODUCT' ? cap(originalPrice, d.type, D(d.value), null) : D(0)
            const price = originalPrice.sub(pd)
            g.originalPrice = g.originalPrice.add(originalPrice.mul(item.quantity))
            g.productDiscount = g.productDiscount.add(pd.mul(item.quantity))
            g.items.push({
                sku: item.variant.sku, name: item.product.title, nameEn: item.product.titleEn,
                price, originalPrice, total: price.mul(item.quantity), quantity: item.quantity, returnedQty: 0,
                attributes: item.variant.attributes.map((x: any) => ({ key: x.attribute.key, value: x.value, label: x.attribute.label })),
                productId: item.product.id, storeId, variantId: item.variant.id,
                colorName: item.variant.color?.name || null, colorHex: item.variant.color?.hexCode || null
            })
            grouped.set(storeId, g)
        }
        if (storeIds.some(id => !grouped.has(id))) throw new BadRequestException('بعضی از کالاها در سبد خرید یافت نشدند')

        const subtotalOf = (id: string) => grouped.get(id)!.originalPrice.sub(grouped.get(id)!.productDiscount)
        const totalSubtotal = storeIds.reduce((s, id) => s.add(subtotalOf(id)), D(0))

        const platformDiscounts = new Map<string, Prisma.Decimal>()
        if (discount?.status === 'PLATFORM' && totalSubtotal.gte(D(discount.minOrderAmount))) {
            const target = cap(totalSubtotal, discount.type, D(discount.value), discount.maxDiscount ? D(discount.maxDiscount) : null)
            const eligible = storeIds.filter(id => subtotalOf(id).gt(0))
            let remain = target
            eligible.forEach((id, i) => {
                const subtotal = subtotalOf(id)
                const share = i === eligible.length - 1 ? remain : Prisma.Decimal.min(remain, subtotal, target.mul(subtotal).div(totalSubtotal).toDecimalPlaces(0, Prisma.Decimal.ROUND_FLOOR))
                if (share.gt(0)) { platformDiscounts.set(id, share); remain = remain.sub(share) }
            })
        }

        const codeDiscountOf = (storeId: string) => {
            if (!discount) return D(0)
            if (discount.status === 'STORE') {
                if (!discount.discountCodeStores.some((x: any) => x.storeId === storeId)) return D(0)
                const subtotal = subtotalOf(storeId)
                return subtotal.lt(D(discount.minOrderAmount)) ? D(0) : cap(subtotal, discount.type, D(discount.value), discount.maxDiscount ? D(discount.maxDiscount) : null)
            }
            return discount.status === 'PLATFORM' ? (platformDiscounts.get(storeId) || D(0)) : D(0)
        }

        const storesResult = storeIds.map(storeId => {
            const store = stores.find((x: any) => x.id === storeId)!
            const g = grouped.get(storeId)!
            const order = orders.find(x => x.storeId === storeId)!
            const subtotal = subtotalOf(storeId)
            const codeDiscount = codeDiscountOf(storeId)
            const totalDiscount = g.productDiscount.add(codeDiscount)
            const shippingCost = D(order.shippingCost)
            const taxRate = D(store.taxRate ?? 10)
            const commissionRate = D(store.commissionRate)

            // مالیات روی مبلغ بعد از تخفیف مشتری (بدون ارسال و بدون تخفیف کمیسیون)
            const net = g.originalPrice.sub(totalDiscount)
            const tax = net.mul(taxRate).div(100)
            const base = net.sub(tax)
            // کمیسیون کامل فروشگاه؛ تخفیف کمیسیون جداست و نرخ/مبلغ کمیسیون را عوض نمی‌کند
            const commissionAmount = base.mul(commissionRate).div(100)

            let commissionDiscount = D(0)
            if (discount?.status === 'COMMISSION' && subtotal.gte(D(discount.minOrderAmount))) {
                // value همیشه واحد درصد است؛ نرخ کمیسیون منفی نمی‌شود؛ سقف maxDiscount به تومان برای هر فروشگاه جدا
                commissionDiscount = base.mul(Prisma.Decimal.min(commissionRate, D(discount.value))).div(100)
                if (D(discount.maxDiscount).gt(0)) commissionDiscount = Prisma.Decimal.min(commissionDiscount, D(discount.maxDiscount))
            }

            const totalPrice = Prisma.Decimal.max(D(0), net.sub(commissionDiscount).add(shippingCost))
            const payoutAmount = g.originalPrice.sub(commissionAmount).sub(totalDiscount).add(shippingCost).sub(tax)

            return {
                storeId,
                shippingCost: R(shippingCost), shippingName: order.shippingName, shippingId: order.shippingId, estimatedDays: String(order.shippingTime),
                storeName: store.name, storeNameEn: store.nameEn,
                commission: commissionRate.toDecimalPlaces(2),
                commissionAmount: R(commissionAmount),
                commissionDiscountAmount: R(commissionDiscount),
                originalPrice: R(g.originalPrice),
                subtotal: R(subtotal),
                taxAmount: R(tax),
                totalPrice: R(totalPrice),
                discountAmount: R(totalDiscount),
                payoutAmount: R(payoutAmount),
                note: order.note || null,
                discountCodeId: (codeDiscount.gt(0) || commissionDiscount.gt(0)) ? discount.id : null,
                orderItems: g.items
            }
        })

        const sum = (f: (x: typeof storesResult[number]) => Prisma.Decimal) => storesResult.reduce((s, x) => s.add(f(x)), D(0))
        const commissionAmount = sum(x => D(x.commissionAmount))
        const commissionDiscountAmount = sum(x => D(x.commissionDiscountAmount))

        return {
            stores: storesResult,
            checkout: {
                totalOriginal: sum(x => D(x.originalPrice)),
                totalAmount: sum(x => D(x.totalPrice)),
                discountAmount: sum(x => D(x.discountAmount)),
                commissionAmount,
                commissionDiscountAmount,
                taxAmount: sum(x => D(x.taxAmount)),
                salesProfit: commissionAmount.sub(commissionDiscountAmount),
                discountType: discount?.status ?? null,
                discountCodeId: discount?.id ?? null
            },
            address
        }
    }

    async createOrder(userId: string, body: CreateOrderDto) {
        const checkout = await this.calculateCheckout(userId, body)
        return { success: checkout }
    }
}