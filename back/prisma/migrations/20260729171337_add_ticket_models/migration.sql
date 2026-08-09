/*
  Warnings:

  - The `attributes` column on the `product_variants` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `attributesEn` column on the `product_variants` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `brandId` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `discount_end` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `discount_price` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `discount_start` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `sku` on the `products` table. All the data in the column will be lost.
  - Added the required column `variant_id` to the `cart_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sku` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `variantName` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `variant_id` to the `order_items` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('PENDING', 'WAITING', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ReportsStatus" AS ENUM ('PENDING', 'RESOLVED', 'CLOSED');

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_brandId_fkey";

-- DropIndex
DROP INDEX "products_price_idx";

-- DropIndex
DROP INDEX "products_sku_key";

-- AlterTable
ALTER TABLE "cart_items" ADD COLUMN     "variant_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "sku" TEXT NOT NULL,
ADD COLUMN     "variantName" TEXT NOT NULL,
ADD COLUMN     "variant_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "product_images" ADD COLUMN     "reportsId" TEXT,
ADD COLUMN     "ticketMessageId" TEXT;

-- AlterTable
ALTER TABLE "product_variants" DROP COLUMN "attributes",
ADD COLUMN     "attributes" JSONB,
DROP COLUMN "attributesEn",
ADD COLUMN     "attributesEn" JSONB;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "brandId",
DROP COLUMN "discount_end",
DROP COLUMN "discount_price",
DROP COLUMN "discount_start",
DROP COLUMN "price",
DROP COLUMN "quantity",
DROP COLUMN "sku",
ADD COLUMN     "brand_id" TEXT;

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "TicketPriority" NOT NULL,
    "title" TEXT NOT NULL,
    "trackingCode" TEXT NOT NULL,
    "isUserRead" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    "order_id" TEXT,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_messages" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ticket_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "status" "ReportsStatus" NOT NULL DEFAULT 'PENDING',
    "nameSeller" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "trackingCode" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tickets_user_id_key" ON "tickets"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_order_id_key" ON "tickets"("order_id");

-- CreateIndex
CREATE INDEX "tickets_user_id_idx" ON "tickets"("user_id");

-- CreateIndex
CREATE INDEX "tickets_status_idx" ON "tickets"("status");

-- CreateIndex
CREATE INDEX "tickets_priority_idx" ON "tickets"("priority");

-- CreateIndex
CREATE INDEX "ticket_messages_ticketId_idx" ON "ticket_messages"("ticketId");

-- CreateIndex
CREATE INDEX "ticket_messages_senderId_idx" ON "ticket_messages"("senderId");

-- CreateIndex
CREATE INDEX "ticket_messages_createdAt_idx" ON "ticket_messages"("createdAt");

-- CreateIndex
CREATE INDEX "reports_status_idx" ON "reports"("status");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_ticketMessageId_fkey" FOREIGN KEY ("ticketMessageId") REFERENCES "ticket_messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_reportsId_fkey" FOREIGN KEY ("reportsId") REFERENCES "reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
