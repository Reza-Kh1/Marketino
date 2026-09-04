/*
  Warnings:

  - You are about to drop the `_ShippingMethodToStore` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ShippingMethodToStore" DROP CONSTRAINT "_ShippingMethodToStore_A_fkey";

-- DropForeignKey
ALTER TABLE "_ShippingMethodToStore" DROP CONSTRAINT "_ShippingMethodToStore_B_fkey";

-- AlterTable
ALTER TABLE "shipping_methods" ADD COLUMN     "storeId" TEXT;

-- DropTable
DROP TABLE "_ShippingMethodToStore";

-- AddForeignKey
ALTER TABLE "shipping_methods" ADD CONSTRAINT "shipping_methods_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE SET NULL ON UPDATE CASCADE;
