-- AlterTable
ALTER TABLE "shipping_methods" ADD COLUMN     "estimated_days_en" TEXT,
ADD COLUMN     "phrase" TEXT;

-- CreateIndex
CREATE INDEX "products_min_Price_idx" ON "products"("min_Price");

-- CreateIndex
CREATE INDEX "products_sale_count_idx" ON "products"("sale_count");

-- CreateIndex
CREATE INDEX "products_rating_idx" ON "products"("rating");

-- CreateIndex
CREATE INDEX "products_updated_at_idx" ON "products"("updated_at");
