export type ChallengeMapEntry = {
  superblocks: string[];
  blocks: string[];
  name: string;
};

export type ChallengeMap = Record<string, ChallengeMapEntry>;

export type ChallengeMapLocationSource = Partial<
  Pick<ChallengeMapEntry, 'superblocks' | 'blocks'>
>;

export type CanonicalChallengeMapLocation = {
  certification: string | undefined;
  block: string | undefined;
};

export type ChallengeMapQueryChallenge = {
  id: string;
  title: string;
};

export type ChallengeMapQueryBlock = {
  dashedName: string;
  name: string;
  challengeOrder: ChallengeMapQueryChallenge[];
};

export type ChallengeMapQuerySuperblock = {
  dashedName: string;
  name: string;
  isCertification: boolean;
  blockObjects: ChallengeMapQueryBlock[];
};

export type ChallengeMapQueryData = {
  superblocks: ChallengeMapQuerySuperblock[];
};

export type ChallengeMapGraphQLResponse = {
  data: ChallengeMapQueryData;
  errors?: unknown;
};
