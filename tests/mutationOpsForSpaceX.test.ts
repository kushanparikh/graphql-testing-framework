import { GraphQLTestClient } from '../utils/graphql-client.ts';
import { describe, expect, test } from '@jest/globals';

/**
 * SpaceX API Mutation Tests
 *
 * Note: The SpaceX public GraphQL API (https://spacex-production.up.railway.app/)
 * has mutations in its schema (insert_users, update_users, delete_users) but they
 * return null, indicating mutations are disabled for public access.
 *
 * These tests demonstrate the correct mutation syntax for Hasura-style GraphQL APIs
 * and verify the API's behavior when mutations are attempted.
 */
describe("Mutation Operations for SpaceX", () => {
    const client = new GraphQLTestClient('https://spacex-production.up.railway.app/');

    test("insert_users mutation returns null (mutations disabled)", async () => {
        const mutation = `
            mutation InsertUser($name: String!, $rocket: String!) {
                insert_users(objects: { name: $name, rocket: $rocket }) {
                    returning {
                        id
                        name
                        rocket
                    }
                }
            }
        `;
        const variables = {
            name: "Test User",
            rocket: "Falcon 9"
        };

        // Using request() - only checking data, mutations return null on this API
        const data = await client.request(mutation, variables);

        expect(data.insert_users).toBeNull();
    });

    test("update_users mutation returns null (mutations disabled)", async () => {
        const mutation = `
            mutation UpdateUser($name: String!) {
                update_users(where: { name: { _eq: "nonexistent" } }, _set: { name: $name }) {
                    affected_rows
                }
            }
        `;
        const variables = {
            name: "Updated Name"
        };

        // Using request() - only checking data
        const data = await client.request(mutation, variables);

        expect(data.update_users).toBeNull();
    });

    test("delete_users mutation returns null (mutations disabled)", async () => {
        const mutation = `
            mutation DeleteUser {
                delete_users(where: { name: { _eq: "nonexistent" } }) {
                    affected_rows
                }
            }
        `;

        // Using request() - only checking data
        const data = await client.request(mutation);

        expect(data.delete_users).toBeNull();
    });
});
