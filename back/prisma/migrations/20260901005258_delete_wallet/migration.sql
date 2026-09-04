/*
  Warnings:

  - You are about to drop the column `balance_after` on the `wallet_transactions` table. All the data in the column will be lost.
  - You are about to drop the column `balance_before` on the `wallet_transactions` table. All the data in the column will be lost.
  - You are about to drop the column `reference` on the `wallet_transactions` table. All the data in the column will be lost.
  - You are about to drop the column `withdraw_request_id` on the `wallet_transactions` table. All the data in the column will be lost.
  - You are about to drop the `withdraw_requests` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[tracking_code]` on the table `wallet_transactions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tracking_code` to the `wallet_transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "WalletTransactionType" ADD VALUE 'tax';

-- DropForeignKey
ALTER TABLE "wallet_transactions" DROP CONSTRAINT "wallet_transactions_withdraw_request_id_fkey";

-- DropForeignKey
ALTER TABLE "withdraw_requests" DROP CONSTRAINT "withdraw_requests_bank_account_id_fkey";

-- DropForeignKey
ALTER TABLE "withdraw_requests" DROP CONSTRAINT "withdraw_requests_user_id_fkey";

-- DropForeignKey
ALTER TABLE "withdraw_requests" DROP CONSTRAINT "withdraw_requests_wallet_id_fkey";

-- DropIndex
DROP INDEX "wallet_transactions_withdraw_request_id_idx";

-- AlterTable
ALTER TABLE "wallet_transactions" DROP COLUMN "balance_after",
DROP COLUMN "balance_before",
DROP COLUMN "reference",
DROP COLUMN "withdraw_request_id",
ADD COLUMN     "tracking_code" TEXT NOT NULL;

-- DropTable
DROP TABLE "withdraw_requests";

-- CreateIndex
CREATE UNIQUE INDEX "wallet_transactions_tracking_code_key" ON "wallet_transactions"("tracking_code");

-- CreateIndex
CREATE INDEX "wallet_transactions_tracking_code_idx" ON "wallet_transactions"("tracking_code");
