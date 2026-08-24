/*
  Warnings:

  - You are about to drop the column `seller_id` on the `discount_codes` table. All the data in the column will be lost.
  - You are about to drop the column `seller_id` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `reviewer_id` on the `seller_reviews` table. All the data in the column will be lost.
  - You are about to drop the column `seller_id` on the `seller_reviews` table. All the data in the column will be lost.
  - You are about to drop the column `business_type` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `commission_rate` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `is_super_admin` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `seller_reason` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `seller_status` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `store_description` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `store_description_en` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `store_logo` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `store_name` on the `users` table. All the data in the column will be lost.
  - Added the required column `store_id` to the `seller_reviews` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `seller_reviews` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'superAdmin';

-- DropForeignKey
ALTER TABLE "discount_codes" DROP CONSTRAINT "discount_codes_seller_id_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_seller_id_fkey";

-- DropForeignKey
ALTER TABLE "seller_ratings" DROP CONSTRAINT "seller_ratings_seller_id_fkey";

-- DropForeignKey
ALTER TABLE "seller_reviews" DROP CONSTRAINT "seller_reviews_reviewer_id_fkey";

-- DropForeignKey
ALTER TABLE "seller_reviews" DROP CONSTRAINT "seller_reviews_seller_id_fkey";

-- DropIndex
DROP INDEX "products_seller_id_idx";

-- DropIndex
DROP INDEX "seller_reviews_seller_id_idx";

-- DropIndex
DROP INDEX "users_store_name_key";

-- AlterTable
ALTER TABLE "discount_codes" DROP COLUMN "seller_id",
ADD COLUMN     "store_id" TEXT;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "seller_id",
ADD COLUMN     "store_id" TEXT;

-- AlterTable
ALTER TABLE "seller_reviews" DROP COLUMN "reviewer_id",
DROP COLUMN "seller_id",
ADD COLUMN     "answer_review" TEXT,
ADD COLUMN     "store_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "business_type",
DROP COLUMN "commission_rate",
DROP COLUMN "is_super_admin",
DROP COLUMN "seller_reason",
DROP COLUMN "seller_status",
DROP COLUMN "store_description",
DROP COLUMN "store_description_en",
DROP COLUMN "store_logo",
DROP COLUMN "store_name";

-- CreateTable
CREATE TABLE "stores" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_en" TEXT,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "banner" TEXT,
    "description" TEXT,
    "description_en" TEXT,
    "business_type" TEXT,
    "national_id" TEXT,
    "economic_code" TEXT,
    "commission_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "SellerStatus" NOT NULL DEFAULT 'pending',
    "status_reason" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "province" TEXT,
    "city" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "instagram" TEXT,
    "telegram" TEXT,
    "working_hours" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stores_owner_id_key" ON "stores"("owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "stores_slug_key" ON "stores"("slug");

-- CreateIndex
CREATE INDEX "stores_status_idx" ON "stores"("status");

-- CreateIndex
CREATE INDEX "stores_is_active_idx" ON "stores"("is_active");

-- CreateIndex
CREATE INDEX "discount_codes_creator_id_idx" ON "discount_codes"("creator_id");

-- CreateIndex
CREATE INDEX "discount_codes_store_id_idx" ON "discount_codes"("store_id");

-- CreateIndex
CREATE INDEX "products_store_id_idx" ON "products"("store_id");

-- CreateIndex
CREATE INDEX "seller_reviews_store_id_idx" ON "seller_reviews"("store_id");

-- CreateIndex
CREATE INDEX "seller_reviews_user_id_idx" ON "seller_reviews"("user_id");

-- AddForeignKey
ALTER TABLE "stores" ADD CONSTRAINT "stores_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_ratings" ADD CONSTRAINT "seller_ratings_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_reviews" ADD CONSTRAINT "seller_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_reviews" ADD CONSTRAINT "seller_reviews_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_codes" ADD CONSTRAINT "discount_codes_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE SET NULL ON UPDATE CASCADE;
