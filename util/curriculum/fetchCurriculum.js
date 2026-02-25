const GRAPHQL_ENDPOINT = 'https://curriculum-db.freecodecamp.org/graphql';

const QUERY = `{
  superblocks {
    dashedName
    name
    blockObjects {
      dashedName
      name
      order
      challengeOrder {
        id
        title
      }
    }
  }
}`;

let cached = null;

async function fetchAll() {
  if (cached) return cached;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: QUERY }),
    signal: controller.signal
  });
  clearTimeout(timeout);
  if (!res.ok) throw new Error(`GraphQL fetch failed: ${res.status}`);
  const json = await res.json();
  if (json.errors || !json.data?.superblocks) {
    throw new Error(
      `GraphQL response error: ${JSON.stringify(
        json.errors || 'missing superblocks data'
      )}`
    );
  }
  cached = json.data.superblocks;
  return cached;
}

/**
 * Returns the list of available superblocks in the same shape the v1 REST API
 * returned (array of {dashedName, title}).
 */
export async function getAvailableSuperblocks() {
  const superblocks = await fetchAll();
  return superblocks.map(sb => ({ dashedName: sb.dashedName, title: sb.name }));
}

/**
 * Given an array of superblock indices, returns curriculum data in the same
 * shape that the legacy getDashedNamesURLs + getSuperBlockJsons chain produced.
 *
 * Each element: { [dashedName]: { blocks: { [blockDashed]: { challenges: { name, challengeOrder, order } } } } }
 */
export async function getSuperblocksByIndices(indices) {
  const superblocks = await fetchAll();
  return indices.map(i => {
    const sb = superblocks[i];
    if (!sb) return {};
    const blocks = {};
    sb.blockObjects.forEach(block => {
      blocks[block.dashedName] = {
        challenges: {
          name: block.name,
          challengeOrder: block.challengeOrder.map(c => ({
            id: c.id,
            title: c.title
          })),
          order: block.order
        }
      };
    });
    return { [sb.dashedName]: { blocks } };
  });
}
