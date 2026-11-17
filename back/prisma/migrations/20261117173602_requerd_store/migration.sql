/*
  Warnings:

  - You are about to drop the column `order_id` on the `reviews` table. All the data in the column will be lost.
  - You are about to drop the column `answer_at` on the `store_reviews` table. All the data in the column will be lost.
  - You are about to drop the column `response_at` on the `store_reviews` table. All the data in the column will be lost.
  - You are about to drop the column `language` on the `users` table. All the data in the column will be lost.
  - Made the column `store_id` on table `products` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_store_id_fkey";

-- AlterTable
ALTER TABLE "products" ALTER COLUMN "store_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "reviews" DROP COLUMN "order_id";

-- AlterTable
ALTER TABLE "store_reviews" DROP COLUMN "answer_at",
DROP COLUMN "response_at";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "language";

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
