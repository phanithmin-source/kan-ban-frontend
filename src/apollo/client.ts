import {
  ApolloClient,
} from "@apollo/client";
import { BatchHttpLink } from "@apollo/client/link/batch-http";

import { authLink } from "./authLink";
import { tokenRefreshLink } from "./tokenRefreshLink";
import { cache } from "./cache";

const httpLink = new BatchHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL,
  credentials: "include",
  batchMax: 10,
  batchInterval: 10,
});

export const client = new ApolloClient({
  link: authLink.concat(tokenRefreshLink).concat(httpLink),
  cache,
});