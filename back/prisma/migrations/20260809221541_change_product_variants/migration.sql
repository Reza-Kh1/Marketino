/*
  Warnings:

  - You are about to drop the column `description` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `description_en` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `attributes` on the `product_variants` table. All the data in the column will be lost.
  - You are about to drop the column `attributesEn` on the `product_variants` table. All the data in the column will be lost.
  - You are about to drop the column `meta_description` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `meta_description_en` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `meta_title` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `meta_title_en` on the `products` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "categories" DROP COLUMN "description",
DROP COLUMN "description_en";

-- AlterTable
ALTER TABLE "product_variants" DROP COLUMN "attributes",
DROP COLUMN "attributesEn";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "meta_description",
DROP COLUMN "meta_description_en",
DROP COLUMN "meta_title",
DROP COLUMN "meta_title_en";

-- CreateTable
CREATE TABLE "AttributeDefinition" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "categoryId" TEXT,

    CONSTRAINT "AttributeDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VariantAttributeValue" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "attributeId" TEXT NOT NULL,

    CONSTRAINT "VariantAttributeValue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AttributeDefinition_key_key" ON "AttributeDefinition"("key");

-- CreateIndex
CREATE INDEX "VariantAttributeValue_attributeId_value_idx" ON "VariantAttributeValue"("attributeId", "value");

-- CreateIndex
CREATE UNIQUE INDEX "VariantAttributeValue_variantId_attributeId_key" ON "VariantAttributeValue"("variantId", "attributeId");

-- AddForeignKey
ALTER TABLE "AttributeDefinition" ADD CONSTRAINT "AttributeDefinition_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VariantAttributeValue" ADD CONSTRAINT "VariantAttributeValue_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VariantAttributeValue" ADD CONSTRAINT "VariantAttributeValue_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "AttributeDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
