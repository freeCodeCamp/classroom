import { processDashboardData } from './processDashBoardData';

// Test suite for processDashboardData function
describe('processDashboardData', () => {
  // Test case: returns correct data structure
  it('returns correct data structure', () => {
    // Sample data for testing
    const certifications = [
      [
        {
          name: 'Managing Packages with npm',
          selector: 'managing-packages-with-npm',
          dashedName: 'managing-packages-with-npm',
          allChallenges: [
            '587d7fb3367417b2b2512bfb',
            '587d7fb3367417b2b2512bfc',
            '587d7fb4367417b2b2512bfd',
            '587d7fb4367417b2b2512bfe',
            '587d7fb4367417b2b2512bff',
            '587d7fb4367417b2b2512c00',
            '587d7fb5367417b2b2512c01',
            '587d7fb5367417b2b2512c02',
            '587d7fb5367417b2b2512c03',
            '587d7fb5367417b2b2512c04'
          ],
          order: 0
        }
      ]
    ];
    const studentData = [
      {
        'erik@example.com': {
          blocks: {
            'learn-basic-css-by-building-a-cafe-menu': {
              completedChallenges: [
                {
                  id: '5f33071498eb2472b87ddee4',
                  completedDate: 1684085905537,
                  files: []
                },
                {
                  id: '5f3313e74582ad9d063e3a38',
                  completedDate: 1684085905537,
                  files: []
                }
              ]
            },
            'learn-css-colors-by-building-a-set-of-colored-markers': {
              completedChallenges: [
                {
                  id: '61695197ac34f0407e339882',
                  completedDate: 1677201077000,
                  files: []
                },
                {
                  id: '61695ab9f6ffe951c16d03dd',
                  completedDate: 1677201077000,
                  files: []
                }
              ]
            },
            'build-a-personal-portfolio-webpage-project': {
              completedChallenges: [
                {
                  id: 'bd7158d8c242eddfaeb5bd13',
                  completedDate: 1475094716730,
                  files: []
                }
              ]
            }
          }
        }
      }
    ];

    // Mocked props for processDashboardData function
    const mockProps = {
      certifications,
      studentData,
      classroomId: 'cljqforg600017kd0l8i20899'
    };

    // Call the processDashboardData function with mockProps
    const result = processDashboardData(mockProps);

    // Check that result is an object with 'data' and 'columns' properties
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('columns');

    // Check the structure and content of 'data'
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data.length).toBe(mockProps.studentData.length);

    // Check the structure and content of 'columns'
    expect(Array.isArray(result.columns)).toBe(true);
    expect(result.columns.length).toBeGreaterThan(1);
  });
});
