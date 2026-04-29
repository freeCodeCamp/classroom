import { getAllTitlesAndDashedNamesSuperblockJSONArray } from '../curriculum/getAllTitlesAndDashedNamesSuperblockJSONArray';

/**
 * Resolves an array of stored Prisma fccCertifications values to superblock dashed names.
 *
 * Prisma stores certifications as an array of dashed name strings (e.g. 'responsive-web-design-v9').
 * This function passes those through directly. It also handles legacy numeric indices
 * (stored by older versions of the app) by looking them up in the filtered superblock list,
 * so old classroom records continue to work.
 *
 * @param {Array<string|number>} fccCertifications - Array of dashed name strings, or legacy numeric indices
 * @returns {Promise<string[]>} Array of superblock dashed names
 *
 * Example usage:
 * getDashedNamesURLs(['responsive-web-design-v9', 'javascript-v9'])
 *
 * Example output:
 * ['responsive-web-design-v9', 'javascript-v9']
 */
export async function getDashedNamesURLs(fccCertifications) {
  if (!Array.isArray(fccCertifications) || fccCertifications.length === 0) {
    return [];
  }

  const superblocks = await getAllTitlesAndDashedNamesSuperblockJSONArray();

  return fccCertifications
    .map(certification => {
      if (typeof certification === 'number') {
        return superblocks[certification]?.dashedName;
      }

      const maybeIndex = Number(certification);
      if (!Number.isNaN(maybeIndex) && String(maybeIndex) === certification) {
        return superblocks[maybeIndex]?.dashedName;
      }

      return certification;
    })
    .filter(Boolean);
}
