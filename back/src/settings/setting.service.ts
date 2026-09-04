import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShippingMethodDto } from './dto/shipping.dto';

@Injectable()
export class SettingsService {
    constructor(private readonly prisma: PrismaService) { }


}