import { HttpLink } from "@apollo/client";
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import { UserAuth } from "../components/context/AuthContext";
import { ApolloProvider } from "@apollo/client/react";

const graphqlEndpoint = `${import.meta.env.VITE_SUPABASE_URL}/graphql/v1`;
const apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const ApolloWrapper = ({ children }: { children: React.ReactNode }) => {
  const { session } = UserAuth();

  const httpLink = new HttpLink({
    uri: graphqlEndpoint,
  });

  const authLink = new SetContextLink((prevContext) => {
    return {
      headers: {
        ...prevContext.headers,
        apiKey,
        authorization: session?.access_token
          ? `Bearer ${session.access_token}`
          : "",
        "Apollo-Require-Preflight": "true",
      },
    };
  });

  // Initialize the Apollo Client
  const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default ApolloWrapper;
