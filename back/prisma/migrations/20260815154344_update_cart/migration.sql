/*
  Warnings:

  - A unique constraint covering the columns `[user_id,variant_id]` on the table `cart_items` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[store_name]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "cart_items_user_id_product_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_user_id_variant_id_key" ON "cart_items"("user_id", "variant_id");

-- CreateIndex
CREATE INDEX "categories_parent_id_idx" ON "categories"("parent_id");

-- CreateIndex
CREATE INDEX "categories_is_active_sort_order_idx" ON "categories"("is_active", "sort_order");

-- CreateIndex
CREATE INDEX "products_slug_slug_en_idx" ON "products"("slug", "slug_en");

-- CreateIndex
CREATE UNIQUE INDEX "users_store_name_key" ON "users"("store_name");
