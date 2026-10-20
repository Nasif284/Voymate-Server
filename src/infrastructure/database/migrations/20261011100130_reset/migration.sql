-- DropForeignKey
ALTER TABLE "connection_requests" DROP CONSTRAINT "connection_requests_matchId_fkey";

-- AlterTable
ALTER TABLE "connection_requests" ALTER COLUMN "matchId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "connection_requests" ADD CONSTRAINT "connection_requests_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "trip_matches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
