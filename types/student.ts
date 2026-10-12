export type CompletedChallenge = {
  id: string;
  challengeName?: string;
  completedDate: number;
  files?: unknown[];
};

export type BlockProgress = Record<
  string,
  { completedChallenges: CompletedChallenge[] }
>;

export type CertificationProgress = Record<string, { blocks: BlockProgress[] }>;

export type StudentDashboardData = {
  email: string;
  certifications: CertificationProgress[];
};

export type StudentDashboardDataList = StudentDashboardData[];

export type StudentCertifications = Pick<
  StudentDashboardData,
  'certifications'
>;

export type FccUserDataByUserId = Record<string, CompletedChallenge[]>;

export type FccUserIdResponse = {
  userId: string;
};

export type FccUserDataResponse = {
  data: FccUserDataByUserId;
};

export type FetchStudentDataResult = {
  error: string | null;
  data: StudentDashboardData[] | null;
  status?: number;
};
