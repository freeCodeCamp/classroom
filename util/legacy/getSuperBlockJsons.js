import { fetchAllSuperblocksWithBlocksFromGraphQL } from '../curriculum/fetchSuperblocksFromGraphQL';

/**
 * Fetches block/challenge data for the given superblock dashed names from GraphQL
 * and returns it in the structure expected by createSuperblockDashboardObject.
 *
 * Uses the unfiltered GraphQL fetch so legacy dashedNames stored in Prisma
 * (e.g. 'back-end-development-and-apis' — the v8 prerequisite of v9) are resolved
 * correctly alongside current v9 superblocks.
 *
 * @param {string[]} superblockURLS - Array of superblock dashed names
 *   (the parameter is named 'superblockURLS' for backward compatibility;
 *    it now accepts dashed names directly, not URL strings)
 * @returns {Promise<Array>} Array of objects, one per superblock, each keyed by
 *   its dashedName with a 'blocks' object inside.
 *
 * Example usage:
 * getSuperBlockJsons(['back-end-development-and-apis', 'back-end-development-and-apis-v9'])
 *
 * Example output:
 * [
 *   {
 *     'back-end-development-and-apis': {
 *       blocks: {
 *         'managing-packages-with-npm': {
 *           challenges: { name: 'Managing Packages with NPM', order: 0, challengeOrder: ['id1', ...] }
 *         },
 *         ...
 *       }
 *     }
 *   },
 *   {
 *     'back-end-development-and-apis-v9': { blocks: { ... } }
 *   }
 * ]
 */
export async function getSuperBlockJsons(superblockURLS) {
  if (!Array.isArray(superblockURLS) || superblockURLS.length === 0) {
    return [];
  }

  // Use the unfiltered fetch so legacy dashedNames stored in Prisma
  // (e.g. back-end-development-and-apis) can be resolved.
  const allSuperblocks = await fetchAllSuperblocksWithBlocksFromGraphQL();
  const selectedDashedNames = new Set(superblockURLS);

  return allSuperblocks
    .filter(superblock => selectedDashedNames.has(superblock.dashedName))
    .map(superblock => {
      const blocks = (superblock.blockObjects || []).reduce(
        (accumulator, block, index) => {
          accumulator[block.dashedName] = {
            challenges: {
              name: block.name,
              order: typeof block.order === 'number' ? block.order : index,
              challengeOrder: (block.challengeOrder || [])
                .map(challenge => challenge.id)
                .filter(Boolean)
            }
          };
          return accumulator;
        },
        {}
      );

      return { [superblock.dashedName]: { blocks } };
    });
}
