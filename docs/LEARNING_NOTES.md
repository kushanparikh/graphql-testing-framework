# Learning Notes

**Project:** GraphQL API Testing Suite
**Purpose:** Personal reference for GraphQL testing concepts, patterns, and gotchas
**Last Updated:** February 8, 2026

---

## Table of Contents

1. [GraphQL Fundamentals](#1-graphql-fundamentals)
2. [Query Operations](#2-query-operations)
3. [Mutation Operations](#3-mutation-operations)
4. [Variables and Arguments](#4-variables-and-arguments)
5. [Fragments and Aliases](#5-fragments-and-aliases)
6. [Schema Introspection](#6-schema-introspection)
7. [Authentication Patterns](#7-authentication-patterns)
8. [Error Handling](#8-error-handling)
9. [Performance Testing](#9-performance-testing)
10. [Jest + ESM Configuration](#10-jest--esm-configuration)
11. [Common Patterns and Best Practices](#11-common-patterns-and-best-practices)
12. [Troubleshooting Notes](#12-troubleshooting-notes)
13. [Quick Reference](#13-quick-reference)

---

## 1. GraphQL Fundamentals

### What is GraphQL?

GraphQL is a query language for APIs where the **client specifies exactly what data it needs**. Unlike REST, where the server defines the response shape, GraphQL lets consumers request specific fields, traverse relationships, and fetch multiple resources in a single request.

### GraphQL vs REST

| Aspect | REST | GraphQL |
|--------|------|---------|
| **Endpoints** | Many (`/users`, `/users/1/posts`) | One (`/graphql`) |
| **Response shape** | Server-defined | Client-defined |
| **Over-fetching** | Common (get all fields) | None (get only requested fields) |
| **Under-fetching** | Common (need multiple requests) | None (nested queries in one request) |
| **Versioning** | URL-based (`/v1/`, `/v2/`) | Schema evolution (deprecation) |
| **Type system** | None (unless OpenAPI) | Built-in (introspection) |
| **Error format** | HTTP status codes | Always 200, errors in response body |

**Key insight for testing:** GraphQL almost always returns HTTP 200 even on errors. The errors are in the response body under an `errors` array. This is a fundamental difference from REST API testing where you check status codes.

### How it Works (From a Testing Perspective)

Every GraphQL request is an HTTP POST to a single endpoint with a JSON body:

```json
{
  "query": "query { country(code: \"US\") { name } }",
  "variables": { "code": "US" }
}
```

The response always has this shape:

```json
{
  "data": { ... },     // The requested data (null on complete failure)
  "errors": [ ... ],   // Optional error array
  "extensions": { ... } // Optional metadata
}
```

---

## 2. Query Operations

### Basic Query Syntax

The simplest query requests specific fields from a root type:

```graphql
query {
  country(code: "US") {
    name
    capital
  }
}
```

This returns `{ country: { name: "United States", capital: "Washington D.C." } }`.

**What I learned:** The `query` keyword is actually optional for queries (but not for mutations). However, always including it makes the operation type explicit and is considered best practice.

### Query with Variables

Variables make queries reusable and prevent string interpolation vulnerabilities:

```graphql
query GetCountry($code: ID!) {
  country(code: $code) {
    name
    capital
  }
}
```

Variables are passed separately: `{ "code": "CA" }`

**From the Countries test (`queryOpsForCountries.test.ts`):**

```typescript
const query = `
  query GetCountry($code: ID!) {
    country(code: $code) {
      name
      capital
    }
  }
`;
const variables = { code: 'CA' };
const data = await client.request(query, variables);
expect(data.country.name).toBe('Canada');
```

### Nested Queries

GraphQL lets you traverse object relationships in a single request. This is one of its biggest advantages over REST.

**From the Countries test — Country with Continent:**

```typescript
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
const data = await client.request(query);
expect(data.country.continent.name).toBe('North America');
```

**From the Rick & Morty test — 3-level nesting:**

Character -> Origin (Location) -> Residents (Characters):

```typescript
const query = `
  query {
    character(id: 1) {
      name
      origin {
        name
        type
        dimension
        residents {
          name
          status
        }
      }
    }
  }
`;
```

This fetches Rick Sanchez, his origin (Earth C-137), and all residents of that location. Three levels of traversal in one request — this would be 3 separate REST calls.

### Multi-Resource Queries

GraphQL allows fetching multiple independent resources in a single request:

```typescript
const query = `
  query {
    character(id: 1) { name, status }
    location(id: 1) { name, type }
    episode(id: 1) { name, episode }
  }
`;
const data = await client.request(query);
expect(Object.keys(data)).toHaveLength(3); // character, location, episode
```

**Insight:** The response has 3 top-level keys. Each resource resolves independently — if one fails, the others can still succeed (with partial `data` + `errors`).

### Filtering and Pagination

**Filtering (Countries API):**

```graphql
query GetCountriesByContinent($continentCode: String!) {
  countries(filter: { continent: { eq: $continentCode } }) {
    name
    code
  }
}
```

**Pagination (Rick & Morty API):**

The Rick & Morty API uses page-based pagination with an `info` metadata object:

```graphql
query {
  characters(page: 1) {
    info {
      count    # Total across all pages (826)
      pages    # Total pages (42)
      next     # Next page number (2) or null
      prev     # Previous page number or null
    }
    results {
      id
      name
    }
  }
}
```

Default page size is 20 items. First page has `prev: null`, last page has `next: null`.

**Pagination (SpaceX API):**

SpaceX uses limit-based pagination:

```graphql
query {
  launches(limit: 5) {
    mission_name
    launch_date_utc
  }
}
```

---

## 3. Mutation Operations

### What Are Mutations?

Mutations are GraphQL's way to write data (create, update, delete). They use the `mutation` keyword instead of `query` and conventionally return the affected data.

### Hasura-Style Mutations (SpaceX API)

The SpaceX API is built on Hasura, which auto-generates CRUD mutations with a specific naming pattern:

```typescript
// INSERT
mutation InsertUser($name: String!, $rocket: String!) {
  insert_users(objects: { name: $name, rocket: $rocket }) {
    returning {
      id
      name
      rocket
    }
  }
}

// UPDATE
mutation UpdateUser($name: String!) {
  update_users(where: { name: { _eq: "nonexistent" } }, _set: { name: $name }) {
    affected_rows
  }
}

// DELETE
mutation DeleteUser {
  delete_users(where: { name: { _eq: "nonexistent" } }) {
    affected_rows
  }
}
```

**Key Hasura patterns:**
- `insert_<table>` with `objects:` parameter and `returning` block
- `update_<table>` with `where:` filter and `_set:` for new values
- `delete_<table>` with `where:` filter
- `_eq` is the equality operator in Hasura's where clause syntax

### Mutations Returning Null

**Important discovery:** The SpaceX API exposes mutation operations in its schema, but they all return `null` because mutations are disabled for public access. This is common for public APIs that want to demonstrate their schema without allowing writes.

```typescript
const data = await client.request(mutation, variables);
expect(data.insert_users).toBeNull(); // Mutations disabled
```

**Lesson learned:** Always check if mutations actually work on public APIs. Having mutations in the schema doesn't mean they're enabled. The schema defines capabilities; access control determines what's allowed.

---

## 4. Variables and Arguments

### Type Notation

GraphQL has a specific type system for variables:

| Notation | Meaning | Example |
|----------|---------|---------|
| `$code: ID!` | Required ID scalar | Must provide a non-null value |
| `$limit: Int` | Optional integer | Can be omitted |
| `$name: String!` | Required string | Must provide a non-null value |
| `$filter: CharacterFilter` | Optional custom input type | Complex filter object |

The `!` suffix means **non-null** (required). Without it, the variable is optional.

### How Variables Map to Arguments

The variable definition declares the type, and the query argument receives the value:

```graphql
query GetCountry($code: ID!) {    # Declaration: $code is required ID
  country(code: $code) {           # Usage: pass $code to the code argument
    name
  }
}
```

Variables are passed as a separate JSON object, never interpolated into the query string. This prevents injection-style issues and allows the server to validate types.

### Variables in Tests

```typescript
// Simple variable
const variables = { code: 'CA' };
const data = await client.request(query, variables);

// Multiple variables
const variables = { owner: 'kushanparikh', name: 'graphql-testing-framework' };
const data = await client.request(query, variables);

// Variables for mutations
const variables = { name: "Test User", rocket: "Falcon 9" };
const data = await client.request(mutation, variables);
```

---

## 5. Fragments and Aliases

### Fragments — DRY Field Selection

Fragments define a reusable set of fields for a specific type. They eliminate duplication when you need the same fields in multiple places.

**From `queryOpsForRickAndMorty.test.ts`:**

```typescript
const fragment = `
  fragment CharacterBasics on Character {
    id
    name
    status
    species
  }
`;

const query = `${fragment}
  query {
    smith_family_father: character(id: 1) {
      ...CharacterBasics
    }
    smith_family_son: character(id: 2) {
      ...CharacterBasics
    }
  }
`;
```

Both queries get the exact same fields (`id`, `name`, `status`, `species`) from the fragment. If you need to add a field later, you change the fragment once.

**Verification pattern:** Assert that both response objects have identical keys to prove the fragment was applied uniformly:

```typescript
const fatherKeys = Object.keys(data.smith_family_father).sort();
const sonKeys = Object.keys(data.smith_family_son).sort();
expect(fatherKeys).toEqual(sonKeys);
expect(fatherKeys).toEqual(['id', 'name', 'species', 'status']);
```

### Aliases — Avoiding Key Collisions

Without aliases, querying the same root field twice would overwrite in the response. Aliases give each query a custom key:

```graphql
query {
  rick: character(id: 1) { name, status }
  morty: character(id: 2) { name, status }
  summersmith: character(id: 3) { name, status }
}
```

Response keys are `rick`, `morty`, `summersmith` — not `character`.

**Testing aliases:**

```typescript
expect(Object.keys(data)).toEqual(['rick', 'morty', 'summersmith']);
expect(data).not.toHaveProperty('character'); // Default key is gone
```

### Aliases for Filter Comparison

One of the more creative uses of aliases — comparing filter behavior by executing multiple filtered queries in one request:

```graphql
query {
  onlyRick: characters(filter: {name: "rick"}) { info { count } }
  onlyAlive: characters(filter: {status: "alive"}) { info { count } }
  bothFilters: characters(filter: {name: "rick", status: "alive"}) {
    info { count }
    results { name, status }
  }
}
```

This validates AND composition: `bothFilters.count <= onlyRick.count` and `bothFilters.count <= onlyAlive.count`.

---

## 6. Schema Introspection

### What is Introspection?

GraphQL APIs expose their own schema as queryable data. You can ask an API "what types do you have?" and "what fields does this type have?" using special `__schema` and `__type` queries.

This is powerful for testing because you can validate the API contract programmatically without reading documentation.

### Introspection Queries

**List all types:**

```graphql
query {
  __schema {
    types {
      name
    }
  }
}
```

Returns every type including internal ones like `__Type`, `__Field`. We filter out types starting with `__`.

**Get type details:**

```graphql
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
  }
}
```

**Why 4 levels of `ofType` nesting?** GraphQL wraps types in modifiers. The deepest practical nesting is `[Type!]!` which is:

```
NON_NULL → LIST → NON_NULL → Type
```

That's 3 levels of wrapping to reach the base type. We use 4 levels for safety.

### Type Unwrapping Algorithm

The `parseFieldType()` function in `schema-introspection.ts` walks the `ofType` chain:

```typescript
const parseFieldType = (typeObj: any): FieldInfo => {
  let typeName = '';
  let isRequired = false;
  let isArray = false;

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

  return { name: '', type: typeName, isRequired, isArray, description: null };
};
```

**Example:** The `languages` field on `Country` type introspects as:

```
NON_NULL → LIST → NON_NULL → Language
```

The algorithm walks: `NON_NULL` (set `isRequired=true`) -> `LIST` (set `isArray=true`) -> `NON_NULL` (already set) -> `Language` (set `typeName`).

Result: `{ type: "Language", isRequired: true, isArray: true }`

### Caching Pattern with Promise.all()

Introspection queries hit real APIs, so we batch them in `beforeAll`:

```typescript
beforeAll(async () => {
  const [types, country, continent, language, state, query] = await Promise.all([
    getSchemaTypes(client),
    getTypeDetails(client, 'Country'),
    getTypeDetails(client, 'Continent'),
    getTypeDetails(client, 'Language'),
    getTypeDetails(client, 'State'),
    getTypeDetails(client, 'Query'),
  ]);
  // Cache in describe-scoped variables
  schemaTypes = types;
  countryType = country;
  // ...
});
```

**Why this matters:**
- Countries schema suite has 24 tests but only makes ~6 API calls (all in `beforeAll`)
- SpaceX schema suite has 28 tests but only makes ~7 API calls
- Without caching, every `getTypeDetails()` call in every test would hit the API
- Public APIs have rate limits — batching respects those limits

### Rate Limiting Consideration

Public GraphQL APIs typically limit requests per minute/hour. The `Promise.all()` pattern sends a burst of ~6-7 requests at once, then runs all tests from cached data. This is much friendlier than 24+ sequential requests spread across test execution.

---

## 7. Authentication Patterns

### Bearer Token Authentication

The GitHub GraphQL API requires an `Authorization: Bearer <token>` header. The `GraphQLTestClient` constructor handles this:

```typescript
const client = new GraphQLTestClient(GITHUB_API, GITHUB_TOKEN!);
// Internally sets: { Authorization: 'Bearer ghp_xxx...' }
```

### dotenv for Local Development

The `.env` file (not committed to git) stores the personal access token:

```
GITHUB_TOKEN=ghp_your_token_here
```

Loaded at the top of the auth test file:

```typescript
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
```

### Conditional Suite Pattern (describeWithAuth)

Since the token may not be available locally, the entire test suite uses a conditional describe:

```typescript
const describeWithAuth = GITHUB_TOKEN ? describe : describe.skip;

if (!GITHUB_TOKEN) {
  console.warn('GITHUB_TOKEN not found - GitHub auth tests will be skipped');
}

describeWithAuth('GitHub API - Authentication', () => {
  // All tests here — skipped entirely if no token
});
```

**Why not `test.skip` per test?** Jest doesn't support runtime-conditional skip at the test level. The decision needs to happen at the describe block level.

### CI/CD Token Handling

In GitHub Actions, `GITHUB_TOKEN` is provided automatically via `secrets.GITHUB_TOKEN`. No manual secret configuration needed:

```yaml
- name: Run tests
  run: npm test
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Scope differences:**
- **Pull request events:** Read-only token (limited permissions)
- **Push to main:** Read+write token
- **Locally:** Your personal access token (whatever scopes you granted)

### Security Best Practices Followed

1. **Token never hardcoded** — Always from environment variables
2. **`.env` in `.gitignore`** — Never committed to source control
3. **Read-only tests** — No mutations against GitHub (no risk of modifying real data)
4. **Graceful degradation** — Suite skips cleanly instead of failing when token is missing
5. **Console warnings** — Clear instructions on how to set up the token

---

## 8. Error Handling

### GraphQL Error Structure

Unlike REST APIs that use HTTP status codes, GraphQL returns errors in the response body. A response with errors looks like:

```json
{
  "data": null,
  "errors": [
    {
      "message": "Cannot query field \"population\" on type \"Country\".",
      "locations": [{ "line": 5, "column": 9 }],
      "extensions": { "code": "GRAPHQL_VALIDATION_FAILED" }
    }
  ]
}
```

The HTTP status is still 200. The `errors` array contains one or more error objects with `message`, `locations`, and optional `extensions`.

### Error Testing Patterns

**Data-level errors (null returns):**

Some invalid inputs don't cause errors — they return `null`:

```typescript
// Invalid country code returns null, not an error
const data = await client.request(query);
expect(data.country).toBeNull();
```

**Query validation errors (throws):**

Syntax errors, missing variables, and non-existent fields cause `graphql-request` to throw:

```typescript
// Using the wrapper's helper method
await client.requestExpectingError(malformedQuery);

// Equivalent to:
await expect(client.request(malformedQuery)).rejects.toThrow();
```

**Authentication errors (throws):**

Invalid tokens cause HTTP 401 errors, which `graphql-request` throws:

```typescript
const badClient = new GraphQLTestClient(GITHUB_API, 'invalid_token_12345');
await badClient.requestExpectingError(query);
```

### Error Categories Tested

| Error Type | API | Behavior | Test Method |
|-----------|-----|----------|-------------|
| Invalid argument value | Countries | Returns `null` | Assert `toBeNull()` |
| Syntax error (missing paren) | Countries | Throws | `requestExpectingError()` |
| Missing required variable | Countries | Throws | `requestExpectingError()` |
| Non-existent field | Countries, SpaceX | Throws | `requestExpectingError()` |
| Invalid variable type | Countries | Returns `null` (type coercion) | Assert `toBeNull()` |
| Wrong variable type | SpaceX | Throws | `requestExpectingError()` |
| Invalid auth token | GitHub | Throws (401) | `requestExpectingError()` |

**Insight:** Different APIs handle the same kind of error differently. The Countries API coerces a numeric `code` variable to a string and returns `null` (no country with code "123"). The SpaceX API rejects a string `limit` variable with an error. Both behaviors are valid GraphQL — the spec leaves coercion details to implementations.

---

## 9. Performance Testing

### measureQuery() Pattern

The `GraphQLTestClient.measureQuery()` method wraps a request with `performance.now()` timing:

```typescript
const { data, time } = await client.measureQuery(query);
expect(data.country.name).toBe('United States');
expect(time).toBeLessThan(2000); // Under 2 seconds
```

It returns both the data (for functional assertions) and the execution time in milliseconds (for performance assertions). This means one test validates both correctness and speed.

### Performance Thresholds

| Query Type | Threshold | Rationale |
|-----------|-----------|-----------|
| Simple query (single resource) | 2,000ms | Network latency + minimal server work |
| Large dataset (all countries) | 3,000ms | More data serialization |
| Nested query (with relationships) | 3,000ms | Additional resolver calls |
| Paginated (5 items) | 3,000ms | Standard page size |
| Paginated (100 items) | 5,000ms | Stress test threshold |

**Why these thresholds?** These are generous limits meant to catch regressions, not measure absolute performance. Public APIs have variable latency depending on geography, load, and caching. The goal is "responds in reasonable time," not "responds in exactly X ms."

### Simple vs. Nested Query Comparison

One performance test measures both a simple and nested query against the same API, then logs the difference:

```typescript
const { time: simpleTime } = await client.measureQuery(simpleQuery);
const { time: nestedTime } = await client.measureQuery(nestedQuery);

console.log(`Simple query: ${simpleTime}ms`);
console.log(`Nested query: ${nestedTime}ms`);
console.log(`Difference: ${nestedTime - simpleTime}ms`);
```

**Observation:** The difference is usually small (< 100ms) on well-optimized APIs because GraphQL resolvers often batch database queries via DataLoader patterns.

---

## 10. Jest + ESM Configuration

### The Problem

Running Jest with TypeScript and ESM (ECMAScript Modules) requires careful configuration because Jest was originally built for CommonJS. Three things need to align:

1. **TypeScript** needs to compile to ESM output
2. **Jest** needs to understand ESM imports
3. **Node.js** needs the `--experimental-vm-modules` flag for ESM in Jest

### Solution Components

**`package.json`:**

```json
{
  "type": "module",
  "scripts": {
    "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js"
  }
}
```

**`jest.config.js`:**

```javascript
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true, tsconfig: { verbatimModuleSyntax: false } }]
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  }
};
```

**`tsconfig.json`:**

```json
{
  "compilerOptions": {
    "module": "nodenext",
    "target": "esnext",
    "moduleResolution": "nodenext"
  }
}
```

### Why `npm test` Works But `npx jest` Doesn't

`npm test` runs the script defined in `package.json`, which includes `--experimental-vm-modules`:

```
node --experimental-vm-modules node_modules/jest/bin/jest.js
```

Running `npx jest` directly skips this flag, and Jest fails with ESM import errors. This is why the CI pipeline uses `npm test`, not `npx jest`.

### moduleNameMapper

TypeScript ESM imports use `.js` extensions (`import { foo } from './bar.js'`), but the actual files are `.ts`. The `moduleNameMapper` strips the `.js` extension so Jest can find the TypeScript files:

```javascript
moduleNameMapper: {
  '^(\\.{1,2}/.*)\\.js$': '$1'  // ./foo.js → ./foo
}
```

### verbatimModuleSyntax: false

`ts-jest` needs this set to `false` in its transform options (even though the main `tsconfig.json` might set it differently) to handle import/export transformations correctly in the ESM context.

---

## 11. Common Patterns and Best Practices

### Test Organization

- **One `describe` per API/feature** — Each test file wraps its tests in a describe block named after the API or feature
- **JSDoc headers on every test file** — Documents the API endpoint, what's tested, and relevant links
- **JSDoc comments on individual tests** — Complex tests explain what's being validated and why

### beforeAll for Client Creation

Every test suite creates the `GraphQLTestClient` in `beforeAll` (or at describe scope) rather than `beforeEach`:

```typescript
describe("Query Operations for Rick and Morty", () => {
  let client: GraphQLTestClient;

  beforeAll(() => {
    client = new GraphQLTestClient(RICK_AND_MORTY_API);
  });
  // ...
});
```

**Why not `beforeEach`?** The client is stateless for read-only operations. Creating a new instance per test adds overhead without benefit. `beforeAll` creates one instance shared across all tests in the suite.

**Exception:** For tests that modify headers (like auth tests), creating a fresh client per test would be safer. In this project, auth tests use one client with the valid token and create separate `badClient` instances for negative tests.

### Naming Conventions

| Convention | Example |
|-----------|---------|
| Test files | `queryOpsFor<API>.test.ts`, `mutationOpsFor<API>.test.ts` |
| Describe blocks | `"Query Operations for Countries"` |
| Test names | `"should fetch nested data"`, `"should handle invalid token"` |
| Variables | `camelCase` (`countryType`, `schemaTypes`) |
| API constants | `UPPER_CASE` (`RICK_AND_MORTY_API`, `GITHUB_TOKEN`) |

### Client Method Selection Guide

**Decision tree for which client method to use:**

```
Need response headers or status code?
  └─ Yes → rawRequest()

Expecting the request to fail?
  └─ Yes → requestExpectingError()

Need execution timing?
  └─ Yes → measureQuery()

Sending multiple independent queries?
  └─ Yes → batchRequests() (if API supports it)

Everything else (90% of tests):
  └─ request()
```

---

## 12. Troubleshooting Notes

### Rate Limiting

**Problem:** Tests start failing intermittently with timeout or 429 errors.

**Cause:** Public APIs have rate limits. Running the full suite multiple times in quick succession can hit them.

**Solution:**
- The `Promise.all()` pattern in schema tests minimizes requests
- Wait a few minutes between full suite runs
- GitHub API provides 5,000 requests/hour (authenticated), which is very generous

### Batch Requests Not Supported

**Problem:** `batchRequests()` throws on Countries and SpaceX APIs.

**Cause:** Both APIs have batching disabled:
- Countries: "Batch queries and APQ request are not currently supported"
- SpaceX: "Operation batching disabled."

**Solution:** Documented in test files as comments. `batchRequests()` works with APIs that support it (e.g., Hasura with batching enabled, Apollo Server with batching plugin).

### Coverage Looks Low (43.75%)

**This is by design.** See the [coverage philosophy in ARCHITECTURE.md](./ARCHITECTURE.md#coverage-philosophy).

The 90 tests exercise real API behavior through integration testing. The utility modules are tested indirectly — every public method is called by at least one test suite. Adding unit tests for the wrapper would mean mocking `graphql-request`, which tests the mock rather than real behavior.

### GitHub Auth Tests Locally

**Problem:** GitHub auth tests are skipped locally.

**Setup:**
1. Create a personal access token at https://github.com/settings/tokens
2. Create a `.env` file in the project root: `GITHUB_TOKEN=ghp_your_token_here`
3. Re-run tests

**In CI:** No setup needed — `GITHUB_TOKEN` is auto-provided by GitHub Actions.

### Mutations Return Null

**Problem:** SpaceX mutation tests assert `toBeNull()` which seems like a failure.

**Explanation:** The SpaceX API exposes mutation operations in its schema but disables them for public access. The mutations execute without error but return `null`. This is valid behavior — the tests verify the mutation syntax is correct and document the API's public access limitations.

### Schema Fields Missing

**Problem:** An introspection test fails because an expected field doesn't exist.

**Possible causes:**
1. The API updated its schema (fields can be deprecated and removed)
2. The field name has a typo in the test
3. The field exists on a different type than expected

**Debug approach:** Run the introspection query manually against the API's GraphQL playground to see the current schema.

---

## 13. Quick Reference

### Common Query Patterns

```graphql
# Fetch single resource
query { country(code: "US") { name } }

# Fetch with variables
query GetCountry($code: ID!) { country(code: $code) { name } }

# Fetch list with pagination
query { launches(limit: 5) { mission_name } }

# Fetch with filter
query { countries(filter: { continent: { eq: "EU" } }) { name } }

# Nested traversal
query { character(id: 1) { origin { residents { name } } } }

# Multi-resource
query { character(id: 1) { name } location(id: 1) { name } }

# With aliases
query { rick: character(id: 1) { name } morty: character(id: 2) { name } }

# With fragments
fragment CharFields on Character { id, name, status }
query { rick: character(id: 1) { ...CharFields } }

# Introspection
query { __schema { types { name } } }
query { __type(name: "Country") { fields { name type { name } } } }
```

### Common Jest Assertions for GraphQL

```typescript
// Data existence
expect(data.country).toBeDefined();
expect(data.country).not.toBeNull();

// Exact value
expect(data.country.name).toBe('United States');

// Type checking
expect(typeof data.country.name).toBe('string');
expect(Array.isArray(data.countries)).toBe(true);

// Array assertions
expect(data.countries).toHaveLength(5);
expect(data.countries.length).toBeGreaterThan(0);

// Object structure
expect(data.country).toHaveProperty('name');
expect(Object.keys(data)).toEqual(['rick', 'morty', 'summer']);

// Array contains object
expect(data.characters).toEqual(expect.arrayContaining([
  expect.objectContaining({ name: "Rick Sanchez", status: "Alive" })
]));

// Regex matching
expect(data.viewer.avatarUrl).toMatch(/^https?:\/\//);
expect(data.viewer.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);

// Performance
expect(time).toBeLessThan(2000);

// Error testing
await client.requestExpectingError(badQuery);
await expect(client.request(badQuery)).rejects.toThrow();

// Schema validation
expect(field?.type).toBe('String');
expect(field?.isRequired).toBe(true);
expect(field?.isArray).toBe(false);
```

### Client Method Quick Reference

```typescript
// Standard data-only request (most common)
const data = await client.request<T>(query, variables?);

// Full response with auto-validation
const response = await client.rawRequest<T>(query, variables?);
// response.data, response.headers, response.status

// Expect failure
await client.requestExpectingError(query, variables?);

// Performance measurement
const { data, time } = await client.measureQuery<T>(query, variables?);

// Batch (if API supports it)
const [result1, result2] = await client.batchRequests([
  { document: query1 },
  { document: query2, variables: vars }
]);

// Auth management
client.setAuthToken('ghp_xxx');
client.setHeaders({ 'x-api-key': 'abc' });
```
