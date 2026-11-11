-- CreateEnum
CREATE TYPE "JoinMode" AS ENUM ('OPEN', 'ASK_TO_JOIN', 'CLOSED');

-- AlterTable
ALTER TABLE "Classroom" ADD COLUMN     "joinMode" "JoinMode" NOT NULL DEFAULT 'OPEN',
ADD COLUMN     "pendingUserIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
