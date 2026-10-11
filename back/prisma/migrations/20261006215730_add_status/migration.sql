-- AlterTable
ALTER TABLE "checkouts" ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'pending';
