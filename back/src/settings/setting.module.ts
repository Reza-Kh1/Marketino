import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from './setting.service';
import { SettingController } from './setting.controller';

@Module({
    controllers: [SettingController],
    providers: [SettingsService, PrismaService],
    exports: [SettingsService],
})
export class SettingModule { }