import ErrorComponent from '../../components/error';
import React, { act } from 'react';
import renderer from 'react-test-renderer';
import { SessionProvider } from 'next-auth/react';

jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() }))
}));

const sampleProps = {
  errorCause: '404 error',
  errorMessage: 'Page not found'
};

describe('ErrorComponet', () => {
  it('displays error cause and error message properly', () => {
    let root;
    act(() => {
      root = renderer.create(
        <SessionProvider session={{ user: { name: 'test user' } }}>
          <ErrorComponent {...sampleProps} />
        </SessionProvider>
      );
    });
    expect(root.toJSON()).toMatchSnapshot();
  });
});
