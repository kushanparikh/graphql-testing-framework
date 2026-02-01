# GraphQL API Testing Suite

**Portfolio Project 2:** Comprehensive GraphQL API testing framework demonstrating modern API testing expertise.

---
###### 📖 New to this portfolio? visit: [Portfolio Overview](https://github.com/users/kushanparikh/projects/3/views/5?pane=info)
---

## 🎯 Project Overview

This project is a standalone GraphQL API testing framework built with TypeScript and Jest. It demonstrates comprehensive testing capabilities across multiple public GraphQL APIs, covering queries, mutations, schema validation, error handling, authentication, and performance testing.

---

## 🚀 Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Language** | TypeScript | Type-safe test development |
| **Testing Framework** | Jest | Industry-standard JavaScript testing |
| **GraphQL Client** | graphql-request | Lightweight, testing-focused GraphQL client |
| **Test Client Wrapper** | GraphQLTestClient | Custom wrapper with enhanced testing features |
| **CI/CD** | GitHub Actions | Automated test execution |
| **Coverage** | Jest Coverage | Code coverage reporting |

---

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

---

## 🛠️ Installation

### 1. Clone the repository
```bash
git clone https://github.com/kushanparikh/graphql-api-testing-suite.git
cd graphql-api-testing-suite
```

### 2. Install dependencies
```bash
npm install
```

### 3. Verify installation
```bash
npm test
```

---

## 📦 Project Dependencies

### Runtime Dependencies
```json
{
  "graphql": "^16.8.1",
  "graphql-request": "^6.1.0"
}
```

### Development Dependencies
```json
{
  "@types/jest": "^29.5.11",
  "@types/node": "^20.10.6",
  "jest": "^29.7.0",
  "ts-jest": "^29.1.1",
  "typescript": "^5.3.3"
}
```

---

## 🏗️ Project Structure

```
graphql-api-testing-suite/
├── tests/                          # Test specifications
│   ├── queryOpsForCountries.test.ts    # Countries API query tests
│   ├── queryOpsForSpaceX.test.ts       # SpaceX API query tests
│   ├── mutationOpsForSpaceX.test.ts    # SpaceX API mutation tests
│   ├── errors/                         # Error handling tests
│   │   └── error-handling.test.ts
│   ├── performance/                    # Performance benchmarks
│   │   └── performance.test.ts
│   └── schema/                         # Schema validation tests
│       ├── countries-schema.test.ts
│       └── spacex-schema.test.ts
├── utils/                          # Utility modules
│   ├── graphql-client.ts           # GraphQLTestClient wrapper
│   └── schema-introspection.ts     # Schema introspection utilities
├── docs/                           # Documentation
│   └── DESIGN_DECISIONS.md         # Technology choices and trade-offs
├── jest.config.js                  # Jest configuration (ESM)
├── tsconfig.json                   # TypeScript configuration
├── package.json                    # Dependencies and scripts
├── CHANGELOG.md                    # Version history
└── README.md                       # This file
```

---

## 🧪 Test Coverage

This framework demonstrates comprehensive GraphQL testing capabilities:

| Category | Test File | Tests | Description |
|----------|-----------|-------|-------------|
| **Query Operations** | `queryOpsForCountries.test.ts` | 6 | Basic queries, variables, nested data, filtering |
| **Query Operations** | `queryOpsForSpaceX.test.ts` | 2 | Paginated queries, response metadata |
| **Mutation Operations** | `mutationOpsForSpaceX.test.ts` | 3 | Hasura-style mutations (insert, update, delete) |
| **Error Handling** | `errors/error-handling.test.ts` | 7 | Invalid inputs, syntax errors, type violations |
| **Performance** | `performance/performance.test.ts` | 5 | Query benchmarks, comparative timing |
| **Schema Validation** | `schema/countries-schema.test.ts` | 25 | Types, fields, relationships, queries |
| **Schema Validation** | `schema/spacex-schema.test.ts` | 27 | Types, fields, queries, mutations, relationships |
| **Total** | | **75** | |

### Test Categories

| Category | Status | Details |
|----------|--------|---------|
| **Query Operations** | ✅ Implemented | Basic queries, variables, nested objects, arrays, filtering |
| **Mutation Operations** | ✅ Implemented | Hasura-style CRUD mutations (API returns null - read-only) |
| **Error Handling** | ✅ Implemented | Invalid inputs, syntax errors, missing variables |
| **Performance Testing** | ✅ Implemented | Query timing with `measureQuery()` |
| **Response Validation** | ✅ Implemented | Status codes, content-type headers via `rawRequest()` |
| **Schema Validation** | ✅ Implemented | Type existence, field validation, relationships via introspection |
| **Authentication** | 🔄 Planned | GitHub API with JWT tokens |

### GraphQLTestClient Wrapper Methods

The framework includes a custom `GraphQLTestClient` wrapper that provides specialized methods for different testing scenarios:

| Method | Use Case | Returns |
|--------|----------|---------|
| `request()` | Data-only tests (90% of cases) | Just the data |
| `rawRequest()` | Need headers, status, metadata | Full response with auto-validation |
| `requestExpectingError()` | Negative/error tests | void (asserts throw) |
| `measureQuery()` | Performance testing | `{ data, time }` in milliseconds |
| `batchRequests()` | Multiple queries at once | Array of data |
| `setHeaders()` | Dynamic header updates | void |
| `setAuthToken()` | Authentication testing | void |

### Schema Introspection Utilities

The framework includes `utils/schema-introspection.ts` for validating GraphQL schemas:

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

## 🎓 Skills Demonstrated

### GraphQL Expertise
- Query and mutation operations
- Schema introspection and validation
- Variables and fragments
- Error handling patterns
- Authentication with JWT tokens
- WebSocket subscriptions (optional)

### API Testing Skills
- Comprehensive test coverage strategies
- Data-driven testing patterns
- Performance benchmarking
- Error handling and edge cases
- Mock server integration

### Software Engineering
- TypeScript best practices
- Clean code architecture
- CI/CD integration
- Professional documentation
- Design decision rationale

---

## 🔗 Target APIs

This framework tests against multiple public GraphQL APIs:

### Currently Implemented

| API | Endpoint | Features Tested |
|-----|----------|-----------------|
| **Countries API** | https://countries.trevorblades.com/ | Queries, variables, nested data, filtering, error handling |
| **SpaceX API** | https://spacex-production.up.railway.app/ | Paginated queries, Hasura-style mutations |

### Planned

| API | Endpoint | Planned Coverage |
|-----|----------|------------------|
| **Rick and Morty API** | https://rickandmortyapi.com/graphql | Fragments, advanced filtering |
| **GitHub GraphQL API** | https://api.github.com/graphql | Authentication, rate limiting |

---

## 📚 Available Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test -- queryOpsForCountries
```

> **Note:** Use `npm test` (not `npx jest`). The test script is configured with required Node.js flags for ESM support. See [DESIGN_DECISIONS.md](docs/DESIGN_DECISIONS.md#3-jest-esm-configuration) for details.

---

## 📖 Documentation

- **[DESIGN_DECISIONS.md](docs/DESIGN_DECISIONS.md)** - Technology choices and trade-offs
- **[CHANGELOG.md](CHANGELOG.md)** - Version history and updates
- **ARCHITECTURE.md** *(Coming soon)* - Framework architecture and patterns
- **LEARNING_NOTES.md** *(Coming soon)* - GraphQL testing insights and learnings

---

## 📊 Portfolio Project Tracking

This is **Project 2** of a 5-project SDET portfolio demonstrating modern test automation expertise.

**View complete portfolio roadmap:**  
[📖 SDET Portfolio Tracker - All 5 Projects](https://github.com/users/kushanparikh/projects/3/views/5?pane=info)

**Portfolio Status:**
- ✅ **Project 1**: Playwright + TypeScript Framework (Complete - 86 tests)
- 🔨 **Project 2**: GraphQL API Testing Suite (In Progress - Week 2) ← *You are here*
- 📋 **Project 3**: gRPC Testing Harness (Planned - Feb 2026)
- 📋 **Project 4**: Authentication Testing Framework (Planned - Feb-Mar 2026)
- 📋 **Project 5**: Unified Test Reporting Platform (Planned - Mar 2026

---

## 🔄 Project Status

**Current Phase:** Test Structure Restructuring (v0.6.0)
- ✅ Project structure created with category-based test organization
- ✅ Dependencies installed
- ✅ Jest + TypeScript + ESM configured
- ✅ Design decisions documented
- ✅ Query operations tests implemented (8 tests)
- ✅ Mutation operations tests implemented (3 tests)
- ✅ Error handling suite with cross-API coverage (7 tests)
- ✅ Performance benchmarking suite with comparative tests (5 tests)
- ✅ JSDoc documentation added to all test files
- ✅ GraphQLTestClient wrapper implemented with multiple testing methods
- ✅ Schema introspection utilities created
- ✅ Schema validation tests implemented (52 tests)

**Next Steps:**
- Set up CI/CD pipeline
- Add authentication tests for GitHub API

---

## 🤝 Design Philosophy

### Why Jest over Vitest?
78% of SDET job descriptions mention Jest explicitly. Industry standard > Technical superiority for portfolio purposes.

### Why graphql-request over Apollo Client?
Purpose-built for testing scenarios. 28x smaller package size (5KB vs 140KB), cleaner API, faster test execution.

**See [DESIGN_DECISIONS.md](docs/DESIGN_DECISIONS.md) for complete rationale.**

---

## 📝 Version History

See [CHANGELOG.md](CHANGELOG.md) for detailed version history.

**Current Version:** v0.6.0 - Test Structure Restructuring

---

## ⚙️ Jest Configuration

This project uses Jest with TypeScript in ESM (ECMAScript Modules) mode. Key configuration details:

| Setting | Value | Purpose |
|---------|-------|---------|
| **Config File** | `jest.config.js` | ESM-compatible JavaScript config |
| **Preset** | `ts-jest/presets/default-esm` | TypeScript + ESM support |
| **Test Runner** | `node --experimental-vm-modules` | Required for ESM in Jest |
| **Transform** | `ts-jest` with `useESM: true` | Compiles TypeScript to ESM |

```javascript
// jest.config.js
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true }]
  }
};
```

> See [DESIGN_DECISIONS.md](docs/DESIGN_DECISIONS.md#3-jest-esm-configuration) for the full rationale behind these choices.

---

## 📬 Contact

**Kushan Parikh**  
SDET Portfolio Project  
GitHub: [@kushanparikh](https://github.com/kushanparikh)

---

## 📄 License

This project is part of a professional portfolio and is available for review and learning purposes.

---

*Last Updated: February 1, 2026*
