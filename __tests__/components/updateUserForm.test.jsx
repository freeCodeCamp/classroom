import UpdateUserForm from '../../components/updateUserForm';
import React from 'react';
import renderer from 'react-test-renderer';

const sampleUsers=[
    {
        id: '5f33071498eb2472b87ddee4',
        name: "Hamzat Victor",
        email: "oluwaborihamzat@gmail.com",
        role: "ADMIN"
    },
    {
        id: '72245f33071498ebb87ccee4',
        name: "Alade Christopher",
        email: "aladechristoph@gmail.com",
        role: "TEACHER"
    },
    {
        id: '98eb72245f330714b87ccee4',
        name: "Ayomide onifade",
        email: "Jangulabi@gmail.com",
        role: "NONE"
    },
]


describe('updateUserForm', () => {

  it('shows a form for user to update details', () => {
    const tree = renderer
      .create(<UpdateUserForm userInfo={sampleUsers[2]}  />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
  it(`doesn't show other roles if user role is "ADMIN"`, () => {
    const tree = renderer
      .create(<UpdateUserForm userInfo={sampleUsers[0]}  />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
  it(`shows all available roles if user role is not "ADMIN"`, () => {
    const tree = renderer
      .create(<UpdateUserForm userInfo={sampleUsers[1]}  />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
  
});
