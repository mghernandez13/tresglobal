export interface UserTypes {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  permission_id: string;
  avatar_url: string;
  is_quota_based: boolean;
  upline: string;
  status: boolean;
}

export interface UserNode {
  node: UserTypes;
}

export interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

export interface UsersQueryData {
  profilesCollection: {
    edges: UserNode[];
    pageInfo?: PageInfo;
    totalCount?: number;
  };
}

export interface UsersQueryVariables {
  first: number;
  offset: number;
  searchTerm: string;
  roleFilter?: string[];
  sortOrder: Record<string, string>[];
}

export interface GetUserQueryVariables {
  userId: string;
}

export interface GetUplineListVariables {
  currentId?: string;
}

export interface LottoType {
  id: string;
  game_type: string;
  draw_time: string;
  name: string;
  days_active: string[];
  is_active: boolean;
  number_of_digits: number;
  min_number: number;
  max_number: number;
}

export interface LottoQueryData {
  lotto_typesCollection: {
    edges: Array<{
      node: LottoType;
      cursor: string;
    }>;
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
    totalCount: number;
  };
}

export interface Settings {
  id: number;
  name: string;
  value: string;
  is_active: boolean;
}

export interface SettingsQueryData {
  settingsCollection: {
    edges: Array<{
      node: Settings;
      cursor: string;
    }>;
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
    totalCount: number;
  };
}

export interface LottoQueryVariables {
  first: number;
  offset: number;
  searchTerm?: string;
  filter?: Record<string, unknown>;
  sortOrder?: Record<string, string>[];
}

export interface GetLottoTypeQueryVariables {
  lottoTypeId: string;
}

export interface BetType {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
  game_type?: string;
  draw_time?: string;
}

export interface BetTypesQueryData {
  bet_typesCollection: {
    edges: Array<{
      node: BetType;
      cursor: string;
    }>;
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
    totalCount: number;
  };
}

export interface BetTypesQueryVariables {
  first: number;
  offset: number;
  filter?: Record<string, unknown>;
  sortOrder?: Record<string, string>[];
}

export interface GetBetTypeQueryVariables {
  betTypeId: string;
}

export interface BetPrize {
  id: string;
  lotto_types: {
    game_type: string;
    draw_time: string;
    name: string;
  };
  bet_amount: number;
  prize: number;
  is_active: boolean;
}

export interface BetPrizesQueryData {
  bet_prizesCollection: {
    edges: Array<{
      node: BetPrize;
      cursor: string;
    }>;
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
    totalCount: number;
  };
}

export interface BetPrizesQueryVariables {
  first: number;
  offset: number;
  filter?: Record<string, unknown>;
  orderBy?: Record<string, string>[];
}

export interface GetBetTypeQueryVariables {
  betTypeId: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
  is_active: boolean;
  users: {
    totalCount: number;
  };
}

export interface RolesQueryData {
  permissionsCollection: {
    edges: Array<{
      node: Role;
      cursor: string;
    }>;
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
    totalCount: number;
  };
}

export interface RolesQueryVariables {
  first?: number;
  offset?: number;
  searchTerm?: string;
  sortOrder?: Record<string, string>[];
  isActive?: boolean;
}

export interface GetRoleQueryVariables {
  roleId?: string;
}
