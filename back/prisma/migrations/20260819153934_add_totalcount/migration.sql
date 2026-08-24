/*
  Warnings:

  - You are about to drop the column `onTime_delivery` on the `seller_ratings` table. All the data in the column will be lost.
  - Made the column `product_quality` on table `seller_ratings` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "seller_ratings" DROP COLUMN "onTime_delivery",
ADD COLUMN     "on_time_delivery" DOUBLE PRECISION,
ADD COLUMN     "product_quality_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "product_quality_total" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "total_reviews" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "product_quality" SET NOT NULL,
ALTER COLUMN "product_quality" SET DEFAULT 5;
