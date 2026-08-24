/*
  Warnings:

  - You are about to drop the `seller_ratings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "seller_ratings" DROP CONSTRAINT "seller_ratings_seller_id_fkey";

-- DropTable
DROP TABLE "seller_ratings";

-- CreateTable
CREATE TABLE "store_ratings" (
    "id" TEXT NOT NULL,
    "avg_rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_reviews" INTEGER NOT NULL DEFAULT 0,
    "product_quality" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "product_quality_total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "product_quality_count" INTEGER NOT NULL DEFAULT 0,
    "total_response_requests" INTEGER NOT NULL DEFAULT 0,
    "answered_responses" INTEGER NOT NULL DEFAULT 0,
    "total_response_time" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "response_rate" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "response_time" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sale_count" INTEGER NOT NULL DEFAULT 0,
    "on_time_delivery" DOUBLE PRECISION,
    "communication" DOUBLE PRECISION,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "seller_id" TEXT NOT NULL,

    CONSTRAINT "store_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "store_ratings_seller_id_key" ON "store_ratings"("seller_id");

-- AddForeignKey
ALTER TABLE "store_ratings" ADD CONSTRAINT "store_ratings_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
