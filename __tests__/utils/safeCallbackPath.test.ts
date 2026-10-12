import { describe, expect, it } from 'vitest';
import { safeCallbackPath } from '../../util/safeCallbackPath';

const base = 'http://localhost:3001';

describe('safeCallbackPath', () => {
  it.each([
    ['/classes', '/classes'],
    ['/dashboard/v2/abc?x=1#h', '/dashboard/v2/abc?x=1#h'],
    ['http://localhost:3001/admin', '/admin'],
    ['https://evil.example/x', '/'],
    ['//evil.example', '/'],
    ['/\\evil.example', '/'],
    [['/a', '/b'], '/'],
    [undefined, '/'],
    ['', '/'],
    ['javascript:alert(1)', '/'],
    ['/.//evil.example', '/'],
    ['/..//evil.example', '/'],
    ['http://localhost:3001//evil.example', '/']
  ])('maps %j to %j', (value, expected) => {
    expect(safeCallbackPath(value, base)).toBe(expected);
  });
});
