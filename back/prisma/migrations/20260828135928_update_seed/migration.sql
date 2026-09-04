/*
  Warnings:

  - You are about to drop the column `title` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `total` on the `orders` table. All the data in the column will be lost.
  - Added the required column `name` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name_en` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `commission` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `store_name` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `store_name_en` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_price` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "order_items" DROP COLUMN "title",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "name_en" TEXT NOT NULL,
ALTER COLUMN "returned_qty" DROP NOT NULL;

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "total",
ADD COLUMN     "commission" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "store_name" TEXT NOT NULL,
ADD COLUMN     "store_name_en" TEXT NOT NULL,
ADD COLUMN     "total_price" DOUBLE PRECISION NOT NULL;
