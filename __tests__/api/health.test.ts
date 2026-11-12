import { describe, expect, it } from 'vitest';
import handler from '../../pages/api/health';
import { createMockReq, createMockRes } from '../helpers/next-api';

describe('/api/health', () => {
  it.each(['GET', 'HEAD'])('returns 200 for %s', method => {
    const res = createMockRes();
    handler(createMockReq({ method }), res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ status: 'ok' });
  });

  it('returns 405 for POST', () => {
    const res = createMockRes();
    handler(createMockReq({ method: 'POST' }), res);
    expect(res.setHeader).toHaveBeenCalledWith('Allow', 'GET, HEAD');
    expect(res.status).toHaveBeenCalledWith(405);
  });
});
