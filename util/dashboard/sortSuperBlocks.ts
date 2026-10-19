/**
 * Sorts superblocks by their order property
 * @param {Array} superblock - Array of block objects
 * @returns {Array} Sorted array of block objects
 *
 * Example Usage:
 * sortSuperBlocks(blocks)
 */
export function sortSuperBlocks<T extends { order: number }>(
  superblock: T[]
): T[] {
  return superblock.toSorted((a, b) => a['order'] - b['order']);
}
