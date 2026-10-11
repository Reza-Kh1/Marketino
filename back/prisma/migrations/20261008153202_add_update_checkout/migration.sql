/*
  Warnings:

  - Added the required column `updated_at` to the `checkouts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "checkouts" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "tax_amount" DECIMAL(12,2) NOT NULL DEFAULT 0;
