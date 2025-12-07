/*
  Warnings:

  - A unique constraint covering the columns `[fccProperUserId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "fccProperUserId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_fccProperUserId_key" ON "User"("fccProperUserId");
