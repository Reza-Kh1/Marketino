/**
 * AddressesService - سرویس مدیریت آدرس‌های کاربران
 */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * ایجاد آدرس جدید برای کاربر
   */
  async create(userId: string, dto: CreateAddressDto) {
    // اگر isDefault=true، بقیه آدرس‌ها را non-default کن
    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const newAddress = await this.prisma.address.create({
      data: {
        ...dto,
        userId,
      },
    });

    return newAddress;
  }

  /**
   * دریافت تمام آدرس‌های کاربر
   */
  async getUserAddresses(userId: string) {
    const addresses = await this.prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return addresses;
  }

  /**
   * دریافت یک آدرس با ID
   */
  async findOne(addressId: string, userId: string) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });
    if (!address) throw new NotFoundException('آدرس یافت نشد');
    return address;
  }

  /**
   * به‌روزرسانی آدرس
   */
  async update(addressId: string, userId: string, dto: UpdateAddressDto) {
    const address = await this.findOne(addressId, userId);

    // اگر isDefault=true، بقیه آدرس‌ها را non-default کن
    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, id: { not: addressId }, isDefault: true },
        data: { isDefault: false },
      });
    }

    const updated = await this.prisma.address.update({
      where: { id: addressId },
      data: dto,
    });

    return updated;
  }

  /**
   * حذف آدرس
   */
  async delete(addressId: string, userId: string) {
    const address = await this.findOne(addressId, userId);
    
    await this.prisma.address.delete({
      where: { id: addressId },
    });

    return { success: true, message: 'آدرس با موفقیت حذف شد' };
  }

  /**
   * تنظیم آدرس به عنوان پیش‌فرض
   */
  async setDefault(addressId: string, userId: string) {
    await this.findOne(addressId, userId);

    // غیرفعال کردن بقیه
    await this.prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });

    // فعال کردن این آدرس
    const updated = await this.prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });

    return updated;
  }

  /**
   * دریافت آدرس پیش‌فرض کاربر
   */
  async getDefaultAddress(userId: string) {
    const address = await this.prisma.address.findFirst({
      where: { userId, isDefault: true },
    });
    return address;
  }
}