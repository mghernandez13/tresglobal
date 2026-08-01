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
            id
            game_type
            draw_time
            name
          }
          bet_types {
            id
            name
          }
          bet_amount
          prize
          is_active
          super_jackpot
          super_jackpot_multiplier
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
    $betTypeId: UUID
    $betAmount: Number!
    $prize: Number!
    $isActive: Boolean!
    $superJackpot: Boolean
    $superJackpotMultiplier: Number
  ) {
    insertIntobet_prizesCollection(
      objects: [
        {
          lotto_type_id: $lottoTypeId
          bet_type_id: $betTypeId
          bet_amount: $betAmount
          prize: $prize
          is_active: $isActive
          super_jackpot: $superJackpot
          super_jackpot_multiplier: $superJackpotMultiplier
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
    $betTypeId: UUID
    $betAmount: Number
    $prize: Number
    $superJackpot: Boolean
    $superJackpotMultiplier: Number
    $isArchive: Boolean
    $isActive: Boolean
  ) {
    updatebet_prizesCollection(
      set: {
        bet_type_id: $betTypeId
        is_archive: $isArchive
        bet_amount: $betAmount
        prize: $prize
        super_jackpot: $superJackpot
        super_jackpot_multiplier: $superJackpotMultiplier
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
