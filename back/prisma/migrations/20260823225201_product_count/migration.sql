/*
  Warnings:

  - Added the required column `product_count` to the `store_ratings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "store_ratings" ADD COLUMN     "product_count" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "stores" ALTER COLUMN "is_active" SET DEFAULT false;
