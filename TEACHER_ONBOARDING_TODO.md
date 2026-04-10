# Teacher Onboarding MVP TODO

## Goals

- [ ] Admin invite-only teacher onboarding
- [ ] Student invite by join link/code
- [ ] Student invite by email
- [ ] Teacher resend/reinvite support

## Planning

- [ ] Finalize invitation lifecycle states
- [ ] Confirm acceptance flow for invites
- [ ] Lock MVP boundaries and non-goals

## Data Model

- [x] Add TeacherInvitation model
- [x] Add StudentInvitation model
- [x] Add indexes and uniqueness constraints
- [x] Generate migration for invitation models

## API

- [x] Admin teacher invite APIs: resend
- [x] Admin teacher invite API: create
- [x] Admin teacher invite API: list
- [x] Admin teacher invite API: revoke
- [x] Teacher student invite APIs: create/list/resend/revoke
- [x] Teacher student invite API: create
- [x] Teacher student invite API: list
- [x] Teacher student invite API: resend
- [x] Teacher student invite API: revoke
- [x] Invite acceptance handling
- [x] Authorization and validation hardening

## UI

- [x] Admin teacher invites panel
- [x] Teacher student invites panel in classes
- [x] Role-aware access denied guidance
- [x] Invite status and action feedback

## Email

- [ ] Select/send provider integration strategy
- [ ] Teacher and student invite templates
- [ ] Resend/retry behavior
- [ ] Expiry handling messaging

## Testing

- [ ] Unit tests for state transitions
- [ ] API tests for auth + error paths
- [ ] Integration test for admin->teacher flow
- [ ] Integration test for teacher->student flow

## Join Link Review

> The existing join-link route (`/join/[...joinCode]` + `student_email_join.js`) was not changed in
> this branch but has several issues that need to be resolved before the dual-path student onboarding
> goal can be considered complete.

### Bugs to fix in `student_email_join.js`

- [ ] Fix broken method guard: `!req.method == 'PUT'` never triggers due to operator precedence — any HTTP method is currently accepted
- [ ] Add early `return` after 405 and 403 responses so execution does not fall through when unauthenticated or wrong method
- [ ] Add `role` to the Prisma `select` on the user query — the role-promotion logic at line 42 silently does nothing today because `userInfo.role` is always `undefined`
- [ ] Validate `body.join[0]` before using it — no guard against missing or malformed joinCode in the request body

### Improvements to consider

- [ ] Migrate from `unstable_getServerSession` to `getServerSession` (stable API, consistent with new invite endpoints)
- [ ] Return a JSON error body on failure responses instead of empty `.end()` (consistent with new invite endpoints)
- [ ] Add rate limiting or a short-circuit for repeated join attempts with invalid codes
- [ ] Decide: does joining via link auto-promote role NONE → STUDENT, or should it require an active StudentInvitation? (aligns with dual-path decision)

### Join page (`pages/join/[...joinCode].js`)

- [ ] Fix success notification: a non-409 response is currently shown as success even on a server 500
- [ ] Fix typo in button label: "Submit Reqest" → "Submit Request"

## Rollout

- [ ] Feature flag teacher invites
- [ ] Feature flag student email invites
- [ ] Update setup docs to remove manual role assignment
