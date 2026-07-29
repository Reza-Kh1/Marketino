/**
 * AdminModule - ماژول پنل مدیریت
 */
import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ConfigModules } from '@/common/config/config.module';

@Module({ controllers: [AdminController], providers: [AdminService], exports: [AdminService] })
export class AdminModule { }
