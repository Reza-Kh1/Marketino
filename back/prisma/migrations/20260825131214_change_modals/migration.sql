/*
  Warnings:

  - You are about to drop the column `order_id` on the `discount_code_usages` table. All the data in the column will be lost.
  - You are about to drop the column `seller_id` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `address_id` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `discount_id` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `payment_method` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `payment_ref` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `payment_status` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `seller_notes` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `shipping_address` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `shipping_city` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `shipping_name` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `shipping_phone` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `shipping_postal` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `shipping_province` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `order_id` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the `refunds` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `amount` to the `discount_code_usages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `checkoutId` to the `discount_code_usages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `store_id` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `checkout_id` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `store_id` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `checkout_id` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wallet_id` to the `wallet_transactions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('pending', 'approved', 'rejected', 'failed');

-- CreateEnum
CREATE TYPE "ReturnStatus" AS ENUM ('requested', 'approved', 'rejected', 'item_received', 'refunded', 'closed');

-- CreateEnum
CREATE TYPE "RefundMethod" AS ENUM ('wallet', 'original_payment');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "WalletTransactionType" ADD VALUE 'sale_settlement';
ALTER TYPE "WalletTransactionType" ADD VALUE 'return_deduction';

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_seller_id_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_address_id_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_discount_id_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_order_id_fkey";

-- DropForeignKey
ALTER TABLE "refunds" DROP CONSTRAINT "refunds_order_id_fkey";

-- DropIndex
DROP INDEX "order_items_seller_id_idx";

-- DropIndex
DROP INDEX "orders_order_number_idx";

-- DropIndex
DROP INDEX "payments_order_id_idx";

-- AlterTable
ALTER TABLE "discount_code_usages" DROP COLUMN "order_id",
ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "checkoutId" TEXT NOT NULL,
ADD COLUMN     "orderId" TEXT;

-- AlterTable
ALTER TABLE "order_items" DROP COLUMN "seller_id",
ADD COLUMN     "returned_qty" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "store_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "address_id",
DROP COLUMN "discount_id",
DROP COLUMN "notes",
DROP COLUMN "payment_method",
DROP COLUMN "payment_ref",
DROP COLUMN "payment_status",
DROP COLUMN "seller_notes",
DROP COLUMN "shipping_address",
DROP COLUMN "shipping_city",
DROP COLUMN "shipping_name",
DROP COLUMN "shipping_phone",
DROP COLUMN "shipping_postal",
DROP COLUMN "shipping_province",
ADD COLUMN     "checkout_id" TEXT NOT NULL,
ADD COLUMN     "discount_code_id" TEXT,
ADD COLUMN     "return_deadline" TIMESTAMP(3),
ADD COLUMN     "store_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "order_id",
ADD COLUMN     "checkout_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "product_images" ADD COLUMN     "returnRequestId" TEXT;

-- AlterTable
ALTER TABLE "stores" ADD COLUMN     "bale" TEXT,
ADD COLUMN     "robika" TEXT,
ADD COLUMN     "whats_app" TEXT;

-- AlterTable
ALTER TABLE "wallet_transactions" ADD COLUMN     "order_id" TEXT,
ADD COLUMN     "return_request_id" TEXT,
ADD COLUMN     "wallet_id" TEXT NOT NULL,
ADD COLUMN     "withdraw_request_id" TEXT;

-- DropTable
DROP TABLE "refunds";

-- CreateTable
CREATE TABLE "checkouts" (
    "id" TEXT NOT NULL,
    "checkout_number" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "total_amount" DOUBLE PRECISION NOT NULL,
    "discount_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discount_id" TEXT,
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "payment_method" "PaymentMethod",
    "payment_ref" TEXT,
    "address_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "checkouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "return_requests" (
    "id" TEXT NOT NULL,
    "request_number" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "ReturnStatus" NOT NULL DEFAULT 'requested',
    "reason" TEXT NOT NULL,
    "reason_detail" TEXT,
    "refund_method" "RefundMethod",
    "refund_amount" DOUBLE PRECISION,
    "return_shipping_cost" DOUBLE PRECISION,
    "admin_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "return_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "return_items" (
    "id" TEXT NOT NULL,
    "return_request_id" TEXT NOT NULL,
    "order_item_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT,
    "condition" TEXT,
    "unit_refund" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "return_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pending_balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "frozen_balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "bank_name" TEXT,
    "account_holder" TEXT NOT NULL,
    "iban" TEXT NOT NULL,
    "card_number" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "withdraw_requests" (
    "id" TEXT NOT NULL,
    "request_number" TEXT NOT NULL,
    "wallet_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "bank_account_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'pending',
    "admin_note" TEXT,
    "reviewed_by_id" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "withdraw_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ShippingMethodToStore" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "checkouts_checkout_number_key" ON "checkouts"("checkout_number");

-- CreateIndex
CREATE INDEX "checkouts_user_id_idx" ON "checkouts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "return_requests_request_number_key" ON "return_requests"("request_number");

-- CreateIndex
CREATE INDEX "return_requests_order_id_idx" ON "return_requests"("order_id");

-- CreateIndex
CREATE INDEX "return_requests_user_id_idx" ON "return_requests"("user_id");

-- CreateIndex
CREATE INDEX "return_requests_status_idx" ON "return_requests"("status");

-- CreateIndex
CREATE INDEX "return_requests_created_at_idx" ON "return_requests"("created_at");

-- CreateIndex
CREATE INDEX "return_items_return_request_id_idx" ON "return_items"("return_request_id");

-- CreateIndex
CREATE INDEX "return_items_order_item_id_idx" ON "return_items"("order_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_user_id_key" ON "wallets"("user_id");

-- CreateIndex
CREATE INDEX "bank_accounts_user_id_idx" ON "bank_accounts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "withdraw_requests_request_number_key" ON "withdraw_requests"("request_number");

-- CreateIndex
CREATE INDEX "withdraw_requests_wallet_id_idx" ON "withdraw_requests"("wallet_id");

-- CreateIndex
CREATE INDEX "withdraw_requests_user_id_idx" ON "withdraw_requests"("user_id");

-- CreateIndex
CREATE INDEX "withdraw_requests_status_idx" ON "withdraw_requests"("status");

-- CreateIndex
CREATE INDEX "withdraw_requests_created_at_idx" ON "withdraw_requests"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "_ShippingMethodToStore_AB_unique" ON "_ShippingMethodToStore"("A", "B");

-- CreateIndex
CREATE INDEX "_ShippingMethodToStore_B_index" ON "_ShippingMethodToStore"("B");

-- CreateIndex
CREATE INDEX "order_items_store_id_idx" ON "order_items"("store_id");

-- CreateIndex
CREATE INDEX "orders_store_id_idx" ON "orders"("store_id");

-- CreateIndex
CREATE INDEX "orders_checkout_id_idx" ON "orders"("checkout_id");

-- CreateIndex
CREATE INDEX "payments_checkout_id_idx" ON "payments"("checkout_id");

-- CreateIndex
CREATE INDEX "shipping_methods_is_active_idx" ON "shipping_methods"("is_active");

-- CreateIndex
CREATE INDEX "wallet_transactions_wallet_id_idx" ON "wallet_transactions"("wallet_id");

-- CreateIndex
CREATE INDEX "wallet_transactions_order_id_idx" ON "wallet_transactions"("order_id");

-- CreateIndex
CREATE INDEX "wallet_transactions_withdraw_request_id_idx" ON "wallet_transactions"("withdraw_request_id");

-- CreateIndex
CREATE INDEX "wallet_transactions_user_id_created_at_idx" ON "wallet_transactions"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_returnRequestId_fkey" FOREIGN KEY ("returnRequestId") REFERENCES "return_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_checkout_id_fkey" FOREIGN KEY ("checkout_id") REFERENCES "checkouts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_discount_code_id_fkey" FOREIGN KEY ("discount_code_id") REFERENCES "discount_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkouts" ADD CONSTRAINT "checkouts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkouts" ADD CONSTRAINT "checkouts_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkouts" ADD CONSTRAINT "checkouts_discount_id_fkey" FOREIGN KEY ("discount_id") REFERENCES "discount_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_checkout_id_fkey" FOREIGN KEY ("checkout_id") REFERENCES "checkouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_requests" ADD CONSTRAINT "return_requests_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_requests" ADD CONSTRAINT "return_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_items" ADD CONSTRAINT "return_items_return_request_id_fkey" FOREIGN KEY ("return_request_id") REFERENCES "return_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_items" ADD CONSTRAINT "return_items_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_return_request_id_fkey" FOREIGN KEY ("return_request_id") REFERENCES "return_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_withdraw_request_id_fkey" FOREIGN KEY ("withdraw_request_id") REFERENCES "withdraw_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdraw_requests" ADD CONSTRAINT "withdraw_requests_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdraw_requests" ADD CONSTRAINT "withdraw_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdraw_requests" ADD CONSTRAINT "withdraw_requests_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ShippingMethodToStore" ADD CONSTRAINT "_ShippingMethodToStore_A_fkey" FOREIGN KEY ("A") REFERENCES "shipping_methods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ShippingMethodToStore" ADD CONSTRAINT "_ShippingMethodToStore_B_fkey" FOREIGN KEY ("B") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
