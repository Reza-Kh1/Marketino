-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "ancestorIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
