// This function returns a 2D array for each block within blocks
// block[0] is the name of the course
// block[1] is a dictionary {desc, challenges}

//Example Usage: sortSuperBlocks("2022/responsive-web-design.json", "https://www.freecodecamp.org/curriculum-data/v1/2022/responsive-web-design.json")

export default async function sortSuperBlocks(superblock, url) {
  let superblocksres = await fetch(url);
  let curriculumData = await superblocksres.json();

  const blocks = Object.entries(curriculumData[superblock]['blocks']);

  return blocks.sort(
    (a, b) => a[1]['challenges']['order'] - b[1]['challenges']['order']
  );
}
