import { gql } from "@apollo/client";

export const GET_BET_PRIZES = gql`
  query GetBetPrizes(
    $first: Int!
    $offset: Int!
    $filter: bet_prizesBoolExp
    $orderBy: [bet_prizesOrderBy!]
  ) {
    bet_prizesCollection(
      first: $first
      offset: $offset
      filter: $filter
      orderBy: $orderBy
    ) {
      edges {
        node {
          id
          lotto_types {
            game_type
            draw_time
            name
          }
          bet_amount
          prize
          is_active
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

export const CREATE_BET_PRIZE = gql`
  mutation CreateBetPrize(
    $lottoTypeId: UUID!
    $betAmount: Number!
    $prize: Number!
    $isActive: Boolean!
  ) {
    insertIntobet_prizesCollection(
      objects: [
        {
          lotto_type_id: $lottoTypeId
          bet_amount: $betAmount
          prize: $prize
          is_active: $isActive
        }
      ]
    ) {
      records {
        id
      }
    }
  }
`;

export const UPDATE_BET_PRIZE = gql`
  mutation UpdateBetPrize(
    $id: UUID!
    $betAmount: Number
    $prize: Number
    $isArchive: Boolean
    $isActive: Boolean
  ) {
    updatebet_prizesCollection(
      set: {
        is_archive: $isArchive
        bet_amount: $betAmount
        prize: $prize
        is_active: $isActive
      }
      filter: { id: { eq: $id } }
    ) {
      records {
        id
      }
    }
  }
`;

export const BULK_UPDATE_BET_PRIZES_STATUS = gql`
  mutation BulkUpdateBetPrizesStatus(
    $betPrizeIds: [UUID!]!
    $isActive: Boolean!
  ) {
    update_bet_prize_statuses(
      bet_prize_ids: $betPrizeIds
      new_status: $isActive
    ) {
      totalCount
    }
  }
`;
