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
          role
          is_quota_based
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
    $role: String
    $isActive: Boolean
    $isArchive: Boolean
    $avatarUrl: String
    $isQuotaBased: Boolean
    $upline: UUID
  ) {
    updateprofilesCollection(
      set: {
        first_name: $firstName
        last_name: $lastName
        email: $email
        role: $role
        status: $isActive
        is_archive: $isArchive
        avatar_url: $avatarUrl
        is_quota_based: $isQuotaBased
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
