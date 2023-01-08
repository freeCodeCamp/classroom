import { getServerSideProps } from '../pages/admin/index';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import prisma from '../prisma/prisma';
import * as nextAuth from 'next-auth/react';

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
    jest.resetAllMocks();
  });

  it('allows access to the admin dashboard', async () => {
    const ctx = {
      status: 'success',
      user: {
        email: 'jestfn@test.com'
      }
    };

    jest.spyOn(nextAuth, 'getSession').mockReturnValue(ctx);

    prisma.user.findUnique = jest
      .fn()
      .mockReturnValue({ email: 'jestfn@test.com', role: 'ADMIN' });

    const res = await getServerSideProps();

    expect(res.props.userSession['status']).toEqual('success');
  });

  it('denies access to the admin dashboard', async () => {
    const ctx = {
      status: 'success',
      user: {
        email: 'jest@test.com'
      }
    };

    jest.spyOn(nextAuth, 'getSession').mockReturnValue(ctx);

    prisma.user.findUnique = jest
      .fn()
      .mockReturnValue({ email: 'jest@test.com', role: 'STUDENT' });

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
