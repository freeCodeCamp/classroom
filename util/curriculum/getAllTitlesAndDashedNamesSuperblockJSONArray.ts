import { fetchSuperblocksFromGraphQL } from './fetchSuperblocksFromGraphQL';
import type { SuperblockDashedNameAndTitle } from '../../types/curriculum';

/**
 * Fetches all available superblocks from FCC GraphQL API
 * @returns {Promise<Array>} Array of superblock objects with dashedName and title
 */
export async function getAllTitlesAndDashedNamesSuperblockJSONArray(): Promise<
  SuperblockDashedNameAndTitle[]
> {
  const superblocks = await fetchSuperblocksFromGraphQL();

  return superblocks.map(superblock => ({
    dashedName: superblock.dashedName,
    title: superblock.title || superblock.name || superblock.dashedName
  }));
}
