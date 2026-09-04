/*
  Warnings:

  - You are about to drop the column `store_id` on the `bank_accounts` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `bank_accounts` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "bank_accounts" DROP CONSTRAINT "bank_accounts_store_id_fkey";

-- DropIndex
DROP INDEX "bank_accounts_store_id_idx";

-- DropIndex
DROP INDEX "wallet_transactions_type_idx";

-- AlterTable
ALTER TABLE "bank_accounts" DROP COLUMN "store_id",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "wallets" ADD COLUMN     "bank_account_id" TEXT,
ADD COLUMN     "is_platform" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "bank_accounts_user_id_idx" ON "bank_accounts"("user_id");

-- CreateIndex
CREATE INDEX "wallet_transactions_type_status_idx" ON "wallet_transactions"("type", "status");

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
