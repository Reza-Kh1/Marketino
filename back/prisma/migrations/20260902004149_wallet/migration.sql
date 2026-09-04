-- DropForeignKey
ALTER TABLE "wallets" DROP CONSTRAINT "wallets_bank_account_id_fkey";

-- DropIndex
DROP INDEX "wallets_bank_account_id_key";

-- AlterTable
ALTER TABLE "bank_accounts" ADD COLUMN     "wallet_id" TEXT;

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
