-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "answer_id" TEXT,
ADD COLUMN     "answer_review" TEXT;

-- CreateIndex
CREATE INDEX "reviews_answer_id_idx" ON "reviews"("answer_id");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_answer_id_fkey" FOREIGN KEY ("answer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
