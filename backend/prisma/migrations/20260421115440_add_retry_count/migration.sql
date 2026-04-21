-- AlterTable
ALTER TABLE "EventQueue" ADD COLUMN     "retryCount" INTEGER NOT NULL DEFAULT 0;
