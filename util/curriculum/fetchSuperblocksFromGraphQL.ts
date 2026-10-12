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

async function postGraphQLQuery(query: string): Promise<SuperblockWithTitle[]> {
  const response = await fetch(CURRICULUM_GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      query
    })
  });

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
  } catch {
    throw new Error('Invalid JSON returned from curriculum GraphQL endpoint');
  }

  if (result.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
  }

  const superblocks = result?.data?.superblocks || [];

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

  const response = await fetch(CURRICULUM_GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({ query: SUPERBLOCKS_WITH_BLOCKS_QUERY })
  });

  if (!response.ok) {
    throw new Error(
      `GraphQL request failed: ${response.status} ${response.statusText}`
    );
  }

  let result: SuperblocksGraphQLResponse;
  try {
    result = (await response.json()) as SuperblocksGraphQLResponse;
  } catch {
    throw new Error('Invalid JSON returned from curriculum GraphQL endpoint');
  }

  if (result.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
  }

  allSuperblocksWithBlocksCache = result?.data?.superblocks || [];
  return allSuperblocksWithBlocksCache;
}

export function clearSuperblocksCache(): void {
  superblocksCache = null;
  superblocksWithBlocksCache = null;
  allSuperblocksWithBlocksCache = null;
}
