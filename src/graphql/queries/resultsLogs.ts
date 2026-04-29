import { gql } from "@apollo/client";

export const GET_DRAW_RESULTS_LOGS = gql`
  query GetDrawResultsLogs(
    $first: Int!
    $offset: Int!
    $filter: draw_results_logsBoolExp
    $sortOrder: [draw_results_logsOrderBy!]
  ) {
    draw_results_logsCollection(
      first: $first
      offset: $offset
      filter: $filter
      orderBy: $sortOrder
    ) {
      edges {
        node {
          id
          name
          status
          created_by
          created_at
          updated_at
          draw_result_id
          profiles {
            full_name
          }
          draw_results {
            draw_date
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;

export const CREATE_DRAW_RESULTS_LOG = gql`
  mutation CreateDrawResultsLog(
    $name: String!
    $status: String!
    $created_by: UUID!
    $draw_result_id: Int!
  ) {
    insertIntodraw_results_logsCollection(
      objects: [
        {
          name: $name
          status: $status
          created_by: $created_by
          draw_result_id: $draw_result_id
        }
      ]
    ) {
      records {
        id
        name
        status
        created_by
        created_at
        updated_at
        draw_result_id
      }
    }
  }
`;
