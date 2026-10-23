import { GraphQLTestClient } from '../../utils/graphql-client.ts';
import {
  getAvailableMutations,
  getAvailableQueries,
  getFieldInfo,
  getTypeDetails,
  getTypeFields,
  getTypeKind,
  typeExists,
} from '../../utils/schema-introspection.ts';
import { describe, expect, test } from '@jest/globals';

/**
 * Schema Introspection Helper Tests (Countries API)
 *
 * The schema-level suites (countries-schema, spacex-schema) use the main helpers.
 * This file covers the remaining helpers and their "not found" branches:
 * - getTypeDetails() for a missing type
 * - getTypeFields() and getFieldInfo() lookups
 * - getAvailableQueries() and getAvailableMutations()
 * - typeExists() and getTypeKind()
 *
 * Countries has no Mutation type, so getAvailableMutations() returns [].
 */

describe('Schema Introspection Helpers – Countries API', () => {
  const client = new GraphQLTestClient('https://countries.trevorblades.com/');

  test('getTypeDetails returns null for a type that does not exist', async () => {
    const details = await getTypeDetails(client, 'DoesNotExistType');

    expect(details).toBeNull();
  });

  test('getTypeFields returns field names for an object type', async () => {
    const fields = await getTypeFields(client, 'Country');

    expect(fields).toEqual(expect.arrayContaining(['code', 'name', 'continent']));
  });

  test('getTypeFields returns null for a scalar type', async () => {
    const fields = await getTypeFields(client, 'String');

    expect(fields).toBeNull();
  });

  test('getFieldInfo returns type details for an existing field', async () => {
    const info = await getFieldInfo(client, 'Country', 'code');

    expect(info).not.toBeNull();
    expect(info?.name).toBe('code');
    expect(info?.type).toBe('ID');
    expect(info?.isRequired).toBe(true);
  });

  test('getFieldInfo returns null for a field that does not exist', async () => {
    const info = await getFieldInfo(client, 'Country', 'population');

    expect(info).toBeNull();
  });

  test('getAvailableQueries lists the root Query operations', async () => {
    const queries = await getAvailableQueries(client);

    expect(queries).toEqual(expect.arrayContaining(['country', 'countries', 'continent', 'continents']));
  });

  test('getAvailableMutations returns an empty array when no Mutation type exists', async () => {
    const mutations = await getAvailableMutations(client);

    expect(mutations).toEqual([]);
  });

  test('typeExists is true for a present type and false for a missing one', async () => {
    expect(await typeExists(client, 'Country')).toBe(true);
    expect(await typeExists(client, 'DoesNotExistType')).toBe(false);
  });

  test('getTypeKind returns OBJECT for Country and null for a missing type', async () => {
    expect(await getTypeKind(client, 'Country')).toBe('OBJECT');
    expect(await getTypeKind(client, 'DoesNotExistType')).toBeNull();
  });
});
