import { GraphQLTestClient } from './graphql-client.js';

/**
 * Schema Introspection Utilities
 *
 * Provides reusable functions for GraphQL schema introspection testing.
 * Uses GraphQL's built-in introspection queries (__schema, __type) to
 * extract schema metadata for validation.
 *
 * @example
 * const types = await getSchemaTypes(client);
 * const fields = await getTypeFields(client, 'Country');
 */

/**
 * Type information returned by introspection queries
 */
export interface TypeInfo {
  name: string;
  kind: string;
  description: string | null;
}

/**
 * Field information returned by introspection queries
 */
export interface FieldInfo {
  name: string;
  type: string;
  isRequired: boolean;
  isArray: boolean;
  description: string | null;
}

/**
 * Detailed type information including fields
 */
export interface TypeDetails {
  name: string;
  kind: string;
  description: string | null;
  fields: FieldInfo[] | null;
  inputFields: FieldInfo[] | null;
  enumValues: string[] | null;
}

/**
 * Get all type names from the schema
 *
 * Returns an array of all type names, filtering out internal GraphQL types
 * (those starting with __).
 *
 * @param client - GraphQL test client instance
 * @returns Array of type names
 *
 * @example
 * const types = await getSchemaTypes(client);
 * expect(types).toContain('Country');
 * expect(types).toContain('Query');
 */
export async function getSchemaTypes(client: GraphQLTestClient): Promise<string[]> {
  const query = `
    query IntrospectionQuery {
      __schema {
        types {
          name
        }
      }
    }
  `;

  const data = await client.request<{
    __schema: { types: Array<{ name: string }> };
  }>(query);

  return data.__schema.types
    .map((t) => t.name)
    .filter((name) => !name.startsWith('__'));
}

/**
 * Get detailed information about a specific type
 *
 * Returns type kind, description, fields (for object types),
 * input fields (for input types), and enum values (for enums).
 *
 * @param client - GraphQL test client instance
 * @param typeName - Name of the type to inspect
 * @returns Type details or null if type doesn't exist
 *
 * @example
 * const details = await getTypeDetails(client, 'Country');
 * expect(details?.kind).toBe('OBJECT');
 * expect(details?.fields).toContainEqual(expect.objectContaining({ name: 'code' }));
 */
export async function getTypeDetails(
  client: GraphQLTestClient,
  typeName: string
): Promise<TypeDetails | null> {
  const query = `
    query TypeDetails($name: String!) {
      __type(name: $name) {
        name
        kind
        description
        fields {
          name
          description
          type {
            name
            kind
            ofType {
              name
              kind
              ofType {
                name
                kind
                ofType {
                  name
                  kind
                  ofType {
                    name
                    kind
                  }
                }
              }
            }
          }
        }
        inputFields {
          name
          description
          type {
            name
            kind
            ofType {
              name
              kind
              ofType {
                name
                kind
                ofType {
                  name
                  kind
                  ofType {
                    name
                    kind
                  }
                }
              }
            }
          }
        }
        enumValues {
          name
        }
      }
    }
  `;

  const data = await client.request<{
    __type: {
      name: string;
      kind: string;
      description: string | null;
      fields: Array<{
        name: string;
        description: string | null;
        type: {
          name: string | null;
          kind: string;
          ofType: {
            name: string | null;
            kind: string;
            ofType: {
              name: string | null;
              kind: string;
            } | null;
          } | null;
        };
      }> | null;
      inputFields: Array<{
        name: string;
        description: string | null;
        type: {
          name: string | null;
          kind: string;
          ofType: {
            name: string | null;
            kind: string;
            ofType: {
              name: string | null;
              kind: string;
            } | null;
          } | null;
        };
      }> | null;
      enumValues: Array<{ name: string }> | null;
    } | null;
  }>(query, { name: typeName });

  if (!data.__type) {
    return null;
  }

  const parseFieldType = (typeObj: any): FieldInfo => {
    let typeName = '';
    let isRequired = false;
    let isArray = false;

    // Unwrap the type structure
    let current = typeObj;
    while (current) {
      if (current.kind === 'NON_NULL') {
        isRequired = true;
        current = current.ofType;
      } else if (current.kind === 'LIST') {
        isArray = true;
        current = current.ofType;
      } else {
        typeName = current.name || 'Unknown';
        break;
      }
    }

    return {
      name: '',
      type: typeName,
      isRequired,
      isArray,
      description: null,
    };
  };

  const mapFields = (
    fields: Array<{
      name: string;
      description: string | null;
      type: any;
    }> | null
  ): FieldInfo[] | null => {
    if (!fields) return null;
    return fields.map((f) => {
      const typeInfo = parseFieldType(f.type);
      return {
        name: f.name,
        type: typeInfo.type,
        isRequired: typeInfo.isRequired,
        isArray: typeInfo.isArray,
        description: f.description,
      };
    });
  };

  return {
    name: data.__type.name,
    kind: data.__type.kind,
    description: data.__type.description,
    fields: mapFields(data.__type.fields),
    inputFields: mapFields(data.__type.inputFields),
    enumValues: data.__type.enumValues?.map((e) => e.name) || null,
  };
}

/**
 * Get field names for a specific type
 *
 * Returns an array of field names for object types.
 * Returns null for non-object types (scalars, enums, etc.).
 *
 * @param client - GraphQL test client instance
 * @param typeName - Name of the type to inspect
 * @returns Array of field names or null
 *
 * @example
 * const fields = await getTypeFields(client, 'Country');
 * expect(fields).toContain('code');
 * expect(fields).toContain('name');
 */
export async function getTypeFields(
  client: GraphQLTestClient,
  typeName: string
): Promise<string[] | null> {
  const details = await getTypeDetails(client, typeName);
  if (!details?.fields) return null;
  return details.fields.map((f) => f.name);
}

/**
 * Get detailed information about a specific field
 *
 * Returns field type, whether it's required, whether it's an array,
 * and its description.
 *
 * @param client - GraphQL test client instance
 * @param typeName - Name of the type containing the field
 * @param fieldName - Name of the field to inspect
 * @returns Field info or null if field doesn't exist
 *
 * @example
 * const fieldInfo = await getFieldInfo(client, 'Country', 'code');
 * expect(fieldInfo?.type).toBe('ID');
 * expect(fieldInfo?.isRequired).toBe(true);
 */
export async function getFieldInfo(
  client: GraphQLTestClient,
  typeName: string,
  fieldName: string
): Promise<FieldInfo | null> {
  const details = await getTypeDetails(client, typeName);
  if (!details?.fields) return null;
  return details.fields.find((f) => f.name === fieldName) || null;
}

/**
 * Get all available query operations
 *
 * Returns an array of query operation names available in the schema.
 *
 * @param client - GraphQL test client instance
 * @returns Array of query operation names
 *
 * @example
 * const queries = await getAvailableQueries(client);
 * expect(queries).toContain('country');
 * expect(queries).toContain('countries');
 */
export async function getAvailableQueries(client: GraphQLTestClient): Promise<string[]> {
  const fields = await getTypeFields(client, 'Query');
  return fields || [];
}

/**
 * Get all available mutation operations
 *
 * Returns an array of mutation operation names available in the schema.
 * Returns empty array if no mutations are defined.
 *
 * @param client - GraphQL test client instance
 * @returns Array of mutation operation names
 *
 * @example
 * const mutations = await getAvailableMutations(client);
 * expect(mutations).toContain('insert_users');
 */
export async function getAvailableMutations(client: GraphQLTestClient): Promise<string[]> {
  const fields = await getTypeFields(client, 'Mutation');
  return fields || [];
}

/**
 * Check if a type exists in the schema
 *
 * @param client - GraphQL test client instance
 * @param typeName - Name of the type to check
 * @returns true if type exists, false otherwise
 *
 * @example
 * const exists = await typeExists(client, 'Country');
 * expect(exists).toBe(true);
 */
export async function typeExists(
  client: GraphQLTestClient,
  typeName: string
): Promise<boolean> {
  const types = await getSchemaTypes(client);
  return types.includes(typeName);
}

/**
 * Get the kind of a type (OBJECT, SCALAR, ENUM, INPUT_OBJECT, etc.)
 *
 * @param client - GraphQL test client instance
 * @param typeName - Name of the type to inspect
 * @returns Type kind or null if type doesn't exist
 *
 * @example
 * const kind = await getTypeKind(client, 'Country');
 * expect(kind).toBe('OBJECT');
 */
export async function getTypeKind(
  client: GraphQLTestClient,
  typeName: string
): Promise<string | null> {
  const details = await getTypeDetails(client, typeName);
  return details?.kind || null;
}
