- make sure there is a confirmation step before sending or resending invites, to prevent accidental clicks
- consider adding a bulk invite option for teachers to upload a CSV of student emails for larger classes
- add clear messaging about invite expiry and how to get a new invite if the old one expires
- ensure that the UI for managing invites is mobile-friendly, as many teachers may access it from tablets or phones
- consider adding a way for teachers to see which students have accepted their invites and which ones are still pending, to help with class management
- add logging and monitoring around the invite APIs to track usage and identify any issues with invite delivery
- make sure there is a confirmation step before revoking invites, to prevent accidental revocations
- make sure there is a confirmation step before removing students from a class, to prevent accidental removals. likely a reinput of the student's email to confirm the action.

**Plan: Teacher Onboarding MVP Proposal**

Recommended approach: ship an admin-invite teacher flow first, and keep student onboarding dual-path (join link/code plus email invites with resend). This matches your preferred scope and fits the current architecture with minimal disruption.

_What similar products do:_

- Google Classroom uses a teacher verification/permission model controlled by admins, then enables class creation only for verified teachers.
- Google Classroom supports multiple student invite channels in parallel: invite link, class code, and email invite.
- Google Classroom supports co-teacher invitation with explicit role boundaries and invitation acceptance.
- ClassDojo emphasizes very low-friction teacher start and family communication onboarding, but less visible role-governance detail in public docs.
- Common LMS pattern across major tools: role gating first, then invite lifecycle (pending, accepted, expired/revoked), then classroom operations.

_Primary references I used:_

1. https://support.google.com/edu/classroom/answer/6071551
2. https://support.google.com/edu/classroom/answer/6020282
3. https://support.google.com/edu/classroom/answer/6190760
4. https://support.google.com/edu/classroom/answer/6020273
5. https://www.classdojo.com/teachers/

_Scannable implementation plan_

1. Define final MVP boundaries and user journeys for Admin, Invited Teacher, and Student.
2. Add teacher invitation lifecycle model (PENDING, ACCEPTED, EXPIRED, REVOKED) with inviter and expiry.
3. On sign-in, if email matches active teacher invite, promote user to TEACHER and mark invite accepted.
4. Add student invitation lifecycle per classroom (PENDING, ACCEPTED, EXPIRED, CANCELLED).
5. Keep current student join-code flow as fallback and parity path.
6. Add teacher email invite, resend, and revoke for students.
7. Add admin APIs for teacher invites: create, list, resend, revoke.
8. Add teacher APIs for student invites: create/list/resend/revoke.
9. Add role-aware onboarding UI:
   - Admin view gets Teacher Invitations panel.
   - Teacher classes view gets Student Invitations panel.
   - Access denied page becomes guidance-driven instead of generic.
10. Add migration and rollout safeguards, then test invitation state transitions, auth rules, and end-to-end flows.

_Key anchors in this codebase:_

1. pages/api/auth/[...nextauth].js
2. index.js
3. pages/admin/actions/[id].js
4. adminTable.js
5. updateUserForm.js
6. index.js
7. ClassInviteTable.js
8. pages/join/[...joinCode].js
9. student_email_join.js
10. create_class_teacher.js
11. error.js
12. schema.prisma
13. redirectUser.js
14. codespace-instructions.sh

_Decisions captured from you:_

1. Teacher onboarding is invite-only by admin for MVP.
2. Students can be invited via join link/code and email.
3. Teachers need resend/reinvite capability for student invitations.
4. This phase is MVP proposal only, not full long-term architecture.

**schema.prisma changes:**

1. Classroom now knows about student invites

Added a relation field on the Classroom model:
studentInvitations StudentInvitation[]
What this does:

One classroom can have many pending/accepted student invitations.
This lets you show invitation history/status per class later in the UI.

2. User now tracks who sent/accepted invites

Added four relation fields on User:
teacherInvitationsSent
teacherInvitationsAccepted
studentInvitationsSent
studentInvitationsAccepted

What this does:

You can answer questions like:
Which admin invited this teacher?
Which user accepted this invite?
Which teacher sent these student invites?

Why the relation names matter:

Prisma needs explicit relation names when the same two models are connected in multiple ways (for example invitedBy vs acceptedBy).

_Note: A new migration was generated for these schema changes and is included in the PR. The migration adds the new tables and fields, along with indexes for efficient querying based on email and status._

3. Added a shared invitation status enum

Added InvitationStatus enum with:
PENDING
ACCEPTED
EXPIRED
REVOKED
CANCELLED

What this does:

Gives both invitation tables a consistent lifecycle.
Makes filtering and reporting easier than using free-form strings.

4. Added TeacherInvitation model
   Key fields:

invitedTeacherEmail
status (defaults to PENDING)
inviteToken (unique)
invitedById (who sent)
acceptedById (who accepted, optional)
expiresAt
createdAt / updatedAt

Indexes:

invitedTeacherEmail + status
expiresAt

What this enables:

Admin invites teacher by email.
Invite can be accepted, revoked, or expired.
Unique token supports secure accept links later.

5. Added StudentInvitation model
   Key fields:

invitedStudentEmail
status (defaults to PENDING)
inviteToken (unique)
classroomId (which class this invite is for)
invitedById (teacher/admin sender)
acceptedById (optional)
expiresAt
createdAt / updatedAt

Indexes:

classroomId + status
invitedStudentEmail + status
expiresAt

What this enables:

Teachers send and resend student invites per class.
You can list pending invites for a class and track acceptance.

How this maps to your onboarding goal

Teacher onboarding (invite-only): supported by TeacherInvitation.
Student onboarding (code + email): existing join code path remains, and StudentInvitation adds the email path.
Reinvite/resend: supported by status + token + expiry + sender tracking.

**admin/teacher_invites/create.js API endpoint added:**

This endpoint allows an admin to create a teacher invitation by providing the teacher's email. It generates a unique invite token, sets the status to PENDING, and records who sent the invite.

What this new endpoint does:

Allows only POST.
Requires an authenticated session.
Requires the current user role to be ADMIN.
Accepts invitedTeacherEmail from request body.
Normalizes the email to lowercase and trims spaces.
Prevents duplicate active invites (same email, status PENDING, not expired).
Creates a secure invite token using Node crypto.
Sets invite expiry to 7 days from now.
Stores the invitation in TeacherInvitation and returns status 201 with the created record.

How the code is structured in create.js:

Imports Prisma + NextAuth session helper + crypto.
Defines INVITE_EXPIRY_DAYS so expiry policy is explicit and easy to change.
Adds buildExpiryDate helper to keep date logic isolated.
In handler:
Method check first.
Auth check second.
Admin authorization check third.
Input validation fourth.
Duplicate check fifth.
Create record last.

**admin/teacher_invites/list.js API endpoint added:**

This endpoint allows an admin to list all teacher invitations, optionally filtered by status. It returns the invitations along with the inviter and acceptor user details.

How the new list endpoint works, step by step:

1. Method guard
   Only accepts GET requests.
   Anything else returns 405.
2. Authentication
   Reads session using NextAuth.
   If there is no session, returns 403.
3. Authorization
   Loads current user from DB by session email.
   Requires role ADMIN.
   Non-admins return 403.
4. Pagination input
   Accepts optional query params: limit and offset.
   limit defaults to 50 and is capped at 200.
   offset defaults to 0 and cannot go below 0.
5. Data query
   Fetches teacher invitations sorted newest first.
   Includes related invitedBy user and acceptedBy user details.
   Also computes total count for pagination.
6. Response shape
   Returns status 200 with:
   invitations array
   pagination object containing total, limit, offset

Why this matters for onboarding:

Admin dashboard will need this endpoint to show pending/accepted/expired teacher invites.
It gives us the read side before adding actions like resend and revoke.
It is safe by default because only authenticated admins can query it.

**admin/teacher_invites/revoke.js API endpoint added:**

This endpoint allows an admin to revoke a pending teacher invitation by its ID. It checks that the invite exists, is still pending, and then updates its status to REVOKED.

How revoke works, step by step:

1. Method check
   Accepts POST only.
   Returns 405 for any other method.
2. Authentication
   Validates active session via NextAuth.
   Returns 403 if not signed in.
3. Authorization
   Looks up current user by session email.
   Requires role ADMIN.
   Returns 403 otherwise.
4. Input validation
   Expects teacherInvitationId in request body.
   Returns 400 if missing/empty.
5. Invitation lookup
   Finds invitation by teacherInvitationId.
   Returns 404 if not found.
6. State safety
   Only allows revoke when status is PENDING.
   If invite is already ACCEPTED, EXPIRED, REVOKED, or CANCELLED, returns 409 with current status.
7. Update
   Sets status to REVOKED.
   Returns updated invitation payload with 200.

Why this matters for onboarding:
Admins need the ability to revoke invites if they were sent in error or if circumstances change.
This endpoint enforces that only pending invites can be revoked, preventing inconsistent states.

**admin/teacher_invites/resend.js API endpoint added:**

This endpoint allows an admin to resend a pending teacher invitation by its ID. It checks that the invite exists, is still pending, and then updates its inviteToken and expiresAt to effectively "refresh" the invite.

How resend works, step by step:

1. Method/auth/role checks
   POST only
   Signed-in session required
   ADMIN role required
2. Input check
   Requires teacherInvitationId in request body
3. Invitation lookup
   Finds invitation by ID
   404 if not found
4. State rule
   If invitation is ACCEPTED, resend is blocked with 409
   Any non-accepted status can be resent
5. Resend behavior
   Generates a fresh secure token using crypto random bytes
   Resets expiration to 7 days from now
   Forces status back to PENDING
6. Response
   Returns updated invitation object with status 200

Why this is useful:

Admin can reissue stale/revoked/expired invite links without creating a brand-new record.
Fresh token invalidates older links for safety.
It keeps invitation history attached to one invitation record.

**admin/index.js and components/TeacherInvitesPanel (js and css) added:**

This adds a new section to the admin dashboard where admins can manage teacher invitations. It includes a list of current invitations with their status and actions to resend or revoke pending invites.

How this new panel works:

1. Loads invites on page load
   Calls GET /api/admin/teacher_invites/list?limit=100
   Shows loading, empty, or table state
2. Lets admin create invite
   Email input + Send Invite button
   Calls POST /api/admin/teacher_invites/create
   Handles duplicate-active-invite case (409) with user feedback
3. Lets admin resend invite
   Resend button on each row
   Calls POST /api/admin/teacher_invites/resend
   Disabled for ACCEPTED invites
4. Lets admin revoke invite
   Revoke button on each row
   Calls POST /api/admin/teacher_invites/revoke
   Disabled unless status is PENDING
5. Gives visible feedback
   Uses existing toast notifier component for success/error messages

What this means practically:

You can now exercise all teacher invite admin APIs from UI.
Admin onboarding workflow is now testable end-to-end at basic level (create/list/resend/revoke), pending database migration and invite acceptance flow.

**api/teacher_invites/accept.js API endpoint added:**

This endpoint allows an invited teacher to accept their invitation. It checks the invite token, validates that the invite is still pending, promotes the user to TEACHER role, and marks the invite as ACCEPTED.

How the accept endpoint works:

1. Requires POST.
2. Requires authenticated user session.
3. Requires inviteToken in request body.
4. Looks up the invitation by token.
5. Verifies invitation email matches signed-in user email.
6. Handles state cases:
   - ACCEPTED: returns success idempotently (or conflict if accepted by different user)
   - non-PENDING: returns 409
   - expired PENDING: marks EXPIRED and returns 410
7. If valid and pending:
   - Marks invitation ACCEPTED
   - Sets acceptedById
   - Promotes user role to TEACHER (keeps ADMIN as ADMIN)
   - Does both writes in a single Prisma transaction

Why this is important:

1. It closes the main onboarding loop from “admin sent invite” to “teacher accepted and got role.”
2. It keeps role change and invitation state synchronized atomically.

Quick manual test flow:

1. As admin, create invite in admin UI (Teacher Invitations panel).
2. Copy inviteToken from API response for now (until invite email link/UI token page is added).
3. Sign in as the invited email account.
4. POST to /api/teacher_invites/accept with:
   {
   "inviteToken": "the-token-from-invite"
   }
5. Confirm response shows:
   - invitation.status = ACCEPTED
   - user.role = TEACHER (or ADMIN if already admin)

**api/student_invites/create.js API endpoint added:**

This endpoint allows a teacher to create an email invitation for a student to join their class. It generates a unique invite token, sets the status to PENDING, and records who sent the invite and which class it's for.

How the new student invite creation endpoint works:

1. Requires POST and authenticated session.
2. Requires current user role to be TEACHER or ADMIN.
3. Validates inputs:
   - invitedStudentEmail
   - classroomId
4. Verifies classroom exists.
5. Enforces ownership:
   - If role is TEACHER, they can only invite for classrooms where classroomTeacherId equals their user id.
6. Prevents duplicate active invites:
   - same invitedStudentEmail + classroomId + status PENDING + not expired.
7. Creates invitation with:
   - status PENDING
   - secure inviteToken
   - 7-day expiry
   - invitedById set to current user id.

Manual test payload:
POST /api/student_invites/create
{
"invitedStudentEmail": "student@example.org",
"classroomId": "YOUR_CLASSROOM_ID"
}

Expected outcomes:

201 with invitation object on success
403 if non-teacher/non-admin or teacher does not own class
404 if classroom not found
409 if active invite already exists

**api/student_invites/list.js API endpoint added:**

This endpoint allows a teacher to list all student invitations for a specific classroom. It returns the invitations along with their status and who sent them.

How the new student invite listing endpoint works:

1. Requires GET.
2. Requires authenticated session.
3. Requires user role TEACHER or ADMIN.
4. Supports optional query parameters:
   - limit
   - offset
   - classroomId
5. Applies ownership filtering:
   - TEACHER only sees invites for classrooms they own.
   - ADMIN can see all invites, optionally filtered by classroomId.
6. Returns invitation rows plus pagination metadata.

Returned fields include:

1. Invite basics: id, invitedStudentEmail, classroomId, status, expiresAt, createdAt, updatedAt
2. Related inviter user details
3. Related accepting user details
4. Related classroom details

Manual test examples:

1. List all visible invites
   - GET /api/student_invites/list
2. Filter by one classroom
   - GET /api/student_invites/list?classroomId=YOUR_CLASSROOM_ID
3. Paginate
   - GET /api/student_invites/list?limit=20&offset=20

**api/student_invites/resend.js API endpoint added:**

This endpoint allows a teacher to resend a pending student invitation by its ID. It checks that the invite exists, is still pending, and then updates its inviteToken and expiresAt to effectively "refresh" the invite.

How the new student invite resend endpoint works:

How resend works:

1. POST-only endpoint.
2. Requires authenticated TEACHER or ADMIN.
3. Requires studentInvitationId in body.
4. Loads invitation and its classroom owner.
5. Enforces ownership:
   - TEACHER can only resend for their own classroom invites.
   - ADMIN can resend any.
6. Blocks resend if invite is already ACCEPTED (409).
7. On allowed resend:
   - Regenerates secure token
   - Resets status to PENDING
   - Extends expiry by 7 days

**api/student_invites/revoke.js API endpoint added:**

This endpoint allows a teacher to revoke a pending student invitation by its ID. It checks that the invite exists, is still pending, and then updates its status to CANCELLED.

How revoke works:

1. POST-only.
2. Requires authenticated TEACHER or ADMIN.
3. Requires studentInvitationId in body.
4. Loads invitation + classroom owner.
5. Enforces ownership:
   - TEACHER can only revoke invites in their own classrooms.
   - ADMIN can revoke any invite.
6. Allows revoke only when status is PENDING.
7. Sets status to CANCELLED and returns updated invitation.

**Authorization and validation hardening:**

Across all new endpoints, we have layered checks to ensure that only properly authenticated and authorized users can perform actions. We also validate inputs and handle edge cases like duplicate invites or invalid states with appropriate HTTP status codes (400, 403, 404, 409, etc.). This ensures a robust and secure API surface for the new onboarding features.

What I changed:

1. Added shared API helper at inviteApiUtils.js
2. Refactored all invitation endpoints to use shared method/auth/role checks:

   - create.js (teacher)
   - list.js (teacher)
   - resend.js (teacher)
   - revoke.js (teacher)
   - accept.js (teacher)

   - create.js (student)
   - list.js (student)
   - resend.js (student)
   - revoke.js (student)
   - accept.js (student)

What is now hardened:

1. Consistent method guarding with one shared helper.
2. Consistent authenticated user loading and role enforcement.
3. Consistent pagination parsing in list endpoints.
4. Email validation added for create invitation endpoints (teacher and student).
5. Reduced duplicated auth logic across endpoints, which lowers drift risk.

**StudentInvitesPanel (js and css) component added to teacher class view:**

This component allows teachers to manage student invitations for their classes directly from the class view. It lists current invites and provides actions to resend or revoke pending invites.

What I implemented:

1. Added student invites UI component at StudentInvitesPanel.js
2. Added panel styles at StudentInvitesPanel.module.css
3. Mounted panel in each class card at ClassInviteTable.js
4. Updated TODO status in TEACHER_ONBOARDING_TODO.md
5. Teacher student invites panel in classes: done
6. Invite status and action feedback: done

What the new panel does:

1. Lists student invites for the specific classroom.
2. Lets teacher/admin create invite by email.
3. Lets teacher/admin resend invites.
4. Lets teacher/admin revoke pending invites.
5. Shows invite status and expiry in a table.
6. Shows success/error notifications for each action.

Important fix I made:
Resolved a React hook dependency warning by using useCallback for invitation loading.

**pages/error.js updated for role-aware access denied guidance:**

This update enhances the error page to provide more specific guidance when access is denied due to insufficient permissions. Instead of a generic "Access Denied" message, it now checks the user's role and offers tailored next steps.

What changed:

1. Replaced static error page with server-aware guidance logic in error.js
2. Marked TODO item complete in TEACHER_ONBOARDING_TODO.md

How the new error flow works:

1. Server checks whether user is signed in.
2. If signed in, it loads user role from DB.
3. It also checks the latest teacher invitation status for that email.
4. UI then chooses guidance based on state.

Current guidance mappings:

1. Not signed in:
   - “Please Sign In” and route to home.
2. Signed in but user record missing:
   - “Account Not Found” message.
3. ADMIN:
   - Prompt to open admin dashboard.
4. TEACHER:
   - Prompt to open classes page.
5. STUDENT:
   - Explains this area is teacher/admin only.
6. NONE with teacher invite PENDING:
   - Indicates invitation exists and asks to get invite link resent/shared.
7. NONE with teacher invite EXPIRED:
   - Asks user to request resend from admin.
8. NONE with teacher invite REVOKED:
   - Indicates invitation was revoked and to contact admin.
9. Optional reason query support:
   - If reason=role-required, shows explicit role-required message.

Why this helps onboarding:

1. Users no longer get one generic “Access Denied.”
2. They get actionable next steps based on their actual onboarding state.
