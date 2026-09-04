/*
  Warnings:

  - You are about to drop the column `estimated_days` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `free_shipping` on the `store_shipping_methods` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "orders" DROP COLUMN "estimated_days";

-- AlterTable
ALTER TABLE "store_shipping_methods" DROP COLUMN "free_shipping";
