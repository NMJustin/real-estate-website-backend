-- AddColumn
ALTER TABLE "viewing_requests" ADD COLUMN IF NOT EXISTS "user_id" TEXT;

-- AddColumn
ALTER TABLE "valuation_requests" ADD COLUMN IF NOT EXISTS "user_id" TEXT;

-- AddColumn
ALTER TABLE "listing_requests" ADD COLUMN IF NOT EXISTS "user_id" TEXT;

-- AddColumn
ALTER TABLE "contact_messages" ADD COLUMN IF NOT EXISTS "user_id" TEXT;

-- AddForeignKey
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viewing_requests" ADD CONSTRAINT "viewing_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viewing_requests" ADD CONSTRAINT "viewing_requests_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "valuation_requests" ADD CONSTRAINT "valuation_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_requests" ADD CONSTRAINT "listing_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_messages" ADD CONSTRAINT "contact_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;