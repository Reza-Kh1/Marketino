/*
  Warnings:

  - You are about to drop the column `categoryId` on the `AttributeDefinition` table. All the data in the column will be lost.
  - You are about to drop the column `attributeId` on the `VariantAttributeValue` table. All the data in the column will be lost.
  - You are about to drop the column `variantId` on the `VariantAttributeValue` table. All the data in the column will be lost.
  - You are about to drop the column `colorId` on the `product_variants` table. All the data in the column will be lost.
  - You are about to drop the column `nameEn` on the `product_variants` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `product_variants` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - A unique constraint covering the columns `[variant_id,attribute_id]` on the table `VariantAttributeValue` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `attribute_id` to the `VariantAttributeValue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `variant_id` to the `VariantAttributeValue` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AttributeDefinition" DROP CONSTRAINT "AttributeDefinition_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "VariantAttributeValue" DROP CONSTRAINT "VariantAttributeValue_attributeId_fkey";

-- DropForeignKey
ALTER TABLE "VariantAttributeValue" DROP CONSTRAINT "VariantAttributeValue_variantId_fkey";

-- DropForeignKey
ALTER TABLE "product_variants" DROP CONSTRAINT "product_variants_colorId_fkey";

-- DropForeignKey
ALTER TABLE "product_variants" DROP CONSTRAINT "product_variants_discount_id_fkey";

-- DropIndex
DROP INDEX "VariantAttributeValue_attributeId_value_idx";

-- DropIndex
DROP INDEX "VariantAttributeValue_variantId_attributeId_key";

-- AlterTable
ALTER TABLE "AttributeDefinition" DROP COLUMN "categoryId";

-- AlterTable
ALTER TABLE "VariantAttributeValue" DROP COLUMN "attributeId",
DROP COLUMN "variantId",
ADD COLUMN     "attribute_id" TEXT NOT NULL,
ADD COLUMN     "variant_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "product_variants" DROP COLUMN "colorId",
DROP COLUMN "nameEn",
ADD COLUMN     "color_id" TEXT,
ADD COLUMN     "name_en" TEXT,
ADD COLUMN     "sale_count" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "price" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "discount_percent" TEXT,
ADD COLUMN     "min_Price" DECIMAL(12,2),
ADD COLUMN     "original_price" DECIMAL(12,2);

-- CreateTable
CREATE TABLE "_AttributeDefinitionToCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AttributeDefinitionToCategory_AB_unique" ON "_AttributeDefinitionToCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_AttributeDefinitionToCategory_B_index" ON "_AttributeDefinitionToCategory"("B");

-- CreateIndex
CREATE INDEX "VariantAttributeValue_attribute_id_value_idx" ON "VariantAttributeValue"("attribute_id", "value");

-- CreateIndex
CREATE UNIQUE INDEX "VariantAttributeValue_variant_id_attribute_id_key" ON "VariantAttributeValue"("variant_id", "attribute_id");

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_discount_id_fkey" FOREIGN KEY ("discount_id") REFERENCES "discount_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_color_id_fkey" FOREIGN KEY ("color_id") REFERENCES "Color"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VariantAttributeValue" ADD CONSTRAINT "VariantAttributeValue_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VariantAttributeValue" ADD CONSTRAINT "VariantAttributeValue_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "AttributeDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttributeDefinitionToCategory" ADD CONSTRAINT "_AttributeDefinitionToCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "AttributeDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttributeDefinitionToCategory" ADD CONSTRAINT "_AttributeDefinitionToCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
