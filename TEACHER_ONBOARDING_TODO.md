# Teacher Onboarding MVP TODO

## Goals

- [x] Admin invite-only teacher onboarding
- [x] Teacher resend/reinvite support

## Planning

- [x] Confirm acceptance flow for invites
- [x] Lock MVP boundaries and non-goals

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
- [x] Teacher invite acceptance handling
- [x] Authorization and validation hardening

## UI

- [x] Admin teacher invites panel
- [x] Role-aware access denied guidance
- [x] Invite status and action feedback

## Email

- [x] Select/send provider integration strategy
- [x] Teacher invite templates
- [x] Resend/retry behavior
- [x] Expiry handling messaging

## Testing

- [x] Unit tests for state transitions
- [x] API tests for auth + error paths
- [x] Integration test for admin->teacher flow

## Rollout

- [x] Feature flag teacher invites
- [x] Update setup docs to remove manual role assignment
