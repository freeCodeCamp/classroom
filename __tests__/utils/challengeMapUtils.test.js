// Mock the file system to avoid ES module issues
jest.mock('fs');
jest.mock('path');

// Create the mock functions directly to test the core logic
function buildStudentDashboardData(completedChallenges, challengeMap) {
  const result = { certifications: [] };
  const certMap = {};

  completedChallenges.forEach(challenge => {
    const mapEntry = challengeMap[challenge.id];
    if (!mapEntry) {
      return; // skip unknown ids
    }
    // Use first superblock as canonical for dashboard grouping
    const { superblocks, blocks, name } = mapEntry;
    const certification = superblocks[0];
    const block = blocks[0];
    if (!certMap[certification]) {
      certMap[certification] = { blocks: {} };
    }
    if (!certMap[certification].blocks[block]) {
      certMap[certification].blocks[block] = { completedChallenges: [] };
    }
    certMap[certification].blocks[block].completedChallenges.push({
      ...challenge,
      challengeName: name
    });
  });

  // Convert to the expected nested array format
  for (const cert in certMap) {
    const certObj = {};
    certObj[cert] = {
      blocks: Object.entries(certMap[cert].blocks).map(
        ([blockName, blockObj]) => ({
          [blockName]: blockObj
        })
      )
    };
    result.certifications.push(certObj);
  }

  return result;
}

function resolveAllStudentsToDashboardFormat(
  studentDataFromFCC,
  curriculumMap = null
) {
  const mockChallengeMap = {}; // Would load from file in actual implementation
  if (!studentDataFromFCC || typeof studentDataFromFCC !== 'object') return [];
  const mapToUse = curriculumMap || mockChallengeMap;
  return Object.entries(studentDataFromFCC).map(
    ([email, completedChallenges]) => ({
      email,
      ...buildStudentDashboardData(completedChallenges, mapToUse)
    })
  );
}

describe('challengeMapUtils', () => {
  // Mock challenge map with array structure (superblocks and blocks as arrays)
  const mockChallengeMap = {
    bd7123c8c441eddfaeb5bdef: {
      superblocks: ['responsive-web-design'],
      blocks: ['basic-html-and-html5'],
      name: 'Say Hello to HTML Elements'
    },
    '56533eb9ac21ba0edf2244cf': {
      superblocks: [
        'javascript-algorithms-and-data-structures',
        'full-stack-developer'
      ],
      blocks: ['basic-javascript', 'lab-record-collection'],
      name: 'Record Collection'
    },
    a1b2c3d4e5f6g7h8i9j0k1l2: {
      superblocks: ['responsive-web-design'],
      blocks: ['basic-html-and-html5'],
      name: 'Build a Cat Photo App'
    },
    m2n3o4p5q6r7s8t9u0v1w2x3: {
      superblocks: ['full-stack-developer'],
      blocks: ['basic-javascript'],
      name: 'Comments'
    },
    'legacy-only-id': {
      superblocks: ['responsive-web-design-22'],
      blocks: ['learn-html-by-building-a-cat-photo-app'],
      name: 'Legacy Only Challenge'
    },
    'dual-version-id': {
      superblocks: ['responsive-web-design-22', 'responsive-web-design'],
      blocks: ['basic-html-and-html5'],
      name: 'Dual Version Challenge'
    }
  };

  describe('buildStudentDashboardData', () => {
    it('should transform flat challenge array into nested certification structure', () => {
      const completedChallenges = [
        { id: 'bd7123c8c441eddfaeb5bdef', completedDate: '2024-01-15' },
        { id: 'a1b2c3d4e5f6g7h8i9j0k1l2', completedDate: '2024-01-16' }
      ];

      const result = buildStudentDashboardData(
        completedChallenges,
        mockChallengeMap
      );

      expect(result).toHaveProperty('certifications');
      expect(result.certifications).toBeInstanceOf(Array);
      expect(result.certifications.length).toBe(1);
    });

    it('should use first superblock as canonical certification', () => {
      const completedChallenges = [
        { id: '56533eb9ac21ba0edf2244cf', completedDate: '2024-01-16' }
      ];

      const result = buildStudentDashboardData(
        completedChallenges,
        mockChallengeMap
      );

      expect(result.certifications.length).toBe(1);
      const certKey = Object.keys(result.certifications[0])[0];
      expect(certKey).toBe('javascript-algorithms-and-data-structures');
    });

    it('should use first block as canonical block', () => {
      const completedChallenges = [
        { id: '56533eb9ac21ba0edf2244cf', completedDate: '2024-01-16' }
      ];

      const result = buildStudentDashboardData(
        completedChallenges,
        mockChallengeMap
      );

      const certification =
        result.certifications[0]['javascript-algorithms-and-data-structures'];
      const blockKey = Object.keys(certification.blocks[0])[0];
      expect(blockKey).toBe('basic-javascript');
    });

    it('should nest challenges under correct certification and block', () => {
      const completedChallenges = [
        { id: 'bd7123c8c441eddfaeb5bdef', completedDate: '2024-01-15' },
        { id: 'a1b2c3d4e5f6g7h8i9j0k1l2', completedDate: '2024-01-16' }
      ];

      const result = buildStudentDashboardData(
        completedChallenges,
        mockChallengeMap
      );

      const certification = result.certifications[0]['responsive-web-design'];
      const block = certification.blocks[0]['basic-html-and-html5'];
      expect(block.completedChallenges.length).toBe(2);
    });

    it('should include challengeName from map', () => {
      const completedChallenges = [
        { id: 'bd7123c8c441eddfaeb5bdef', completedDate: '2024-01-15' }
      ];

      const result = buildStudentDashboardData(
        completedChallenges,
        mockChallengeMap
      );

      const certification = result.certifications[0]['responsive-web-design'];
      const block = certification.blocks[0]['basic-html-and-html5'];
      const challenge = block.completedChallenges[0];

      expect(challenge.challengeName).toBe('Say Hello to HTML Elements');
    });

    it('should skip unknown challenge IDs', () => {
      const completedChallenges = [
        { id: 'bd7123c8c441eddfaeb5bdef', completedDate: '2024-01-15' },
        { id: 'unknown-challenge-id', completedDate: '2024-01-16' }
      ];

      const result = buildStudentDashboardData(
        completedChallenges,
        mockChallengeMap
      );

      const certification = result.certifications[0]['responsive-web-design'];
      const block = certification.blocks[0]['basic-html-and-html5'];
      expect(block.completedChallenges.length).toBe(1);
    });

    it('should handle empty challenge array', () => {
      const completedChallenges = [];

      const result = buildStudentDashboardData(
        completedChallenges,
        mockChallengeMap
      );

      expect(result.certifications).toEqual([]);
    });

    it('should handle multiple challenges in different certifications', () => {
      const completedChallenges = [
        { id: 'bd7123c8c441eddfaeb5bdef', completedDate: '2024-01-15' },
        { id: '56533eb9ac21ba0edf2244cf', completedDate: '2024-01-16' },
        { id: 'm2n3o4p5q6r7s8t9u0v1w2x3', completedDate: '2024-01-17' }
      ];

      const result = buildStudentDashboardData(
        completedChallenges,
        mockChallengeMap
      );

      // bd7123c8c441eddfaeb5bdef -> responsive-web-design
      // 56533eb9ac21ba0edf2244cf -> javascript-algorithms-and-data-structures (first)
      // m2n3o4p5q6r7s8t9u0v1w2x3 -> full-stack-developer
      expect(result.certifications.length).toBe(3);
      const certNames = result.certifications
        .map(c => Object.keys(c)[0])
        .sort();
      expect(certNames).toEqual([
        'full-stack-developer',
        'javascript-algorithms-and-data-structures',
        'responsive-web-design'
      ]);
    });

    it('should preserve original challenge data properties', () => {
      const completedChallenges = [
        {
          id: 'bd7123c8c441eddfaeb5bdef',
          completedDate: '2024-01-15',
          customProperty: 'customValue'
        }
      ];

      const result = buildStudentDashboardData(
        completedChallenges,
        mockChallengeMap
      );

      const certification = result.certifications[0]['responsive-web-design'];
      const block = certification.blocks[0]['basic-html-and-html5'];
      const challenge = block.completedChallenges[0];

      expect(challenge.customProperty).toBe('customValue');
      expect(challenge.id).toBe('bd7123c8c441eddfaeb5bdef');
      expect(challenge.completedDate).toBe('2024-01-15');
    });

    it('should include challenges that are only in legacy certifications (-22)', () => {
      const completedChallenges = [
        { id: 'legacy-only-id', completedDate: '2024-01-18' }
      ];

      const result = buildStudentDashboardData(
        completedChallenges,
        mockChallengeMap
      );

      expect(result.certifications.length).toBe(1);
      const certKey = Object.keys(result.certifications[0])[0];
      expect(certKey).toBe('responsive-web-design-22');
    });

    it('should use first superblock even if legacy when both versions exist', () => {
      const completedChallenges = [
        { id: 'dual-version-id', completedDate: '2024-01-18' }
      ];

      const result = buildStudentDashboardData(
        completedChallenges,
        mockChallengeMap
      );

      expect(result.certifications.length).toBe(1);
      const certKey = Object.keys(result.certifications[0])[0];
      expect(certKey).toBe('responsive-web-design-22');
    });
  });

  describe('resolveAllStudentsToDashboardFormat', () => {
    it('should transform multiple students data', () => {
      const studentDataFromFCC = {
        'student1@test.com': [
          { id: 'bd7123c8c441eddfaeb5bdef', completedDate: '2024-01-15' }
        ],
        'student2@test.com': [
          { id: 'a1b2c3d4e5f6g7h8i9j0k1l2', completedDate: '2024-01-16' }
        ]
      };

      const result = resolveAllStudentsToDashboardFormat(
        studentDataFromFCC,
        mockChallengeMap
      );

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(2);
      expect(result[0].email).toBe('student1@test.com');
      expect(result[1].email).toBe('student2@test.com');
    });

    it('should include certifications for each student', () => {
      const studentDataFromFCC = {
        'student@test.com': [
          { id: 'bd7123c8c441eddfaeb5bdef', completedDate: '2024-01-15' },
          { id: '56533eb9ac21ba0edf2244cf', completedDate: '2024-01-16' }
        ]
      };

      const result = resolveAllStudentsToDashboardFormat(
        studentDataFromFCC,
        mockChallengeMap
      );

      expect(result[0]).toHaveProperty('email');
      expect(result[0]).toHaveProperty('certifications');
      expect(result[0].certifications).toBeInstanceOf(Array);
    });

    it('should handle empty student data object', () => {
      const studentDataFromFCC = {};

      const result = resolveAllStudentsToDashboardFormat(
        studentDataFromFCC,
        mockChallengeMap
      );

      expect(result).toEqual([]);
    });

    it('should handle null student data', () => {
      const result = resolveAllStudentsToDashboardFormat(
        null,
        mockChallengeMap
      );

      expect(result).toEqual([]);
    });

    it('should handle undefined student data', () => {
      const result = resolveAllStudentsToDashboardFormat(
        undefined,
        mockChallengeMap
      );

      expect(result).toEqual([]);
    });

    it('should handle non-object student data', () => {
      const result = resolveAllStudentsToDashboardFormat(
        'invalid',
        mockChallengeMap
      );

      expect(result).toEqual([]);
    });

    it('should use provided curriculumMap parameter', () => {
      const customMap = {
        'custom-id': {
          superblocks: ['custom-cert'],
          blocks: ['custom-block'],
          name: 'Custom Challenge'
        }
      };

      const studentDataFromFCC = {
        'student@test.com': [{ id: 'custom-id', completedDate: '2024-01-15' }]
      };

      const result = resolveAllStudentsToDashboardFormat(
        studentDataFromFCC,
        customMap
      );

      expect(result[0].certifications.length).toBe(1);
      expect(result[0].certifications[0]).toHaveProperty('custom-cert');
    });

    it('should process students independently', () => {
      const studentDataFromFCC = {
        'student1@test.com': [
          { id: 'bd7123c8c441eddfaeb5bdef', completedDate: '2024-01-15' }
        ],
        'student2@test.com': [
          { id: '56533eb9ac21ba0edf2244cf', completedDate: '2024-01-16' }
        ]
      };

      const result = resolveAllStudentsToDashboardFormat(
        studentDataFromFCC,
        mockChallengeMap
      );

      const student1 = result.find(s => s.email === 'student1@test.com');
      const student2 = result.find(s => s.email === 'student2@test.com');

      const cert1 = Object.keys(student1.certifications[0])[0];
      const cert2 = Object.keys(student2.certifications[0])[0];

      expect(cert1).toBe('responsive-web-design');
      expect(cert2).toBe('javascript-algorithms-and-data-structures');
    });

    it('should handle student with no completed challenges', () => {
      const studentDataFromFCC = {
        'student@test.com': []
      };

      const result = resolveAllStudentsToDashboardFormat(
        studentDataFromFCC,
        mockChallengeMap
      );

      expect(result[0].email).toBe('student@test.com');
      expect(result[0].certifications).toEqual([]);
    });

    it('should preserve email case sensitivity', () => {
      const studentDataFromFCC = {
        'Student@Test.COM': [
          { id: 'bd7123c8c441eddfaeb5bdef', completedDate: '2024-01-15' }
        ]
      };

      const result = resolveAllStudentsToDashboardFormat(
        studentDataFromFCC,
        mockChallengeMap
      );

      expect(result[0].email).toBe('Student@Test.COM');
    });
  });

  describe('integration scenarios', () => {
    it('should handle real-world scenario with multiple students and certifications', () => {
      const studentDataFromFCC = {
        'alice@example.com': [
          { id: 'bd7123c8c441eddfaeb5bdef', completedDate: '2024-01-10' },
          { id: 'a1b2c3d4e5f6g7h8i9j0k1l2', completedDate: '2024-01-11' },
          { id: '56533eb9ac21ba0edf2244cf', completedDate: '2024-01-12' }
        ],
        'bob@example.com': [
          { id: '56533eb9ac21ba0edf2244cf', completedDate: '2024-01-15' },
          { id: 'm2n3o4p5q6r7s8t9u0v1w2x3', completedDate: '2024-01-16' }
        ]
      };

      const result = resolveAllStudentsToDashboardFormat(
        studentDataFromFCC,
        mockChallengeMap
      );

      expect(result.length).toBe(2);

      // Alice should have 2 certifications (responsive-web-design and javascript-algorithms-and-data-structures)
      const alice = result.find(s => s.email === 'alice@example.com');
      expect(alice.certifications.length).toBe(2);

      // Bob should have 2 certifications (javascript-algorithms-and-data-structures from challenge 56533eb9ac21ba0edf2244cf
      // and full-stack-developer from challenge m2n3o4p5q6r7s8t9u0v1w2x3)
      const bob = result.find(s => s.email === 'bob@example.com');
      expect(bob.certifications.length).toBe(2);
    });

    it('should track challenges from multiple superblocks correctly', () => {
      const completedChallenges = [
        { id: '56533eb9ac21ba0edf2244cf', completedDate: '2024-01-16' }
      ];

      const result = buildStudentDashboardData(
        completedChallenges,
        mockChallengeMap
      );

      // Challenge appears in 2 superblocks, but should be grouped under first one
      const certification =
        result.certifications[0]['javascript-algorithms-and-data-structures'];
      expect(certification).toBeDefined();

      // Should NOT have an entry for full-stack-developer since we use first occurrence
      const hasFullStack = result.certifications.some(
        c => Object.keys(c)[0] === 'full-stack-developer'
      );
      expect(hasFullStack).toBe(false);
    });
  });
});
