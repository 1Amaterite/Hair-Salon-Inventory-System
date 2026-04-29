/*
  Warnings:

  - You are about to drop the column `contact` on the `delivery_destinations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "delivery_destinations" DROP COLUMN "contact",
ADD COLUMN     "contact_number" TEXT,
ADD COLUMN     "contact_person" TEXT;
