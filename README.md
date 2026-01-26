# GraphQL API Testing Suite

**Portfolio Project 2:** Comprehensive GraphQL API testing framework demonstrating modern API testing expertise.

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
├── tests/                      # Test specifications
│   ├── countries/              # Countries API tests
│   │   └── queryOpsForCountries.test.ts
│   └── spaceX/                 # SpaceX API tests
│       ├── queryOpsForSpaceX.test.ts
│       └── mutationOpsForSpaceX.test.ts
├── docs/                       # Documentation
│   └── DESIGN_DECISIONS.md     # Technology choices and trade-offs
├── jest.config.js              # Jest configuration (ESM)
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies and scripts
├── CHANGELOG.md                # Version history
└── README.md                   # This file
```

---

## 🧪 Test Coverage

This framework demonstrates comprehensive GraphQL testing capabilities:

| API | Test File | Tests | Description |
|-----|-----------|-------|-------------|
| **Countries** | `queryOpsForCountries.test.ts` | 9 | Query operations, variables, nested data, filtering, error handling |
| **SpaceX** | `queryOpsForSpaceX.test.ts` | 1 | Paginated queries with limit argument |
| **SpaceX** | `mutationOpsForSpaceX.test.ts` | 3 | Hasura-style mutations (insert, update, delete) |
| **Total** | | **13** | |

### Test Categories

| Category | Status | Details |
|----------|--------|---------|
| **Query Operations** | ✅ Implemented | Basic queries, variables, nested objects, arrays, filtering |
| **Mutation Operations** | ✅ Implemented | Hasura-style CRUD mutations (API returns null - read-only) |
| **Error Handling** | ✅ Implemented | Invalid inputs, syntax errors, missing variables |
| **Schema Validation** | 🔄 Planned | Introspection queries |
| **Authentication** | 🔄 Planned | GitHub API with JWT tokens |

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

## 🎯 Portfolio Context

This project is **Project 2** in a 5-project SDET portfolio:

1. ✅ **Playwright + TypeScript Framework** - UI testing foundation
2. 🔄 **GraphQL API Testing Suite** (This project) - Modern API patterns
3. 📋 **gRPC Testing Harness** - Protocol buffer testing
4. 📋 **Authentication Testing Framework** - OAuth, JWT, SAML
5. 📋 **Unified Test Reporting Platform** - Cross-project result aggregation

**Portfolio Narrative:** Demonstrating versatile test automation expertise across UI, REST, GraphQL, and gRPC protocols, with modern TypeScript-based frameworks and CI/CD integration.

---

## 🔄 Project Status

**Current Phase:** Query & Mutation Operations (v0.3.0)
- ✅ Project structure created with API-specific test directories
- ✅ Dependencies installed
- ✅ Jest + TypeScript + ESM configured
- ✅ Design decisions documented
- ✅ Countries API tests implemented (9 tests)
- ✅ SpaceX API query tests implemented (1 test)
- ✅ SpaceX API mutation tests implemented (3 tests)
- ✅ JSDoc documentation added to all test files

**Next Steps:**
- Add more SpaceX query tests (rockets, capsules, launchpads)
- Set up CI/CD pipeline
- Add schema validation tests
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

**Current Version:** v0.3.0 - Query & Mutation Operations

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

*Last Updated: January 25, 2026*
