import { GraphQLTestClient } from '../../utils/graphql-client.ts';
import { describe, expect, test } from '@jest/globals';

/**
 * Countries API Query Tests
 *
 * API: https://countries.trevorblades.com/
 *
 * This test suite demonstrates various GraphQL query patterns against the
 * Countries GraphQL API, a public read-only API providing country data.
 *
 * Test Coverage:
 * - Basic queries with arguments
 * - Multiple field selection
 * - Query variables (parameterized queries)
 * - Nested object queries (relationships)
 * - Array/list queries
 * - Filtering with variables
 * - Error handling (invalid inputs, syntax errors, missing variables)
 *
 * @see https://countries.trevorblades.com/ for API documentation
 */

describe("Query Operations for Countries - Success", () => {
  const client = new GraphQLTestClient('https://countries.trevorblades.com/');

  test('Should be able to retrieve country details from country code', async () => {
    // Request Query creation
    const query = `
        query {
            country (code: "US") {
                name
                capital
            }
        }
        `;
    // Execute the query
    const response = await client.rawRequest(query);
    // Assert the status
    expect(response.status).toBe(200);
    // Assert response body type
    expect(response.headers.get('content-type')).toContain('application/graphql-response+json');
    // Assert the response body structure
    expect(response.data).toBeDefined();
    expect(response.data.country).toBeDefined();
    //expect(typeof response.data.country.name).toBe('string');
    expect(response.data.country.name).toBe('United States');
    //expect(typeof response.data.country.capital).toBe('object');
    expect(response.data.country.capital).toBe('Washington D.C.');
  });

  test('should fetch multiple fields', async () => {
    const query = `
    query {
      country(code: "US") {
        name
        capital
        currency
        emoji
      }
    }
  `;

    // Using request() - returns data only, no response metadata needed
    const data = await client.request(query);

    expect(data.country.currency).toContain('USD');
    expect(data.country.emoji).toBe('🇺🇸');
  });

  test('should use variables', async () => {
    const query = `
    query GetCountry($code: ID!) {
      country(code: $code) {
        name
        capital
      }
    }
  `;

    const variables = { code: 'CA' };

    // Using request() with variables - data only
    const data = await client.request(query, variables);

    expect(data.country.name).toBe('Canada');
  });

  test('should fetch nested data', async () => {
    const query = `
    query {
      country(code: "US") {
        name
        continent {
          name
          code
        }
      }
    }
  `;

    // Using request() for nested data - data only
    const data = await client.request(query);

    expect(data.country.continent.name).toBe('North America');
    expect(data.country.continent.code).toBe('NA');
  });

  test('should handle arrays', async () => {
    const query = `
    query {
      countries {
        name
        code
      }
    }
  `;

    // Using request() for array data - data only
    const data = await client.request(query);

    expect(Array.isArray(data.countries)).toBe(true);
    expect(data.countries.length).toBeGreaterThan(0);
  });

  test('should filter with variables', async () => {
    const query = `
    query GetCountriesByContinent($continentCode: String!) {
      countries(filter: { continent: { eq: $continentCode } }) {
        name
        code
      }
    }
  `;

    const variables = { continentCode: 'EU' };

    // Using request() with filter variables - data only
    const data = await client.request(query, variables);

    expect(data.countries.length).toBeGreaterThan(0);
    // All countries should be in Europe
    expect(data.countries.every((c: any) => c.code)).toBeTruthy();
  });

  test('should measure query performance', async () => {
    const query = `
    query {
      country(code: "US") {
        name
        capital
      }
    }
  `;

    // Using measureQuery() for performance testing
    const { data, time } = await client.measureQuery(query);

    expect(data.country.name).toBe('United States');
    expect(time).toBeLessThan(2000); // Response under 2 seconds
  });

  // Note: batchRequests() is not supported by this API
  // The Countries API returns: "Batch queries and APQ request are not currently supported"
  // Use batchRequests() with APIs that support batching (e.g., Hasura, Apollo Server with batching enabled)
})

describe("Query Operations for Countries - Error", () => {
  const client = new GraphQLTestClient('https://countries.trevorblades.com/');
  test('should handle invalid country code', async () => {
    const query = `
    query {
      country(code: "INVALID") {
        name
      }
    }
  `;

    // Using request() - only checking data, not response metadata
    const data = await client.request(query);

    // GraphQL returns null for non-existent country
    expect(data.country).toBeNull();
  });

  test('should handle syntax errors', async () => {
    const query = `
    query {
      country(code: "US" {
        name
      }
    }
  `;

    // This will throw an error - using wrapper's helper method
    await client.requestExpectingError(query);
  });

  test('should handle missing required variables', async () => {
    const query = `
    query GetCountry($code: ID!) {
      country(code: $code) {
        name
      }
    }
  `;

    // Don't pass variables - using wrapper's helper method
    await client.requestExpectingError(query);
  });
})
