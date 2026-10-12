export type ChallengeOrderItem = {
  id: string;
  title?: string;
};

export type BlockObject = {
  dashedName: string;
  name: string;
  order?: number;
  challengeOrder: ChallengeOrderItem[];
};

export type Superblock = {
  dashedName: string;
  name: string;
  title?: string;
  isCertification: boolean;
  blockObjects?: BlockObject[];
};

export type SuperblockWithTitle = Superblock & { title: string };

export type SuperblocksQueryData = {
  superblocks?: Superblock[];
};

export type GraphQLResponse<T> = {
  data?: T;
  errors?: unknown;
};

export type SuperblocksGraphQLResponse = GraphQLResponse<SuperblocksQueryData>;

export type SuperblockDashedNameAndTitle = {
  dashedName: string;
  title: string;
};

export type SuperblockTitleMapping = {
  superblockDashedName: string;
  superblockReadableTitle: string;
};

export type AvailableSuperblocksResponse = {
  superblocks: SuperblockDashedNameAndTitle[];
};

export type BlockChallenges = {
  name: string;
  order: number;
  challengeOrder: string[];
};

export type SuperblockBlocks = Record<string, { challenges: BlockChallenges }>;

export type SuperblockJson = Record<string, { blocks: SuperblockBlocks }>;

export type DashboardBlock = {
  superblock: string;
  superblockReadableTitle: string;
  blockName: string;
  selector: string;
  dashedName: string;
  allChallenges: string[];
  order: number;
};
