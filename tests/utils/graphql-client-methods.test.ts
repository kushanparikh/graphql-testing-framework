import { GraphQLTestClient, measureQueryPerformance } from '../../utils/graphql-client.ts';
import { afterEach, describe, expect, test } from '@jest/globals';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';

/**
 * GraphQLTestClient Utility Method Tests
 *
 * Covers public wrapper methods that the API-focused suites don't exercise:
 * - getEndpoint()
 * - setHeaders() and setAuthToken()
 * - batchRequests() error path (Countries rejects batching)
 * - measureQueryPerformance() standalone helper
 * - enhanceError() network-failure branch (connection refused)
 * - timeoutMs option and enhanceError() timeout branch (local server that never responds)
 *
 * All tests are read-only.
 */

const COUNTRIES_URL = 'https://countries.trevorblades.com/';

describe('GraphQLTestClient – endpoint and headers', () => {
  test('getEndpoint returns the configured URL', () => {
    const client = new GraphQLTestClient(COUNTRIES_URL);

    expect(client.getEndpoint()).toBe(COUNTRIES_URL);
  });

  test('setHeaders keeps requests working after headers are updated', async () => {
    const client = new GraphQLTestClient(COUNTRIES_URL);
    // Countries ignores unknown headers, so this checks the request still succeeds
    client.setHeaders({ 'x-request-id': 'test-123' });

    const data = await client.request<{ country: { name: string } }>(
      'query { country(code: "US") { name } }'
    );

    expect(data.country.name).toBe('United States');
  });

  test('setAuthToken sends the token, so GitHub rejects an invalid one with 401', async () => {
    // GitHub's GraphQL endpoint requires a token, so a bogus one must be rejected.
    // No real credentials are needed.
    const client = new GraphQLTestClient('https://api.github.com/graphql', undefined, {
      'User-Agent': 'graphql-testing-framework',
    });
    client.setAuthToken('ghp_invalid_token_for_testing');

    await expect(client.request('query { viewer { login } }')).rejects.toThrow(/HTTP 401/);
  });

  test('constructor token is sent as a Bearer header', async () => {
    const client = new GraphQLTestClient('https://api.github.com/graphql', 'ghp_invalid_token_for_testing', {
      'User-Agent': 'graphql-testing-framework',
    });

    await expect(client.request('query { viewer { login } }')).rejects.toThrow(/HTTP 401/);
  });
});

describe('GraphQLTestClient – batching', () => {
  test('batchRequests rejects on an API that does not support batching', async () => {
    const client = new GraphQLTestClient(COUNTRIES_URL);

    await expect(
      client.batchRequests([
        { document: 'query { country(code: "US") { name } }' },
        { document: 'query { continent(code: "EU") { name } }' },
      ])
    ).rejects.toThrow(/Batch queries/);
  });
});

describe('measureQueryPerformance helper', () => {
  test('returns data and a duration in milliseconds', async () => {
    const client = new GraphQLTestClient(COUNTRIES_URL);

    const { data, duration } = await measureQueryPerformance<{ country: { name: string } }>(
      client,
      'query { country(code: "US") { name } }'
    );

    expect(data.country.name).toBe('United States');
    expect(duration).toBeGreaterThan(0);
  });
});

describe('GraphQLTestClient – network failures', () => {
  test('connection refused is reported as a network error with the endpoint', async () => {
    // Port 1 is closed locally, so the connection fails before any HTTP response
    const client = new GraphQLTestClient('http://127.0.0.1:1/graphql');

    await expect(client.request('query { __typename }')).rejects.toThrow(
      /Network Error: Unable to reach http:\/\/127\.0\.0\.1:1\/graphql/
    );
  });
});

describe('GraphQLTestClient – timeouts', () => {
  let server: Server | undefined;

  // Runs even if the test times out, so a stalled request never leaves the server open
  afterEach(async () => {
    if (!server) return;
    server.closeAllConnections();
    await new Promise<void>((resolve) => server!.close(() => resolve()));
    server = undefined;
  });

  test('a request with no response within timeoutMs is reported as a timeout', async () => {
    // Accepts the connection but never answers, like a stalled upstream
    server = createServer(() => {});
    await new Promise<void>((resolve) => server!.listen(0, '127.0.0.1', resolve));
    const { port } = server.address() as AddressInfo;
    const endpoint = `http://127.0.0.1:${port}/graphql`;

    const client = new GraphQLTestClient(endpoint, undefined, undefined, { timeoutMs: 200 });
    await expect(client.request('query { __typename }')).rejects.toThrow(
      `Timeout: no response from ${endpoint} within 200 ms`
    );
  });
});
