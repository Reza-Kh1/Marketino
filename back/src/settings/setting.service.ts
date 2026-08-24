import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShippingMethodDto } from './dto/shipping.dto';

@Injectable()
export class SettingsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateShippingMethodDto) {
        const shippingMethod = await this.prisma.shippingMethod.create({
            data: {
                name: dto.name,
                nameEn: dto.nameEn,
                description: dto.description,
                descriptionEn: dto.descriptionEn,
                cost: dto.cost,
                phrase: dto.phrase,
                freeThreshold: dto.freeThreshold,
                estimatedDays: dto.estimatedDays,
                estimatedDaysEn: dto.estimatedDaysEn,
                isActive: dto.isActive ?? true,
                sortOrder: dto.sortOrder ?? 0,
            },
        });

        return shippingMethod;
    }

    async findAll() {
        return this.prisma.shippingMethod.findMany({
            orderBy: { sortOrder: 'asc' },
        });
    }

    async remove(id: string): Promise<void> {
        await this.prisma.shippingMethod.delete({
            where: { id },
        });
    }
}