-- AlterEnum
ALTER TYPE "OtpPurpose" ADD VALUE 'verify';

-- CreateIndex
CREATE INDEX "checkouts_payment_status_status_created_at_idx" ON "checkouts"("payment_status", "status", "created_at");

-- CreateIndex
CREATE INDEX "order_items_store_id_price_idx" ON "order_items"("store_id", "price");

-- CreateIndex
CREATE INDEX "otp_codes_contact_purpose_used_expires_at_idx" ON "otp_codes"("contact", "purpose", "used", "expires_at");
