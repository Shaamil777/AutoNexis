-- AlterTable: Add error tracking and timestamp fields
ALTER TABLE "EventQueue" ADD COLUMN "lastError" TEXT;
ALTER TABLE "EventQueue" ADD COLUMN "updatedAt" TIMESTAMP(3);
UPDATE "EventQueue" SET "updatedAt" = "createdAt";
ALTER TABLE "EventQueue" ALTER COLUMN "updatedAt" SET NOT NULL;
