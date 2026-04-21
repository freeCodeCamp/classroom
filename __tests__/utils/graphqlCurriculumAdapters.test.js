global.fetch = jest.fn();

const {
  clearSuperblocksCache
} = require('../../util/curriculum/fetchSuperblocksFromGraphQL');
const {
  getAllTitlesAndDashedNamesSuperblockJSONArray
} = require('../../util/curriculum/getAllTitlesAndDashedNamesSuperblockJSONArray');
const { getDashedNamesURLs } = require('../../util/legacy/getDashedNamesURLs');
const {
  getNonDashedNamesURLs
} = require('../../util/legacy/getNonDashedNamesURLs');
const { getSuperBlockJsons } = require('../../util/legacy/getSuperBlockJsons');

describe('GraphQL curriculum adapters', () => {
  const mockGraphQLResponse = {
    data: {
      superblocks: [
        {
          dashedName: 'responsive-web-design-v9',
          isCertification: true,
          title: 'Responsive Web Design',
          name: 'Responsive Web Design',
          blockObjects: [
            {
              dashedName: 'learn-html',
              name: 'Learn HTML',
              order: 0,
              challengeOrder: [{ id: 'a1', title: 'Challenge A1' }]
            }
          ]
        },
        {
          dashedName: 'javascript-v9',
          isCertification: true,
          title: null,
          name: 'JavaScript Algorithms and Data Structures',
          blockObjects: [
            {
              dashedName: 'learn-js',
              name: 'Learn JS',
              order: 1,
              challengeOrder: [{ id: 'b1', title: 'Challenge B1' }]
            }
          ]
        },
        {
          dashedName: 'the-odin-project',
          isCertification: false,
          title: 'The Odin Project',
          name: 'The Odin Project',
          blockObjects: []
        },
        {
          dashedName: 'dev-playground',
          isCertification: false,
          title: 'Dev Playground',
          name: 'Dev Playground',
          blockObjects: []
        }
      ]
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    clearSuperblocksCache();
    global.fetch.mockResolvedValue({
      ok: true,
      headers: {
        get: () => 'application/json'
      },
      json: async () => mockGraphQLResponse
    });
  });

  it('maps superblocks from GraphQL into dashedName/title pairs', async () => {
    const result = await getAllTitlesAndDashedNamesSuperblockJSONArray();

    expect(result).toEqual([
      {
        dashedName: 'responsive-web-design-v9',
        title: 'Responsive Web Design'
      },
      {
        dashedName: 'javascript-v9',
        title: 'JavaScript Algorithms and Data Structures'
      },
      {
        dashedName: 'the-odin-project',
        title: 'The Odin Project'
      }
    ]);
  });

  it('returns dashed names from mixed certification inputs', async () => {
    const result = await getDashedNamesURLs([
      'responsive-web-design-v9',
      1,
      '0'
    ]);

    expect(result).toEqual([
      'responsive-web-design-v9',
      'javascript-v9',
      'responsive-web-design-v9'
    ]);
  });

  it('returns readable names from mixed certification inputs', async () => {
    const result = await getNonDashedNamesURLs(['responsive-web-design-v9', 1]);

    expect(result).toEqual([
      'Responsive Web Design',
      'JavaScript Algorithms and Data Structures'
    ]);
  });

  it('builds legacy-compatible block payload from GraphQL', async () => {
    const result = await getSuperBlockJsons(['responsive-web-design-v9']);

    expect(result).toEqual([
      {
        'responsive-web-design-v9': {
          blocks: {
            'learn-html': {
              challenges: {
                name: 'Learn HTML',
                order: 0,
                challengeOrder: ['a1']
              }
            }
          }
        }
      }
    ]);
  });
});
