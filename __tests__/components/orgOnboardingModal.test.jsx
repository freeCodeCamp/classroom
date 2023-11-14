import { screen, render } from '@testing-library/react'
import '@testing-library/jest-dom'
import OrgOnboardingModal from '../../components/orgOnboardingModal'
import React from 'react'
import renderer from 'react-test-renderer'

// Allows us to mock createPortal which is used to render our Modal.
jest.mock('react-dom', () => ({
    // @ts-ignore
    ...jest.requireActual('react-dom'),
    createPortal: node => node
  }))

// Used when rendering our <OrgOnboardingModal /> by Jest.
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}))

describe('Onboarding modal', () => {
    it('renders the combobox correctly when University is selected', () => {
        const tree = renderer.create(
            <OrgOnboardingModal></OrgOnboardingModal>
        ).toJSON();
        expect(tree).toMatchSnapshot();
    }) 

        // This test passes selectedOrg into our component. However, this pattern is not followed inside of our parent page where we call <OrgOnboardingModal />. This props should only be included when testing the component.
        it(`should render the 'otherType' input`, () => {
            render(<OrgOnboardingModal selectedOrg={4}></OrgOnboardingModal>)
            expect(screen.getByLabelText('Please specify:')).toBeInTheDocument();
        })
})