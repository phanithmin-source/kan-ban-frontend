import { ApolloLink } from "@apollo/client";
import { tokenStorage } from "../utils/tokenStorage";

export const authLink = new ApolloLink((operation, forward) => {
  const token = tokenStorage.getAccessToken();

  if (token) {
    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...headers,
        Authorization: `Bearer ${token}`,
      },
    }));
  }

  return forward(operation);
});