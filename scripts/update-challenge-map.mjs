import { writeFile } from 'fs/promises';
// The update-challenge-map.mjs script works only with challenge-map url set in this file,
// due to CORS requirements that classroom be in the same domain as proper.
// Otherwise, none of these requests will go through.
const CHALLENGE_MAP_URL = 'http://localhost:3000/api/build-challenge-map';
const OUTPUT_PATH = new URL('../data/challengeMap.json', import.meta.url);

async function updateChallengeMap() {
  try {
    console.log('Fetching challenge map from:', CHALLENGE_MAP_URL);
    const res = await fetch(CHALLENGE_MAP_URL);
    if (!res.ok) {
      throw new Error(`Failed to fetch challenge map: ${res.status} ${res.statusText}`);
    }
    const map = await res.json();
    await writeFile(OUTPUT_PATH, JSON.stringify(map, null, 2));
    console.log('Challenge map saved to', OUTPUT_PATH.pathname);
  } catch (err) {
    console.error('Error updating challenge map:', err);
    process.exit(1);
  }
}

updateChallengeMap();
