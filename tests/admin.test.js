import { getServerSideProps } from '../pages/admin/index';
import {
  enableFetchMocks,
  resetMocks,
  mockResponseOnce
} from 'jest-fetch-mock';
import { jest } from '@jest/globals';
import prisma from '../prisma/prisma';

enableFetchMocks();

prisma.user.findMany = jest.fn().mockReturnValue([
  {
    id: '0000000000000000000000000',
    name: 'jestfn',
    email: 'jest@test.com',
    role: 'STUDENT'
  },
  {
    id: '1111111111111111111111111',
    name: 'test',
    email: 'test@jest.com',
    role: 'TEACHER'
  }
]);

describe('Admin dashboard has secure API endpoints', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('allows access to the admin dashboard', async () => {
    const ctx = {
      email: 'jestfn@test.com'
    };

    mockResponseOnce(JSON.stringify({ status: 'success', user: ctx }));
    prisma.user.findUnique = jest
      .fn()
      .mockReturnValue({ email: 'jestfn@test.com', role: 'ADMIN' });

    const res = await getServerSideProps(ctx);

    expect(res.props.userSession['status']).toEqual('success');
  });

  it('denies access to the admin dashboard', async () => {
    const ctx = {
      email: 'foo@bar.com'
    };

    mockResponseOnce(JSON.stringify({ status: 'success', user: ctx }));
    prisma.user.findUnique = jest
      .fn()
      .mockReturnValue({ email: 'jest@test.com', role: 'STUDENT' });
    expect.assertions(1);
    try {
      await getServerSideProps(ctx);
    } catch (e) {
      expect(e).toEqual(
        new TypeError(
          "Cannot read properties of undefined (reading 'writeHead')"
        )
      );
    }
  });
});
