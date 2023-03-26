import { render } from '@testing-library/react';
import Join from '../../pages/join/index'

describe('Join page tests', () => {
    it('Join page can load', async () => {
        expect(render(<Join />)).toBeDefined();
    });
})