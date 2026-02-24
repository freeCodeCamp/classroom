/**
 * [Parameters] an array of URLs as a parameter, where the URLs are the json endpoint URLs that contain information about the superblock/certificate.
 *
 * [Returns] an array of objects containing superblock/certificate information.
 * The objects have 1 key: the superblock/certificate URL (dashed/or undashed URL name) and the value of the objects
 * is the corresponding information associated with the superblock/certificate. The values contain two arrays 'intro' and 'blocks'.
 *
 * Example usage:
 * getSuperBlockJsons([
 * 'https://www.freecodecamp.org/curriculum-data/v1/2022/responsive-web-design.json',
 * 'https://www.freecodecamp.org/curriculum-data/v1/javascript-algorithms-and-data-structures.json'
 * ])
 *
 *
 * Example output:
 * [
 * {
 * '2022/responsive-web-design': { intro: [Array], blocks: [Object] }
 * },
 * {
 * 'javascript-algorithms-and-data-structures': { intro: [Array], blocks: [Object] }
 * }
 * ]
 *
 * NOTE: This function is deprecated for v9 curriculum which doesn't have individual REST API JSON files.
 * */
export async function getSuperBlockJsons(superblockURLS) {
  let responses = await Promise.all(
    superblockURLS.map(async currUrl => {
      let currResponse = await fetch(currUrl);
      let superblockJSON = currResponse.json();
      return superblockJSON;
    })
  );
  return responses;
}
