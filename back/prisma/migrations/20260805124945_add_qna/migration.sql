-- CreateEnum
CREATE TYPE "ImageUseCase" AS ENUM ('AVATAR', 'PRODUCT', 'POST', 'ATTACHMENT', 'THUMBNAIL', 'WATERMARK', 'REPORTS', 'MAINS');

-- AlterTable
ALTER TABLE "product_images" ADD COLUMN     "use_case" "ImageUseCase" NOT NULL DEFAULT 'PRODUCT';

-- AlterTable
ALTER TABLE "product_variants" ADD COLUMN     "colorId" TEXT;

-- AlterTable
ALTER TABLE "reports" ALTER COLUMN "nameSeller" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Color" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "hex_code" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Color_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Qna" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'buyer',
    "status" "ReviewApproval" NOT NULL DEFAULT 'pending',
    "userId" TEXT NOT NULL,
    "parentId" TEXT,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Qna_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Qna_productId_idx" ON "Qna"("productId");

-- CreateIndex
CREATE INDEX "Qna_parentId_idx" ON "Qna"("parentId");

-- CreateIndex
CREATE INDEX "Qna_status_idx" ON "Qna"("status");

-- CreateIndex
CREATE INDEX "Qna_createdAt_idx" ON "Qna"("createdAt");

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Qna" ADD CONSTRAINT "Qna_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Qna"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Qna" ADD CONSTRAINT "Qna_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Qna" ADD CONSTRAINT "Qna_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
