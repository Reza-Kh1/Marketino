/*
  Warnings:

  - You are about to drop the column `store_id` on the `discount_codes` table. All the data in the column will be lost.
  - You are about to drop the `seller_reviews` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "discount_codes" DROP CONSTRAINT "discount_codes_store_id_fkey";

-- DropForeignKey
ALTER TABLE "seller_reviews" DROP CONSTRAINT "seller_reviews_store_id_fkey";

-- DropForeignKey
ALTER TABLE "seller_reviews" DROP CONSTRAINT "seller_reviews_user_id_fkey";

-- DropIndex
DROP INDEX "discount_codes_store_id_idx";

-- AlterTable
ALTER TABLE "checkouts" ADD COLUMN     "commission_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "sales_profit" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "discount_codes" DROP COLUMN "store_id",
ADD COLUMN     "is_commission" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_platform" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "store_ratings" ALTER COLUMN "on_time_delivery" SET DEFAULT 0,
ALTER COLUMN "communication" SET DEFAULT 0;

-- DropTable
DROP TABLE "seller_reviews";

-- CreateTable
CREATE TABLE "store_reviews" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "verifiedPurchase" BOOLEAN NOT NULL DEFAULT false,
    "rating" INTEGER NOT NULL,
    "body" TEXT,
    "product_quality" INTEGER,
    "product_name" TEXT,
    "status" "StoreStatus" NOT NULL DEFAULT 'pending',
    "answer_review" TEXT,
    "answer_at" TIMESTAMP(3),
    "response_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "store_id" TEXT NOT NULL,

    CONSTRAINT "store_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discount_code_stores" (
    "discountCodeId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,

    CONSTRAINT "discount_code_stores_pkey" PRIMARY KEY ("discountCodeId","storeId")
);

-- CreateIndex
CREATE INDEX "store_reviews_store_id_idx" ON "store_reviews"("store_id");

-- CreateIndex
CREATE INDEX "store_reviews_user_id_idx" ON "store_reviews"("user_id");

-- CreateIndex
CREATE INDEX "store_reviews_status_idx" ON "store_reviews"("status");

-- CreateIndex
CREATE UNIQUE INDEX "store_reviews_user_id_store_id_key" ON "store_reviews"("user_id", "store_id");

-- CreateIndex
CREATE INDEX "discount_code_stores_storeId_idx" ON "discount_code_stores"("storeId");

-- CreateIndex
CREATE INDEX "reviews_is_approved_idx" ON "reviews"("is_approved");

-- AddForeignKey
ALTER TABLE "store_reviews" ADD CONSTRAINT "store_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_reviews" ADD CONSTRAINT "store_reviews_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_code_stores" ADD CONSTRAINT "discount_code_stores_discountCodeId_fkey" FOREIGN KEY ("discountCodeId") REFERENCES "discount_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_code_stores" ADD CONSTRAINT "discount_code_stores_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
