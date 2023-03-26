import { render } from '@testing-library/react';
import Classes from '../../pages/classes/index';

describe('Classes page tests', () => {
    it('Classes page can load', async () => {
        expect(render(<Classes />)).toBeDefined();
    });
})