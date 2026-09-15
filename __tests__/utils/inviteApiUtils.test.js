// util/inviteApiUtils.js imports next-auth at the top of the file for the
// server-session helper, which transitively pulls in openid-client/jose
// (ESM-only, not parseable by Jest's default transform). Stub it out so
// this pure-function test doesn't need to load the real auth stack.
jest.mock('next-auth', () => ({
  __esModule: true,
  default: jest.fn(() => jest.fn()),
  getServerSession: jest.fn()
}));

import { areEquivalentInviteEmails } from '../../util/inviteApiUtils';

describe('areEquivalentInviteEmails', () => {
  it('matches identical emails', () => {
    expect(
      areEquivalentInviteEmails('teacher@example.com', 'teacher@example.com')
    ).toBe(true);
  });

  it('is case-insensitive and trims whitespace', () => {
    expect(
      areEquivalentInviteEmails(' Teacher@Example.com ', 'teacher@example.com')
    ).toBe(true);
  });

  it('ignores dots in the local part of a gmail.com address', () => {
    expect(
      areEquivalentInviteEmails('teach.er@gmail.com', 'teacher@gmail.com')
    ).toBe(true);
  });

  it('ignores a plus suffix in the local part of a gmail.com address', () => {
    expect(
      areEquivalentInviteEmails('teacher+invite@gmail.com', 'teacher@gmail.com')
    ).toBe(true);
  });

  it('applies gmail normalization to googlemail.com addresses too', () => {
    expect(
      areEquivalentInviteEmails(
        'teach.er+invite@googlemail.com',
        'teacher@gmail.com'
      )
    ).toBe(true);
  });

  it('does not apply gmail-style normalization to other domains', () => {
    expect(
      areEquivalentInviteEmails('teach.er@example.com', 'teacher@example.com')
    ).toBe(false);
  });

  it('rejects genuinely different emails', () => {
    expect(
      areEquivalentInviteEmails('teacher@example.com', 'admin@example.com')
    ).toBe(false);
  });
});
