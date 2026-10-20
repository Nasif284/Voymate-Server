-- CreateEnum
CREATE TYPE "CommunityTripCategory" AS ENUM ('CAMP', 'TREK_EXPEDITION', 'ROADTRIP', 'TRIP');

-- CreateEnum
CREATE TYPE "CommunityTripPricingType" AS ENUM ('FREE', 'PAID');

-- CreateEnum
CREATE TYPE "CommunityTripStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CommunityVerificationStatus" AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED');

-- CreateTable
CREATE TABLE "community_trip_bookings" (
    "id" UUID NOT NULL,
    "booking_code" VARCHAR(50) NOT NULL,
    "trip_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "contact_name" VARCHAR(150) NOT NULL,
    "contact_phone" VARCHAR(20) NOT NULL,
    "emergency_phone" VARCHAR(20),
    "note" TEXT,
    "amount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'INR',
    "razorpay_order_id" VARCHAR(255),
    "razorpay_payment_id" VARCHAR(255),
    "booked_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_trip_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_trips" (
    "id" UUID NOT NULL,
    "community_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "category" "CommunityTripCategory" NOT NULL,
    "pricing_type" "CommunityTripPricingType" NOT NULL,
    "price" DECIMAL(10,2),
    "currency" VARCHAR(10) NOT NULL DEFAULT 'INR',
    "price_note" VARCHAR(255),
    "destination_name" VARCHAR(255) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(100) NOT NULL,
    "country" VARCHAR(100) NOT NULL DEFAULT 'India',
    "date_from" DATE NOT NULL,
    "date_to" DATE NOT NULL,
    "duration_text" VARCHAR(100) NOT NULL,
    "max_capacity" INTEGER NOT NULL,
    "joined_count" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT NOT NULL,
    "itinerary" TEXT NOT NULL,
    "gallery" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "inclusions" TEXT,
    "exclusions" TEXT,
    "status" "CommunityTripStatus" NOT NULL DEFAULT 'PUBLISHED',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "community_trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "communities" (
    "id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(150) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "tagline" VARCHAR(255),
    "description" TEXT,
    "avatar_url" VARCHAR(500),
    "cover_url" VARCHAR(500),
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "country" VARCHAR(100) NOT NULL DEFAULT 'India',
    "instagram_handle" VARCHAR(100),
    "website_url" VARCHAR(255),
    "is_onboarded" BOOLEAN NOT NULL DEFAULT false,
    "verification_status" "CommunityVerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "verification_doc_url" VARCHAR(500),
    "verification_notes" TEXT,
    "verified_at" TIMESTAMPTZ(6),
    "rating" DECIMAL(3,2) NOT NULL DEFAULT 5.0,
    "total_trips_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "communities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "community_trip_bookings_booking_code_key" ON "community_trip_bookings"("booking_code");

-- CreateIndex
CREATE INDEX "community_trip_bookings_user_id_idx" ON "community_trip_bookings"("user_id");

-- CreateIndex
CREATE INDEX "community_trip_bookings_trip_id_idx" ON "community_trip_bookings"("trip_id");

-- CreateIndex
CREATE UNIQUE INDEX "community_trip_bookings_trip_id_user_id_key" ON "community_trip_bookings"("trip_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "community_trips_slug_key" ON "community_trips"("slug");

-- CreateIndex
CREATE INDEX "community_trips_slug_idx" ON "community_trips"("slug");

-- CreateIndex
CREATE INDEX "community_trips_community_id_idx" ON "community_trips"("community_id");

-- CreateIndex
CREATE INDEX "community_trips_category_idx" ON "community_trips"("category");

-- CreateIndex
CREATE INDEX "community_trips_pricing_type_idx" ON "community_trips"("pricing_type");

-- CreateIndex
CREATE INDEX "community_trips_status_idx" ON "community_trips"("status");

-- CreateIndex
CREATE INDEX "community_trips_date_from_idx" ON "community_trips"("date_from");

-- CreateIndex
CREATE UNIQUE INDEX "communities_slug_key" ON "communities"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "communities_email_key" ON "communities"("email");

-- CreateIndex
CREATE INDEX "communities_slug_idx" ON "communities"("slug");

-- CreateIndex
CREATE INDEX "communities_email_idx" ON "communities"("email");

-- CreateIndex
CREATE INDEX "communities_is_verified_idx" ON "communities"("is_verified");

-- AddForeignKey
ALTER TABLE "community_trip_bookings" ADD CONSTRAINT "community_trip_bookings_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "community_trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_trip_bookings" ADD CONSTRAINT "community_trip_bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_trips" ADD CONSTRAINT "community_trips_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
