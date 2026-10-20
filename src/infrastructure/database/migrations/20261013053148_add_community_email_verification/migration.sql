-- AlterTable
ALTER TABLE "communities" ADD COLUMN     "email_verified_at" TIMESTAMPTZ(6),
ADD COLUMN     "is_email_verified" BOOLEAN NOT NULL DEFAULT false;
