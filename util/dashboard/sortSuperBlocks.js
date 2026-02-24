/**
 * Sorts superblocks by their order property
 * @param {Array} superblock - Array of block objects
 * @returns {Array} Sorted array of block objects
 *
 * Example Usage:
 * sortSuperBlocks(blocks)
 */
export function sortSuperBlocks(superblock) {
  let sortedBlock = superblock.sort((a, b) => a['order'] - b['order']);
  return sortedBlock;
}
