import { getIndividualStudentData } from '../../util/student/getIndividualStudentData';
import { fetchStudentData } from '../../util/student/fetchStudentData';

vi.mock('../../util/student/fetchStudentData', () => ({
  fetchStudentData: vi.fn()
}));

describe('getIndividualStudentData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the student whose email matches', async () => {
    const student = { email: 'a@example.org', certifications: [] };
    vi.mocked(fetchStudentData).mockResolvedValue({
      error: null,
      data: [student, { email: 'b@example.org', certifications: [] }]
    });

    expect(await getIndividualStudentData('a@example.org')).toEqual(student);
  });

  it('returns null when no student matches', async () => {
    vi.mocked(fetchStudentData).mockResolvedValue({
      error: null,
      data: [{ email: 'a@example.org', certifications: [] }]
    });

    expect(await getIndividualStudentData('missing@example.org')).toBeNull();
  });
});
