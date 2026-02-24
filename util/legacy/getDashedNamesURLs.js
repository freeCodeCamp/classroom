export const FCC_BASE_URL = 'https://www.freecodecamp.org/curriculum-data/v1/';
export const AVAILABLE_SUPER_BLOCKS =
  FCC_BASE_URL + 'available-superblocks.json';

/**
 * [Parameters] an array of indices as a parameter.
 * Those indices correspond to an index in an array of objects containing superblock data at a JSON endpoint (https://www.freecodecamp.org/curriculum-data/v1/available-superblocks.json)
 * The array of indices is stored in Prisma as fccCertificates (see const certificationNumbers in [id].js).
 *
 * [Returns] an array of URL endpoints where JSON for superblocks is accessed.
 *
 * Example usage:
 * getDashedNamesURLs([0, 2, 3])
 *
 *
 * Example output:
 * [
 * 'https://www.freecodecamp.org/curriculum-data/v1/2022/responsive-web-design.json',
 * 'https://www.freecodecamp.org/curriculum-data/v1/responsive-web-design.json',
 * 'https://www.freecodecamp.org/curriculum-data/v1/back-end-development-and-apis.json'
 * ]
 *
 * NOTE: This function is deprecated for v9 curriculum which doesn't have individual REST API JSON files.
 * */
export async function getDashedNamesURLs(fccCertifications) {
  const superblocksres = await fetch(AVAILABLE_SUPER_BLOCKS);

  const curriculumData = await superblocksres.json();

  return fccCertifications.map(
    x => FCC_BASE_URL + curriculumData['superblocks'][x]['dashedName'] + '.json'
  );
}
