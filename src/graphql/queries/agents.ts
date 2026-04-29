import { gql } from "@apollo/client";

export const GET_AGENTS = gql`
  query GetAgents($first: Int!, $offset: Int!) {
    profilesCollection(
      first: $first
      offset: $offset
      filter: { is_archive: { eq: false } }
    ) {
      edges {
        node {
          id
          full_name
        }
      }
    }
  }
`;
