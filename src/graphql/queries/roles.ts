import { gql } from "@apollo/client";

export const GET_ROLES = gql`
  query GetPermissions(
    $first: Int!
    $offset: Int!
    $searchTerm: String
    $sortOrder: [rolesOrderBy!]
    $isActive: Boolean
  ) {
    permissionsCollection(
      first: $first
      offset: $offset
      orderBy: $sortOrder
      filter: {
        name: { ilike: $searchTerm }
        is_archive: { eq: false }
        is_active: { eq: $isActive }
      }
    ) {
      edges {
        node {
          id
          name
          permissions
          is_active
          users: profilesCollection {
            totalCount
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

export const GET_ROLE = gql`
  query GetRole($roleId: UUID!) {
    permissionsCollection(filter: { id: { eq: $roleId } }) {
      edges {
        node {
          id
          name
          permissions
        }
      }
    }
  }
`;

export const CREATE_ROLE = gql`
  mutation CreateRole($name: String!, $permissions: [String!]!) {
    insertIntopermissionsCollection(
      objects: { name: $name, permissions: $permissions }
    ) {
      records {
        id
        name
        permissions
      }
    }
  }
`;

export const UPDATE_ROLE = gql`
  mutation UpdateRole($id: UUID!, $name: String!, $permissions: [String!]!) {
    updatepermissionsCollection(
      set: { name: $name, permissions: $permissions }
      filter: { id: { eq: $id } }
    ) {
      records {
        id
        name
        permissions
      }
    }
  }
`;

export const DELETE_ROLE = gql`
  mutation DeleteRole($id: UUID!) {
    updatepermissionsCollection(
      set: { is_archive: true }
      filter: { id: { eq: $id } }
    ) {
      records {
        id
        is_archive
      }
    }
  }
`;

export const BULK_UPDATE_ROLE_STATUS = gql`
  mutation BulkUpdateRoleStatus($roleIds: [UUID!]!, $isActive: Boolean!) {
    update_permission_statuses(role_ids: $roleIds, new_status: $isActive) {
      totalCount
    }
  }
`;
