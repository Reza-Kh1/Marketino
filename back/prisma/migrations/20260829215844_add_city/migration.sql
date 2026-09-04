/*
  Warnings:

  - You are about to drop the column `city` on the `addresses` table. All the data in the column will be lost.
  - You are about to drop the column `province` on the `addresses` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `bank_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `bank_accounts` table. All the data in the column will be lost.
  - You are about to alter the column `total_amount` on the `checkouts` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(13,2)`.
  - You are about to alter the column `discount_amount` on the `checkouts` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(13,2)`.
  - You are about to alter the column `commission_amount` on the `checkouts` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(13,2)`.
  - You are about to alter the column `sales_profit` on the `checkouts` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(13,2)`.
  - You are about to drop the column `checkoutId` on the `discount_code_usages` table. All the data in the column will be lost.
  - You are about to drop the column `orderId` on the `discount_code_usages` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `discount_code_usages` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `value` on the `discount_codes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `min_order_amount` on the `discount_codes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `max_discount` on the `discount_codes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `amount` on the `invoices` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `price` on the `order_items` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `total` on the `order_items` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(13,2)`.
  - You are about to alter the column `original_price` on the `order_items` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `subtotal` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(13,2)`.
  - You are about to alter the column `shipping_cost` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `discount_amount` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `commission_amount` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `commission` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `total_price` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(13,2)`.
  - You are about to alter the column `amount` on the `payments` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `unit_refund` on the `return_items` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `refund_amount` on the `return_requests` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `return_shipping_cost` on the `return_requests` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to drop the column `cost` on the `shipping_methods` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `shipping_methods` table. All the data in the column will be lost.
  - You are about to drop the column `description_en` on the `shipping_methods` table. All the data in the column will be lost.
  - You are about to drop the column `estimated_days` on the `shipping_methods` table. All the data in the column will be lost.
  - You are about to drop the column `estimated_days_en` on the `shipping_methods` table. All the data in the column will be lost.
  - You are about to drop the column `free_threshold` on the `shipping_methods` table. All the data in the column will be lost.
  - You are about to drop the column `phrase` on the `shipping_methods` table. All the data in the column will be lost.
  - You are about to drop the column `return_date` on the `shipping_methods` table. All the data in the column will be lost.
  - You are about to drop the column `sort_order` on the `shipping_methods` table. All the data in the column will be lost.
  - You are about to drop the column `storeId` on the `shipping_methods` table. All the data in the column will be lost.
  - You are about to drop the column `communication` on the `store_ratings` table. All the data in the column will be lost.
  - You are about to drop the column `on_time_delivery` on the `store_ratings` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `stores` table. All the data in the column will be lost.
  - You are about to drop the column `province` on the `stores` table. All the data in the column will be lost.
  - You are about to alter the column `commission_rate` on the `stores` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `amount` on the `wallet_transactions` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `balance_before` on the `wallet_transactions` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `balance_after` on the `wallet_transactions` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `balance` on the `wallets` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(13,2)`.
  - You are about to alter the column `pending_balance` on the `wallets` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(13,2)`.
  - You are about to alter the column `frozen_balance` on the `wallets` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(13,2)`.
  - You are about to alter the column `amount` on the `withdraw_requests` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - Added the required column `cityId` to the `addresses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provinceId` to the `addresses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `store_id` to the `bank_accounts` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "bank_accounts" DROP CONSTRAINT "bank_accounts_userId_fkey";

-- DropForeignKey
ALTER TABLE "bank_accounts" DROP CONSTRAINT "bank_accounts_user_id_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_shipping_method_id_fkey";

-- DropForeignKey
ALTER TABLE "shipping_methods" DROP CONSTRAINT "shipping_methods_storeId_fkey";

-- DropIndex
DROP INDEX "bank_accounts_user_id_idx";

-- DropIndex
DROP INDEX "shipping_methods_sort_order_idx";

-- AlterTable
ALTER TABLE "addresses" DROP COLUMN "city",
DROP COLUMN "province",
ADD COLUMN     "cityId" TEXT NOT NULL,
ADD COLUMN     "provinceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "bank_accounts" DROP COLUMN "userId",
DROP COLUMN "user_id",
ADD COLUMN     "store_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "checkouts" ALTER COLUMN "total_amount" SET DATA TYPE DECIMAL(13,2),
ALTER COLUMN "discount_amount" SET DATA TYPE DECIMAL(13,2),
ALTER COLUMN "commission_amount" SET DATA TYPE DECIMAL(13,2),
ALTER COLUMN "sales_profit" SET DATA TYPE DECIMAL(13,2);

-- AlterTable
ALTER TABLE "discount_code_usages" DROP COLUMN "checkoutId",
DROP COLUMN "orderId",
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "discount_codes" ALTER COLUMN "value" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "min_order_amount" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "max_discount" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "invoices" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "order_items" ALTER COLUMN "price" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "total" SET DATA TYPE DECIMAL(13,2),
ALTER COLUMN "original_price" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "estimated_days" TEXT,
ALTER COLUMN "subtotal" SET DATA TYPE DECIMAL(13,2),
ALTER COLUMN "shipping_cost" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "discount_amount" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "commission_amount" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "commission" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "total_price" SET DATA TYPE DECIMAL(13,2);

-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "return_items" ALTER COLUMN "unit_refund" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "return_requests" ALTER COLUMN "refund_amount" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "return_shipping_cost" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "shipping_methods" DROP COLUMN "cost",
DROP COLUMN "description",
DROP COLUMN "description_en",
DROP COLUMN "estimated_days",
DROP COLUMN "estimated_days_en",
DROP COLUMN "free_threshold",
DROP COLUMN "phrase",
DROP COLUMN "return_date",
DROP COLUMN "sort_order",
DROP COLUMN "storeId",
ADD COLUMN     "is_free_method" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "store_ratings" DROP COLUMN "communication",
DROP COLUMN "on_time_delivery";

-- AlterTable
ALTER TABLE "stores" DROP COLUMN "city",
DROP COLUMN "province",
ADD COLUMN     "city_id" TEXT,
ADD COLUMN     "province_id" TEXT,
ALTER COLUMN "commission_rate" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "wallet_transactions" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "balance_before" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "balance_after" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "wallets" ALTER COLUMN "balance" SET DATA TYPE DECIMAL(13,2),
ALTER COLUMN "pending_balance" SET DATA TYPE DECIMAL(13,2),
ALTER COLUMN "frozen_balance" SET DATA TYPE DECIMAL(13,2);

-- AlterTable
ALTER TABLE "withdraw_requests" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(12,2);

-- CreateTable
CREATE TABLE "store_shipping_methods" (
    "id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "description_en" TEXT,
    "phrase" TEXT,
    "min_days" INTEGER NOT NULL,
    "max_days" INTEGER NOT NULL,
    "default_price" DECIMAL(12,2),
    "storeId" TEXT NOT NULL,
    "shippingMethodId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_shipping_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store_shipping_rates" (
    "id" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "return_days" INTEGER NOT NULL,
    "storeShippingMethodId" TEXT NOT NULL,
    "provinceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_shipping_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provinces" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provinces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "provinceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "store_shipping_methods_storeId_idx" ON "store_shipping_methods"("storeId");

-- CreateIndex
CREATE INDEX "store_shipping_methods_shippingMethodId_idx" ON "store_shipping_methods"("shippingMethodId");

-- CreateIndex
CREATE UNIQUE INDEX "store_shipping_methods_storeId_shippingMethodId_key" ON "store_shipping_methods"("storeId", "shippingMethodId");

-- CreateIndex
CREATE INDEX "store_shipping_rates_provinceId_idx" ON "store_shipping_rates"("provinceId");

-- CreateIndex
CREATE UNIQUE INDEX "store_shipping_rates_storeShippingMethodId_provinceId_key" ON "store_shipping_rates"("storeShippingMethodId", "provinceId");

-- CreateIndex
CREATE UNIQUE INDEX "provinces_name_key" ON "provinces"("name");

-- CreateIndex
CREATE INDEX "cities_provinceId_idx" ON "cities"("provinceId");

-- CreateIndex
CREATE UNIQUE INDEX "cities_provinceId_name_key" ON "cities"("provinceId", "name");

-- CreateIndex
CREATE INDEX "bank_accounts_store_id_idx" ON "bank_accounts"("store_id");

-- AddForeignKey
ALTER TABLE "stores" ADD CONSTRAINT "stores_province_id_fkey" FOREIGN KEY ("province_id") REFERENCES "provinces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stores" ADD CONSTRAINT "stores_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "provinces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_shipping_method_id_fkey" FOREIGN KEY ("shipping_method_id") REFERENCES "store_shipping_methods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_shipping_methods" ADD CONSTRAINT "store_shipping_methods_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_shipping_methods" ADD CONSTRAINT "store_shipping_methods_shippingMethodId_fkey" FOREIGN KEY ("shippingMethodId") REFERENCES "shipping_methods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_shipping_rates" ADD CONSTRAINT "store_shipping_rates_storeShippingMethodId_fkey" FOREIGN KEY ("storeShippingMethodId") REFERENCES "store_shipping_methods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_shipping_rates" ADD CONSTRAINT "store_shipping_rates_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "provinces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "provinces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
