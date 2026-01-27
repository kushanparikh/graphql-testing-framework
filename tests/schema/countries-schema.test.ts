import { GraphQLTestClient } from '../../utils/graphql-client.ts';
import {
  getSchemaTypes,
  getTypeDetails,
  getAvailableQueries,
  type TypeDetails,
} from '../../utils/schema-introspection.ts';
import { describe, expect, test, beforeAll } from '@jest/globals';

/**
 * Countries API Schema Validation Tests
 *
 * API: https://countries.trevorblades.com/
 *
 * This test suite validates the GraphQL schema structure of the Countries API
 * using introspection queries. Schema validation ensures:
 * - Expected types exist in the schema
 * - Types have the correct fields
 * - Fields have correct types (ID, String, Object, Array)
 * - Required vs optional fields are correct
 * - Relationships between types are properly defined
 *
 * Note: Tests are optimized to minimize API calls by fetching type details
 * once per describe block and reusing the cached data for assertions.
 *
 * Test Coverage:
 * - Type existence (Country, Continent, Language, State, Query)
 * - Field presence on each type
 * - Field type validation (scalar types, object types, arrays)
 * - Required/optional field validation
 * - Query operation availability
 * - Nested relationship validation
 *
 * @see https://countries.trevorblades.com/ for API documentation
 */

describe('Countries API Schema', () => {
  let client: GraphQLTestClient;
  let schemaTypes: string[];
  let countryType: TypeDetails | null;
  let continentType: TypeDetails | null;
  let languageType: TypeDetails | null;
  let stateType: TypeDetails | null;
  let queryType: TypeDetails | null;

  // Fetch all schema data once before all tests
  beforeAll(async () => {
    client = new GraphQLTestClient('https://countries.trevorblades.com/');

    // Fetch all needed data in parallel to minimize API calls
    const [types, country, continent, language, state, query] = await Promise.all([
      getSchemaTypes(client),
      getTypeDetails(client, 'Country'),
      getTypeDetails(client, 'Continent'),
      getTypeDetails(client, 'Language'),
      getTypeDetails(client, 'State'),
      getTypeDetails(client, 'Query'),
    ]);

    schemaTypes = types;
    countryType = country;
    continentType = continent;
    languageType = language;
    stateType = state;
    queryType = query;
  });

  // Helper to get field info from cached type details
  const getField = (type: TypeDetails | null, fieldName: string) => {
    return type?.fields?.find((f) => f.name === fieldName) || null;
  };

  describe('Type Existence', () => {
    test('should have all expected object types', () => {
      expect(schemaTypes).toContain('Country');
      expect(schemaTypes).toContain('Continent');
      expect(schemaTypes).toContain('Language');
      expect(schemaTypes).toContain('State');
      expect(schemaTypes).toContain('Subdivision');
    });

    test('should have Query type', () => {
      expect(schemaTypes).toContain('Query');
    });

    test('should have input object types for filtering', () => {
      expect(schemaTypes).toContain('StringQueryOperatorInput');
      expect(schemaTypes).toContain('CountryFilterInput');
      expect(schemaTypes).toContain('ContinentFilterInput');
      expect(schemaTypes).toContain('LanguageFilterInput');
    });

    test('Country should be an OBJECT type', () => {
      expect(countryType?.kind).toBe('OBJECT');
    });
  });

  describe('Country Type', () => {
    test('Country type should have all expected fields', () => {
      const fields = countryType?.fields?.map((f) => f.name) || [];

      expect(fields).toContain('code');
      expect(fields).toContain('name');
      expect(fields).toContain('native');
      expect(fields).toContain('phone');
      expect(fields).toContain('capital');
      expect(fields).toContain('currency');
      expect(fields).toContain('emoji');
      expect(fields).toContain('emojiU');
      expect(fields).toContain('continent');
      expect(fields).toContain('languages');
      expect(fields).toContain('states');
      expect(fields).toContain('subdivisions');
    });

    test('Country.code should be a required ID type', () => {
      const field = getField(countryType, 'code');

      expect(field).not.toBeNull();
      expect(field?.type).toBe('ID');
      expect(field?.isRequired).toBe(true);
      expect(field?.isArray).toBe(false);
    });

    test('Country.name should be a required String type', () => {
      const field = getField(countryType, 'name');

      expect(field).not.toBeNull();
      expect(field?.type).toBe('String');
      expect(field?.isRequired).toBe(true);
    });

    test('Country.capital should be an optional String type', () => {
      const field = getField(countryType, 'capital');

      expect(field).not.toBeNull();
      expect(field?.type).toBe('String');
      expect(field?.isRequired).toBe(false);
    });

    test('Country.continent should be a required Continent object', () => {
      const field = getField(countryType, 'continent');

      expect(field).not.toBeNull();
      expect(field?.type).toBe('Continent');
      expect(field?.isRequired).toBe(true);
      expect(field?.isArray).toBe(false);
    });

    test('Country.languages should be a required array of Language', () => {
      const field = getField(countryType, 'languages');

      expect(field).not.toBeNull();
      expect(field?.type).toBe('Language');
      expect(field?.isRequired).toBe(true);
      expect(field?.isArray).toBe(true);
    });

    test('Country.states should be a required array of State', () => {
      const field = getField(countryType, 'states');

      expect(field).not.toBeNull();
      expect(field?.type).toBe('State');
      expect(field?.isRequired).toBe(true);
      expect(field?.isArray).toBe(true);
    });
  });

  describe('Continent Type', () => {
    test('Continent type should have all expected fields', () => {
      const fields = continentType?.fields?.map((f) => f.name) || [];

      expect(fields).toContain('code');
      expect(fields).toContain('name');
      expect(fields).toContain('countries');
    });

    test('Continent.code should be a required ID type', () => {
      const field = getField(continentType, 'code');

      expect(field).not.toBeNull();
      expect(field?.type).toBe('ID');
      expect(field?.isRequired).toBe(true);
    });

    test('Continent.countries should be a required array of Country', () => {
      const field = getField(continentType, 'countries');

      expect(field).not.toBeNull();
      expect(field?.type).toBe('Country');
      expect(field?.isRequired).toBe(true);
      expect(field?.isArray).toBe(true);
    });
  });

  describe('Language Type', () => {
    test('Language type should have all expected fields', () => {
      const fields = languageType?.fields?.map((f) => f.name) || [];

      expect(fields).toContain('code');
      expect(fields).toContain('name');
      expect(fields).toContain('native');
      expect(fields).toContain('rtl');
    });

    test('Language.code should be a required ID type', () => {
      const field = getField(languageType, 'code');

      expect(field).not.toBeNull();
      expect(field?.type).toBe('ID');
      expect(field?.isRequired).toBe(true);
    });

    test('Language.rtl should be a required Boolean type', () => {
      const field = getField(languageType, 'rtl');

      expect(field).not.toBeNull();
      expect(field?.type).toBe('Boolean');
      expect(field?.isRequired).toBe(true);
    });
  });

  describe('Query Operations', () => {
    test('should have all expected query operations', () => {
      const queries = queryType?.fields?.map((f) => f.name) || [];

      expect(queries).toContain('country');
      expect(queries).toContain('countries');
      expect(queries).toContain('continent');
      expect(queries).toContain('continents');
      expect(queries).toContain('language');
      expect(queries).toContain('languages');
    });

    test('country query should return Country type', () => {
      const field = getField(queryType, 'country');

      expect(field).not.toBeNull();
      expect(field?.type).toBe('Country');
      expect(field?.isArray).toBe(false);
    });

    test('countries query should return array of Country', () => {
      const field = getField(queryType, 'countries');

      expect(field).not.toBeNull();
      expect(field?.type).toBe('Country');
      expect(field?.isArray).toBe(true);
    });

    test('continents query should return array of Continent', () => {
      const field = getField(queryType, 'continents');

      expect(field).not.toBeNull();
      expect(field?.type).toBe('Continent');
      expect(field?.isArray).toBe(true);
    });
  });

  describe('Nested Relationships', () => {
    test('Country → Continent relationship exists', () => {
      const countryFields = countryType?.fields?.map((f) => f.name) || [];
      const continentFields = continentType?.fields?.map((f) => f.name) || [];

      // Country has continent field
      expect(countryFields).toContain('continent');

      // Continent has countries field (reverse relationship)
      expect(continentFields).toContain('countries');
    });

    test('Country → Language relationship exists', () => {
      const countryFields = countryType?.fields?.map((f) => f.name) || [];
      const field = getField(countryType, 'languages');

      expect(countryFields).toContain('languages');
      expect(field?.type).toBe('Language');
      expect(field?.isArray).toBe(true);
    });

    test('Country → State relationship exists', () => {
      const countryFields = countryType?.fields?.map((f) => f.name) || [];
      const stateFields = stateType?.fields?.map((f) => f.name) || [];

      expect(countryFields).toContain('states');
      expect(stateFields).toContain('country');
    });
  });
});
