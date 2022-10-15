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

  it('allows access the admin dashboard', async () => {
    const ctx = {
      email: 'josue@example.com'
    };

    mockResponseOnce(JSON.stringify({ status: 'success', user: ctx }));

    const res = await getServerSideProps(ctx);

    expect(res.props.userSession['status']).toEqual('success');
  });
});
