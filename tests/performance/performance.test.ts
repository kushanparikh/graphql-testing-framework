import { GraphQLTestClient } from '../../utils/graphql-client.ts';
import { describe, expect, test } from '@jest/globals';

/**
 * Performance Tests
 *
 * This test suite benchmarks query execution times across both GraphQL APIs,
 * establishing performance baselines and comparing simple vs. complex queries.
 *
 * Test Coverage:
 * - Simple query response times
 * - Large dataset query performance
 * - Paginated query performance at different page sizes
 * - Comparative benchmarks (simple vs. nested queries)
 *
 * All tests use measureQuery() to track execution time and assert against
 * reasonable response time thresholds.
 */

describe("Performance – Countries API", () => {
  const client = new GraphQLTestClient('https://countries.trevorblades.com/');

  test('simple query completes under 2 s', async () => {
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

  test('large dataset query completes under 3 s', async () => {
    const query = `
    query {
      countries {
        code
        name
        capital
      }
    }
  `;

    // Fetch all countries without filter
    const { data, time } = await client.measureQuery(query);

    expect(Array.isArray(data.countries)).toBe(true);
    expect(data.countries.length).toBeGreaterThan(200); // Verify it's a large dataset
    expect(time).toBeLessThan(3000); // Response under 3 seconds
  });

  test('simple vs nested query comparison', async () => {
    // Simple query - flat fields only
    const simpleQuery = `
    query {
      country(code: "US") {
        code
        name
      }
    }
  `;

    // Nested query - includes relationships
    const nestedQuery = `
    query {
      country(code: "US") {
        code
        name
        continent {
          code
          name
        }
        languages {
          code
          name
        }
      }
    }
  `;

    // Measure both queries
    const { data: simpleData, time: simpleTime } = await client.measureQuery(simpleQuery);
    const { data: nestedData, time: nestedTime } = await client.measureQuery(nestedQuery);

    // Log the comparison for portfolio visibility
    console.log(`Simple query: ${simpleTime}ms`);
    console.log(`Nested query: ${nestedTime}ms`);
    console.log(`Difference: ${nestedTime - simpleTime}ms`);

    // Both should complete successfully
    expect(simpleData.country.name).toBe('United States');
    expect(nestedData.country.name).toBe('United States');
    expect(nestedData.country.continent.name).toBe('North America');

    // Nested query should still be under 3 seconds
    expect(nestedTime).toBeLessThan(3000);
  });
});

describe("Performance – SpaceX API", () => {
  const client = new GraphQLTestClient('https://spacex-production.up.railway.app/');

  test('paginated query (5) completes under 3 s', async () => {
    const query = `
    query {
      launches(limit: 5) {
        mission_name
        launch_date_utc
      }
    }
  `;

    // Using measureQuery() - returns data and execution time
    const { data, time } = await client.measureQuery(query);

    expect(data.launches).toHaveLength(5);
    expect(time).toBeLessThan(3000); // Response under 3 seconds
  });

  test('large paginated query (100) completes under 5 s', async () => {
    const query = `
    query {
      launches(limit: 100) {
        mission_name
        launch_date_utc
        launch_success
        rocket {
          rocket_name
        }
      }
    }
  `;

    // Stress test with larger page size
    const { data, time } = await client.measureQuery(query);

    expect(data.launches).toHaveLength(100);
    expect(time).toBeLessThan(5000); // Response under 5 seconds
  });
});
