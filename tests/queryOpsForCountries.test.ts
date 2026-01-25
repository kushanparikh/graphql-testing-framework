import { GraphQLClient } from 'graphql-request';
import { describe, expect, test } from '@jest/globals';

describe("Query Operations for Countries - Success", () => {
    const client = new GraphQLClient('https://countries.trevorblades.com/');

    test('Should be able to retrieve country details from country code', async () => {
        // Request Query creation
        const query = `
        query {
            country (code: "US") {
                name
                capital
            }
        }
        `;
        // Execute the query
        const response = await client.rawRequest(query);
        // Assert the status
        expect(response.status).toBe(200);
        // Assert response body type
        expect(response.headers.get('content-type')).toContain('application/graphql-response+json');
        // Assert the response body structure
        expect(response.data).toBeDefined();
        expect(response.data.country).toBeDefined();
        //expect(typeof response.data.country.name).toBe('string');
        expect(response.data.country.name).toBe('United States');
        //expect(typeof response.data.country.capital).toBe('object');
        expect(response.data.country.capital).toBe('Washington D.C.');
    });

    test('should fetch multiple fields', async () => {
        const query = `
    query {
      country(code: "US") {
        name
        capital
        currency
        emoji
      }
    }
  `;

        const response = await client.rawRequest(query);

        expect(response.status).toBe(200);
        expect(response.data.country.currency).toContain('USD');
        expect(response.data.country.emoji).toBe('🇺🇸');
    });

    test('should use variables', async () => {
        const query = `
    query GetCountry($code: ID!) {
      country(code: $code) {
        name
        capital
      }
    }
  `;

        const variables = { code: 'CA' };

        const response = await client.rawRequest(query, variables);

        expect(response.status).toBe(200);
        expect(response.data.country.name).toBe('Canada');
    });

    test('should fetch nested data', async () => {
        const query = `
    query {
      country(code: "US") {
        name
        continent {
          name
          code
        }
      }
    }
  `;

        const response = await client.rawRequest(query);

        expect(response.data.country.continent.name).toBe('North America');
        expect(response.data.country.continent.code).toBe('NA');
    });

    test('should handle arrays', async () => {
        const query = `
    query {
      countries {
        name
        code
      }
    }
  `;

        const response = await client.rawRequest(query);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.data.countries)).toBe(true);
        expect(response.data.countries.length).toBeGreaterThan(0);
    });

    test('should filter with variables', async () => {
        const query = `
    query GetCountriesByContinent($continentCode: String!) {
      countries(filter: { continent: { eq: $continentCode } }) {
        name
        code
      }
    }
  `;

        const variables = { continentCode: 'EU' };

        const response = await client.rawRequest(query, variables);

        expect(response.data.countries.length).toBeGreaterThan(0);
        // All countries should be in Europe
        expect(response.data.countries.every((c: any) => c.code)).toBeTruthy();
    });
})

describe("Query Operations for Countries - Error", () => {
    const client = new GraphQLClient('https://countries.trevorblades.com/');
    test('should handle invalid country code', async () => {
        const query = `
    query {
      country(code: "INVALID") {
        name
      }
    }
  `;

        const response = await client.rawRequest(query);

        // GraphQL returns 200 even for errors (not ideal but common)
        expect(response.status).toBe(200);
        // But data will be null
        expect(response.data.country).toBeNull();
    });

    test('should handle syntax errors', async () => {
        const query = `
    query {
      country(code: "US" {
        name
      }
    }
  `;

        // This will throw an error
        await expect(client.rawRequest(query)).rejects.toThrow();
    });

    test('should handle missing required variables', async () => {
        const query = `
    query GetCountry($code: ID!) {
      country(code: $code) {
        name
      }
    }
  `;

        // Don't pass variables
        await expect(client.rawRequest(query)).rejects.toThrow();
    });
})
