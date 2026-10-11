/*
  Warnings:

  - You are about to drop the column `creator_id` on the `discount_codes` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "discount_codes" DROP CONSTRAINT "discount_codes_creator_id_fkey";

-- DropIndex
DROP INDEX "discount_codes_creator_id_idx";

-- AlterTable
ALTER TABLE "discount_codes" DROP COLUMN "creator_id",
ADD COLUMN     "user_id" TEXT;

-- CreateIndex
CREATE INDEX "discount_codes_user_id_idx" ON "discount_codes"("user_id");

-- AddForeignKey
ALTER TABLE "discount_codes" ADD CONSTRAINT "discount_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
