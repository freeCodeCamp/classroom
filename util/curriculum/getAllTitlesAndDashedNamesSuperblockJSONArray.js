import { fetchSuperblocksFromGraphQL } from './fetchSuperblocksFromGraphQL';

/**
 * Fetches all available superblocks from FCC GraphQL API
 * @returns {Promise<Array>} Array of superblock objects with dashedName and title
 */
export async function getAllTitlesAndDashedNamesSuperblockJSONArray() {
  const superblocks = await fetchSuperblocksFromGraphQL();

  return superblocks.map(superblock => ({
    dashedName: superblock.dashedName,
    title: superblock.title || superblock.name || superblock.dashedName
  }));
}
