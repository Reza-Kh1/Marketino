-- AlterTable
ALTER TABLE "seller_reviews" ADD COLUMN     "response_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "store_ratings" ADD COLUMN     "rating_total" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "return_count" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "stores" ADD COLUMN     "shipping_time" TEXT;
