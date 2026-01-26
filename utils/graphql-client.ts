import { GraphQLClient, type Variables } from 'graphql-request';
import { expect } from '@jest/globals';

/**
 * GraphQL Test Client Wrapper
 *
 * Provides a comprehensive testing interface for GraphQL APIs with:
 * - Multiple request methods for different testing needs
 * - Automatic test validations (status, content-type)
 * - Enhanced error handling with context
 * - Performance measurement utilities
 * - Flexible authentication support
 * - Batch request capabilities
 */
export class GraphQLTestClient {
  private client: GraphQLClient;
  private endpoint: string;

  /**
   * Create a new GraphQL test client
   *
   * @param endpoint - GraphQL API endpoint URL
   * @param token - Optional authentication token (Bearer)
   * @param headers - Optional custom headers
   */
  constructor(endpoint: string, token?: string, headers?: Record<string, string>) {
    this.endpoint = endpoint;
    const clientHeaders = {
      ...headers,
    };
    
    // Add authentication header if token is provided
    if (token) {
      clientHeaders.Authorization = `Bearer ${token}`;
    }
    
    this.client = new GraphQLClient(endpoint, { headers: clientHeaders });
  }

  /**
   * Execute a GraphQL query or mutation - returns data only
   *
   * Use for 90% of tests where you just need the data.
   * Automatically handles errors with enhanced context.
   *
   * @param query - GraphQL query/mutation string
   * @param variables - Query variables (optional)
   * @returns Response data
   *
   * @example
   * const data = await client.request<CountryResponse>(query, { code: 'US' });
   * expect(data.country.name).toBe('United States');
   */
  async request<T = any>(
    query: string,
    variables?: Variables
  ): Promise<T> {
    try {
      return await this.client.request<T>(query, variables);
    } catch (error) {
      throw this.enhanceError(error, query, variables);
    }
  }

  /**
   * Execute a GraphQL query with full response details
   *
   * Returns complete response with automatic test validations:
   * - Validates 200 status code
   * - Validates JSON content-type
   * - Includes headers, status, data, errors
   *
   * Use for performance tests, header validation, or when you need
   * more than just the data.
   *
   * @param query - GraphQL query/mutation string
   * @param variables - Query variables (optional)
   * @returns Full response object with data, headers, status, errors
   *
   * @example
   * const response = await client.rawRequest(query);
   * expect(response.status).toBe(200); // Already validated
   * expect(response.data.countries).toHaveLength(5);
   */
  async rawRequest<T = any>(
    query: string,
    variables?: Variables
  ): Promise<{
    data: T;
    errors?: any[];
    extensions?: any;
    headers: Headers;
    status: number;
  }> {
    try {
      const response = await this.client.rawRequest<T>(query, variables);
      
      // Automatic validations that every test needs
      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toMatch(/application\/(json|graphql-response\+json)/);
      
      return response;
    } catch (error) {
      throw this.enhanceError(error, query, variables);
    }
  }

  /**
   * Execute a query/mutation expecting it to fail
   *
   * Convenient helper for negative testing scenarios.
   * Asserts that the request throws an error.
   *
   * @param query - GraphQL query/mutation string
   * @param variables - Query variables (optional)
   *
   * @example
   * // Test invalid syntax
   * await client.requestExpectingError(malformedQuery);
   *
   * // Test with variables
   * await client.requestExpectingError(query, { code: 'INVALID' });
   */
  async requestExpectingError(
    query: string,
    variables?: Variables
  ): Promise<void> {
    await expect(
      this.client.request(query, variables)
    ).rejects.toThrow();
  }

  /**
   * Measure query execution time with high precision
   *
   * Returns both the data and execution time in milliseconds.
   * Uses performance.now() for sub-millisecond precision.
   *
   * @param query - GraphQL query/mutation string
   * @param variables - Query variables (optional)
   * @returns Object with data and time in milliseconds
   *
   * @example
   * const { data, time } = await client.measureQuery(query);
   * expect(time).toBeLessThan(500); // Assert performance
   * expect(data.countries).toBeDefined(); // Assert data
   */
  async measureQuery<T = any>(
    query: string,
    variables?: Variables
  ): Promise<{ data: T; time: number }> {
    const startTime = performance.now();
    
    try {
      const data = await this.request<T>(query, variables);
      const endTime = performance.now();
      const executionTime = Math.round((endTime - startTime) * 100) / 100;
      
      return { data, time: executionTime };
    } catch (error) {
      const endTime = performance.now();
      const executionTime = Math.round((endTime - startTime) * 100) / 100;
      
      // Include timing in error for debugging slow failures
      const enhancedError = this.enhanceError(error, query, variables);
      throw new Error(`${enhancedError.message} (Execution time: ${executionTime}ms)`);
    }
  }

  /**
   * Execute multiple GraphQL queries in a single request
   *
   * Efficient for testing multiple independent queries together.
   * Returns array of responses in the same order as requests.
   *
   * @param requests - Array of query/mutation objects
   * @returns Array of response data
   *
   * @example
   * const [countries, launches] = await client.batchRequests([
   *   { document: getCountriesQuery },
   *   { document: getLaunchesQuery, variables: { limit: 5 } }
   * ]);
   * expect(countries.countries).toBeDefined();
   * expect(launches.launches).toHaveLength(5);
   */
  async batchRequests<T = any>(
    requests: Array<{ document: string; variables?: Variables }>
  ): Promise<T[]> {
    try {
      const result = await this.client.batchRequests(requests);
      return result.map((r) => r.data) as T[];
    } catch (error) {
      throw this.enhanceError(error, 'Batch request', undefined);
    }
  }

  /**
   * Update request headers dynamically
   *
   * Useful for testing different authentication states or
   * updating headers between test scenarios.
   *
   * @param headers - New headers to set
   *
   * @example
   * // Add API key
   * client.setHeaders({ 'x-api-key': 'test-key-123' });
   *
   * // Update multiple headers
   * client.setHeaders({
   *   'x-request-id': 'test-123',
   *   'x-client-version': '1.0.0'
   * });
   */
  setHeaders(headers: Record<string, string>): void {
    this.client.setHeaders(headers);
  }

  /**
   * Set or update authentication token
   *
   * Convenience method for auth testing scenarios.
   * Updates the Authorization header with Bearer token.
   *
   * @param token - Bearer token (without 'Bearer ' prefix)
   *
   * @example
   * // Set initial token
   * client.setAuthToken('ghp_xxxxxxxxxxxxx');
   *
   * // Test with expired token
   * client.setAuthToken('expired_token_123');
   * await expect(client.request(query)).rejects.toThrow();
   */
  setAuthToken(token: string): void {
    this.setHeaders({ Authorization: `Bearer ${token}` });
  }

  /**
   * Get the current endpoint URL
   *
   * @returns GraphQL endpoint URL
   */
  getEndpoint(): string {
    return this.endpoint;
  }

  /**
   * Enhanced error handling with detailed context
   *
   * Extracts meaningful information from errors and adds:
   * - Endpoint URL
   * - Query snippet (first 150 chars)
   * - Variables used
   * - Original error message
   *
   * @private
   */
  private enhanceError(error: any, query: string, variables?: Variables): Error {
    // Extract GraphQL error messages
    if (error.response?.errors) {
      const graphqlErrors = error.response.errors
        .map((e: any) => e.message)
        .join(', ');
      
      return new Error(
        `GraphQL Error at ${this.endpoint}\n` +
        `Query: ${query.substring(0, 150)}...\n` +
        `Variables: ${JSON.stringify(variables)}\n` +
        `Errors: ${graphqlErrors}`
      );
    }

    // Network/request errors
    if (error.request) {
      return new Error(
        `Network Error: Unable to reach ${this.endpoint}\n` +
        `Query: ${query.substring(0, 150)}...\n` +
        `Variables: ${JSON.stringify(variables)}`
      );
    }

    // Preserve original error with context
    const enhancedError = new Error(
      `Request failed at ${this.endpoint}\n` +
      `Query: ${query.substring(0, 150)}...\n` +
      `Variables: ${JSON.stringify(variables)}\n` +
      `Original error: ${error.message}`
    );
    enhancedError.stack = error.stack;
    
    return enhancedError;
  }
}

/**
 * Standalone helper to measure query performance
 *
 * Alternative to client.measureQuery() for cases where you
 * want to measure an existing client without modifying it.
 *
 * @param client - GraphQL test client instance
 * @param query - GraphQL query string
 * @param variables - Query variables (optional)
 * @returns Object with data and duration in milliseconds
 *
 * @example
 * const { data, duration } = await measureQueryPerformance(client, query);
 * console.log(`Query took ${duration}ms`);
 * expect(duration).toBeLessThan(1000);
 */
export async function measureQueryPerformance<T = any>(
  client: GraphQLTestClient,
  query: string,
  variables?: Variables
): Promise<{ data: T; duration: number }> {
  const { data, time } = await client.measureQuery<T>(query, variables);
  return { data, duration: time };
}