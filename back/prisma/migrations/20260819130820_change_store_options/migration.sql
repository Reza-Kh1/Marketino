/*
  Warnings:

  - The `status` column on the `stores` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "StoreStatus" AS ENUM ('pending', 'approved', 'rejected');

-- AlterTable
ALTER TABLE "stores" DROP COLUMN "status",
ADD COLUMN     "status" "StoreStatus" NOT NULL DEFAULT 'pending';

-- DropEnum
DROP TYPE "SellerStatus";

-- CreateIndex
CREATE INDEX "stores_status_idx" ON "stores"("status");
