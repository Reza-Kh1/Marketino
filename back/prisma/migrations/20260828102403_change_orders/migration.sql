/*
  Warnings:

  - Added the required column `shipping_address` to the `checkouts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shipping_city` to the `checkouts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shipping_name` to the `checkouts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shipping_phone` to the `checkouts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shipping_postal` to the `checkouts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shipping_province` to the `checkouts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "checkouts" ADD COLUMN     "discount_status" "StatusDiscount",
ADD COLUMN     "shipping_address" TEXT NOT NULL,
ADD COLUMN     "shipping_city" TEXT NOT NULL,
ADD COLUMN     "shipping_name" TEXT NOT NULL,
ADD COLUMN     "shipping_phone" TEXT NOT NULL,
ADD COLUMN     "shipping_postal" TEXT NOT NULL,
ADD COLUMN     "shipping_province" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "note" TEXT,
ADD COLUMN     "shipping_name" TEXT;
