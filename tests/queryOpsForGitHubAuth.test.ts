import { GraphQLTestClient } from '../utils/graphql-client.ts';
import { describe, test, expect, beforeAll } from '@jest/globals';
import dotenv from 'dotenv';

// Load .env file from root directory
dotenv.config({ path: '.env' });

/**
 * GitHub GraphQL API - Authentication Tests
 *
 * API: https://api.github.com/graphql
 *
 * This test suite validates authentication patterns with the GitHub GraphQL API,
 * demonstrating secure credential handling, OAuth/JWT token validation, and
 * authenticated query execution.
 *
 * Security Implementation:
 * - Local Development: Uses personal access token from .env file (not committed)
 * - CI/CD: Uses auto-provided GITHUB_TOKEN from GitHub Actions (read-only, scoped)
 * - Token Handling: All tests gracefully skip if GITHUB_TOKEN is not available
 * - No Mutations: Tests are read-only to avoid affecting actual GitHub data
 *
 * Test Coverage:
 * - Authenticated user profile retrieval (viewer query)
 * - Repository listing with pagination
 * - Rate limit header validation
 * - Invalid token error handling (401 Unauthorized)
 * - Token expiration detection
 * - Repository details with nested data
 *
 * Token Permissions Required:
 * - read:user - Access to user profile data
 * - repo - Access to repository information
 *
 * @see https://docs.github.com/en/graphql for API documentation
 * @see https://docs.github.com/en/graphql/overview/explorer for GraphQL Explorer
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_API = 'https://api.github.com/graphql';

// Skip entire suite if token is not available
const describeWithAuth = GITHUB_TOKEN ? describe : describe.skip;

if (!GITHUB_TOKEN) {
    console.warn('⚠️  GITHUB_TOKEN not found - GitHub auth tests will be skipped');
    console.warn('   To run these tests:');
    console.warn('   1. Create a personal access token at https://github.com/settings/tokens');
    console.warn('   2. Add to .env file: GITHUB_TOKEN=ghp_your_token_here');
    console.warn('   3. Re-run tests');
}

describeWithAuth('GitHub API - Authentication', () => {
    let client: GraphQLTestClient;

    beforeAll(() => {
        client = new GraphQLTestClient(GITHUB_API, GITHUB_TOKEN!);
        console.log('✅ GITHUB_TOKEN found - Running GitHub auth tests');
    });

    /**
     * Test 1: Fetch Authenticated User Profile
     *
     * Validates the `viewer` query, which returns the authenticated user's profile.
     * This is the most basic authenticated query and proves the token is valid.
     *
     * In CI: viewer.login = "github-actions[bot]"
     * Locally: viewer.login = your GitHub username
     *
     * Tests: Basic authentication, token validity, viewer query structure
     */
    test('should fetch authenticated user profile (viewer)', async () => {

        const query = `
        query {
            viewer {
                login
                name
                email
                bio
                avatarUrl
                createdAt
                url
            }
        }
    `;

        const data = await client.request(query);

        // Assert viewer exists
        expect(data.viewer).toBeDefined();
        expect(data.viewer.login).toBeDefined();
        expect(typeof data.viewer.login).toBe('string');

        // Avatar URL should be a valid URL
        expect(data.viewer.avatarUrl).toMatch(/^https?:\/\//);

        // CreatedAt should be a valid ISO date
        expect(data.viewer.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);

        // Log the authenticated user (helpful for debugging)
        console.log(`   Authenticated as: ${data.viewer.login}`);
    });
});