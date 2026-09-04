/*
  Warnings:

  - A unique constraint covering the columns `[is_platform]` on the table `wallets` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "wallets_is_platform_key" ON "wallets"("is_platform");
