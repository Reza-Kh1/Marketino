/*
  Warnings:

  - A unique constraint covering the columns `[is_default,user_id]` on the table `bank_accounts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[bank_account_id]` on the table `wallets` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "bank_accounts_is_default_user_id_key" ON "bank_accounts"("is_default", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_bank_account_id_key" ON "wallets"("bank_account_id");

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
