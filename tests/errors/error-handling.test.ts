import { GraphQLTestClient } from '../../utils/graphql-client.ts';
import { describe, expect, test } from '@jest/globals';

/**
 * Error Handling Tests
 *
 * This test suite validates error handling across both GraphQL APIs,
 * ensuring consistent behavior for invalid inputs, malformed queries,
 * and type violations.
 *
 * Test Coverage:
 * - Invalid arguments returning null (data-level errors)
 * - Syntax errors in query strings
 * - Missing required variables
 * - Non-existent fields (schema validation)
 * - Invalid variable types (type checking)
 */

describe("Error Handling – Countries API", () => {
  const client = new GraphQLTestClient('https://countries.trevorblades.com/');

  test('invalid country code returns null', async () => {
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

  test('syntax error throws', async () => {
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

  test('missing required variable throws', async () => {
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

  test('non-existent field throws', async () => {
    const query = `
    query {
      country(code: "US") {
        name
        population
      }
    }
  `;

    // 'population' field doesn't exist on Country type
    await client.requestExpectingError(query);
  });

  test('invalid variable type returns null', async () => {
    const query = `
    query GetCountry($code: ID!) {
      country(code: $code) {
        name
      }
    }
  `;

    const variables = { code: 123 }; // Numeric instead of string

    // GraphQL servers may coerce numeric types to ID
    // The Countries API accepts this and returns null for non-existent code
    const data = await client.request(query, variables);
    expect(data.country).toBeNull();
  });
});

describe("Error Handling – SpaceX API", () => {
  const client = new GraphQLTestClient('https://spacex-production.up.railway.app/');

  test('non-existent field throws', async () => {
    const query = `
    query {
      launches(limit: 1) {
        mission_name
        mission_duration
      }
    }
  `;

    // 'mission_duration' field doesn't exist on Launch type
    await client.requestExpectingError(query);
  });

  test('invalid limit type throws', async () => {
    const query = `
    query GetLaunches($limit: Int) {
      launches(limit: $limit) {
        mission_name
      }
    }
  `;

    const variables = { limit: "five" }; // String instead of Int

    // Server should reject invalid type
    await client.requestExpectingError(query, variables);
  });
});
