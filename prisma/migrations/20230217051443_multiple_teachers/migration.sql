/*
  Warnings:

  - The `classroomTeacherId` column on the `Classroom` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `isAdminApproved` on the `User` table. All the data in the column will be lost.
  - Added the required column `UserId` to the `Classroom` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Classroom" DROP CONSTRAINT "Classroom_classroomTeacherId_fkey";

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "refresh_token_expires_in" INTEGER;

-- AlterTable
ALTER TABLE "Classroom" ADD COLUMN     "UserId" TEXT NOT NULL,
DROP COLUMN "classroomTeacherId",
ADD COLUMN     "classroomTeacherId" TEXT[];

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isAdminApproved";

-- AddForeignKey
ALTER TABLE "Classroom" ADD CONSTRAINT "Classroom_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
