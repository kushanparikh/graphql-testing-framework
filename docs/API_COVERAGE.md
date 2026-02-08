# API Coverage

**Project:** GraphQL API Testing Suite
**Version:** 0.8.0
**Last Updated:** February 8, 2026

---

## Overview

This test suite validates GraphQL operations against **4 public GraphQL APIs**, each selected to demonstrate specific testing patterns and GraphQL concepts. Together they cover the full spectrum of GraphQL testing: queries, mutations, schema validation, error handling, authentication, and performance.

**Total: 90 tests across 9 test files**

---

## Comprehensive Coverage Matrix

| API | Endpoint | Queries | Mutations | Schema | Auth | Performance | Error | Total |
|-----|----------|---------|-----------|--------|------|-------------|-------|-------|
| **Countries** | `countries.trevorblades.com` | 6 | 0 | 24 | 0 | 3 | 5 | **38** |
| **SpaceX** | `spacex-production.up.railway.app` | 2 | 3 | 28 | 0 | 2 | 2 | **37** |
| **Rick & Morty** | `rickandmortyapi.com/graphql` | 9 | 0 | 0 | 0 | 0 | 0 | **9** |
| **GitHub** | `api.github.com/graphql` | 6 | 0 | 0 | 6 | 0 | 0 | **6** |
| **Total** | | **23** | **3** | **52** | **6** | **5** | **7** | **90** |

> **Note:** Auth tests are a subset of the GitHub query count (all 6 GitHub tests exercise authentication). The column separates them for visibility into the auth pattern.

---

## Test Distribution by Category

| Category | Count | Percentage | Files |
|----------|-------|------------|-------|
| Schema Validation | 52 | 57.8% | `countries-schema.test.ts`, `spacex-schema.test.ts` |
| Query Operations | 23 | 25.6% | `queryOpsForCountries.test.ts`, `queryOpsForSpaceX.test.ts`, `queryOpsForRickAndMorty.test.ts`, `queryOpsForGitHubAuth.test.ts` |
| Error Handling | 7 | 7.8% | `error-handling.test.ts` |
| Performance | 5 | 5.5% | `performance.test.ts` |
| Mutation Operations | 3 | 3.3% | `mutationOpsForSpaceX.test.ts` |

**Schema validation (57.8%)** forms the largest category because it validates the API contract programmatically — type existence, field types, required/optional fields, and relationships. This is the most valuable category for regression detection.

**Query operations (25.6%)** cover the breadth of GraphQL query features: variables, nesting, filtering, pagination, fragments, aliases, and multi-resource queries.

---

## API-Specific Details

### 1. Countries API

**Endpoint:** `https://countries.trevorblades.com/`
**Authentication:** None required
**Rate Limits:** Moderate (no published limits, but throttles under heavy load)
**Batch Requests:** Not supported ("Batch queries and APQ request are not currently supported")
**Mutations:** None available
**Best For:** Learning basic GraphQL query patterns, schema validation fundamentals

**Quirks:**
- Returns `null` for invalid country codes (not an error)
- Coerces numeric values to string for `ID!` type (e.g., `123` becomes `"123"`)
- No pagination — `countries` query returns all ~250 countries at once
- Uses `filter` argument with `StringQueryOperatorInput` for filtering

**Test Coverage Breakdown:**

| File | Tests | Patterns Demonstrated |
|------|-------|-----------------------|
| `queryOpsForCountries.test.ts` | 6 | Basic query, multiple fields, variables, nested data, arrays, filtering |
| `countries-schema.test.ts` | 24 | Type existence (5 types), field validation, type checking, relationships |
| `error-handling.test.ts` (Countries section) | 5 | Invalid args, syntax errors, missing variables, non-existent fields, type coercion |
| `performance.test.ts` (Countries section) | 3 | Simple query timing, large dataset timing, simple vs. nested comparison |

**Schema Types Validated:**
- `Country` — 12 fields validated (code, name, native, phone, capital, currency, emoji, emojiU, continent, languages, states, subdivisions)
- `Continent` — 3 fields validated (code, name, countries)
- `Language` — 4 fields validated (code, name, native, rtl)
- `State` — Relationship validation (country field)
- `Query` — 6 operations validated (country, countries, continent, continents, language, languages)
- Input types: `StringQueryOperatorInput`, `CountryFilterInput`, `ContinentFilterInput`, `LanguageFilterInput`

---

### 2. SpaceX API

**Endpoint:** `https://spacex-production.up.railway.app/`
**Authentication:** None required (public access)
**Rate Limits:** Moderate
**Batch Requests:** Not supported ("Operation batching disabled.")
**Mutations:** In schema but disabled (return `null`)
**Best For:** Mutation syntax (Hasura-style), complex nested types, large datasets

**Quirks:**
- Built on Hasura — auto-generated CRUD mutations with `insert_`, `update_`, `delete_` prefix
- Mutations are in the schema but return `null` for public access
- Uses `limit` argument for pagination (not page-based)
- Has deeply nested type relationships: Launch -> LaunchRocket -> Rocket
- The `LaunchRocket` type is a join type between `Launch` and `Rocket`

**Test Coverage Breakdown:**

| File | Tests | Patterns Demonstrated |
|------|-------|-----------------------|
| `queryOpsForSpaceX.test.ts` | 2 | Paginated queries, response metadata via `rawRequest()` |
| `mutationOpsForSpaceX.test.ts` | 3 | Hasura insert, update, delete mutations (return null) |
| `spacex-schema.test.ts` | 28 | Type existence (6+ types), field validation, mutation operations, relationships |
| `error-handling.test.ts` (SpaceX section) | 2 | Non-existent fields, invalid variable types |
| `performance.test.ts` (SpaceX section) | 2 | Paginated (5 items), stress test (100 items) |

**Schema Types Validated:**
- `Launch` — 8 fields validated (id, mission_name, launch_date_utc, launch_success, rocket, launch_site, links, details)
- `Rocket` — 10 fields validated (id, name, type, active, stages, boosters, cost_per_launch, success_rate_pct, first_flight, description)
- `LaunchRocket` — 3 fields validated (rocket_name, rocket_type, rocket)
- `LaunchLinks` — 3 fields validated (video_link, article_link, wikipedia)
- `Query` — 6 operations validated (launches, launch, rockets, rocket, capsules, launchpads)
- `Mutation` — 3 operations validated (insert_users, update_users, delete_users)
- Hasura types: `users`, `users_mutation_response`

---

### 3. Rick & Morty API

**Endpoint:** `https://rickandmortyapi.com/graphql`
**Authentication:** None required
**Rate Limits:** Lenient (public API with generous limits)
**Batch Requests:** Not tested
**Mutations:** None available (read-only API)
**Best For:** Advanced query patterns — fragments, aliases, pagination metadata, deep nesting, multi-resource queries

**Quirks:**
- Page-based pagination with default page size of 20
- `info` object returns `count`, `pages`, `next`, `prev` alongside `results`
- `next` and `prev` are page numbers (not URLs), `null` at boundaries
- Character count (826) and page count (42) are stable fixtures
- 3-level nesting works: Character -> Location -> Characters (circular)
- Filter uses AND composition (multiple filter fields narrow results)
- Name filter is case-insensitive partial match

**Test Coverage Breakdown:**

| File | Tests | Patterns Demonstrated |
|------|-------|-----------------------|
| `queryOpsForRickAndMorty.test.ts` | 9 | Single resource fetch, pagination, name filtering, multi-parameter AND filtering with aliases, 3-level nesting, episode-character relationships, multi-resource queries, fragments, aliases |

**Detailed Test Breakdown:**

| Test | GraphQL Concepts |
|------|-----------------|
| Fetch single character | Variables (`$id: ID!`), single resource |
| Pagination metadata | Page-based pagination, `info` object, default page size |
| Filter by name | Partial string matching, case-insensitive filter |
| Multi-parameter filter | AND composition, aliases for comparison, set theory validation |
| Nested data (3 levels) | Character -> Origin -> Residents, bidirectional traversal |
| Episode with characters | One-to-many relationship, known fixture validation |
| Multi-resource query | 3 resources in one request (character + location + episode) |
| Fragments | `fragment ... on Type`, spread syntax, DRY field selection |
| Aliases | Key collision avoidance, same-type multi-query |

---

### 4. GitHub GraphQL API

**Endpoint:** `https://api.github.com/graphql`
**Authentication:** Required (Bearer token)
**Rate Limits:** 5,000 requests/hour (authenticated), 60/hour (unauthenticated)
**Batch Requests:** Not tested
**Mutations:** Available but not tested (read-only tests by design)
**Best For:** Authentication patterns, token handling, rate limit validation, production API testing

**Quirks:**
- Requires `Authorization: Bearer <token>` header
- Different token scopes grant different data access
- `viewer` query returns the authenticated user (not a specific user)
- In CI, `viewer.login` is `"github-actions[bot]"` (not a real user)
- Rate limit info available both as a query field and in response headers
- Connection pattern: `repositories(first: N) { totalCount, nodes { ... } }`
- `GITHUB_TOKEN` is auto-provided in GitHub Actions (no manual secret setup)

**Test Coverage Breakdown:**

| File | Tests | Patterns Demonstrated |
|------|-------|-----------------------|
| `queryOpsForGitHubAuth.test.ts` | 6 | Viewer profile, repository listing, repository details, rate limit validation, invalid token error handling, scope-dependent queries |

**Detailed Test Breakdown:**

| Test | Authentication Concept |
|------|----------------------|
| Fetch viewer profile | Token validity, basic auth, `viewer` query |
| List repositories | Pagination (`first: N`), connection pattern, nested data |
| Get repository details | Query by owner/name, language detection, nested objects |
| Rate limit validation | Rate limit query, `rawRequest()` for headers, timestamp validation |
| Invalid token (401) | Error handling for auth failure, `requestExpectingError()` |
| Scope-dependent query | `PRIVATE` privacy filter, scope documentation |

---

## Feature Coverage Matrix

| Feature | Countries | SpaceX | Rick & Morty | GitHub | Notes |
|---------|:---------:|:------:|:------------:|:------:|-------|
| Basic Queries | X | X | X | X | All 4 APIs |
| Variables | X | | X | X | `$code: ID!`, `$id: ID!`, `$owner: String!` |
| Nested Data | X | | X | X | Up to 3 levels deep |
| Arrays/Lists | X | X | X | X | Countries, launches, characters, repos |
| Filtering | X | | X | | `filter` argument, AND composition |
| Pagination | | X | X | X | Limit-based, page-based, connection pattern |
| Fragments | | | X | | `fragment CharacterBasics on Character` |
| Aliases | | | X | | `rick: character(id: 1)`, filter comparison |
| Mutations | | X | | | Hasura-style insert/update/delete |
| Schema Validation | X | X | | | Introspection queries, type unwrapping |
| Error Handling | X | X | | X | Null returns, syntax errors, auth errors |
| Performance | X | X | | | `measureQuery()`, timing thresholds |
| Authentication | | | | X | Bearer token, `describeWithAuth` pattern |
| Rate Limits | | | | X | Query-based + header-based validation |
| Multi-Resource | | | X | | 3 resources in 1 request |
| Response Metadata | X | X | | X | `rawRequest()` with headers/status |

---

## Why These APIs

### Countries API — The Foundation

**Pros:**
- Zero authentication, always available
- Simple schema perfect for learning query basics
- Has nested relationships (Country -> Continent, Country -> Languages)
- Returns `null` for invalid inputs (tests data-level error handling)
- Stable data (country names don't change)

**Cons:**
- No mutations available
- No pagination (returns all data at once)
- No batch request support

**Purpose:** Establish baseline query patterns and schema validation techniques before tackling more complex APIs.

### SpaceX API — Schema Depth

**Pros:**
- Rich schema with nested types (Launch -> LaunchRocket -> Rocket)
- Hasura-generated mutations (demonstrates mutation syntax)
- Limit-based pagination
- Complex type relationships for schema validation

**Cons:**
- Mutations return `null` (disabled for public access)
- No batch support
- Occasional downtime (community-maintained)

**Purpose:** Demonstrate mutation syntax, complex schema validation, and deeply nested type relationships.

### Rick & Morty API — Query Variety

**Pros:**
- Supports fragments and aliases (advanced query features)
- Page-based pagination with metadata
- Multi-parameter filtering with AND composition
- 3-level deep nesting with circular references
- Multi-resource queries (character + location + episode)
- Stable, well-maintained, excellent documentation

**Cons:**
- Read-only (no mutations)
- No authentication needed (can't demo auth patterns)
- Fictional data (not "real-world" in traditional sense)

**Purpose:** Exercise advanced GraphQL query features that aren't available on simpler APIs.

### GitHub API — Production Auth

**Pros:**
- Requires real authentication (Bearer token)
- Rate limit management (query + headers)
- Production-grade API (used by millions)
- Auto-provided token in CI (GitHub Actions)
- Complex schema with connection patterns

**Cons:**
- Requires setup (personal access token)
- Different behavior in CI vs. local (viewer identity changes)
- Token scope affects test behavior

**Purpose:** Demonstrate authentication patterns, security best practices, and testing against production APIs with real credentials.

### Strategic Selection Summary

| API | Primary Purpose | Complexity | Auth |
|-----|----------------|------------|------|
| Countries | Query fundamentals, schema basics | Low | None |
| SpaceX | Mutations, complex schema | Medium | None |
| Rick & Morty | Advanced queries (fragments, aliases, nesting) | Medium | None |
| GitHub | Authentication, production API testing | High | Required |

Each API fills a specific gap in the testing portfolio. Together, they demonstrate the full range of GraphQL testing skills: from basic queries to authenticated production APIs, from simple schemas to deeply nested type relationships, from happy path data validation to error handling and performance benchmarking.
