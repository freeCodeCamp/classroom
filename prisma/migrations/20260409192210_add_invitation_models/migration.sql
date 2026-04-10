-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED', 'CANCELLED');

-- CreateTable
CREATE TABLE "TeacherInvitation" (
    "teacherInvitationId" TEXT NOT NULL,
    "invitedTeacherEmail" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "inviteToken" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,
    "acceptedById" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherInvitation_pkey" PRIMARY KEY ("teacherInvitationId")
);

-- CreateTable
CREATE TABLE "StudentInvitation" (
    "studentInvitationId" TEXT NOT NULL,
    "invitedStudentEmail" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "inviteToken" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,
    "acceptedById" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentInvitation_pkey" PRIMARY KEY ("studentInvitationId")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeacherInvitation_inviteToken_key" ON "TeacherInvitation"("inviteToken");

-- CreateIndex
CREATE INDEX "TeacherInvitation_invitedTeacherEmail_status_idx" ON "TeacherInvitation"("invitedTeacherEmail", "status");

-- CreateIndex
CREATE INDEX "TeacherInvitation_expiresAt_idx" ON "TeacherInvitation"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "StudentInvitation_inviteToken_key" ON "StudentInvitation"("inviteToken");

-- CreateIndex
CREATE INDEX "StudentInvitation_classroomId_status_idx" ON "StudentInvitation"("classroomId", "status");

-- CreateIndex
CREATE INDEX "StudentInvitation_invitedStudentEmail_status_idx" ON "StudentInvitation"("invitedStudentEmail", "status");

-- CreateIndex
CREATE INDEX "StudentInvitation_expiresAt_idx" ON "StudentInvitation"("expiresAt");

-- AddForeignKey
ALTER TABLE "TeacherInvitation" ADD CONSTRAINT "TeacherInvitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherInvitation" ADD CONSTRAINT "TeacherInvitation_acceptedById_fkey" FOREIGN KEY ("acceptedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentInvitation" ADD CONSTRAINT "StudentInvitation_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("classroomId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentInvitation" ADD CONSTRAINT "StudentInvitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentInvitation" ADD CONSTRAINT "StudentInvitation_acceptedById_fkey" FOREIGN KEY ("acceptedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
