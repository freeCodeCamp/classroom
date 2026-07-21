/**
 * Resolve the canonical (certification, block) location for a single challenge
 * map entry.
 *
 * A challenge can be reused across several superblocks and blocks in the
 * freeCodeCamp curriculum (for example, a challenge that exists in both the
 * current `responsive-web-design` superblock and the legacy
 * `responsive-web-design-22` one). The challenge map therefore records *every*
 * association as arrays — `superblocks` and `blocks` — ordered as they are
 * emitted by the GraphQL build (`scripts/build-challenge-map-graphql.mjs`).
 *
 * For dashboard grouping we collapse each challenge down to a single location
 * by taking the first element of each array as canonical. Centralizing that
 * choice here keeps the "first occurrence wins" rule in one place so callers
 * (and tests) cannot drift apart.
 *
 * @param {{ superblocks?: string[], blocks?: string[] }} mapEntry - A single
 *   entry from `data/challengeMap.json`.
 * @returns {{ certification: string | undefined, block: string | undefined }}
 *   The canonical superblock (as `certification`) and block. Either field is
 *   `undefined` when the corresponding array is missing or empty.
 */
export function getCanonicalChallengeMapLocation(mapEntry) {
  return {
    certification: (mapEntry.superblocks || [])[0],
    block: (mapEntry.blocks || [])[0]
  };
}
