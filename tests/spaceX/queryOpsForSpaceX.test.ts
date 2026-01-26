import { GraphQLClient } from 'graphql-request';
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
    const client = new GraphQLClient('https://spacex-production.up.railway.app/');

    test("should fetch launches", async () => {
        const query = `
            query{
                launches (limit: 5) {
                    mission_name
                    launch_date_utc
                }
            }
        `;

        const response = await client.rawRequest(query);

        expect(response.status).toBe(200);
        expect(response.data.launches).toHaveLength(5);
    })
})