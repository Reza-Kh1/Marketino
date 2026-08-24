import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BrandDto, SearchBrandDto } from './dto/brand.dts';

@Injectable()
export class BrandService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * دریافت تمام دسته‌بندی‌های فعال (برای کاربران عادی)
     * ساختار درختی با children
     */
    async findAllAdmin() {
        return this.prisma.brand.findMany({
            include: {
                _count: { select: { products: true } }
            },
        });
    }

    async findAll(query: SearchBrandDto) {
        const { best, limit } = query
        const orderBy = [] as any
        if (best === 'true') {
            orderBy.push({ sortOrder: 'desc' });
        }
        orderBy.push({ name: 'asc' });
        return this.prisma.brand.findMany({
            select: { id: true, name: true, nameEn: true, slug: true, logo: true},
            orderBy,
            take: limit || undefined
        });
    }

    async create(dto: BrandDto) {
        return this.prisma.brand.create({
            data: { ...dto },
        });
    }

    /**
     * به‌روزرسانی دسته‌بندی
     */
    async update(id: string, dto: BrandDto) {
        const brand = await this.prisma.brand.findUnique({ where: { id } });
        if (!brand) throw new NotFoundException('برند یافت نشد');

        const data: any = { ...dto };
        return this.prisma.brand.update({ where: { id }, data });
    }

    /**
     * حذف دسته‌بندی (در صورت نداشتن محصول)
     */
    async delete(id: string) {
        const brand = await this.prisma.brand.findUnique({
            where: { id },
            include: { _count: { select: { products: true } } },
        });
        if (!brand) throw new NotFoundException('دسته‌بندی یافت نشد');

        if (brand._count.products > 0) {
            throw new BadRequestException(
                `امکان حذف این برند وجود ندارد زیرا ${brand._count.products} محصول به آن متصل است.`
            );
        }

        return this.prisma.brand.delete({ where: { id } });
    }
}
