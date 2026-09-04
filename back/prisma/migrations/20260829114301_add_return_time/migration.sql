-- AlterTable
ALTER TABLE "shipping_methods" ADD COLUMN     "return_date" INTEGER NOT NULL DEFAULT 2;

-- CreateIndex
CREATE INDEX "shipping_methods_sort_order_idx" ON "shipping_methods"("sort_order");
