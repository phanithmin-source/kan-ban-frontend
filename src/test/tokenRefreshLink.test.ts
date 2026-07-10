// Define the environment variable for testing BEFORE importing the module
if (!import.meta.env) {
  (import.meta as any).env = {};
}
import.meta.env.VITE_GRAPHQL_URL = "http://localhost/graphql";

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { execute, ApolloLink, Observable, gql } from "@apollo/client";
import { GraphQLError } from "graphql";
import { tokenRefreshLink } from "../apollo/tokenRefreshLink";
import { tokenStorage } from "../utils/tokenStorage";

describe("tokenRefreshLink", () => {
  beforeEach(() => {
    localStorage.clear();
    tokenStorage.setTokens("old-access-token", "valid-refresh-token");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("should queue requests while refresh is in progress and retry them after refresh", () => {
    let refreshResolve: any;
    const refreshPromise = new Promise((resolve) => {
      refreshResolve = resolve;
    });

    // Mock global.fetch directly with Vitest's stubGlobal
    const mockFetch = vi.fn().mockImplementation((url, init) => {
      console.log("Mock fetch called with:", url, JSON.stringify(init));
      return refreshPromise.then(() => ({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            data: {
              refreshToken: {
                accessToken: "new-access-token",
              },
            },
          }),
      }));
    });
    vi.stubGlobal("fetch", mockFetch);

    let callCount1 = 0;
    let callCount2 = 0;
    const headerTokenCalls: string[] = [];

    // Terminating link that fails first with UNAUTHENTICATED error in next(), then succeeds on retry
    const mockTerminatingLink = new ApolloLink((operation) => {
      const authHeader = operation.getContext().headers?.Authorization;
      headerTokenCalls.push(authHeader);

      if (operation.operationName === "Query1") {
        callCount1++;
        if (callCount1 === 1) {
          return new Observable((observer) => {
            observer.next({
              errors: [
                new GraphQLError("Unauthenticated", {
                  extensions: { code: "UNAUTHENTICATED" },
                }),
              ],
            });
            observer.complete();
          });
        }
        return new Observable((observer) => {
          observer.next({ data: { query1: "success" } });
          observer.complete();
        });
      }

      if (operation.operationName === "Query2") {
        callCount2++;
        if (callCount2 === 1) {
          return new Observable((observer) => {
            observer.next({
              errors: [
                new GraphQLError("Unauthenticated", {
                  extensions: { code: "UNAUTHENTICATED" },
                }),
              ],
            });
            observer.complete();
          });
        }
        return new Observable((observer) => {
          observer.next({ data: { query2: "success" } });
          observer.complete();
        });
      }

      return new Observable((observer) => {
        observer.next({ data: {} });
        observer.complete();
      });
    });

    const link = ApolloLink.from([
      new ApolloLink((operation, forward) => {
        // Intercept and log errors to see what went wrong in the refresh promise chain
        return new Observable((observer) => {
          const sub = forward(operation).subscribe({
            next: (val) => observer.next(val),
            error: (err) => {
              console.log("Link observed error:", err);
              if (err.stack) console.log("Stack:", err.stack);
              observer.error(err);
            },
            complete: () => observer.complete(),
          });
          return () => sub.unsubscribe();
        });
      }),
      tokenRefreshLink,
      mockTerminatingLink,
    ]);

    // Start two concurrent queries that will fail initially
    const results1: any[] = [];
    const results2: any[] = [];

    const query1 = gql`
      query Query1 {
        test1
      }
    `;
    const query2 = gql`
      query Query2 {
        test2
      }
    `;

    const mockClient = {
      queryManager: {
        incrementalHandler: {
          isIncrementalResult: () => false,
        },
      },
    };

    const sub1 = execute(link, { query: query1, operationName: "Query1" } as any, { client: mockClient as any }).subscribe({
      next: (val) => results1.push(val),
      error: (err) => results1.push(err),
    });

    const sub2 = execute(link, { query: query2, operationName: "Query2" } as any, { client: mockClient as any }).subscribe({
      next: (val) => results2.push(val),
      error: (err) => results2.push(err),
    });

    // Both should have triggered the initial call
    expect(callCount1).toBe(1);
    expect(callCount2).toBe(1);

    // Refresh should be triggered exactly once
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Resolve the token refresh
    refreshResolve!();

    // Wait for microtasks to flush
    return new Promise<void>((resolve) => setTimeout(resolve, 50)).then(() => {
      // Now both queries should be retried with the new token
      expect(callCount1).toBe(2);
      expect(callCount2).toBe(2);

      expect(results1).toEqual([{ data: { query1: "success" } }]);
      expect(results2).toEqual([{ data: { query2: "success" } }]);

      expect(headerTokenCalls).toContain("Bearer new-access-token");
      expect(tokenStorage.getAccessToken()).toBe("new-access-token");

      sub1.unsubscribe();
      sub2.unsubscribe();
    });
  });
});
