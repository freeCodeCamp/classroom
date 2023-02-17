-- DropForeignKey
ALTER TABLE "Classroom" DROP CONSTRAINT "Classroom_UserId_fkey";

-- AlterTable
ALTER TABLE "Classroom" ALTER COLUMN "UserId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Classroom" ADD CONSTRAINT "Classroom_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
