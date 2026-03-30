import { gql } from "@apollo/client";

export const GET_BET_TYPES = gql`
  query GetBetTypes(
    $first: Int!
    $offset: Int!
    $searchTerm: String
    $filter: bet_typesBoolExp
    $sortOrder: [bet_typesOrderBy!]
  ) {
    bet_typesCollection(
      first: $first
      offset: $offset
      orderBy: $sortOrder
      filter: $filter
    ) {
      edges {
        node {
          id
          name
          code
          is_active
          game_type
          draw_time
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

export const GET_BET_TYPE = gql`
  query GetBetType($betTypeId: Int!) {
    bet_typesCollection(filter: { id: { eq: $betTypeId } }) {
      edges {
        node {
          id
          name
          code
          is_active
          game_type
          draw_time
        }
      }
    }
  }
`;

export const CREATE_BET_TYPE = gql`
  mutation CreateBetType(
    $name: String!
    $code: String!
    $isActive: Boolean!
    $gameType: String
    $drawTime: String
  ) {
    insertIntobet_typesCollection(
      objects: [
        {
          name: $name
          code: $code
          is_active: $isActive
          game_type: $gameType
          draw_time: $drawTime
        }
      ]
    ) {
      affectedCount
    }
  }
`;

export const UPDATE_BET_TYPE = gql`
  mutation UpdateBetType(
    $id: Int!
    $name: String
    $code: String
    $isActive: Boolean
    $gameType: String
    $drawTime: String
    $isArchive: Boolean
  ) {
    updatebet_typesCollection(
      set: {
        name: $name
        code: $code
        is_active: $isActive
        game_type: $gameType
        draw_time: $drawTime
        is_archive: $isArchive
      }
      filter: { id: { eq: $id } }
    ) {
      records {
        id
      }
    }
  }
`;

export const BULK_UPDATE_BET_TYPES_STATUS = gql`
  mutation BulkUpdateBetTypesStatus($lottoIds: [Int!]!, $isArchive: Boolean!) {
    update_bet_types_status(bet_type_ids: $lottoIds, new_status: $isArchive) {
      totalCount
    }
  }
`;
