import { render } from '@testing-library/react';
import Classes from '../../pages/classes/index';
import { useSession } from 'next-auth/react';

jest.mock('next-auth/react', () => {
    const originalModule = jest.requireActual('next-auth/react');
    return {
      __esModule: true,
      ...originalModule,
      useSession: jest.fn()
    };
});

describe('Classes page tests', () => {
    it('Classes page is loaded', async () => {
        useSession.mockImplementation(() => {
            return { data: { user: 'test@google.com' }, status: 'authenticated' };
        });
        const { container } = render(<Classes />);
        expect(container).toBeDefined();
    });
})


