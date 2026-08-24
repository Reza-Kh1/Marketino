-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "variant_info" JSONB,
ADD COLUMN     "verifiedPurchase" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "seller_reviews" ADD COLUMN     "product_name" TEXT,
ADD COLUMN     "verifiedPurchase" BOOLEAN NOT NULL DEFAULT false;
