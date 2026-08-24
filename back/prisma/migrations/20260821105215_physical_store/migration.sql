-- DropIndex
DROP INDEX "stores_is_active_idx";

-- DropIndex
DROP INDEX "stores_status_idx";

-- AlterTable
ALTER TABLE "stores" ADD COLUMN     "has_physical_store" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "store_ratings_avg_rating_idx" ON "store_ratings"("avg_rating");

-- CreateIndex
CREATE INDEX "store_ratings_total_reviews_idx" ON "store_ratings"("total_reviews");

-- CreateIndex
CREATE INDEX "store_ratings_product_quality_idx" ON "store_ratings"("product_quality");

-- CreateIndex
CREATE INDEX "store_ratings_answered_responses_idx" ON "store_ratings"("answered_responses");

-- CreateIndex
CREATE INDEX "store_ratings_response_rate_idx" ON "store_ratings"("response_rate");

-- CreateIndex
CREATE INDEX "store_ratings_response_time_idx" ON "store_ratings"("response_time");

-- CreateIndex
CREATE INDEX "store_ratings_sale_count_idx" ON "store_ratings"("sale_count");

-- CreateIndex
CREATE INDEX "stores_is_active_is_verified_idx" ON "stores"("is_active", "is_verified");

-- CreateIndex
CREATE INDEX "stores_is_active_is_verified_name_idx" ON "stores"("is_active", "is_verified", "name");
