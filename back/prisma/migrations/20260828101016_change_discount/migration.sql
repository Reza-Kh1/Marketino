/*
  Warnings:

  - You are about to drop the column `is_commission` on the `discount_codes` table. All the data in the column will be lost.
  - You are about to drop the column `is_platform` on the `discount_codes` table. All the data in the column will be lost.
  - You are about to drop the `Qna` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "StatusDiscount" AS ENUM ('PLATFORM', 'STORE', 'COMMISSION');

-- DropForeignKey
ALTER TABLE "Qna" DROP CONSTRAINT "Qna_parentId_fkey";

-- DropForeignKey
ALTER TABLE "Qna" DROP CONSTRAINT "Qna_productId_fkey";

-- DropForeignKey
ALTER TABLE "Qna" DROP CONSTRAINT "Qna_userId_fkey";

-- AlterTable
ALTER TABLE "discount_codes" DROP COLUMN "is_commission",
DROP COLUMN "is_platform",
ADD COLUMN     "status" "StatusDiscount" NOT NULL DEFAULT 'PLATFORM';

-- AlterTable
ALTER TABLE "wallet_transactions" ADD COLUMN     "settlement_date" TIMESTAMP(3);

-- DropTable
DROP TABLE "Qna";

-- CreateTable
CREATE TABLE "qna" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'buyer',
    "status" "ReviewApproval" NOT NULL DEFAULT 'pending',
    "userId" TEXT NOT NULL,
    "parentId" TEXT,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qna_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "qna_productId_idx" ON "qna"("productId");

-- CreateIndex
CREATE INDEX "qna_parentId_idx" ON "qna"("parentId");

-- CreateIndex
CREATE INDEX "qna_status_idx" ON "qna"("status");

-- CreateIndex
CREATE INDEX "qna_createdAt_idx" ON "qna"("createdAt");

-- AddForeignKey
ALTER TABLE "qna" ADD CONSTRAINT "qna_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "qna"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qna" ADD CONSTRAINT "qna_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qna" ADD CONSTRAINT "qna_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
