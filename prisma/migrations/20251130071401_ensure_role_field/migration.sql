/*
  Warnings:

  - You are about to drop the column `goal` on the `MenteeRequest` table. All the data in the column will be lost.
  - You are about to drop the column `skills` on the `MentorProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MenteeRequest" DROP COLUMN "goal",
ADD COLUMN     "subjects" TEXT[];

-- AlterTable
ALTER TABLE "MentorProfile" DROP COLUMN "skills",
ADD COLUMN     "subjectPriorities" TEXT,
ADD COLUMN     "subjects" TEXT[];
