import { gql } from "@apollo/client";

export const GET_BETS = gql`
  query GetBets(
    $first: Int!
    $offset: Int!
    $filter: betsBoolExp
    $searchTerm: String
    $orderBy: [betsOrderBy!]
  ) {
    betsCollection(
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
            code
          }
          profiles {
            full_name
          }

          bet_amount
          prize_amount
          combination
          hit
          is_dummy_bet
          bettor_name
          is_super_jackpot
          is_return_bet
          created_at
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

export const CREATE_BETS = gql`
  mutation CreateBet(
    $lottoTypeId: UUID!
    $betAmount: Number!
    $bettor: String!
    $combination: String!
    $betTypeId: UUID
    $isDummy: Boolean!
    $agent: UUID!
    $createdBy: UUID!
  ) {
    insertIntobetsCollection(
      objects: [
        {
          lotto_type_id: $lottoTypeId
          bet_amount: $betAmount
          bettor_name: $bettor
          combination: $combination
          bet_type_id: $betTypeId
          is_dummy_bet: $isDummy
          agent_id: $agent
          created_by: $createdBy
        }
      ]
    ) {
      records {
        id
      }
    }
  }
`;

export const UPDATE_BETS = gql`
  mutation UpdateBet(
    $id: UUID!
    $betAmount: Number
    $prizeAmount: Number
    $isArchive: Boolean
    $isActive: Boolean
  ) {
    updatebet_prizesCollection(
      set: {
        is_archive: $isArchive
        bet_amount: $betAmount
        prize_amount: $prizeAmount
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
