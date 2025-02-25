import { fetchStudentData } from '../../util/api_proccesor';

describe('fetchStudentData', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('returns data when fetch is successful', async () => {
    const mockData = [{ email: 'test@example.com', certifications: [] }];
    global.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockData)
    });

    const result = await fetchStudentData();
    expect(result).toEqual(mockData);
  });

  it('returns an empty array when fetch fails', async () => {

    const result = await fetchStudentData();
    expect(result).toEqual(null);
  });
});
