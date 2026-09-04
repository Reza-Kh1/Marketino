import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { BankAccountService } from './bank_account.service';
import { CreateBankAccountDto } from './dto/bank.dts';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiTags('Bank Accounts')
@Controller('bank-accounts')
export class BankAccountController {
    constructor(private readonly bankAccountService: BankAccountService) { }

    /**
     * دریافت لیست حساب‌های بانکی کاربر جاری (فروشنده)
     */
    @Roles('seller', 'admin', 'superAdmin')
    @Get()
    @ApiOperation({ summary: 'دریافت حساب‌های بانکی من' })
    async findMyBankAccounts(@CurrentUser('id') userId: string) {
        return this.bankAccountService.findByUser(userId);
    }

    /**
     * ایجاد حساب بانکی جدید برای کاربر جاری
     */
    @Roles('seller', 'admin', 'superAdmin')
    @Post()
    @ApiOperation({ summary: 'ایجاد حساب بانکی جدید' })
    async create(
        @CurrentUser('id') userId: string,
        @Body() dto: CreateBankAccountDto,
    ) {
        return this.bankAccountService.create(userId, dto);
    }

    /**
     * ویرایش حساب بانکی (فقط مالک یا ادمین)
     */
    @Roles('seller', 'admin', 'superAdmin')
    @Put(':id')
    @ApiOperation({ summary: 'ویرایش حساب بانکی' })
    @ApiParam({ name: 'id', description: 'شناسه حساب بانکی' })
    async update(
        @CurrentUser('id') userId: string,
        @Param('id') id: string,
        @Body() dto: CreateBankAccountDto,
    ) {
        return this.bankAccountService.update(userId, id, dto);
    }

    /**
     * حذف حساب بانکی (فقط مالک یا ادمین)
     */
    @Roles('seller', 'admin', 'superAdmin')
    @Delete(':id')
    @ApiOperation({ summary: 'حذف حساب بانکی' })
    @ApiParam({ name: 'id', description: 'شناسه حساب بانکی' })
    async delete(
        @CurrentUser('id') userId: string,
        @Param('id') id: string,
    ) {
        return this.bankAccountService.delete(userId, id);
    }
}