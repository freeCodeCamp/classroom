import {
  CURRICULUM_GRAPHQL_ENDPOINT,
  LEGACY_SUPERBLOCK_DASHED_NAMES,
  INTERVIEW_PREP_SUPERBLOCK_DASHED_NAMES
} from './constants';
import type {
  Superblock,
  SuperblocksGraphQLResponse,
  SuperblockWithTitle
} from '../../types/curriculum';

const SUPERBLOCKS_QUERY = `
  query GetSuperblocksForClassroom {
    superblocks {
      dashedName
      name
      isCertification
    }
  }
`;

const SUPERBLOCKS_WITH_BLOCKS_QUERY = `
  query GetSuperblocksWithBlocksForClassroom {
    superblocks {
      dashedName
      name
      isCertification
      blockObjects {
        dashedName
        name
        challengeOrder {
          id
        }
      }
    }
  }
`;

export const CURRICULUM_REQUEST_TIMEOUT_MS = 5_000;

let superblocksCache: SuperblockWithTitle[] | null = null;
let superblocksWithBlocksCache: SuperblockWithTitle[] | null = null;
let allSuperblocksWithBlocksCache: Superblock[] | null = null;

function removeLegacySuperblocks(
  superblocks: Superblock[]
): SuperblockWithTitle[] {
  return superblocks
    .filter(superblock => {
      if (LEGACY_SUPERBLOCK_DASHED_NAMES.has(superblock.dashedName)) {
        return false;
      }

      const isCertification = Boolean(superblock.isCertification);
      const isInterviewPrepException =
        INTERVIEW_PREP_SUPERBLOCK_DASHED_NAMES.has(superblock.dashedName);

      return isCertification || isInterviewPrepException;
    })
    .map(superblock => ({
      ...superblock,
      title: superblock.title || superblock.name || superblock.dashedName
    }));
}

function isTimeoutError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === 'TimeoutError' || error.name === 'AbortError')
  );
}

function createTimeoutError(cause: unknown): Error {
  return new Error(
    `Curriculum GraphQL request timed out after ${CURRICULUM_REQUEST_TIMEOUT_MS}ms`,
    { cause }
  );
}

async function executeCurriculumGraphQLQuery(
  query: string
): Promise<Superblock[]> {
  let response: Response;
  try {
    response = await fetch(CURRICULUM_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        query
      }),
      signal: AbortSignal.timeout(CURRICULUM_REQUEST_TIMEOUT_MS)
    });
  } catch (error) {
    if (isTimeoutError(error)) {
      throw createTimeoutError(error);
    }
    throw error;
  }

  if (!response.ok) {
    throw new Error(
      `GraphQL request failed: ${response.status} ${response.statusText}`
    );
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(`Unexpected GraphQL content type: ${contentType}`);
  }

  let result: SuperblocksGraphQLResponse;
  try {
    result = (await response.json()) as SuperblocksGraphQLResponse;
  } catch (error) {
    if (isTimeoutError(error)) {
      throw createTimeoutError(error);
    }
    throw new Error('Invalid JSON returned from curriculum GraphQL endpoint', {
      cause: error
    });
  }

  if (result.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
  }

  return result?.data?.superblocks || [];
}

async function postGraphQLQuery(query: string): Promise<SuperblockWithTitle[]> {
  const superblocks = await executeCurriculumGraphQLQuery(query);
  return removeLegacySuperblocks(superblocks);
}

export async function fetchSuperblocksFromGraphQL(): Promise<
  SuperblockWithTitle[]
> {
  if (superblocksCache) {
    return superblocksCache;
  }

  superblocksCache = await postGraphQLQuery(SUPERBLOCKS_QUERY);
  return superblocksCache;
}

export async function fetchSuperblocksWithBlocksFromGraphQL(): Promise<
  SuperblockWithTitle[]
> {
  if (superblocksWithBlocksCache) {
    return superblocksWithBlocksCache;
  }

  superblocksWithBlocksCache = await postGraphQLQuery(
    SUPERBLOCKS_WITH_BLOCKS_QUERY
  );
  return superblocksWithBlocksCache;
}

/**
 * Fetches all superblocks with blocks from GraphQL without filtering legacy superblocks.
 * Used by the dashboard to fetch blocks for legacy superblocks that are merged
 * into v9 superblocks (e.g. back-end-development-and-apis into back-end-development-and-apis-v9).
 */
export async function fetchAllSuperblocksWithBlocksFromGraphQL(): Promise<
  Superblock[]
> {
  if (allSuperblocksWithBlocksCache) {
    return allSuperblocksWithBlocksCache;
  }

  allSuperblocksWithBlocksCache = await executeCurriculumGraphQLQuery(
    SUPERBLOCKS_WITH_BLOCKS_QUERY
  );
  return allSuperblocksWithBlocksCache;
}

export function clearSuperblocksCache(): void {
  superblocksCache = null;
  superblocksWithBlocksCache = null;
  allSuperblocksWithBlocksCache = null;
}
