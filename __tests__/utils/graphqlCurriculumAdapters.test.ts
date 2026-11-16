const fetchMock = vi.fn();
global.fetch = fetchMock;

import {
  clearSuperblocksCache,
  fetchSuperblocksFromGraphQL,
  fetchSuperblocksWithBlocksFromGraphQL,
  fetchAllSuperblocksWithBlocksFromGraphQL,
  CURRICULUM_REQUEST_TIMEOUT_MS
} from '../../util/curriculum/fetchSuperblocksFromGraphQL';
import { getAllTitlesAndDashedNamesSuperblockJSONArray } from '../../util/curriculum/getAllTitlesAndDashedNamesSuperblockJSONArray';
import { getDashedNamesURLs } from '../../util/legacy/getDashedNamesURLs';
import { getNonDashedNamesURLs } from '../../util/legacy/getNonDashedNamesURLs';
import { getSuperBlockJsons } from '../../util/legacy/getSuperBlockJsons';

describe('GraphQL curriculum adapters', () => {
  const mockGraphQLResponse = {
    data: {
      superblocks: [
        {
          dashedName: 'responsive-web-design-v9',
          isCertification: true,
          title: 'Responsive Web Design',
          name: 'Responsive Web Design',
          blockObjects: [
            {
              dashedName: 'learn-html',
              name: 'Learn HTML',
              order: 0,
              challengeOrder: [{ id: 'a1', title: 'Challenge A1' }]
            }
          ]
        },
        {
          dashedName: 'javascript-v9',
          isCertification: true,
          title: null,
          name: 'JavaScript Algorithms and Data Structures',
          blockObjects: [
            {
              dashedName: 'learn-js',
              name: 'Learn JS',
              order: 1,
              challengeOrder: [{ id: 'b1', title: 'Challenge B1' }]
            }
          ]
        },
        {
          dashedName: 'the-odin-project',
          isCertification: false,
          title: 'The Odin Project',
          name: 'The Odin Project',
          blockObjects: []
        },
        {
          dashedName: 'dev-playground',
          isCertification: false,
          title: 'Dev Playground',
          name: 'Dev Playground',
          blockObjects: []
        }
      ]
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    clearSuperblocksCache();
    fetchMock.mockResolvedValue({
      ok: true,
      headers: {
        get: () => 'application/json'
      },
      json: async () => mockGraphQLResponse
    });
  });

  it('maps superblocks from GraphQL into dashedName/title pairs', async () => {
    const result = await getAllTitlesAndDashedNamesSuperblockJSONArray();

    expect(result).toEqual([
      {
        dashedName: 'responsive-web-design-v9',
        title: 'Responsive Web Design'
      },
      {
        dashedName: 'javascript-v9',
        title: 'JavaScript Algorithms and Data Structures'
      },
      {
        dashedName: 'the-odin-project',
        title: 'The Odin Project'
      }
    ]);
  });

  it('returns dashed names from mixed certification inputs', async () => {
    const result = await getDashedNamesURLs([
      'responsive-web-design-v9',
      1,
      '0'
    ]);

    expect(result).toEqual([
      'responsive-web-design-v9',
      'javascript-v9',
      'responsive-web-design-v9'
    ]);
  });

  it('returns readable names from mixed certification inputs', async () => {
    const result = await getNonDashedNamesURLs(['responsive-web-design-v9', 1]);

    expect(result).toEqual([
      'Responsive Web Design',
      'JavaScript Algorithms and Data Structures'
    ]);
  });

  it('builds legacy-compatible block payload from GraphQL', async () => {
    const result = await getSuperBlockJsons(['responsive-web-design-v9']);

    expect(result).toEqual([
      {
        'responsive-web-design-v9': {
          blocks: {
            'learn-html': {
              challenges: {
                name: 'Learn HTML',
                order: 0,
                challengeOrder: ['a1']
              }
            }
          }
        }
      }
    ]);
  });

  describe('GraphQL request timeout and error handling', () => {
    it('passes an AbortSignal timeout to fetch in fetchSuperblocksFromGraphQL', async () => {
      await fetchSuperblocksFromGraphQL();

      expect(fetchMock).toHaveBeenCalledWith(
        'https://curriculum-db.freecodecamp.org/graphql',
        expect.objectContaining({
          method: 'POST',
          signal: expect.any(AbortSignal)
        })
      );
    });

    it('passes an AbortSignal timeout to fetch in fetchAllSuperblocksWithBlocksFromGraphQL', async () => {
      await fetchAllSuperblocksWithBlocksFromGraphQL();

      expect(fetchMock).toHaveBeenCalledWith(
        'https://curriculum-db.freecodecamp.org/graphql',
        expect.objectContaining({
          method: 'POST',
          signal: expect.any(AbortSignal)
        })
      );
    });

    it('passes an AbortSignal timeout to fetch in fetchSuperblocksWithBlocksFromGraphQL', async () => {
      const result = await fetchSuperblocksWithBlocksFromGraphQL();

      expect(fetchMock).toHaveBeenCalledWith(
        'https://curriculum-db.freecodecamp.org/graphql',
        expect.objectContaining({
          method: 'POST',
          signal: expect.any(AbortSignal)
        })
      );
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            dashedName: 'responsive-web-design-v9',
            title: 'Responsive Web Design'
          })
        ])
      );
    });

    it('handles TimeoutError correctly for fetchSuperblocksFromGraphQL', async () => {
      const timeoutError = new DOMException(
        'The operation was aborted due to timeout',
        'TimeoutError'
      );
      fetchMock.mockRejectedValueOnce(timeoutError);

      await expect(fetchSuperblocksFromGraphQL()).rejects.toThrow(
        `Curriculum GraphQL request timed out after ${CURRICULUM_REQUEST_TIMEOUT_MS}ms`
      );
    });

    it('handles TimeoutError correctly for fetchAllSuperblocksWithBlocksFromGraphQL', async () => {
      const timeoutError = new DOMException(
        'The operation was aborted due to timeout',
        'TimeoutError'
      );
      fetchMock.mockRejectedValueOnce(timeoutError);

      await expect(fetchAllSuperblocksWithBlocksFromGraphQL()).rejects.toThrow(
        `Curriculum GraphQL request timed out after ${CURRICULUM_REQUEST_TIMEOUT_MS}ms`
      );
    });

    it('handles TimeoutError occurring during response.json()', async () => {
      const timeoutError = new DOMException(
        'The operation was aborted due to timeout',
        'TimeoutError'
      );
      fetchMock.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: () => 'application/json'
        },
        json: async () => {
          throw timeoutError;
        }
      });

      await expect(fetchSuperblocksFromGraphQL()).rejects.toThrow(
        `Curriculum GraphQL request timed out after ${CURRICULUM_REQUEST_TIMEOUT_MS}ms`
      );
    });

    it('handles AbortError occurring during response.json()', async () => {
      const abortError = new DOMException(
        'This operation was aborted',
        'AbortError'
      );
      fetchMock.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: () => 'application/json'
        },
        json: async () => {
          throw abortError;
        }
      });

      await expect(fetchSuperblocksFromGraphQL()).rejects.toThrow(
        `Curriculum GraphQL request timed out after ${CURRICULUM_REQUEST_TIMEOUT_MS}ms`
      );
    });

    it('handles AbortError correctly as a timeout', async () => {
      const abortError = new DOMException(
        'This operation was aborted',
        'AbortError'
      );
      fetchMock.mockRejectedValueOnce(abortError);

      await expect(fetchSuperblocksFromGraphQL()).rejects.toThrow(
        `Curriculum GraphQL request timed out after ${CURRICULUM_REQUEST_TIMEOUT_MS}ms`
      );
    });

    it('distinguishes unrelated network errors from timeouts', async () => {
      const networkError = new TypeError('fetch failed');
      fetchMock.mockRejectedValueOnce(networkError);

      await expect(fetchSuperblocksFromGraphQL()).rejects.toThrow(
        'fetch failed'
      );
    });

    it('throws on non-ok HTTP responses', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable'
      });

      await expect(fetchSuperblocksFromGraphQL()).rejects.toThrow(
        'GraphQL request failed: 503 Service Unavailable'
      );
    });

    it('throws on unexpected content type', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: () => 'text/html'
        }
      });

      await expect(fetchSuperblocksFromGraphQL()).rejects.toThrow(
        'Unexpected GraphQL content type: text/html'
      );
    });

    it('throws on unexpected content type for fetchAllSuperblocksWithBlocksFromGraphQL', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: () => 'text/plain'
        }
      });

      await expect(fetchAllSuperblocksWithBlocksFromGraphQL()).rejects.toThrow(
        'Unexpected GraphQL content type: text/plain'
      );
    });

    it('throws on invalid JSON in GraphQL response', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: () => 'application/json'
        },
        json: async () => {
          throw new Error('Unexpected token');
        }
      });

      await expect(fetchSuperblocksFromGraphQL()).rejects.toThrow(
        'Invalid JSON returned from curriculum GraphQL endpoint'
      );
    });

    it('throws on GraphQL errors array in payload', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: () => 'application/json'
        },
        json: async () => ({
          errors: [{ message: 'Cannot query field' }]
        })
      });

      await expect(fetchSuperblocksFromGraphQL()).rejects.toThrow(
        'GraphQL errors: [{"message":"Cannot query field"}]'
      );
    });
  });
});
