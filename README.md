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
│   ├── spacex/                 # SpaceX API tests
│   ├── rickandmorty/           # Rick and Morty API tests
│   ├── github/                 # GitHub API tests (auth)
│   ├── mutations/              # Mutation tests (mock server)
│   ├── schema/                 # Schema validation tests
│   ├── errors/                 # Error handling tests
│   └── performance/            # Performance benchmark tests
├── utils/                      # Utility functions
│   ├── graphql-client.ts       # GraphQL client wrapper
│   └── performance.ts          # Performance testing utilities
├── types/                      # TypeScript type definitions
│   ├── countries.types.ts      # Countries API types
│   ├── spacex.types.ts         # SpaceX API types
│   └── github.types.ts         # GitHub API types
├── config/                     # Configuration files
│   ├── endpoints.ts            # API endpoint configuration
│   └── auth.ts                 # Authentication configuration
├── fixtures/                   # Test data and fixtures
│   └── test-data.ts            # Reusable test data
├── docs/                       # Documentation
│   └── DESIGN_DECISIONS.md     # Technology choices and trade-offs
├── jest.config.js              # Jest configuration (ESM)
├── tsconfig.json               # TypeScript configuration
├── CHANGELOG.md                # Version history
└── README.md                   # This file
```

---

## 🧪 Test Coverage Goals

This framework demonstrates comprehensive GraphQL testing capabilities:

| Test Category | Coverage | Status |
|--------------|----------|--------|
| **Query Testing** | 9 tests | ✅ Implemented |
| **Mutation Testing** | 4-5 tests | 🔄 Planned |
| **Schema Validation** | 5-6 tests | 🔄 Planned |
| **Error Handling** | 3 tests | ✅ Implemented |
| **Authentication** | 5-6 tests | 🔄 Planned |
| **Performance** | 4-5 tests | 🔄 Planned |
| **Total** | 40+ tests | 🔄 In Progress |

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

1. **Countries API** - https://countries.trevorblades.com/
   - Basic queries and filtering
   - Schema validation
   - No authentication required

2. **SpaceX API** - https://spacex-production.up.railway.app/
   - Complex nested queries
   - Pagination patterns
   - Historical data validation

3. **Rick and Morty API** - https://rickandmortyapi.com/graphql
   - Fragment usage
   - Multiple query patterns
   - Advanced filtering

4. **GitHub GraphQL API** - https://api.github.com/graphql
   - Authentication with JWT tokens
   - Real-world enterprise patterns
   - Rate limiting validation

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

**Current Phase:** Query Operations (v0.2.0)
- ✅ Project structure created
- ✅ Dependencies installed
- ✅ Jest + TypeScript + ESM configured
- ✅ Design decisions documented
- ✅ Countries API query tests implemented (9 tests)
- 🔄 Additional test coverage in progress

**Next Steps:**
- Add mutation tests with mock server
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

**Current Version:** v0.2.0 - Query Operations

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
