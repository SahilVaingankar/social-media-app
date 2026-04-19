/*
  Warnings:

  - You are about to drop the column `consumedAt` on the `AuthToken` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Otp_userId_type_key";

-- AlterTable
ALTER TABLE "AuthToken" DROP COLUMN "consumedAt";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "otpBlockedUntil" TIMESTAMP(3);
