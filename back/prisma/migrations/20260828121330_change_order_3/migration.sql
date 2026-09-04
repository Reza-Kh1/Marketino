/*
  Warnings:

  - You are about to drop the column `image` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `variant_name` on the `order_items` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "discount_codes" ALTER COLUMN "status" SET DEFAULT 'PRODUCT';

-- AlterTable
ALTER TABLE "order_items" DROP COLUMN "image",
DROP COLUMN "variant_name";
