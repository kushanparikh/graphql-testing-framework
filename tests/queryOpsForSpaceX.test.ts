import { GraphQLTestClient } from '../utils/graphql-client.ts';
import { describe, expect, jest, test } from '@jest/globals';

// The SpaceX endpoint sometimes stalls for ~20 s before responding.
// Jest's 5 s default aborts those tests, so allow more time per test.
jest.setTimeout(30_000);

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
 * KNOWN UPSTREAM OUTAGE (negative-scenario mode)
 * The gateway currently fails because its upstream (api.spacexdata.com)
 * returns an HTML error page. The gateway replies HTTP 200 with
 * `launches: null` and an INTERNAL_SERVER_ERROR. These tests assert that
 * failure so CI stays green while the outage lasts.
 *
 * If one of these tests FAILS, the upstream has recovered. Restore the
 * positive assertions (data returned, length checked) and delete this note.
 *
 * @see https://studio.apollographql.com/public/SpaceX-pxxbxen/home for schema explorer
 */

const UPSTREAM_OUTAGE = /invalid json response body at https:\/\/api\.spacexdata\.com/;

describe("Query Operations for SpaceX", () => {
    const client = new GraphQLTestClient('https://spacex-production.up.railway.app/');

    test("[KNOWN OUTAGE] launches query fails with upstream error (fails when upstream recovers)", async () => {
        const query = `
            query{
                launches (limit: 5) {
                    mission_name
                    launch_date_utc
                }
            }
        `;

        // Negative scenario: expect the gateway to surface the upstream failure.
        // A success here means the SpaceX upstream has recovered.
        await expect(client.request(query)).rejects.toThrow(UPSTREAM_OUTAGE);
    });

    test("[KNOWN OUTAGE] metadata query fails with upstream error (fails when upstream recovers)", async () => {
        const query = `
            query{
                launches (limit: 1) {
                    mission_name
                }
            }
        `;

        // Negative scenario: rawRequest() surfaces the same upstream failure.
        await expect(client.rawRequest(query)).rejects.toThrow(UPSTREAM_OUTAGE);
    });

    // Note: batchRequests() is not supported by this API
    // The SpaceX API returns: "Operation batching disabled."
    // Use batchRequests() with APIs that support batching (e.g., Hasura with batching enabled)
})
