import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const client = new ApolloClient({
  link: new HttpLink({
    uri: "https://sandbox-api-test.samyroad.com/graphql", // This is the proxy URL
    headers: {
      "Content-Type": "application/json",
    },
  }),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          images: {
            keyArgs: ["title"], // Keeps "title" as part of the cache key
            merge(existing = { edges: [] }, incoming) {
              // Merge existing edges with incoming edges
              return {
                ...incoming,
                edges: [...incoming.edges],
              };
            },
          },
        },
      },
    },
  }),
});

export default client;