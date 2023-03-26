import { render } from '@testing-library/react';
import Home  from '../../pages/index';
import { useSession } from 'next-auth/react';

jest.mock('next-auth/react', () => {
    const originalModule = jest.requireActual('next-auth/react');
    return {
      __esModule: true,
      ...originalModule,
      useSession: jest.fn()
    };
});

describe('Home page tests', () => {
    it('Home page can load', async () => {
        useSession.mockImplementation(() => {
            return { data: { user: 'test@google.com' }, status: 'authenticated' };
        });
        expect(render(<Home />)).toBeDefined();
    });
})