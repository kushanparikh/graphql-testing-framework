# Architecture

**Project:** GraphQL API Testing Suite
**Version:** 0.8.0
**Last Updated:** February 8, 2026

---

## Overview

This project is a professional GraphQL API integration testing framework built with **TypeScript**, **Jest**, and **graphql-request**. It validates query operations, mutations, schema structure, error handling, authentication, and performance across four public GraphQL APIs.

The architecture prioritizes **clarity**, **reusability**, and **real-world testing patterns** over abstraction for its own sake. Every layer exists because tests needed it, not because a design pattern prescribed it.

**Key metrics:**
- **90 tests** across 9 test files (225% of the original 40-test goal)
- **4 public GraphQL APIs** exercised against real endpoints
- **2 reusable utility modules** (client wrapper + schema introspection)
- **CI/CD pipeline** with GitHub Actions, coverage reporting, and artifact archival

---

## Architecture Principles

### Separation of Concerns (SoC)

Each layer has a single responsibility:

| Layer | Responsibility | Files |
|-------|---------------|-------|
| **Tests** | Assertions and test logic | `tests/*.test.ts` |
| **Client Wrapper** | HTTP transport, error enhancement, measurement | `utils/graphql-client.ts` |
| **Schema Introspection** | Schema metadata extraction and normalization | `utils/schema-introspection.ts` |
| **GraphQL Transport** | Low-level HTTP + GraphQL protocol | `graphql-request` (third-party) |

### Don't Repeat Yourself (DRY)

- `GraphQLTestClient` wraps common patterns (auth headers, error context, performance measurement) so tests don't reimplement them
- Schema introspection utilities extract the type-unwrapping algorithm once, reused across 52 schema validation tests
- `beforeAll` + `Promise.all()` pattern fetches schema data once per suite, not per test

### Single Responsibility Principle (SRP)

- `request()` returns data only — no validation overhead
- `rawRequest()` returns full response with automatic status/content-type validation
- `requestExpectingError()` handles the assertion-that-it-throws pattern
- `measureQuery()` adds timing without changing the request flow

### Composition Over Inheritance

The client wrapper and introspection utilities are standalone modules composed together in tests — not a class hierarchy. Tests import what they need:

```typescript
// Query tests: just the client
import { GraphQLTestClient } from '../utils/graphql-client.ts';

// Schema tests: client + introspection utilities
import { GraphQLTestClient } from '../../utils/graphql-client.ts';
import { getSchemaTypes, getTypeDetails } from '../../utils/schema-introspection.ts';
```

---

## Framework Layers

```
┌─────────────────────────────────────────────────┐
│                   Test Files                     │
│  queryOps / mutationOps / schema / errors / perf │
├─────────────────────────────────────────────────┤
│              GraphQLTestClient                   │
│  request() · rawRequest() · measureQuery()       │
│  requestExpectingError() · batchRequests()        │
│  setHeaders() · setAuthToken()                   │
├─────────────────────────────────────────────────┤
│          Schema Introspection Utilities           │
│  getSchemaTypes() · getTypeDetails()             │
│  getTypeFields() · getFieldInfo()                │
│  getAvailableQueries() · getAvailableMutations() │
│  typeExists() · getTypeKind()                    │
├─────────────────────────────────────────────────┤
│              graphql-request (5KB)               │
│         Lightweight GraphQL HTTP client          │
├─────────────────────────────────────────────────┤
│             Public GraphQL APIs                  │
│  Countries · SpaceX · Rick & Morty · GitHub      │
└─────────────────────────────────────────────────┘
```

**Data flows downward.** Tests compose client methods and introspection utilities. The client wrapper handles transport concerns. `graphql-request` handles the HTTP/GraphQL protocol. APIs return data.

---

## Design Patterns

### 1. GraphQL Client Wrapper Pattern

**File:** `utils/graphql-client.ts` (320 lines)

The `GraphQLTestClient` class wraps `graphql-request`'s `GraphQLClient` with testing-specific methods. Instead of one generic `request()` method, it provides purpose-built methods that match testing intent:

| Method | Use Case | Returns | Auto-Validations |
|--------|----------|---------|-------------------|
| `request<T>()` | Standard data assertions (90% of tests) | `T` (data only) | None — trusts the API |
| `rawRequest<T>()` | Header/status inspection | Full response + headers | HTTP 200, JSON content-type |
| `requestExpectingError()` | Negative/error path testing | `void` | Asserts the request throws |
| `measureQuery<T>()` | Performance benchmarking | `{ data: T, time: number }` | None |
| `batchRequests<T>()` | Multiple queries in one HTTP call | `T[]` | None |
| `setHeaders()` | Dynamic header updates | `void` | None |
| `setAuthToken()` | Bearer token management | `void` | None |

**Why a wrapper instead of using `graphql-request` directly?**

1. **Enhanced error context** — Errors include the endpoint URL, query snippet (first 150 chars), variables, and original error message. Without this, a failing test just says "request failed" with no debugging context.

2. **Right method for the job** — `request()` returns data only, so tests don't need `response.data.country` everywhere. `rawRequest()` adds automatic validations. `requestExpectingError()` wraps the `expect().rejects.toThrow()` boilerplate.

3. **Consistent auth handling** — The constructor accepts an optional token and sets the `Authorization: Bearer` header automatically.

**Example — enhanced error output:**

```
GraphQL Error at https://countries.trevorblades.com/
Query: query { country(code: "INVALID_CODE_THAT_IS_WAY_TOO_LONG") { name ...
Variables: {"code":"INVALID_CODE_THAT_IS_WAO_TOO_LONG"}
Errors: Cannot query field "nonexistent" on type "Country"
```

### 2. Schema Introspection Utilities Pattern

**File:** `utils/schema-introspection.ts` (388 lines)

These are standalone functions (not a class) that use GraphQL's built-in `__schema` and `__type` introspection queries to extract schema metadata. The key technical challenge is **type unwrapping**.

**The Type Unwrapping Problem:**

GraphQL wraps types in modifier layers. A field like `languages: [Language!]!` comes back from introspection as:

```
NON_NULL → LIST → NON_NULL → Language
```

The `parseFieldType()` function walks this chain to extract:

```typescript
{ type: "Language", isRequired: true, isArray: true }
```

This handles up to 4 levels of nesting, covering all practical GraphQL type combinations.

**Caching Strategy:**

Schema introspection queries hit real APIs, so test suites fetch all needed type data once in `beforeAll` using `Promise.all()`:

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
});
```

This reduces API calls from ~24 (one per test) to ~6 (one burst) for the Countries schema suite, and from ~28 to ~7 for SpaceX.

### 3. Category-Based Test Organization

Tests are organized by **what they test** (query operations, mutations, schema, errors, performance) rather than by API:

```
tests/
├── queryOpsForCountries.test.ts        # Query patterns
├── queryOpsForSpaceX.test.ts           # Query patterns
├── queryOpsForRickAndMorty.test.ts     # Query patterns (fragments, aliases)
├── queryOpsForGitHubAuth.test.ts       # Auth patterns
├── mutationOpsForSpaceX.test.ts        # Mutation patterns
├── errors/
│   └── error-handling.test.ts          # Cross-API error scenarios
├── performance/
│   └── performance.test.ts             # Cross-API benchmarks
└── schema/
    ├── countries-schema.test.ts        # Schema validation
    └── spacex-schema.test.ts           # Schema validation
```

**Why this structure?**

- **CLI targeting:** `npm test -- RickAndMorty` runs just Rick & Morty tests
- **Cross-cutting concerns get their own directory:** Error handling and performance tests span multiple APIs, so they live in category subdirectories
- **API-specific tests stay flat:** Query and mutation files use the `<category>OpsFor<API>.test.ts` naming convention for easy discovery
- **File naming makes intent obvious:** You know what `mutationOpsForSpaceX.test.ts` tests without opening it

### 4. Conditional Test Suite Pattern

**File:** `tests/queryOpsForGitHubAuth.test.ts`

The GitHub API requires authentication, but the test suite must work both locally (where a token may or may not exist in `.env`) and in CI (where `GITHUB_TOKEN` is auto-provided by GitHub Actions):

```typescript
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const describeWithAuth = GITHUB_TOKEN ? describe : describe.skip;

if (!GITHUB_TOKEN) {
  console.warn('GITHUB_TOKEN not found - GitHub auth tests will be skipped');
}

describeWithAuth('GitHub API - Authentication', () => {
  // All 6 tests live here — entire suite skips gracefully
});
```

**Why `describe.skip` instead of per-test `test.skip`?**

Jest does not support conditional `test.skip` at the individual test level using a runtime variable — the skip decision must happen at the describe block level. The `describeWithAuth` pattern skips the entire suite cleanly with a single conditional.

---

## Project Structure

```
graphql-api-testing-suite/
├── .github/
│   └── workflows/
│       └── graphql.yml                 # CI/CD pipeline
├── docs/
│   ├── DESIGN_DECISIONS.md             # Technology choices (888 lines)
│   ├── ARCHITECTURE.md                 # This file
│   ├── LEARNING_NOTES.md               # GraphQL testing insights
│   └── API_COVERAGE.md                 # Coverage matrix
├── tests/                              # 9 test files, 90 tests
│   ├── queryOpsForCountries.test.ts    #   6 tests
│   ├── queryOpsForSpaceX.test.ts       #   2 tests
│   ├── queryOpsForRickAndMorty.test.ts #   9 tests
│   ├── queryOpsForGitHubAuth.test.ts   #   6 tests
│   ├── mutationOpsForSpaceX.test.ts    #   3 tests
│   ├── errors/
│   │   └── error-handling.test.ts      #   7 tests
│   ├── performance/
│   │   └── performance.test.ts         #   5 tests
│   └── schema/
│       ├── countries-schema.test.ts    #  24 tests
│       └── spacex-schema.test.ts       #  28 tests
├── utils/                              # 2 utility modules
│   ├── graphql-client.ts               # GraphQLTestClient wrapper (320 lines)
│   └── schema-introspection.ts         # Introspection utilities (388 lines)
├── jest.config.js                      # ESM + TypeScript config
├── tsconfig.json                       # Strict TypeScript
├── package.json                        # ESM module, test scripts
├── README.md                           # Project overview
├── CHANGELOG.md                        # Version history (v0.1.0–v0.8.0)
├── TODO.md                             # Progress tracking
└── plan.md                             # Sprint planning
```

---

## Data Flow

### Test Execution Flow

```
Test File
  │
  ├─ beforeAll() ─── Create GraphQLTestClient(endpoint, token?)
  │
  ├─ test("should fetch X") ──┐
  │                            │
  │   1. Build query string    │
  │   2. Define variables      │
  │   3. Call client method    │
  │      ├─ request()          │──► graphql-request ──► API ──► JSON response
  │      ├─ rawRequest()       │       (HTTP POST)        (GraphQL endpoint)
  │      ├─ measureQuery()     │
  │      └─ requestExpectingError()
  │   4. Assert on response    │
  │                            │
  └─ afterAll() (none needed — clients are stateless)
```

### Schema Validation Flow

```
Schema Test File
  │
  ├─ beforeAll()
  │    ├─ Create GraphQLTestClient(endpoint)
  │    └─ Promise.all([
  │         getSchemaTypes(client),        ──► __schema { types { name } }
  │         getTypeDetails(client, 'X'),   ──► __type(name: "X") { fields... }
  │         getTypeDetails(client, 'Y'),
  │         ...
  │       ])
  │    └─ Cache results in describe-scoped variables
  │
  ├─ test("Type X should have field F")
  │    └─ Read from cached typeDetails (no API call)
  │
  └─ test("Field F should be required String")
       └─ Read from cached typeDetails (no API call)
```

---

## Testing Strategy

### Test Categories

| Category | Tests | Purpose |
|----------|-------|---------|
| **Query Operations** | 23 | Validate GraphQL query syntax, variables, nesting, filtering, pagination, fragments, aliases |
| **Mutation Operations** | 3 | Demonstrate Hasura-style mutation syntax (insert, update, delete) |
| **Schema Validation** | 52 | Verify type existence, field types, required/optional fields, relationships |
| **Error Handling** | 7 | Test invalid inputs, syntax errors, missing variables, non-existent fields |
| **Performance** | 5 | Benchmark query execution times, compare simple vs. complex queries |

### Coverage Philosophy

**Code coverage: 43.75%** — This is intentional and by design.

This suite focuses on **integration testing** against real GraphQL APIs. The utility modules (`graphql-client.ts` and `schema-introspection.ts`) are tested indirectly through the 90 integration tests that exercise them. Every public method of `GraphQLTestClient` is called by at least one test file:

| Method | Exercised By |
|--------|-------------|
| `request()` | Countries, SpaceX, Rick & Morty, GitHub, Mutations |
| `rawRequest()` | Countries, SpaceX, GitHub (rate limits) |
| `requestExpectingError()` | Error handling suite, GitHub (invalid token) |
| `measureQuery()` | Performance suite |
| `batchRequests()` | Documented as unsupported by tested APIs |
| `setAuthToken()` | GitHub auth tests |

**Why not higher coverage?**

- Integration test frameworks typically achieve 40–60% code coverage. The value is in exercising real API behavior, not in mocking transport internals.
- Adding unit tests for the client wrapper would mean mocking `graphql-request` — testing our mock, not real behavior.
- The 90 tests validate that every utility function works correctly against production APIs. That's stronger validation than unit tests with mocked responses.

---

## CI/CD Architecture

**File:** `.github/workflows/graphql.yml`

```
┌──────────────────────────────────────────────────────────┐
│                   GitHub Actions Trigger                  │
│  push to main · pull request to main · manual dispatch   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  1. Checkout code         actions/checkout@v5            │
│  2. Setup Node.js         actions/setup-node@v5 (LTS)   │
│  3. Install deps          npm ci (reproducible)          │
│  4. Run tests             npm test                       │
│     ├─ GITHUB_TOKEN ← secrets.GITHUB_TOKEN (auto)       │
│     └─ CI=true                                           │
│  5. Coverage report       npm run test:coverage          │
│  6. Upload artifacts      coverage/ + html-report/       │
│     └─ 14-day retention                                  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Key design decisions:**

- **`npm test` not `npx jest`** — The test script in `package.json` includes `--experimental-vm-modules`, which is required for ESM support. Running `npx jest` directly skips this flag and fails.
- **Auto-provided `GITHUB_TOKEN`** — GitHub Actions provides a scoped token automatically. No manual secret configuration needed for the GitHub API auth tests.
- **Artifact archival** — Coverage reports and HTML test reports are uploaded as artifacts on every run (not just failures) for 14-day retention.
- **Failure-specific artifacts** — On test failure, additional debug artifacts (`jest-failures.json`) are uploaded.

---

## Design Decisions

Detailed rationale for each technology choice is documented in [DESIGN_DECISIONS.md](./DESIGN_DECISIONS.md). Summary of key decisions:

### Jest over Vitest

**Chosen:** Jest (78% of SDET job postings mention it)
**Trade-off:** Sacrificing Vitest's ~2x speed for industry-standard recognition
**Rationale:** Portfolio projects should demonstrate tools companies actually use

### graphql-request over Apollo Client

**Chosen:** graphql-request (5KB)
**Trade-off:** No client-side caching, no subscriptions
**Rationale:** Apollo Client (140KB) is over-engineered for API testing. graphql-request provides the exact API surface tests need — `request()`, `rawRequest()`, `batchRequests()` — without unused abstractions.

### Category-Based Organization (Evolution)

**Before (v0.1–v0.3):** One file per API
**After (v0.6+):** Category-based with cross-cutting subdirectories
**Rationale:** Error handling and performance tests span multiple APIs. Grouping by category makes the suite navigable and reflects how real test organizations structure their suites.

### Integration Focus over Unit Coverage

**43.75% line coverage with 90 tests** — Every test hits a real API.
**Rationale:** The alternative (mocking `graphql-request`) would test our mocks, not real API behavior. Integration tests against production endpoints provide stronger confidence than isolated unit tests with synthetic responses.

---

## Scalability Considerations

### Adding a New API

1. Create `tests/queryOpsFor<API>.test.ts`
2. Instantiate `GraphQLTestClient` with the new endpoint
3. Optionally add schema tests in `tests/schema/<api>-schema.test.ts`
4. No changes to utility modules required

### Adding New Test Categories

1. Create a new subdirectory under `tests/` (e.g., `tests/security/`)
2. Import existing utilities — `GraphQLTestClient` and introspection functions work with any GraphQL endpoint

### Growing the Utility Layer

The client wrapper and introspection utilities are independent modules:
- New client methods (e.g., `requestWithRetry()`) can be added without changing existing tests
- New introspection functions (e.g., `getEnumValues()`) compose with existing functions

---

## Summary

This architecture demonstrates:

1. **Layered abstraction** — Tests compose utilities without coupling to transport details
2. **Purpose-built methods** — Each client method matches a testing intent, reducing boilerplate
3. **Performance-conscious design** — Schema caching via `Promise.all()` minimizes API calls
4. **Production CI/CD** — GitHub Actions pipeline with coverage reporting and artifact archival
5. **Intentional trade-offs** — Integration focus over unit coverage, industry-standard tools over technically superior alternatives
6. **Scalable structure** — Adding APIs or test categories requires no changes to the utility layer

The 90-test suite validates real API behavior across query operations, mutations, schema structure, error handling, authentication, and performance — exercising every public method of the utility layer against production endpoints.
