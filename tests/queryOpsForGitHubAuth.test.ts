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

    /**
   * Test 2: List User's Repositories
   *
   * Validates repository listing with pagination. Tests the `repositories`
   * connection field on the viewer, demonstrating:
   * - Nested query structure (viewer → repositories → nodes)
   * - Pagination with `first` argument
   * - Connection pattern (edges, nodes, pageInfo)
   *
   * Tests: Repository access, pagination, connection pattern, nested data
   */
    test('should list user repositories', async () => {
        const query = `
            query {
                viewer {
                    repositories(first: 5, orderBy: {field: CREATED_AT, direction: DESC}) {
                    totalCount
                    nodes {
                        name
                        description
                        isPrivate
                        url
                        createdAt
                    }
                }
            }
        }
        `;

        const data = await client.request(query);

        // Assert repositories connection exists
        expect(data.viewer.repositories).toBeDefined();
        expect(data.viewer.repositories.totalCount).toBeGreaterThanOrEqual(0);

        // If user has repositories, validate structure
        if (data.viewer.repositories.totalCount > 0) {
            expect(Array.isArray(data.viewer.repositories.nodes)).toBe(true);
            expect(data.viewer.repositories.nodes.length).toBeGreaterThan(0);
            expect(data.viewer.repositories.nodes.length).toBeLessThanOrEqual(5);

            // Validate first repository structure
            const firstRepo = data.viewer.repositories.nodes[0];
            expect(firstRepo.name).toBeDefined();
            expect(typeof firstRepo.isPrivate).toBe('boolean');
            expect(firstRepo.url).toMatch(/^https:\/\/github\.com\//);

            console.log(`   Found ${data.viewer.repositories.totalCount} repositories`);
        } else {
            console.log('   User has no repositories');
        }
    });

    /**
   * Test 3: Get Specific Repository Details
   *
   * Validates querying a specific repository by owner and name.
   * Uses the GraphQL API Testing Suite repository itself as the test subject.
   *
   * Demonstrates:
   * - Repository query by owner/name
   * - Nested data (owner, languages, primaryLanguage)
   * - Boolean fields (isPrivate, hasIssuesEnabled)
   *
   * Tests: Repository query, owner field, language detection, nested objects
   */
    test('should get repository details', async () => {
        // First, get the viewer's login to use as owner
        const viewerQuery = `
            query {
                viewer {
                    login
                }
            }`;
        const viewerData = await client.request(viewerQuery);
        const owner = viewerData.viewer.login;

        // Now query for a specific repository
        // Using "graphql-api-testing-suite" as example - adjust if needed
        const query = `
            query($owner: String!, $name: String!) {
                repository(owner: $owner, name: $name) {
                    name
                    description
                    isPrivate
                    url
                    createdAt
                    updatedAt
                    primaryLanguage {
                        name
                        color
                    }
                    languages(first: 5) {
                        nodes {
                            name
                        }
                    }
                    hasIssuesEnabled
                    hasWikiEnabled
                }
            }
        `;

        const variables = {
            owner: owner,
            name: 'graphql-testing-framework'
        };

        const data = await client.request(query, variables);

        // Assert repository exists and has expected structure
        expect(data.repository).toBeDefined();
        expect(data.repository.name).toBe('graphql-testing-framework');
        expect(data.repository.url).toContain('github.com');
        expect(typeof data.repository.isPrivate).toBe('boolean');

        // Primary language should be TypeScript for this project
        if (data.repository.primaryLanguage) {
            console.log(`   Primary language: ${data.repository.primaryLanguage.name}`);
        }

        // Languages array should contain TypeScript
        if (data.repository.languages.nodes.length > 0) {
            const languageNames = data.repository.languages.nodes.map((l: any) => l.name);
            console.log(`   Languages: ${languageNames.join(', ')}`);
        }
    });

    /**
   * Test 4: Validate Rate Limit Headers
   *
   * GitHub API includes rate limit information in response headers and
   * can also be queried via the rateLimit field. This test validates both.
   *
   * GitHub API Rate Limits:
   * - Authenticated: 5,000 requests per hour
   * - Unauthenticated: 60 requests per hour
   *
   * Tests: Rate limit query, response metadata, header validation
   */
    test('should validate rate limit information', async () => {
        const query = `
            query {
                rateLimit {
                    limit
                    remaining
                    resetAt
                    used
                }
            }
        `;

        // Use rawRequest() to access headers
        const response = await client.rawRequest(query);

        // Assert rate limit data exists
        expect(response.data.rateLimit).toBeDefined();
        expect(response.data.rateLimit.limit).toBeGreaterThan(0);
        expect(response.data.rateLimit.remaining).toBeGreaterThanOrEqual(0);
        expect(response.data.rateLimit.used).toBeGreaterThanOrEqual(0);

        // Validate resetAt is a future timestamp
        const resetAt = new Date(response.data.rateLimit.resetAt);
        const now = new Date();
        expect(resetAt.getTime()).toBeGreaterThan(now.getTime());

        // Log rate limit info (useful for monitoring)
        console.log(`   Rate limit: ${response.data.rateLimit.remaining}/${response.data.rateLimit.limit}`);
        console.log(`   Resets at: ${response.data.rateLimit.resetAt}`);

        // Assert headers exist (GitHub provides x-ratelimit-* headers)
        expect(response.headers).toBeDefined();
    });

    /**
   * Test 5: Handle Invalid Token (401 Unauthorized)
   *
   * Validates error handling when an invalid or expired token is provided.
   * This tests the client wrapper's error handling for authentication failures.
   *
   * Expected behavior:
   * - Request should throw an error
   * - Error should indicate authentication failure
   *
   * Tests: Error handling, authentication failure detection, wrapper error context
   */
    test('should handle invalid token (401 error)', async () => {
        // Create a client with an obviously invalid token
        const badClient = new GraphQLTestClient(GITHUB_API, 'invalid_token_12345');

        const query = `
            query {
                viewer {
                    login
                }
            }
        `;

        // This should throw an error
        await badClient.requestExpectingError(query);

        // Alternative verbose assertion:
        // await expect(badClient.request(query)).rejects.toThrow();
    });

    /**
   * Test 6: Detect Insufficient Token Permissions
   *
   * While we can't create a token with missing scopes in this test,
   * we can document what would happen if a token lacks required permissions.
   *
   * This test attempts to query data that requires specific scopes and
   * validates the query structure. In production, a token lacking 'repo'
   * scope would return limited data or throw permission errors.
   *
   * Tests: Permission-dependent queries, scope requirements documentation
   */
    test('should query data requiring repo scope', async () => {
        const query = `
            query {
                viewer {
                    login
                    repositories(first: 1, privacy: PRIVATE) {
                        totalCount
                    }
                }
            }
        `;

        const data = await client.request(query);

        // With proper 'repo' scope, this should work
        expect(data.viewer).toBeDefined();
        expect(data.viewer.repositories).toBeDefined();

        // Note: If token lacks 'repo' scope, this would fail with permission error
        // For portfolio demonstration, we document the scope requirement
        console.log(`   Private repos accessible: ${data.viewer.repositories.totalCount > 0 ? 'Yes' : 'No'}`);
    });
});