import Layout from '../../components/layout';
import React from 'react';
import renderer from 'react-test-renderer';


describe('Layout', () => {
  it('displays expected children', () => {
    const tree = renderer
      .create(
        <Layout>
          <h1>I love freecodecamp</h1>
        </Layout>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
