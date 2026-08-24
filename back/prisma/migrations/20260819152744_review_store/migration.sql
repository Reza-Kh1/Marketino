/*
  Warnings:

  - You are about to drop the column `on_time_delivery` on the `seller_ratings` table. All the data in the column will be lost.
  - You are about to drop the column `total_reviews` on the `seller_ratings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "seller_ratings" DROP COLUMN "on_time_delivery",
DROP COLUMN "total_reviews",
ADD COLUMN     "answered_responses" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "onTime_delivery" DOUBLE PRECISION,
ADD COLUMN     "sale_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total_response_requests" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total_response_time" DOUBLE PRECISION NOT NULL DEFAULT 0,
ALTER COLUMN "product_quality" DROP NOT NULL,
ALTER COLUMN "product_quality" DROP DEFAULT,
ALTER COLUMN "communication" DROP NOT NULL,
ALTER COLUMN "communication" DROP DEFAULT;

-- AlterTable
ALTER TABLE "seller_reviews" ADD COLUMN     "answer_at" TIMESTAMP(3),
ADD COLUMN     "product_quality" INTEGER;
