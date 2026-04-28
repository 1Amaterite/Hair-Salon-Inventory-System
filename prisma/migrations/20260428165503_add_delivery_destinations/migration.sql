-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('PERMANENT', 'TEMPORARY');

-- CreateEnum
CREATE TYPE "DestinationStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "delivery_destinations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "full_address" TEXT NOT NULL,
    "contact" TEXT,
    "location_type" "LocationType" NOT NULL,
    "status" "DestinationStatus" NOT NULL DEFAULT 'ACTIVE',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_destinations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "delivery_destinations_location_type_idx" ON "delivery_destinations"("location_type");

-- CreateIndex
CREATE INDEX "delivery_destinations_status_idx" ON "delivery_destinations"("status");

-- CreateIndex
CREATE INDEX "delivery_destinations_is_active_idx" ON "delivery_destinations"("is_active");
