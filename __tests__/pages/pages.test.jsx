import { render } from '@testing-library/react';
import Home  from '../../pages/index';
import Classes from '../../pages/classes/index';
import Join from '../../pages/join/index'
import { useSession } from 'next-auth/react';

jest.mock('next-auth/react', () => {
    const originalModule = jest.requireActual('next-auth/react');
    return {
      __esModule: true,
      ...originalModule,
      useSession: jest.fn()
    };
});

describe('Checks if pages loaded', () => {
    it('Home', async () => {
        useSession.mockImplementation(() => {
            return { data: { user: 'test@google.com' }, status: 'authenticated' };
        });
        const { container } = render(<Home />);
        expect(container).toBeDefined();
    });

    it('Classes', async () => {
        useSession.mockImplementation(() => {
            return { data: { user: 'test@google.com' }, status: 'authenticated' };
        });
        const { container } = render(<Classes />);
        expect(container).toBeDefined();
    });

    it('Join', async () => {
        useSession.mockImplementation(() => {
            return { data: { user: 'test@google.com' }, status: 'authenticated' };
        });
        const { container } = render(<Join />);
        expect(container).toBeDefined();
    });
})


