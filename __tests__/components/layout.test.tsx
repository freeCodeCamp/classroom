import Layout from '../../components/layout';
import React, { act } from 'react';
import renderer from 'react-test-renderer';
import type { ReactTestRenderer } from 'react-test-renderer';

describe('Layout', () => {
  it('displays expected children', () => {
    let root!: ReactTestRenderer;
    act(() => {
      root = renderer.create(
        <Layout>
          <h1>I love freecodecamp</h1>
        </Layout>
      );
    });
    expect(root.toJSON()).toMatchSnapshot();
  });
});
