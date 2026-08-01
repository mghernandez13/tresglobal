import { gql } from "@apollo/client";

// orderBy: [{ created_at: DescNullsLast }]
export const GET_USERS = gql`
  query GetUsers(
    $first: Int!
    $offset: Int!
    $searchTerm: String
    $roleFilter: [String]
    $sortOrder: [profilesOrderBy!]
  ) {
    profilesCollection(
      first: $first
      offset: $offset
      orderBy: $sortOrder
      filter: {
        and: [
          { permission_id: { in: $roleFilter } }
          { is_archive: { eq: false } }
        ]
        or: [
          { first_name: { ilike: $searchTerm } }
          { last_name: { ilike: $searchTerm } }
          { email: { ilike: $searchTerm } }
          { full_name: { ilike: $searchTerm } }
        ]
      }
    ) {
      edges {
        node {
          id
          first_name
          last_name
          full_name
          email
          permission_id
          is_quota_based
          remittance_percent
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

export const GET_UPLINE_LIST = gql`
  query GetUplineList($currentId: UUID) {
    profilesCollection(
      orderBy: [{ created_at: DescNullsLast }]
      filter: {
        and: [
          { status: { eq: true } }
          { is_archive: { eq: false } }
          { id: { neq: $currentId } }
        ]
      }
    ) {
      edges {
        node {
          id
          first_name
          last_name
          full_name
          email
          is_quota_based
          remittance_percent
          upline
        }
      }
    }
  }
`;

export const GET_USER = gql`
  query GetUser($userId: String!) {
    profilesCollection(filter: { id: { eq: $userId } }) {
      edges {
        node {
          id
          first_name
          last_name
          full_name
          email
          permission_id
          avatar_url
          is_quota_based
          remittance_percent
          upline
          status
        }
      }
    }
  }
`;

export const GET_ROLE_COUNTS = gql`
  query GetRoleCounts {
    admin: profilesCollection(
      filter: {
        and: [
          { role: { eq: "admin" } }
          { status: { eq: true } }
          { is_archive: { eq: false } }
        ]
      }
    ) {
      totalCount
    }
    main_agent: profilesCollection(
      filter: {
        and: [
          { role: { eq: "main_agent" } }
          { status: { eq: true } }
          { is_archive: { eq: false } }
        ]
      }
    ) {
      totalCount
    }
    agent: profilesCollection(
      filter: {
        and: [
          { role: { eq: "agent" } }
          { status: { eq: true } }
          { is_archive: { eq: false } }
        ]
      }
    ) {
      totalCount
    }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser(
    $id: UUID!
    $firstName: String
    $lastName: String
    $email: String
    $isActive: Boolean
    $isArchive: Boolean
    $avatarUrl: String
    $isQuotaBased: Boolean
    $permissionId: UUID
    $remittancePercent: Float
    $upline: UUID
  ) {
    updateprofilesCollection(
      set: {
        first_name: $firstName
        last_name: $lastName
        email: $email
        status: $isActive
        is_archive: $isArchive
        avatar_url: $avatarUrl
        is_quota_based: $isQuotaBased
        permission_id: $permissionId
        remittance_percent: $remittancePercent
        upline: $upline
      }
      filter: { id: { eq: $id } }
    ) {
      records {
        id
      }
    }
  }
`;

export const RESET_USER_PASSWORD = gql`
  mutation ResetUserPassword($userId: UUID!, $password: String!) {
    admin_reset_password(target_user_id: $userId, new_password: $password)
  }
`;

export const UPDATE_USER_EMAIL = gql`
  mutation UpdateUserEmail($userId: UUID!, $email: String!) {
    admin_update_user_email(target_user_id: $userId, new_email: $email)
  }
`;

export const BULK_UPDATE_USER_STATUS = gql`
  mutation BulkUpdateUserStatus($userIds: [UUID!]!, $isArchive: Boolean!) {
    update_user_statuses(user_ids: $userIds, new_status: $isArchive) {
      totalCount
    }
  }
`;

export const GET_AGENTS_WITH_BETS = gql`
  query GetAgentsByUplineWithBets(
    $first: Int!
    $offset: Int!
    $upline: UUID!
    $searchTerm: String!
    $filterBets: betsBoolExp
    $orderByBets: [betsOrderBy!]
  ) {
    profilesCollection(
      first: $first
      offset: $offset
      filter: {
        and: [
          { is_archive: { eq: false } }
          { or: [{ upline: { eq: $upline } }, { id: { eq: $upline } }] }
          {
            or: [
              { first_name: { ilike: $searchTerm } }
              { last_name: { ilike: $searchTerm } }
              { full_name: { ilike: $searchTerm } }
            ]
          }
        ]
      }
    ) {
      edges {
        node {
          id
          full_name
          first_name
          last_name
          upline
          remittance_percent
          betsCollection(filter: $filterBets, orderBy: $orderByBets) {
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
                bet_status
                message
                created_at
                completed_at
              }
              cursor
            }
            totalCount
          }
        }
      }
    }
  }
`;

export const GET_ALL_AGENTS_WITH_BETS = gql`
  query GetAllAgentsWithBets(
    $first: Int!
    $offset: Int!
    $searchTerm: String!
    $filterBets: betsBoolExp
    $orderByBets: [betsOrderBy!]
  ) {
    profilesCollection(
      first: $first
      offset: $offset
      filter: {
        and: [
          { is_archive: { eq: false } }
          {
            or: [
              { first_name: { ilike: $searchTerm } }
              { last_name: { ilike: $searchTerm } }
              { full_name: { ilike: $searchTerm } }
            ]
          }
        ]
      }
    ) {
      edges {
        node {
          id
          full_name
          first_name
          last_name
          upline
          remittance_percent
          betsCollection(filter: $filterBets, orderBy: $orderByBets) {
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
                bet_status
                message
                created_at
                completed_at
              }
              cursor
            }
            totalCount
          }
        }
      }
    }
  }
`;
