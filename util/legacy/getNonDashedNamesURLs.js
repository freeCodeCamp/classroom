import { getAllTitlesAndDashedNamesSuperblockJSONArray } from '../curriculum/getAllTitlesAndDashedNamesSuperblockJSONArray';

/**
 * Resolves an array of stored Prisma fccCertifications values to their human-readable titles.
 *
 * Prisma now stores certifications as dashed name strings (e.g. 'responsive-web-design-v9').
 * This function maps each dashed name to its readable title (e.g. 'Responsive Web Design').
 * It also handles legacy numeric indices stored by older versions of the app.
 *
 * Used by the v1 dashboard (pages/dashboard/[id].js) to display section headings.
 * For context on how certifications are selected and stored, see:
 *   - components/modal.js (classroom creation)
 *   - components/ClassInviteTable.js (classroom editing)
 *   - util/curriculum/constants.js (CERT_REQUIREMENTS expansion at save time)
 *
 * @param {Array<string|number>} fccCertificationsIndex - Array of dashed name strings, or legacy numeric indices
 * @returns {Promise<string[]>} Array of human-readable superblock titles
 */
export async function getNonDashedNamesURLs(fccCertificationsIndex) {
  if (
    !Array.isArray(fccCertificationsIndex) ||
    fccCertificationsIndex.length === 0
  ) {
    return [];
  }

  const superblocks = await getAllTitlesAndDashedNamesSuperblockJSONArray();

  return fccCertificationsIndex.map(certification => {
    if (typeof certification === 'number') {
      return superblocks[certification]?.title || String(certification);
    }

    const maybeIndex = Number(certification);
    if (!Number.isNaN(maybeIndex) && String(maybeIndex) === certification) {
      return superblocks[maybeIndex]?.title || certification;
    }

    const match = superblocks.find(
      superblock => superblock.dashedName === certification
    );
    return match?.title || certification;
  });
}
