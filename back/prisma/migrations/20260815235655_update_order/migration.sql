/*
  Warnings:

  - You are about to drop the column `variantName` on the `order_items` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "VariantAttributeValue" ADD COLUMN     "value_en" TEXT;

-- AlterTable
ALTER TABLE "order_items" DROP COLUMN "variantName",
ADD COLUMN     "attributes" JSONB,
ADD COLUMN     "color_hex" TEXT,
ADD COLUMN     "color_name" TEXT,
ADD COLUMN     "original_price" DOUBLE PRECISION,
ADD COLUMN     "variant_name" TEXT;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "shipping_method" TEXT;

-- AlterTable
ALTER TABLE "shipping_methods" ADD COLUMN     "description_en" TEXT;
