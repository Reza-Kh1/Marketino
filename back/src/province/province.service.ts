import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Request } from 'express';
import { CreateCityDto, CreateProvinceDto } from './dtos/create.province.dto';
import pagination from 'src/common/utils/pagination';
@Injectable()
export class ProvinceService {
  constructor(private readonly prisma: PrismaService) { }

  async getAllProvince() {
    const data = await this.prisma.province.findMany()
    return data
  }

  async updateProvince(body: CreateProvinceDto, id: string) {
    const data = await this.prisma.province.update({
      where: {
        id
      },
      data: body
    })
    if (!data) {
      throw new NotFoundException('استان یافت نشد')
    }
    return { success: true }
  }

  async deleteProvince(id: string) {    
    await this.prisma.province.delete({
      where: {
        id
      }
    })
    return { success: true }
  }

  async createProvince(body: CreateProvinceDto) {
    await this.prisma.province.create({
      data: body,
    });
    return { success: true }
  }

  async getAllCity(idProvince: string) {
    const where: any = {
      ...(idProvince ? { where: { provinceId: idProvince } } : { include: { province: true } })
    };
    const data = await this.prisma.city.findMany(where)
    return data
  }

  async updateCity(body: CreateCityDto, id: string) {
    const data = await this.prisma.city.update({
      where: {
        id
      },
      data: body
    })
    if (!data) {
      throw new NotFoundException('شهر یافت نشد !')
    }
    return { success: true }
  }

  async deleteCity(id: string) {
    await this.prisma.city.delete({
      where: {
        id
      }
    })
    return { success: true }
  }

  async createCity(body: CreateCityDto) {
    await this.prisma.city.create({
      data: body,
    });
    return { success: true }
  }
}
