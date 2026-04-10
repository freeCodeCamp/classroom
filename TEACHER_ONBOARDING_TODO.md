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

## Rollout

- [ ] Feature flag teacher invites
- [ ] Feature flag student email invites
- [ ] Update setup docs to remove manual role assignment
