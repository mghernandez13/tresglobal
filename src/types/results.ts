export interface DrawResult {
  id: number;
  draw_date: string;
  draw_type: number;
  combination: string;
  created_at: string;
  is_archive: boolean;
}

export interface ResultsQueryData {
  draw_resultsCollection: {
    edges: Array<{
      node: DrawResult;
      cursor: string;
    }>;
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
    totalCount: number;
  };
}

export interface ResultsQueryVariables {
  first: number;
  offset: number;
  searchTerm: string;
  sortOrder?: Record<string, string>[];
  filter?: Record<string, unknown>;
}

export interface CreateResultVariables {
  draw_date: string;
  draw_type: number;
  combination: string;
}

export interface UpdateResultVariables {
  id: number;
  draw_date: string;
  draw_type: number;
  combination: string;
}

export interface DeleteResultVariables {
  id: number;
}
