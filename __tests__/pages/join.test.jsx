import { render } from '@testing-library/react';
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

describe('Join page tests', () => {
    it('Join page is loaded', async () => {
        useSession.mockImplementation(() => {
            return { data: { user: 'test@google.com' }, status: 'authenticated' };
        });
        const { container } = render(<Join />);
        expect(container).toBeDefined();
    });
})