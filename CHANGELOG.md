# Changelog

All notable changes to the GraphQL API Testing Suite will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- CI/CD pipeline with GitHub Actions
- GitHub API authentication tests
- Rick and Morty API fragment tests
- Mock GraphQL server for mutation testing

---

## [0.6.0] - 2026-02-01

### Changed
- **Test Organization Restructure** - Reorganized tests by category instead of API
  - Moved test files from per-API folders to category-based structure
  - Removed empty `countries/` and `spaceX/` directories
  - Tests now organized at root level with cross-cutting concern folders

### Added
- **Error Handling Test Suite** (`tests/errors/error-handling.test.ts`) - 7 tests
  - Extracted 3 tests from Countries query tests
  - Added 4 new cross-API error validation tests
  - Invalid arguments returning null
  - Syntax errors in query strings
  - Missing required variables
  - Non-existent field validation (both APIs)
  - Invalid variable type validation (both APIs)

- **Performance Test Suite** (`tests/performance/performance.test.ts`) - 5 tests
  - Extracted 2 tests from existing query tests
  - Added 3 new benchmark tests
  - Simple query benchmarks (< 2s)
  - Large dataset queries (< 3s)
  - Paginated query performance (5 items: < 3s, 100 items: < 5s)
  - Comparative benchmarking (simple vs nested queries)

### Removed
- Error tests from `queryOpsForCountries.test.ts` (moved to error-handling suite)
- Performance tests from both query test files (moved to performance suite)
- Per-API folder structure (`countries/`, `spaceX/`)

### Technical Details
- Test count increased from 68 to 75 (+7 net)
- Query operations files reduced from 10→6 and 3→2 tests respectively
- All import paths updated after file restructuring
- New structure:
  ```
  tests/
  ├── queryOpsForCountries.test.ts (6 tests)
  ├── queryOpsForSpaceX.test.ts (2 tests)
  ├── mutationOpsForSpaceX.test.ts (3 tests)
  ├── errors/error-handling.test.ts (7 tests)
  ├── performance/performance.test.ts (5 tests)
  └── schema/ (52 tests)
  ```

### Why This Change
The original per-API structure (`countries/`, `spaceX/`) lost meaning after schema became its own cross-cutting folder. Tests mixed concerns (happy-path + errors + performance in single files). The new category-based structure provides clearer organization and better showcases testing capabilities in a portfolio context.

---

## [0.5.0] - 2026-01-26

### Added
- **Schema Introspection Utilities** (`utils/schema-introspection.ts`)
  - `getSchemaTypes()` - List all types in schema
  - `getTypeDetails()` - Get type kind, fields, and metadata
  - `getTypeFields()` - Get field names for a type
  - `getFieldInfo()` - Get specific field details
  - `getAvailableQueries()` - List query operations
  - `getAvailableMutations()` - List mutation operations
  - `typeExists()` - Check if type exists
  - `getTypeKind()` - Get type kind (OBJECT, SCALAR, etc.)

- **Countries API Schema Tests** (`tests/schema/countries-schema.test.ts`) - 25 tests
  - Type existence validation (Country, Continent, Language, State)
  - Field presence and type validation
  - Required/optional field validation
  - Query operation validation
  - Nested relationship testing

- **SpaceX API Schema Tests** (`tests/schema/spacex-schema.test.ts`) - 27 tests
  - Type existence validation (Launch, Rocket, Capsule, Launchpad)
  - Field presence and type validation
  - Query and Mutation operation validation
  - Nested relationship chain testing (Launch → LaunchRocket → Rocket)

### Changed
- Updated `tsconfig.json` to support `.ts` imports and `type` keyword imports
- Updated documentation with schema validation section

### Technical Details
- Schema tests optimized with `Promise.all()` in `beforeAll` to minimize API calls
- Type unwrapping algorithm handles 4 levels of nested types (NON_NULL, LIST)
- Total tests: 68 (up from 16)

---

## [0.4.0] - 2026-01-26

### Added
- **GraphQLTestClient Wrapper** (`utils/graphql-client.ts`)
  - `request()` - Data-only requests (90% of test cases)
  - `rawRequest()` - Full response with headers, status, auto-validation
  - `requestExpectingError()` - Assert query throws error
  - `measureQuery()` - Performance testing with timing
  - `batchRequests()` - Multiple queries in one request
  - `setHeaders()` - Dynamic header updates
  - `setAuthToken()` - Authentication token management

### Changed
- Refactored all test files to use appropriate wrapper methods
- Countries API tests now use `request()` for data-only scenarios
- SpaceX API tests demonstrate all wrapper method types
- Added performance tests with `measureQuery()`

### Technical Details
- Wrapper auto-validates HTTP 200 status and JSON content-type in `rawRequest()`
- Enhanced error context includes endpoint, query, variables, and error message
- Batch requests not supported by Countries/SpaceX APIs (documented)

---

## [0.3.0] - 2026-01-20

### Added
- **SpaceX API Tests**
  - `queryOpsForSpaceX.test.ts` - 3 query tests (launches, response metadata, performance)
  - `mutationOpsForSpaceX.test.ts` - 3 mutation tests (insert, update, delete users)

### Changed
- Reorganized test structure with API-specific directories
- Added JSDoc documentation to all test files

### Technical Details
- SpaceX mutations return null (disabled for public access)
- Tests document Hasura-style mutation syntax

---

## [0.2.0] - 2026-01-18

### Added
- **Countries API Tests** (`tests/countries/queryOpsForCountries.test.ts`) - 10 tests
  - Basic query operations
  - Variables usage
  - Nested data fetching
  - Array handling
  - Filter operations
  - Error handling (invalid codes, syntax errors, missing variables)

### Changed
- Updated Jest configuration for ESM support
- Switched from `jest.config.ts` to `jest.config.js` for ESM compatibility

### Technical Details
- Module system: ESM with `--experimental-vm-modules`
- Test runner: `node --experimental-vm-modules node_modules/jest/bin/jest.js`

---

## [0.1.0] - 2026-01-14

### Added
- Initial project setup and configuration
- Project directory structure
- TypeScript configuration (`tsconfig.json`)
- Jest testing framework configuration (`jest.config.ts`)
- NPM package dependencies:
  - Runtime: `graphql`, `graphql-request`
  - Dev: `jest`, `@types/jest`, `ts-jest`, `typescript`, `@types/node`
- Documentation:
  - `README.md` with project overview and setup instructions
  - `docs/DESIGN_DECISIONS.md` with technology choice rationale
  - `CHANGELOG.md` (this file)
- Test directory structure:
  - `/tests` - Root test directory
  - `/utils` - Utility functions placeholder
  - `/types` - TypeScript type definitions placeholder
  - `/config` - Configuration files placeholder
  - `/fixtures` - Test data placeholder
  - `/docs` - Documentation directory

### Decisions
- **Testing Framework:** Chose Jest over Vitest for industry standard alignment (78% of job descriptions)
- **GraphQL Client:** Chose graphql-request over Apollo Client for testing-focused simplicity
- **Language:** TypeScript for type safety and modern development practices

### Technical Details
- Node.js version: 18+
- TypeScript version: 5.3.3
- Jest version: 29.7.0
- Test environment: Node.js (not browser)
- Module system: CommonJS with TypeScript support via ts-jest

---

## Version History Summary

| Version | Date | Description |
|---------|------|-------------|
| 0.6.0 | 2026-02-01 | Test structure restructuring (category-based organization) |
| 0.5.0 | 2026-01-26 | Schema validation with introspection utilities |
| 0.4.0 | 2026-01-26 | GraphQLTestClient wrapper with specialized methods |
| 0.3.0 | 2026-01-20 | SpaceX API tests (queries and mutations) |
| 0.2.0 | 2026-01-18 | Countries API tests and ESM configuration |
| 0.1.0 | 2026-01-14 | Initial project setup and configuration |

---

## Upcoming Milestones

### v0.7.0 - CI/CD Pipeline
- GitHub Actions workflow for automated testing
- Test coverage reporting
- PR checks and status badges

### v1.0.0 - Production Ready
- GitHub API authentication tests
- Rick and Morty API fragment tests
- Comprehensive documentation (ARCHITECTURE.md, LEARNING_NOTES.md)
- Production-ready portfolio project

---

## Change Categories

This changelog uses the following categories:
- **Added** - New features or capabilities
- **Changed** - Changes to existing functionality
- **Deprecated** - Features marked for removal
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Security improvements
- **Decisions** - Architectural or technology decisions
- **Technical Details** - Implementation specifics

---

*Changelog Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)*
*Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)*
*Last Updated: February 1, 2026*