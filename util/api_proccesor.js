export const FCC_BASE_URL = 'https://www.freecodecamp.org/curriculum-data/v1/'
export const AVAILABLE_SUPER_BLOCKS = FCC_BASE_URL + 'available-superblocks.json'

/* This function returns a 2D array for each block within blocks
block[0] is the name of the course
block[1] is a dictionary {desc, challenges}
Example Usage: sortSuperBlocks("2022/responsive-web-design.json", "https://www.freecodecamp.org/curriculum-data/v1/2022/responsive-web-design.json")
*/
export async function sortSuperBlocks(superblock, url) {
  let superblocksres = await fetch(url);
  let curriculumData = await superblocksres.json();

  const blocks = Object.entries(curriculumData[superblock]['blocks']);

  return blocks.sort(
    (a, b) => a[1]['challenges']['order'] - b[1]['challenges']['order']
  );
}

export async function getDashedNamesURLs(fccCertifications) {
  const superblocksres = await fetch(AVAILABLE_SUPER_BLOCKS);

  const curriculumData = await superblocksres.json();

  return fccCertifications.map(
    x => FCC_BASE_URL + curriculumData['superblocks'][x]['dashedName'] + '.json'
  )
}

export async function getSuperBlockJsons(superblockURLS) {
  let responses = await Promise.all(superblockURLS.map(i => fetch(i)))
  return responses.map(x => x.json())
}
