/*
  Warnings:

  - You are about to drop the column `answered_responses` on the `store_ratings` table. All the data in the column will be lost.
  - You are about to drop the column `response_rate` on the `store_ratings` table. All the data in the column will be lost.
  - You are about to drop the column `response_time` on the `store_ratings` table. All the data in the column will be lost.
  - You are about to drop the column `total_response_requests` on the `store_ratings` table. All the data in the column will be lost.
  - You are about to drop the column `total_response_time` on the `store_ratings` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "store_ratings_answered_responses_idx";

-- DropIndex
DROP INDEX "store_ratings_response_rate_idx";

-- DropIndex
DROP INDEX "store_ratings_response_time_idx";

-- AlterTable
ALTER TABLE "store_ratings" DROP COLUMN "answered_responses",
DROP COLUMN "response_rate",
DROP COLUMN "response_time",
DROP COLUMN "total_response_requests",
DROP COLUMN "total_response_time";
