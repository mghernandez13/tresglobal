import { gql } from "@apollo/client";

export const GET_SETTINGS = gql`
  query GetSettings {
    settingsCollection {
      edges {
        node {
          id
          name
          value
        }
      }
    }
  }
`;

export const GET_SETTING = gql`
  query GetSetting($id: UUID!) {
    settingsCollection(filter: { id: { eq: $id } }) {
      edges {
        node {
          id
          name
          value
        }
      }
    }
  }
`;

export const CREATE_SETTING = gql`
  mutation CreateSetting(
    $name: String!
    $value: String!
    $is_active: Boolean!
  ) {
    insertIntosettingsCollection(
      objects: { name: $name, value: $value, is_active: $is_active }
    ) {
      records {
        id
        name
        value
      }
    }
  }
`;

export const UPDATE_SETTING = gql`
  mutation UpdateSetting($name: String, $value: String) {
    updatesettingsCollection(
      set: { value: $value }
      filter: { name: { eq: $name } }
    ) {
      records {
        id
        name
        value
      }
    }
  }
`;
