import { getServerSideProps } from '../pages/admin/index';
import {
  enableFetchMocks,
  resetMocks,
  mockResponseOnce
} from 'jest-fetch-mock';

enableFetchMocks();

describe('Admin dashboard has secure API endpoints', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('allows access to the admin dashboard', async () => {
    const ctx = {
      email: 'josue@example.com'
    };

    mockResponseOnce(JSON.stringify({ status: 'success', user: ctx }));

    const res = await getServerSideProps(ctx);

    expect(res.props.userSession['status']).toEqual('success');
  });

  it('denies access to the admin dashboard', async () => {
    const ctx = {
      email: 'foo@bar.com'
    };

    mockResponseOnce(JSON.stringify({ status: 'success', user: ctx }));

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
