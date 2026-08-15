/*
  Warnings:

  - The `content` column on the `products` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `content_en` column on the `products` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "products" DROP COLUMN "content",
ADD COLUMN     "content" JSONB,
DROP COLUMN "content_en",
ADD COLUMN     "content_en" JSONB;
