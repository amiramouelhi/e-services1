-- AlterTable
ALTER TABLE "User" ADD COLUMN     "passwordResetCode" TEXT,
ADD COLUMN     "passwordResetCodeExpiresAt" TIMESTAMP(3);
