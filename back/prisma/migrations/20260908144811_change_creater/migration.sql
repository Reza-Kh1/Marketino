/*
  Warnings:

  - You are about to drop the `AttributeDefinition` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Color` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VariantAttributeValue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `blog_posts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `compare_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `conversations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `messages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notifications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tracking_events` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "VariantAttributeValue" DROP CONSTRAINT "VariantAttributeValue_attribute_id_fkey";

-- DropForeignKey
ALTER TABLE "VariantAttributeValue" DROP CONSTRAINT "VariantAttributeValue_variant_id_fkey";

-- DropForeignKey
ALTER TABLE "_AttributeDefinitionToCategory" DROP CONSTRAINT "_AttributeDefinitionToCategory_A_fkey";

-- DropForeignKey
ALTER TABLE "blog_posts" DROP CONSTRAINT "blog_posts_author_id_fkey";

-- DropForeignKey
ALTER TABLE "compare_items" DROP CONSTRAINT "compare_items_product_id_fkey";

-- DropForeignKey
ALTER TABLE "compare_items" DROP CONSTRAINT "compare_items_user_id_fkey";

-- DropForeignKey
ALTER TABLE "conversations" DROP CONSTRAINT "conversations_buyer_id_fkey";

-- DropForeignKey
ALTER TABLE "conversations" DROP CONSTRAINT "conversations_product_id_fkey";

-- DropForeignKey
ALTER TABLE "conversations" DROP CONSTRAINT "conversations_seller_id_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_conversation_id_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_receiver_id_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_sender_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_user_id_fkey";

-- DropForeignKey
ALTER TABLE "product_variants" DROP CONSTRAINT "product_variants_color_id_fkey";

-- DropForeignKey
ALTER TABLE "tracking_events" DROP CONSTRAINT "tracking_events_order_id_fkey";

-- DropTable
DROP TABLE "AttributeDefinition";

-- DropTable
DROP TABLE "Color";

-- DropTable
DROP TABLE "VariantAttributeValue";

-- DropTable
DROP TABLE "blog_posts";

-- DropTable
DROP TABLE "compare_items";

-- DropTable
DROP TABLE "conversations";

-- DropTable
DROP TABLE "messages";

-- DropTable
DROP TABLE "notifications";

-- DropTable
DROP TABLE "tracking_events";

-- DropEnum
DROP TYPE "BlogPostStatus";

-- DropEnum
DROP TYPE "NotificationType";

-- DropEnum
DROP TYPE "TrackingStatus";

-- CreateTable
CREATE TABLE "attribute_definition" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "attribute_definition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variant_attribute_value" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "value_en" TEXT,
    "variant_id" TEXT NOT NULL,
    "attribute_id" TEXT NOT NULL,

    CONSTRAINT "variant_attribute_value_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "color" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "hex_code" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "color_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "attribute_definition_key_key" ON "attribute_definition"("key");

-- CreateIndex
CREATE INDEX "variant_attribute_value_attribute_id_value_idx" ON "variant_attribute_value"("attribute_id", "value");

-- CreateIndex
CREATE UNIQUE INDEX "variant_attribute_value_variant_id_attribute_id_key" ON "variant_attribute_value"("variant_id", "attribute_id");

-- CreateIndex
CREATE UNIQUE INDEX "color_slug_key" ON "color"("slug");

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_color_id_fkey" FOREIGN KEY ("color_id") REFERENCES "color"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variant_attribute_value" ADD CONSTRAINT "variant_attribute_value_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variant_attribute_value" ADD CONSTRAINT "variant_attribute_value_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "attribute_definition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttributeDefinitionToCategory" ADD CONSTRAINT "_AttributeDefinitionToCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "attribute_definition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
