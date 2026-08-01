import { gql } from "@apollo/client";

export const GET_NOTIFICATIONS = gql`
  query GetNotifications(
    $first: Int!
    $offset: Int!
    $searchTerm: String
    $sortOrder: [notificationsOrderBy!]
    $receiverId: UUID
  ) {
    notificationsCollection(
      first: $first
      offset: $offset
      orderBy: $sortOrder
      filter: {
        and: [
          {
            or: [
              { title: { ilike: $searchTerm } }
              { content: { ilike: $searchTerm } }
              { sender: { ilike: $searchTerm } }
            ]
          }
          { or: [{ receiver: { is: NULL } }, { receiver: { eq: $receiverId } }] }
        ]
      }
    ) {
      edges {
        node {
          id
          sender
          receiver
          title
          content
          created_at
          unread
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
