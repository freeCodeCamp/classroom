import ErrorComponent from '../../components/error';
import React from 'react';
import renderer from 'react-test-renderer';
import { SessionProvider } from 'next-auth/react';

const sampleProps = {
  errorCause: '404 error',
  errorMessage: 'Page not found'
};

describe('ErrorComponet', () => {
  it('displays error cause and error message properly', () => {
    const tree = renderer
      .create(
        <SessionProvider session={{ user: { name: 'test user' } }}>
          <ErrorComponent {...sampleProps} />
        </SessionProvider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
