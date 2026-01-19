import { GraphQLClient, type RequestOptions, type Variables } from 'graphql-request';

/**
 * GraphQL Test Client Wrapper
 *
 * Wraps graphql-request with additional functionality for testing:
 * - Error handling
 * - Request/response logging (optional)
 * - Authentication support
 * - Response time measurement
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
   * Execute a GraphQL query or mutation
   *
   * @param query - GraphQL query/mutation string
   * @param variables - Query variables (optional)
   * @returns Response data
   *
   * @example
   * const data = await client.request(`
   *   query GetCountry($code: ID!) {
   *     country(code: $code) {
   *       name
   *     }
   *   }
   * `, { code: 'US' });
   */
  async request<T = any>(
    query: string,
    variables?: Variables
  ): Promise<T> {
    try {
      return await this.client.request<T>(query, variables);
    } catch(error) {
      // Re-throw with additional context
      throw this.handleError(error);
    }
  }

  /**
   * Execute a GraphQL query with full response details
   *
   * Returns the complete response including headers, status, and errors
   * Useful for testing response headers, status codes, etc.
   *
   * @param query - GraphQL query/mutation string
   * @param variables - Query variables (optional)
   * @returns Full response object with data, headers, status, errors
   *
   * @example
   * const response = await client.rawRequest(`query { countries { code } }`);
   * console.log(response.status); // 200
   * console.log(response.headers); // Response headers
   * console.log(response.data); // GraphQL data
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
      return await this.client.rawRequest<T>(query, variables);
    } catch (error) {
      // Re-throw with additional context
      throw this.handleError(error);
    }
  }

  /**
   * Execute multiple GraphQL queries in a single request
   *
   * @param requests - Array of query/mutation objects
   * @returns Array of responses
   *
   * @example
   * const [countries, launches] = await client.batchRequests([
   *   { document: getCountriesQuery },
   *   { document: getLaunchesQuery, variables: { limit: 5 } }
   * ]);
   */
  async batchRequests<T = any>(
    requests: Array<{ document: string; variables?: Variables }>
  ): Promise<T[]> {
    try {
      const result = await this.client.batchRequests(requests);
      return result.map((r) => r.data) as T[];
    } catch (error) {
      throw this.handleError(error);
    }
  }
  
  /**
   * Update request headers (e.g., for authentication)
   *
   * @param headers - New headers to set
   *
   * @example
   * client.setHeaders({ 'x-api-key': 'new-key' });
   */
  setHeaders(headers: Record<string, string>): void {
    this.client.setHeaders(headers);
  }

  /**
   * Set authentication token
   *
   * @param token - Bearer token
   *
   * @example
   * client.setAuthToken('ghp_xxxxxxxxxxxxx');
   */
  setAuthToken(token: string): void {
    this.setHeaders({ authorization: `Bearer ${token}` });
  }

  /**
   * Get the endpoint URL
   */
  getEndpoint(): string {
    return this.endpoint;
  }

  /**
   * Measure query execution time
   *
   * @param query - GraphQL query/mutation string
   * @param variables - Query variables (optional)
   * @returns Object with response data and execution time in milliseconds
   *
   * @example
   * const { data, time } = await client.measureQuery(`
   *   query GetCountries {
   *     countries { code name }
   *   }
   * `);
   * console.log(`Query executed in ${time}ms`);
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
      
      // Re-throw with timing information
      const enhancedError = this.handleError(error);
      throw new Error(`${enhancedError.message} (Execution time: ${executionTime}ms)`);
    }
  }

  /**
   * Enhanced error handling
   * Extracts meaningful error messages from GraphQL errors
   */
  private handleError(error: any): Error {
    // GraphQL errors
    if (error.response?.errors) {
      const graphqlErrors = error.response.errors
        .map((e: any) => e.message)
        .join(', ');
      
      return new Error(`GraphQL Error: ${graphqlErrors}`);
    }

    // Network errors
    if (error.request) {
      return new Error(`Network Error: Unable to reach ${this.endpoint}`);
    }

    // Other errors
    return error;
  }
}

/**
 * Helper function to measure query performance
 *
 * @param client - GraphQL test client
 * @param query - GraphQL query string
 * @param variables - Query variables (optional)
 * @returns Object with data and execution duration
 *
 * @example
 * const { data, duration } = await measureQuery(client, query, vars);
 * console.log(`Query took ${duration}ms`);
 */
export async function measureQuery<T = any>(
  client: GraphQLTestClient,
  query: string,
  variables?: Variables
): Promise<{ data: T; duration: number }> {
  const startTime = Date.now();
  const data = await client.request<T>(query, variables);
  const duration = Date.now() - startTime;
  
  return { data, duration };
}
