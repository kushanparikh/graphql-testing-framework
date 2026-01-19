import { GraphQLTestClient } from '../../utils/graphql-client.js';
import { describe, before, it } from 'node:test';
import { expect } from 'expect';

const COUNTRIES_API = 'https://countries.trevorblades.com/';

describe('Countries API - Basic Queries', () => {
  let client: GraphQLTestClient;
  
  before(() => {
    client = new GraphQLTestClient(COUNTRIES_API);
  });

  it('should fetch all countries', async () => {
    const query = `
      query {
        countries {
          code
          name
          capital
          currency
        }
      }
    `;
    
    const result = await client.request(query);
    
    expect(result.countries).toBeDefined();
    expect(result.countries.length).toBeGreaterThan(0);
    expect(result.countries[0].code).toBeDefined();
    expect(result.countries[0].name).toBeDefined();
    expect(result.countries[0].capital).toBeDefined();
    expect(result.countries[0].currency).toBeDefined();
  });

  it('should fetch country by code with variables', async () => {
    const query = `
      query GetCountry($code: ID!) {
        country(code: $code) {
          code
          name
          capital
        }
      }
    `;
    
    const variables = { code: 'US' };
    const data = await client.request(query, variables);
    
    expect(data.country).toBeDefined();
    expect(data.country.code).toBe('US');
    expect(data.country.name).toBeDefined();
    expect(data.country.capital).toBeDefined();
  });
});