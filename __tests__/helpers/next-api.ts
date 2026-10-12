import type { NextApiRequest, NextApiResponse } from 'next';
import type { Mock } from 'vitest';

export type MockNextApiResponse = NextApiResponse & {
  status: Mock;
  json: Mock;
  end: Mock;
  setHeader: Mock;
};

export function createMockReq(init: Partial<NextApiRequest>): NextApiRequest {
  return init as unknown as NextApiRequest;
}

export function createMockRes(): MockNextApiResponse {
  const res = {} as unknown as MockNextApiResponse;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.end = vi.fn().mockReturnValue(res);
  res.setHeader = vi.fn().mockReturnValue(res);
  return res;
}
