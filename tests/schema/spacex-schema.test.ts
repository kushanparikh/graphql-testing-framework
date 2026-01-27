import { GraphQLTestClient } from '../../utils/graphql-client.js';
import {
  getSchemaTypes,
  getTypeDetails,
  TypeDetails,
} from '../../utils/schema-introspection.js';
import { describe, expect, test, beforeAll } from '@jest/globals';

/**
 * SpaceX API Schema Validation Tests
 *
 * API: https://spacex-production.up.railway.app/
 *
 * This test suite validates the GraphQL schema structure of the SpaceX API
 * using introspection queries. The SpaceX API is built on Hasura and provides
 * data about SpaceX launches, rockets, capsules, and more.
 *
 * Note: Tests are optimized to minimize API calls by fetching type details
 * once per describe block and reusing the cached data for assertions.
 *
 * Test Coverage:
 * - Type existence (Launch, Rocket, Capsule, etc.)
 * - Field presence on each type
 * - Field type validation (scalar types, object types, arrays)
 * - Required/optional field validation
 * - Query and Mutation operation availability
 * - Nested relationship validation
 *
 * @see https://studio.apollographql.com/public/SpaceX-pxxbxen/home for schema explorer
 */

describe('SpaceX API Schema', () => {
  let client: GraphQLTestClient;
  let schemaTypes: string[];
  let launchType: TypeDetails | null;
  let rocketType: TypeDetails | null;
  let launchRocketType: TypeDetails | null;
  let launchLinksType: TypeDetails | null;
  let queryType: TypeDetails | null;
  let mutationType: TypeDetails | null;

  // Fetch all schema data once before all tests
  beforeAll(async () => {
    client = new GraphQLTestClient('https://spacex-production.up.railway.app/');

    // Fetch all needed data in parallel to minimize API calls
    const [types, launch, rocket, launchRocket, launchLinks, query, mutation] = await Promise.all([
      getSchemaTypes(client),
      getTypeDetails(client, 'Launch'),
      getTypeDetails(client, 'Rocket'),
      getTypeDetails(client, 'LaunchRocket'),
      getTypeDetails(client, 'LaunchLinks'),
      getTypeDetails(client, 'Query'),
      getTypeDetails(client, 'Mutation'),
    ]);

    schemaTypes = types;
    launchType = launch;
    rocketType = rocket;
    launchRocketType = launchRocket;
    launchLinksType = launchLinks;
    queryType = query;
    mutationType = mutation;
  });

  // Helper to get field info from cached type details
  const getField = (type: TypeDetails | null, fieldName: string) => {
    return type?.fields?.find((f) => f.name === fieldName) || null;
  };

  describe('Type Existence', () => {
    test('should have core entity types', () => {
      expect(schemaTypes).toContain('Launch');
      expect(schemaTypes).toContain('Rocket');
      expect(schemaTypes).toContain('Capsule');
      expect(schemaTypes).toContain('Launchpad');
    });

    test('should have Query and Mutation types', () => {
      expect(schemaTypes).toContain('Query');
      expect(schemaTypes).toContain('Mutation');
    });

    test('should have nested object types', () => {
      expect(schemaTypes).toContain('LaunchRocket');
      expect(schemaTypes).toContain('LaunchSite');
      expect(schemaTypes).toContain('LaunchLinks');
    });

    test('Launch should be an OBJECT type', () => {
      expect(launchType?.kind).toBe('OBJECT');
    });

    test('should have user-related types (Hasura)', () => {
      expect(schemaTypes).toContain('users');
      expect(schemaTypes).toContain('users_mutation_response');
    });
  });

  describe('Launch Type', () => {
    test('Launch type should have all expected fields', () => {
      const fields = launchType?.fields?.map((f) => f.name) || [];

      expect(fields).toContain('id');
      expect(fields).toContain('mission_name');
      expect(fields).toContain('launch_date_utc');
      expect(fields).toContain('launch_success');
      expect(fields).toContain('rocket');
      expect(fields).toContain('launch_site');
      expect(fields).toContain('links');
      expect(fields).toContain('details');
    });

    test('Launch.id should be an ID type', () => {
      const field = getField(launchType, 'id');

      expect(field).not.toBeNull();
      expect(field?.type).toBe('ID');
    });

    test('Launch.mission_name should be a String type', () => {
      const field = getField(launchType, 'mission_name');

      expect(field).not.toBeNull();
      expect(field?.type).toBe('String');
    });

    test('Launch.launch_date_utc should be a Date type', () => {
      const field = getField(launchType, 'launch_date_utc');

      expect(field).not.toBeNull();
      expect(field?.type).toBe('Date');
    });

    test('Launch.launch_success should be a Boolean type', () => {
      const field = getField(launchType, 'launch_success');

      expect(field).not.toBeNull();
      expect(field?.type).toBe('Boolean');
    });

    test('Launch.rocket should be a LaunchRocket object', () => {
      const field = getField(launchType, 'rocket');

      expect(field).not.toBeNull();
      expect(field?.type).toBe('LaunchRocket');
      expect(field?.isArray).toBe(false);
    });
  });

  describe('Rocket Type', () => {
    test('Rocket type should have all expected fields', () => {
      const fields = rocketType?.fields?.map((f) => f.name) || [];

      expect(fields).toContain('id');
      expect(fields).toContain('name');
      expect(fields).toContain('type');
      expect(fields).toContain('active');
      expect(fields).toContain('stages');
      expect(fields).toContain('boosters');
      expect(fields).toContain('cost_per_launch');
      expect(fields).toContain('success_rate_pct');
      expect(fields).toContain('first_flight');
      expect(fields).toContain('description');
    });

    test('Rocket.id should be an ID type', () => {
      const field = getField(rocketType, 'id');

      expect(field).not.toBeNull();
      expect(field?.type).toBe('ID');
    });

    test('Rocket.active should be a Boolean type', () => {
      const field = getField(rocketType, 'active');

      expect(field).not.toBeNull();
      expect(field?.type).toBe('Boolean');
    });

    test('Rocket.cost_per_launch should be an Int type', () => {
      const field = getField(rocketType, 'cost_per_launch');

      expect(field).not.toBeNull();
      expect(field?.type).toBe('Int');
    });

    test('Rocket.success_rate_pct should be an Int type', () => {
      const field = getField(rocketType, 'success_rate_pct');

      expect(field).not.toBeNull();
      expect(field?.type).toBe('Int');
    });
  });

  describe('LaunchRocket Type', () => {
    test('LaunchRocket type should have expected fields', () => {
      const fields = launchRocketType?.fields?.map((f) => f.name) || [];

      expect(fields).toContain('rocket_name');
      expect(fields).toContain('rocket_type');
      expect(fields).toContain('rocket');
    });

    test('LaunchRocket.rocket should reference Rocket type', () => {
      const field = getField(launchRocketType, 'rocket');

      expect(field).not.toBeNull();
      expect(field?.type).toBe('Rocket');
    });
  });

  describe('Query Operations', () => {
    test('should have all expected query operations', () => {
      const queries = queryType?.fields?.map((f) => f.name) || [];

      expect(queries).toContain('launches');
      expect(queries).toContain('launch');
      expect(queries).toContain('rockets');
      expect(queries).toContain('rocket');
      expect(queries).toContain('capsules');
      expect(queries).toContain('launchpads');
    });

    test('launches query should return array of Launch', () => {
      const field = getField(queryType, 'launches');

      expect(field).not.toBeNull();
      expect(field?.type).toBe('Launch');
      expect(field?.isArray).toBe(true);
    });

    test('launch query should return single Launch', () => {
      const field = getField(queryType, 'launch');

      expect(field).not.toBeNull();
      expect(field?.type).toBe('Launch');
      expect(field?.isArray).toBe(false);
    });

    test('rockets query should return array of Rocket', () => {
      const field = getField(queryType, 'rockets');

      expect(field).not.toBeNull();
      expect(field?.type).toBe('Rocket');
      expect(field?.isArray).toBe(true);
    });
  });

  describe('Mutation Operations', () => {
    test('should have user mutation operations (Hasura)', () => {
      const mutations = mutationType?.fields?.map((f) => f.name) || [];

      expect(mutations).toContain('insert_users');
      expect(mutations).toContain('update_users');
      expect(mutations).toContain('delete_users');
    });

    test('insert_users mutation should return users_mutation_response', () => {
      const field = getField(mutationType, 'insert_users');

      expect(field).not.toBeNull();
      expect(field?.type).toBe('users_mutation_response');
    });
  });

  describe('Nested Relationships', () => {
    test('Launch → LaunchRocket → Rocket relationship chain', () => {
      // Launch has rocket field
      const launchRocketField = getField(launchType, 'rocket');
      expect(launchRocketField?.type).toBe('LaunchRocket');

      // LaunchRocket has rocket field pointing to actual Rocket
      const rocketField = getField(launchRocketType, 'rocket');
      expect(rocketField?.type).toBe('Rocket');
    });

    test('Launch → LaunchSite relationship exists', () => {
      const launchFields = launchType?.fields?.map((f) => f.name) || [];
      const field = getField(launchType, 'launch_site');

      expect(launchFields).toContain('launch_site');
      expect(field?.type).toBe('LaunchSite');
    });

    test('Launch → LaunchLinks relationship exists', () => {
      const launchFields = launchType?.fields?.map((f) => f.name) || [];
      const field = getField(launchType, 'links');

      expect(launchFields).toContain('links');
      expect(field?.type).toBe('LaunchLinks');
    });

    test('LaunchLinks should have media-related fields', () => {
      const fields = launchLinksType?.fields?.map((f) => f.name) || [];

      expect(fields).toContain('video_link');
      expect(fields).toContain('article_link');
      expect(fields).toContain('wikipedia');
    });
  });
});
