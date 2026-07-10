import {
  ApolloClient,
  HttpLink,
} from "@apollo/client";

import { authLink } from "./authLink";
import { tokenRefreshLink } from "./tokenRefreshLink";
import { cache } from "./cache";

const httpLink = new HttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL,
  credentials: "include",
});

export const client = new ApolloClient({
  link: authLink.concat(tokenRefreshLink).concat(httpLink),
  cache,
});