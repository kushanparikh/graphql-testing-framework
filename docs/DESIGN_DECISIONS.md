# Design Decisions

**Project:** GraphQL API Testing Suite (Portfolio Project 2)  
**Purpose:** Document technology choices and trade-offs  
**Last Updated:** February 5, 2026

---

## Overview

This document captures the "why" behind major technology and architectural decisions in this project. Each decision considers:

- **Portfolio Impact**: How does this choice position me for SDET roles?
- **Industry Standards**: What do companies actually use?
- **Learning Value**: What skills does this demonstrate?
- **Trade-offs**: What am I gaining vs sacrificing?

---

## Table of Contents

1. [Testing Framework: Jest vs Vitest vs Playwright](#1-testing-framework-jest-vs-vitest-vs-playwright)
2. [GraphQL Client: graphql-request vs Apollo Client](#2-graphql-client-graphql-request-vs-apollo-client)
3. [Jest ESM Configuration](#3-jest-esm-configuration)
4. [Test Organization Strategy](#4-test-organization-strategy)
5. [GraphQLTestClient Wrapper Design](#5-graphqltestclient-wrapper-design)
6. [Schema Introspection Utilities](#6-schema-introspection-utilities)

---

## 1. Testing Framework: Jest vs Vitest vs Playwright

### Decision: **Jest**

### Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| **Vitest** | Faster execution (~2x), modern architecture, better native ESM support, excellent TypeScript support | Newer (2021), smaller ecosystem, rarely mentioned in job descriptions, unknown enterprise adoption |
| **Playwright Test** | Already using in Project 1, single tool for UI + API, familiar patterns | Portfolio shows limited tool breadth, "one-tool engineer" perception, API teams often use different tools |
| **Mocha + Chai** | Established, flexible, lightweight | Declining popularity, fragmented ecosystem, manual configuration overhead |

---

### Why Jest?

#### 1. Industry Standard (Critical for Portfolio)
- **78%** of SDET job descriptions (160-200k range) mention "Jest" explicitly
- **3%** mention "Vitest"
- **42M+** weekly NPM downloads
- Used by Facebook, Netflix, Airbnb, Twitter, Uber

#### 2. Enterprise Adoption
- 10 years of production use (since 2014)
- Battle-tested at scale
- Companies don't easily switch testing frameworks
- Known edge cases documented
- Massive Stack Overflow knowledge base (750k+ questions)

#### 3. Portfolio Strategy
**Goal**: Demonstrate breadth of expertise, not just depth in one tool.

**Scenario**: If I join a company where:
- UI team uses Playwright
- API team uses Jest + Postman
- I need to contribute to both → This portfolio proves I can

Using Jest for Project 2 (after Playwright in Project 1) shows:
- Tool selection judgment
- Adaptability to different testing frameworks
- Understanding of team/toolchain diversity

#### 4. Interview Advantage

**Likely Question**: "What testing frameworks do you use?"

**Strong Answer**:
"I use Jest for API and unit testing in TypeScript. For this GraphQL project, I chose Jest because it's the industry standard and demonstrates I can work with the tools most companies already use. I'm also familiar with Playwright for UI testing and have explored newer alternatives like Vitest, but Jest's maturity and widespread adoption made it the right choice for a production-grade portfolio project."

---

### Trade-offs

**What I'm Sacrificing:**
- Vitest's faster execution (~2x speed improvement)
- Better Vite ecosystem integration
- More modern watch mode
- Native ESM support advantages

**What I'm Gaining:**
- Industry recognition and job market alignment
- Access to largest testing ecosystem
- Interview advantage (matches company expectations)
- Knowledge transferability (React Testing Library, frontend testing)

**For portfolio purposes: Industry standard > Technical superiority**

---

### Configuration

```typescript
// jest.config.ts
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'utils/**/*.ts',
    'config/**/*.ts',
    '!**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

---

## 2. GraphQL Client: graphql-request vs Apollo Client

### Decision: **graphql-request**

### Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| **Apollo Client** | Most feature-rich, built-in caching, excellent React integration, large ecosystem | Heavy (~140KB), over-engineered for testing, designed for frontend apps not testing |
| **axios + GraphQL** | Maximum control, lightweight (~13KB), familiar to REST developers | Manual request construction, more boilerplate, no GraphQL-specific features |
| **urql** | Lightweight (~25KB), modern architecture, flexible | Less popular, smaller community, less interview name recognition |

---

### Why graphql-request?

#### 1. Purpose-Built for Testing
graphql-request is designed for scenarios where you need to make GraphQL requests without frontend app overhead:
- API testing
- Server-side scripts
- CLI tools
- Automation workflows

**Package Size Comparison:**
- graphql-request: ~5KB
- Apollo Client: ~140KB
- urql: ~25KB

**For testing: Smaller = Faster test execution**

#### 2. Clean, Testing-Focused API

```typescript
// Simple and clear
const client = new GraphQLClient(endpoint, {
  headers: {
    authorization: `Bearer ${token}`,
  },
});

const data = await client.request(query, variables);
expect(data.user.name).toBe('John');
```

vs Apollo Client (more complex):
```typescript
const client = new ApolloClient({
  uri: endpoint,
  cache: new InMemoryCache(), // Don't need cache for testing
  // ... more configuration
});

const { data } = await client.query({
  query: gql`...`,
  variables,
  fetchPolicy: 'no-cache', // Disable cache for tests
});
```

**Testing principle**: Simpler API = More readable tests = Easier maintenance

#### 3. Philosophy Alignment with RestAssured
From my RestAssured experience at CVS:

**RestAssured (Java):**
```java
given()
  .contentType(ContentType.JSON)
  .body(payload)
.when()
  .post("/api/users")
.then()
  .statusCode(200)
  .body("name", equalTo("John"));
```

**graphql-request (TypeScript):**
```typescript
const data = await client.request(query, variables);
expect(data.user.name).toBe('John');
```

**Both are**: Declarative, focused, testing-first tools.

#### 4. Avoids Over-Engineering

**Apollo Client is excellent for:**
- Frontend applications with state management
- Normalized caching needs
- React integration
- Real-time subscriptions (primary use case)

**Not needed for testing where:**
- Tests should be isolated (no shared cache)
- No UI state management
- Simple request → response validation

**Engineering judgment**: Use enterprise-grade tools when needed, avoid complexity when simpler tools suffice.

---

### Trade-offs

**What I'm Sacrificing:**
- Apollo's rich ecosystem and tooling
- Built-in caching (not needed for tests)
- GraphQL DevTools integration
- Normalized cache benefits

**What I'm Gaining:**
- 28x smaller package size (5KB vs 140KB)
- Faster test execution
- Simpler test code (easier to read/maintain)
- Clear demonstration of tool selection judgment

**Testing philosophy: Right tool for the job, not biggest tool for every job**

---

## 3. Jest ESM Configuration

### Decision: **ESM with experimental-vm-modules**

### The Problem

This project uses modern TypeScript with ESM (ECMAScript Modules) as configured in `package.json`:

```json
{
  "type": "module"
}
```

Combined with `tsconfig.json` settings:

```json
{
  "compilerOptions": {
    "module": "nodenext",
    "verbatimModuleSyntax": true
  }
}
```

These settings enable modern ESM syntax but create compatibility challenges with Jest, which historically uses CommonJS.

---

### Issues Encountered and Solutions

#### Issue 1: TypeScript Config File Parsing Error

**Error:**
```
Jest: Failed to parse the TypeScript config file jest.config.ts
TSError: ECMAScript imports and exports cannot be written in a CommonJS file
under 'verbatimModuleSyntax'.
```

**Root Cause:**
When `verbatimModuleSyntax: true` is set in `tsconfig.json`, TypeScript enforces that ESM imports/exports can only exist in files explicitly marked as ESM. Jest uses `ts-node` to parse `jest.config.ts`, but `ts-node` was treating the file as CommonJS.

**Solution:**
Changed the config file from `jest.config.ts` to `jest.config.js` with ESM syntax:

```javascript
// jest.config.js (ESM)
/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest/presets/default-esm',
  // ...
};
```

**Why `.js` instead of `.mts`?**
- `.js` files in an ESM package (with `"type": "module"`) are automatically treated as ESM
- Avoids additional TypeScript compilation step for config
- Simpler toolchain with fewer moving parts

---

#### Issue 2: Cannot Use Import Statement Outside a Module

**Error:**
```
SyntaxError: Cannot use import statement outside a module
```

**Root Cause:**
Jest's default runtime doesn't support ESM. Even with `"type": "module"` in `package.json`, Jest needs explicit ESM mode enablement.

**Solution:**
Enable Node.js experimental VM modules flag in `package.json`:

```json
{
  "scripts": {
    "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js",
    "test:watch": "node --experimental-vm-modules node_modules/jest/bin/jest.js --watch",
    "test:coverage": "node --experimental-vm-modules node_modules/jest/bin/jest.js --coverage"
  }
}
```

**Why this approach?**
- `--experimental-vm-modules` enables Jest's ESM support
- Direct path to Jest binary ensures the flag is passed correctly
- Standard `jest` CLI doesn't accept Node flags

---

#### Issue 3: Why `npm test` Works But `npx jest` Doesn't

**Explanation:**

| Command | What It Does | Result |
|---------|--------------|--------|
| `npm test` | Runs the `"test"` script from `package.json` | Works - includes `--experimental-vm-modules` flag |
| `npx jest` | Directly executes Jest binary | Fails - no ESM flag passed |
| `npx test` | Tries to find a package called "test" | Fails - no such package exists |

**Key Insight:**
`npx` runs **packages**, not npm scripts. `npm test` (or `npm run test`) runs **scripts** defined in `package.json`.

To run Jest directly with ESM support without using npm scripts:
```bash
node --experimental-vm-modules node_modules/jest/bin/jest.js
```

---

### Final Configuration

#### jest.config.js
```javascript
/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          verbatimModuleSyntax: false
        }
      }
    ]
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  }
};
```

**Key Settings Explained:**

| Setting | Purpose |
|---------|---------|
| `preset: 'ts-jest/presets/default-esm'` | Base configuration for TypeScript + ESM |
| `extensionsToTreatAsEsm: ['.ts']` | Tells Jest to treat `.ts` files as ESM |
| `transform.useESM: true` | Configures ts-jest to output ESM |
| `tsconfig.verbatimModuleSyntax: false` | Overrides tsconfig for test compilation to avoid import/export errors |
| `moduleNameMapper` | Handles `.js` extension in imports (TypeScript ESM convention) |

---

### Trade-offs

**What We Sacrifice:**
- Simple `npx jest` command doesn't work
- Experimental Node.js feature (may change in future)
- Slightly more complex configuration

**What We Gain:**
- Modern ESM syntax throughout the codebase
- Consistent module system (no CJS/ESM mixing)
- Future-proof setup (ESM is the standard going forward)
- Better alignment with modern TypeScript practices

**Engineering Decision:**
ESM is the future of JavaScript modules. While the configuration is more complex today, it ensures the codebase follows modern standards and avoids the CommonJS/ESM interop issues that plague many projects.

---

## 4. Test Organization Strategy

### Decision: **Flat structure with category subdirectories for cross-cutting concerns**

> **Note:** The original design (v0.1.0–v0.5.0) used per-API subdirectories (`countries/`, `spaceX/`).
> This was retired in v0.6.0 in favor of a flat layout, because schema validation and error handling
> are cross-API concerns that didn't fit neatly into API-specific folders.

### The Structure

```
tests/
├── queryOpsForCountries.test.ts        # Countries API query tests (6)
├── queryOpsForSpaceX.test.ts           # SpaceX API query tests (2)
├── queryOpsForRickAndMorty.test.ts     # Rick & Morty API query tests (9)
├── mutationOpsForSpaceX.test.ts        # SpaceX API mutation tests (3)
├── errors/
│   └── error-handling.test.ts          # Cross-API error handling (7)
├── performance/
│   └── performance.test.ts             # Performance benchmarks (5)
└── schema/
    ├── countries-schema.test.ts        # Countries schema validation (24)
    └── spacex-schema.test.ts           # SpaceX schema validation (28)
```

### Why This Structure?

#### 1. Flat Layout for API-Specific Tests

Operation-type test files live at the `tests/` root because:

- **Simple discovery**: All query/mutation test files are immediately visible without navigating subdirectories
- **Easy CLI targeting**: Can run `npm test -- RickAndMorty` to test only one API
- **File naming is sufficient**: The `queryOpsFor<API>` convention already encodes both the operation type and API
- **Cross-cutting subdirectories**: Errors, performance, and schema tests span multiple APIs and belong in their own folders

#### 2. Operation-Type Files

Separating queries and mutations into different files because:

- **Different testing patterns**: Queries are idempotent; mutations may have side effects
- **Different error handling**: Query errors vs mutation validation errors
- **Logical grouping**: All query tests together, all mutation tests together
- **Smaller files**: Easier to read and maintain

### Naming Convention

| Pattern | Example | Purpose |
|---------|---------|---------|
| `queryOpsFor<API>.test.ts` | `queryOpsForSpaceX.test.ts` | Query operation tests |
| `mutationOpsFor<API>.test.ts` | `mutationOpsForSpaceX.test.ts` | Mutation operation tests |
| `schemaFor<API>.test.ts` | `schemaForSpaceX.test.ts` | Schema introspection tests (planned) |

### Documentation Standards

Each test file includes a JSDoc header documenting:

```typescript
/**
 * <API Name> API <Operation Type> Tests
 *
 * API: <endpoint URL>
 *
 * <Description of what the API provides>
 *
 * Test Coverage:
 * - <List of test scenarios>
 *
 * @see <Link to API documentation or schema explorer>
 */
```

**Why JSDoc?**
- Self-documenting code
- IDE tooltip support
- Generates documentation if needed
- Clear context for each test file

---

### SpaceX API Mutation Behavior

The SpaceX public API exposes mutation fields in its schema:
- `insert_users`
- `update_users`
- `delete_users`

However, these mutations return `null` when executed, indicating they are disabled for public access.

**Testing Approach:**
Rather than skipping these tests, we:
1. Execute the mutations with correct Hasura syntax
2. Assert they return `null`
3. Document the behavior in test names and comments

**Why Test Disabled Mutations?**

| Reason | Benefit |
|--------|---------|
| **Demonstrates syntax knowledge** | Shows understanding of Hasura-style mutations |
| **Documents API behavior** | Tests serve as documentation |
| **Detects API changes** | If mutations become enabled, tests will fail (alerting us) |
| **Complete coverage** | Tests all available schema operations |

---

### Trade-offs

**What We Sacrifice:**
- More files to manage
- Deeper directory structure

**What We Gain:**
- Clear organization by API
- Easy to run specific test subsets
- Separation of concerns (queries vs mutations)
- Self-documenting structure
- Scalable as more APIs are added

---

## 5. GraphQLTestClient Wrapper Design

### Decision: **Custom wrapper with specialized testing methods**

### The Problem

Raw `graphql-request` provides a simple API, but testing scenarios often require:
- Repetitive status code validation
- Content-type header checks
- Error context when tests fail
- Performance measurement
- Different return types for different test needs

### Solution: GraphQLTestClient Wrapper

Created `utils/graphql-client.ts` with a `GraphQLTestClient` class that provides specialized methods for different testing scenarios.

---

### Method Selection Guide

| Method | When to Use | Returns | Auto-Validations |
|--------|-------------|---------|------------------|
| `request()` | Most tests - just need data | Data only | None (trust the API) |
| `rawRequest()` | Need headers/status/metadata | Full response | Status 200, JSON content-type |
| `requestExpectingError()` | Testing error scenarios | void | Asserts throw |
| `measureQuery()` | Performance testing | `{ data, time }` | None |
| `batchRequests()` | Multiple queries at once | Array of data | None |

---

### Design Principles

#### 1. Right Method for the Job

**90% of tests** just need data - use `request()`:
```typescript
const data = await client.request(query);
expect(data.country.name).toBe('United States');
```

**Full response validation** - use `rawRequest()`:
```typescript
const response = await client.rawRequest(query);
// Wrapper already validated status=200 and content-type
expect(response.headers).toBeDefined();
```

**Error testing** - use `requestExpectingError()`:
```typescript
await client.requestExpectingError(malformedQuery);
// Cleaner than: await expect(...).rejects.toThrow()
```

**Performance testing** - use `measureQuery()`:
```typescript
const { data, time } = await client.measureQuery(query);
expect(time).toBeLessThan(2000);
```

#### 2. Automatic Validations in rawRequest()

The wrapper's `rawRequest()` method automatically validates:
- HTTP status code is 200
- Content-type is `application/json` or `application/graphql-response+json`

This removes repetitive boilerplate from tests while ensuring basic response integrity.

#### 3. Enhanced Error Context

When requests fail, the wrapper provides detailed context:
```
GraphQL Error at https://api.example.com/graphql
Query: query { country(code: "US") { name } }...
Variables: {"code":"US"}
Errors: Field 'name' not found on type 'Country'
```

This speeds up debugging by showing:
- Which endpoint failed
- What query was sent
- What variables were used
- What the actual error was

---

### API Compatibility Notes

#### Batch Requests
Some GraphQL APIs don't support batch requests:
- **Countries API**: Returns "Batch queries and APQ request are not currently supported"
- **SpaceX API**: Returns "Operation batching disabled"

Tests document this with comments rather than skipped tests, as the `batchRequests()` method is still valuable for APIs that support it.

#### Content-Type Variations
Different GraphQL servers return different content-types:
- Standard: `application/json`
- GraphQL-over-HTTP spec: `application/graphql-response+json`

The wrapper accepts both to ensure compatibility across APIs.

---

### Trade-offs

**What We Sacrifice:**
- Slight abstraction over raw graphql-request
- Additional wrapper code to maintain

**What We Gain:**
- Consistent testing patterns across all test files
- Reduced boilerplate in individual tests
- Better error messages when tests fail
- Built-in performance measurement
- Clear method names that document intent

---

### Usage Statistics (Current Codebase)

| Method | Usage Count | Percentage |
|--------|-------------|------------|
| `request()` | 20 calls | 60.6% |
| `rawRequest()` | 2 calls | 6.1% |
| `requestExpectingError()` | 5 calls | 15.2% |
| `measureQuery()` | 6 calls | 18.2% |
| `batchRequests()` | 0 calls* | 0% |

*Not supported by current test APIs. The remaining 52 tests (schema validation) use introspection utility functions rather than direct wrapper method calls.

---

## 6. Schema Introspection Utilities

### Decision: **Reusable utility functions with caching strategy**

### The Problem

GraphQL schema validation requires introspection queries (`__schema`, `__type`) to extract schema metadata. Without a structured approach:
- Each test makes individual API calls, risking rate limits
- Complex type unwrapping logic is duplicated across tests
- Tests become coupled to introspection query structure

### Solution: Schema Introspection Utilities

Created `utils/schema-introspection.ts` with reusable functions:

| Function | Purpose | Returns |
|----------|---------|---------|
| `getSchemaTypes()` | List all types in schema | `string[]` |
| `getTypeDetails()` | Get type kind, fields, metadata | `TypeDetails` |
| `getTypeFields()` | Get field names for a type | `string[]` |
| `getFieldInfo()` | Get specific field details | `FieldInfo` |
| `getAvailableQueries()` | List query operations | `string[]` |
| `getAvailableMutations()` | List mutation operations | `string[]` |
| `typeExists()` | Check if type exists | `boolean` |
| `getTypeKind()` | Get type kind (OBJECT, SCALAR, etc.) | `string` |

---

### Type Unwrapping Algorithm

GraphQL types can be deeply nested with wrappers:
- `NON_NULL` - Required field
- `LIST` - Array type
- Nested combinations like `[Language!]!` (required array of required Language)

The utilities unwrap these to extract:
- Base type name (e.g., `Language`)
- `isRequired` flag
- `isArray` flag

**Example: Parsing `[Language!]!`**
```
NON_NULL → LIST → NON_NULL → Language
   ↓        ↓        ↓         ↓
isRequired  isArray  (inner)   typeName
```

The introspection query uses 4 levels of `ofType` nesting to handle all practical cases:
```graphql
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
        ofType { name kind }
      }
    }
  }
}
```

---

### Test Optimization Strategy

**Problem**: Rate limiting on public GraphQL APIs (e.g., Countries API limits to 1 request per 20 seconds).

**Solution**: Cache all type data in `beforeAll` using `Promise.all()`:

```typescript
beforeAll(async () => {
  const [types, country, continent, query] = await Promise.all([
    getSchemaTypes(client),
    getTypeDetails(client, 'Country'),
    getTypeDetails(client, 'Continent'),
    getTypeDetails(client, 'Query'),
  ]);

  schemaTypes = types;
  countryType = country;
  // ... cache all type data
});
```

**Benefits:**
- All introspection calls happen in parallel
- Single burst of API requests instead of one per test
- Tests use cached data, avoiding rate limits
- Faster test execution

---

### Schema Test Coverage

| API | Tests | Coverage |
|-----|-------|----------|
| Countries | 24 | Types, fields, relationships, queries |
| SpaceX | 28 | Types, fields, queries, mutations, nested relationships |

**Test Categories:**
- **Type Existence**: Verify expected types exist in schema
- **Field Validation**: Check field presence, types, required/optional
- **Relationship Testing**: Validate nested object relationships
- **Query/Mutation Operations**: Verify available operations and return types

---

### Trade-offs

**What We Sacrifice:**
- Single point of failure (if introspection fails, all schema tests fail)
- Cached data may become stale in long-running test sessions

**What We Gain:**
- Consistent introspection patterns across all schema tests
- Rate limit compliance through batched requests
- Reusable utilities for any GraphQL API
- Clean separation of introspection logic from test assertions
- Faster test execution through parallelized fetching

---

*Last Updated: February 5, 2026*
