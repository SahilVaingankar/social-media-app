/*
  Warnings:

  - A unique constraint covering the columns `[userId,type]` on the table `Otp` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "tokenType" AS ENUM ('ACCOUNT_VERIFICATION', 'PASSWORD_RESET');

-- CreateTable
CREATE TABLE "AuthToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "type" "tokenType" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuthToken_userId_idx" ON "AuthToken"("userId");

-- CreateIndex
CREATE INDEX "AuthToken_expiresAt_idx" ON "AuthToken"("expiresAt");

-- CreateIndex
CREATE INDEX "AuthToken_tokenHash_idx" ON "AuthToken"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "AuthToken_userId_type_key" ON "AuthToken"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Otp_userId_type_key" ON "Otp"("userId", "type");

-- AddForeignKey
ALTER TABLE "AuthToken" ADD CONSTRAINT "AuthToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
