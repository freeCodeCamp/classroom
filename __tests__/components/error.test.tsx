import ErrorComponent from '../../components/error';
import React, { act } from 'react';
import renderer from 'react-test-renderer';
import type { ReactTestRenderer } from 'react-test-renderer';
import { SessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';

vi.mock('next/router', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() }))
}));

const sampleProps = {
  errorCause: '404 error',
  errorMessage: 'Page not found'
};

describe('ErrorComponet', () => {
  it('displays error cause and error message properly', () => {
    let root!: ReactTestRenderer;
    act(() => {
      root = renderer.create(
        <SessionProvider
          session={{ user: { name: 'test user' } } as unknown as Session}
        >
          <ErrorComponent {...sampleProps} />
        </SessionProvider>
      );
    });
    expect(root.toJSON()).toMatchSnapshot();
  });
});
