-- AlterTable
ALTER TABLE "store_shipping_methods" ADD COLUMN     "free_shipping" DECIMAL(12,2);

-- AlterTable
ALTER TABLE "wallet_transactions" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "balance_before" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "balance_after" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "wallets" ALTER COLUMN "balance" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "pending_balance" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "frozen_balance" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "withdraw_requests" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(18,2);
