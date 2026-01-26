import { GraphQLTestClient } from '../../utils/graphql-client.js';
import { describe, expect, test } from '@jest/globals';

/**
 * SpaceX API Query Tests
 *
 * API: https://spacex-production.up.railway.app/
 *
 * This test suite demonstrates GraphQL query operations against the SpaceX
 * GraphQL API, which provides data about SpaceX launches, rockets, and missions.
 *
 * The API is built with Hasura and exposes a rich schema including:
 * - launches: Historical launch data with mission details
 * - rockets: Rocket specifications and capabilities
 * - capsules: Capsule information
 * - launchpads: Launch site data
 *
 * Test Coverage:
 * - Paginated queries with limit argument
 * - Field selection on complex types
 *
 * @see https://studio.apollographql.com/public/SpaceX-pxxbxen/home for schema explorer
 */

describe("Query Operations for SpaceX - Success", () => {
    const client = new GraphQLTestClient('https://spacex-production.up.railway.app/');

    test("should fetch launches with data only", async () => {
        const query = `
            query{
                launches (limit: 5) {
                    mission_name
                    launch_date_utc
                }
            }
        `;

        // Using request() - returns data only, most common use case
        const data = await client.request(query);

        expect(data.launches).toHaveLength(5);
    });

    test("should access response metadata", async () => {
        const query = `
            query{
                launches (limit: 1) {
                    mission_name
                }
            }
        `;

        // Using rawRequest() - when you need headers, status, etc.
        const response = await client.rawRequest(query);

        // Wrapper already validated status=200 and content-type
        expect(response.headers).toBeDefined();
        expect(response.data.launches).toHaveLength(1);
    });

    test("should measure query performance", async () => {
        const query = `
            query{
                launches (limit: 5) {
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

    // Note: batchRequests() is not supported by this API
    // The SpaceX API returns: "Operation batching disabled."
    // Use batchRequests() with APIs that support batching (e.g., Hasura with batching enabled)
})