-- AlterEnum
ALTER TYPE "TransactionType" RENAME TO "TransactionType_old";

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('INBOUND', 'OUTBOUND', 'USAGE');

-- AlterTable
ALTER TABLE "transactions" ALTER COLUMN "type" TYPE "TransactionType" USING "type"::text::"TransactionType";

-- DropEnum
DROP TYPE "TransactionType_old";
