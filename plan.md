# Project 2: GraphQL API Testing Suite - Sprint Plan

**Timeline:** 3 weeks @ 10 hours/week = 30 hours total  
**Start Date:** Mid-January 2026 (after Project 1 completion)  
**Tech Stack:** TypeScript, graphql-request, Jest/Vitest, GitHub Actions  
**Target APIs:** Countries, SpaceX, Rick and Morty, GitHub (optional)

---

## Project Overview

Build a comprehensive GraphQL API testing framework demonstrating:
- Query and mutation testing
- Schema validation and introspection
- Error handling and edge cases
- Authentication (JWT tokens)
- Performance testing
- Data-driven testing with variables
- WebSocket subscriptions (optional advanced feature)

---

## Week 1: Foundation + Basic Query Testing (10 hours)

### Goals
- Project setup with TypeScript + testing framework
- GraphQL client configuration
- Basic query tests with multiple APIs
- Response validation patterns

### Tasks

#### Day 1-2: Project Setup (3 hours)

**Setup Tasks:**
- [ ] Create GitHub repository: `graphql-api-testing-suite`
- [ ] Initialize Node.js project with TypeScript
- [ ] Install dependencies:
  ```bash
  npm init -y
  npm install --save-dev typescript @types/node
  npm install --save-dev vitest @vitest/ui
  npm install graphql-request graphql
  npm install --save-dev @types/jest
  ```
- [ ] Configure `tsconfig.json` with strict settings
- [ ] Configure `vitest.config.ts` for testing
- [ ] Create project structure:
  ```
  graphql-api-testing-suite/
  ├── tests/
  │   ├── countries/
  │   ├── spacex/
  │   └── rickandmorty/
  ├── utils/
  │   └── graphql-client.ts
  ├── types/
  │   └── api-types.ts
  ├── config/
  │   └── endpoints.ts
  └── fixtures/
      └── test-data.ts
  ```
- [ ] Create README.md with project description
- [ ] Make repository public

**Deliverables:**
- Working TypeScript + Vitest environment
- GraphQL client utility class
- Basic project documentation

---

#### Day 3-4: Countries API - Basic Queries (4 hours)

**API:** https://countries.trevorblades.com/

**Learning Focus:**
- Writing GraphQL queries in TypeScript
- Response validation
- TypeScript types for GraphQL responses

**Tasks:**
- [ ] Create `utils/graphql-client.ts` wrapper:
  ```typescript
  import { GraphQLClient } from 'graphql-request';
  
  export class GraphQLTestClient {
    private client: GraphQLClient;
    
    constructor(endpoint: string) {
      this.client = new GraphQLClient(endpoint);
    }
    
    async query<T>(query: string, variables?: any): Promise<T> {
      return await this.client.request<T>(query, variables);
    }
  }
  ```

- [ ] Write 5-7 basic query tests:
  1. Get all countries (basic query)
  2. Get country by code (with variables)
  3. Get countries by continent (filtering)
  4. Get country with specific fields (field selection)
  5. Get multiple countries by codes (array variables)
  6. Test invalid country code (error handling)
  7. Test empty response handling

**Example Test Structure:**
```typescript
// tests/countries/countries-queries.test.ts
import { describe, it, expect } from 'vitest';
import { GraphQLTestClient } from '../../utils/graphql-client';

const COUNTRIES_API = 'https://countries.trevorblades.com/';
const client = new GraphQLTestClient(COUNTRIES_API);

describe('Countries API - Basic Queries', () => {
  it('should fetch all countries', async () => {
    const query = `
      query {
        countries {
          code
          name
          capital
        }
      }
    `;
    
    const response = await client.query(query);
    
    expect(response.countries).toBeDefined();
    expect(response.countries.length).toBeGreaterThan(0);
    expect(response.countries[0]).toHaveProperty('code');
    expect(response.countries[0]).toHaveProperty('name');
  });
  
  it('should fetch country by code with variables', async () => {
    const query = `
      query GetCountry($code: ID!) {
        country(code: $code) {
          code
          name
          capital
          currency
        }
      }
    `;
    
    const variables = { code: 'US' };
    const response = await client.query(query, variables);
    
    expect(response.country.code).toBe('US');
    expect(response.country.name).toBe('United States');
    expect(response.country.capital).toBe('Washington D.C.');
  });
});
```

**Deliverables:**
- 5-7 passing query tests
- Response validation patterns
- TypeScript types for Country API responses

---

#### Day 5: SpaceX API - Complex Queries (3 hours)

**API:** https://spacex-production.up.railway.app/

**Learning Focus:**
- Nested queries
- Complex filtering
- Pagination patterns

**Tasks:**
- [ ] Write 4-5 complex query tests:
  1. Get all launches with nested rocket data
  2. Get launches with date filtering
  3. Get mission details with deep nesting (launch → rocket → rocket_type)
  4. Test pagination (limit, offset)
  5. Test null/optional fields handling

**Example Complex Query:**
```typescript
it('should fetch launches with nested rocket data', async () => {
  const query = `
    query GetLaunches {
      launches(limit: 5) {
        mission_name
        launch_date_utc
        rocket {
          rocket_name
          rocket_type
        }
        launch_site {
          site_name
        }
      }
    }
  `;
  
  const response = await client.query(query);
  
  expect(response.launches).toHaveLength(5);
  expect(response.launches[0].rocket).toBeDefined();
  expect(response.launches[0].rocket.rocket_name).toBeDefined();
});
```

**Deliverables:**
- 4-5 complex nested query tests
- Pagination testing examples
- Documentation on complex query patterns

---

### Week 1 Deliverables Checklist

- [ ] Repository created and configured
- [ ] 10-12 query tests passing (Countries + SpaceX)
- [ ] GraphQL client utility with error handling
- [ ] TypeScript types for API responses
- [ ] README with setup instructions
- [ ] CHANGELOG.md started (v0.1.0)

---

## Week 2: Mutations + Schema Validation + Error Handling (10 hours)

### Goals
- Mutation testing patterns
- Schema introspection and validation
- Error handling and edge cases
- Data-driven testing with variables

### Tasks

#### Day 1-2: Rick and Morty API - Advanced Queries (3 hours)

**API:** https://rickandmortyapi.com/graphql

**Learning Focus:**
- Fragments for reusable fields
- Multiple queries in one request
- Character/Episode/Location queries

**Tasks:**
- [ ] Write 5-6 tests using fragments:
  1. Get characters with fragment reuse
  2. Get episodes with character relationships
  3. Test filter by name (partial match)
  4. Test filter by status (alive/dead/unknown)
  5. Multiple entities in one query (character + episode)
  6. Test pagination with info metadata

**Example with Fragments:**
```typescript
it('should use fragments for character queries', async () => {
  const query = `
    fragment CharacterFields on Character {
      id
      name
      status
      species
      type
      gender
    }
    
    query GetCharacters {
      character(id: 1) {
        ...CharacterFields
        location {
          name
        }
      }
      characters(page: 1, filter: { name: "rick" }) {
        results {
          ...CharacterFields
        }
      }
    }
  `;
  
  const response = await client.query(query);
  
  expect(response.character).toBeDefined();
  expect(response.characters.results).toBeDefined();
  // Validate fragment fields are present
});
```

**Deliverables:**
- 5-6 tests demonstrating fragments
- Multi-query request examples
- Filter and pagination tests

---

#### Day 3: Mutation Testing Patterns (3 hours)

**Challenge:** Public GraphQL APIs rarely allow mutations. Options:
1. Use mock GraphQL server (GraphQL Yoga or Apollo Server)
2. Document mutation patterns with example code
3. Use GitHub GraphQL API (requires auth token)

**Recommended Approach:** Create mock server for mutation testing

**Tasks:**
- [ ] Set up local mock GraphQL server with mutations
- [ ] Write 4-5 mutation tests:
  1. Create operation (add entity)
  2. Update operation (modify entity)
  3. Delete operation (remove entity)
  4. Mutation with optimistic response
  5. Mutation error handling

**Mock Server Setup:**
```typescript
// utils/mock-server.ts
import { createServer } from '@graphql-yoga/node';

export const mockSchema = `
  type User {
    id: ID!
    name: String!
    email: String!
  }
  
  type Query {
    user(id: ID!): User
    users: [User!]!
  }
  
  type Mutation {
    createUser(name: String!, email: String!): User!
    updateUser(id: ID!, name: String, email: String): User!
    deleteUser(id: ID!): Boolean!
  }
`;

// Start mock server on localhost:4000
```

**Deliverables:**
- Mock GraphQL server for mutation testing
- 4-5 mutation test examples
- Documentation on mutation testing patterns

---

#### Day 4: Schema Validation + Introspection (2 hours)

**Learning Focus:**
- Schema introspection queries
- Type validation
- Field existence verification

**Tasks:**
- [ ] Write 5-6 schema validation tests:
  1. Introspect schema and validate types exist
  2. Validate required fields on types
  3. Check enum values
  4. Validate query/mutation operations exist
  5. Test deprecated field detection
  6. Validate schema documentation strings

**Example Schema Test:**
```typescript
it('should validate Country type schema', async () => {
  const introspectionQuery = `
    {
      __type(name: "Country") {
        name
        fields {
          name
          type {
            name
            kind
          }
        }
      }
    }
  `;
  
  const response = await client.query(introspectionQuery);
  
  expect(response.__type.name).toBe('Country');
  
  const fieldNames = response.__type.fields.map(f => f.name);
  expect(fieldNames).toContain('code');
  expect(fieldNames).toContain('name');
  expect(fieldNames).toContain('capital');
});
```

**Deliverables:**
- 5-6 schema validation tests
- Introspection utility functions
- Documentation on schema testing

---

#### Day 5: Error Handling + Data-Driven Testing (2 hours)

**Learning Focus:**
- Invalid query handling
- Network error simulation
- Data-driven test patterns with variables

**Tasks:**
- [ ] Write 5-6 error handling tests:
  1. Invalid query syntax
  2. Missing required variables
  3. Invalid variable types
  4. Non-existent fields
  5. Authentication errors (if using GitHub API)
  6. Rate limiting errors

**Example Error Test:**
```typescript
it('should handle invalid query gracefully', async () => {
  const invalidQuery = `
    query {
      nonExistentField {
        id
      }
    }
  `;
  
  await expect(client.query(invalidQuery)).rejects.toThrow();
});

it('should handle missing required variables', async () => {
  const query = `
    query GetCountry($code: ID!) {
      country(code: $code) {
        name
      }
    }
  `;
  
  // Don't provide required $code variable
  await expect(client.query(query)).rejects.toThrow(/Variable.*code.*required/);
});
```

- [ ] Create data-driven test examples:
  ```typescript
  const testCases = [
    { code: 'US', expectedName: 'United States' },
    { code: 'CA', expectedName: 'Canada' },
    { code: 'MX', expectedName: 'Mexico' },
  ];
  
  testCases.forEach(({ code, expectedName }) => {
    it(`should fetch ${expectedName} by code ${code}`, async () => {
      // Test implementation
    });
  });
  ```

**Deliverables:**
- 5-6 error handling tests
- Data-driven test examples
- Error handling best practices documentation

---

### Week 2 Deliverables Checklist

- [ ] 15-20 additional tests (mutations, schema, errors)
- [ ] Mock GraphQL server for mutation testing
- [ ] Schema introspection utilities
- [ ] Error handling patterns documented
- [ ] Data-driven testing examples
- [ ] Update CHANGELOG.md (v0.2.0)

---

## Week 3: Advanced Features + CI/CD + Documentation (10 hours)

### Goals
- Authentication with JWT tokens (GitHub API)
- Performance/load testing basics
- CI/CD pipeline setup
- Comprehensive documentation

### Tasks

#### Day 1-2: Authentication Testing (GitHub API) (4 hours)

**API:** https://api.github.com/graphql

**Prerequisites:**
- GitHub Personal Access Token (PAT)
- Scopes: `read:user`, `repo` (for testing purposes)

**Learning Focus:**
- Bearer token authentication
- Authenticated queries
- Private data access

**Tasks:**
- [ ] Set up environment variables for auth token:
  ```typescript
  // config/auth.ts
  export const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
  ```

- [ ] Extend GraphQL client for authentication:
  ```typescript
  constructor(endpoint: string, token?: string) {
    this.client = new GraphQLClient(endpoint, {
      headers: token ? { authorization: `Bearer ${token}` } : {},
    });
  }
  ```

- [ ] Write 5-6 authenticated tests:
  1. Get viewer (authenticated user) data
  2. List user's repositories
  3. Get repository issues
  4. Test with invalid token (401 error)
  5. Test with expired token
  6. Test rate limit headers

**Example GitHub API Test:**
```typescript
it('should fetch authenticated user profile', async () => {
  const query = `
    query {
      viewer {
        login
        name
        email
        repositories(first: 5) {
          totalCount
          nodes {
            name
            isPrivate
          }
        }
      }
    }
  `;
  
  const client = new GraphQLTestClient(GITHUB_API, GITHUB_TOKEN);
  const response = await client.query(query);
  
  expect(response.viewer).toBeDefined();
  expect(response.viewer.login).toBeDefined();
  expect(response.viewer.repositories.totalCount).toBeGreaterThan(0);
});
```

**Deliverables:**
- 5-6 authenticated query tests
- Token management utilities
- Auth error handling tests
- Documentation on authentication patterns

---

#### Day 3: Performance Testing Basics (2 hours)

**Learning Focus:**
- Response time measurement
- Query complexity analysis
- Rate limiting validation

**Tasks:**
- [ ] Create performance test utilities:
  ```typescript
  // utils/performance.ts
  export async function measureQueryPerformance<T>(
    client: GraphQLTestClient,
    query: string,
    variables?: any
  ): Promise<{ data: T; duration: number }> {
    const startTime = Date.now();
    const data = await client.query<T>(query, variables);
    const duration = Date.now() - startTime;
    return { data, duration };
  }
  ```

- [ ] Write 4-5 performance tests:
  1. Simple query response time (< 500ms)
  2. Complex nested query response time (< 2000ms)
  3. Large dataset query (pagination performance)
  4. Query complexity comparison (simple vs complex)
  5. Rate limit detection (GitHub API)

**Example Performance Test:**
```typescript
it('should respond to simple query within 500ms', async () => {
  const query = `{ countries { code } }`;
  
  const { data, duration } = await measureQueryPerformance(client, query);
  
  expect(data.countries).toBeDefined();
  expect(duration).toBeLessThan(500);
});

it('should handle complex query within 2 seconds', async () => {
  const query = `
    query {
      launches(limit: 100) {
        mission_name
        rocket { rocket_name rocket_type }
        launch_site { site_name }
      }
    }
  `;
  
  const { duration } = await measureQueryPerformance(client, query);
  expect(duration).toBeLessThan(2000);
});
```

**Deliverables:**
- Performance testing utilities
- 4-5 performance benchmark tests
- Response time documentation

---

#### Day 4: CI/CD Pipeline Setup (2 hours)

**Learning Focus:**
- GitHub Actions for API testing
- Secret management for tokens
- Test reporting

**Tasks:**
- [ ] Create `.github/workflows/graphql-tests.yml`:
  ```yaml
  name: GraphQL API Tests
  
  on:
    push:
      branches: [ main ]
    pull_request:
      branches: [ main ]
    workflow_dispatch:
  
  jobs:
    test:
      runs-on: ubuntu-latest
      
      steps:
        - uses: actions/checkout@v4
        
        - name: Setup Node.js
          uses: actions/setup-node@v4
          with:
            node-version: '20'
        
        - name: Install dependencies
          run: npm ci
        
        - name: Run tests
          run: npm test
          env:
            GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        
        - name: Upload coverage report
          if: always()
          uses: actions/upload-artifact@v4
          with:
            name: coverage-report
            path: coverage/
  ```

- [ ] Configure GitHub secrets for GITHUB_TOKEN
- [ ] Add test coverage reporting (vitest coverage)
- [ ] Configure test retry strategy
- [ ] Test pipeline with a commit

**Deliverables:**
- Working GitHub Actions pipeline
- Test coverage reporting
- Secret management configured

---

#### Day 5: Documentation + Polish (2 hours)

**Learning Focus:**
- Comprehensive README
- API documentation
- Architecture documentation

**Tasks:**
- [ ] Complete README.md with:
  - Project overview
  - Setup instructions
  - Running tests
  - API coverage matrix
  - Authentication setup
  - Example queries
  - Technology stack
  - Skills demonstrated

- [ ] Create ARCHITECTURE.md:
  - Framework design decisions
  - GraphQL client implementation
  - Test organization strategy
  - Authentication patterns
  - Performance testing approach

- [ ] Create API_COVERAGE.md:
  ```markdown
  | API | Queries | Mutations | Schema | Auth | Performance |
  |-----|---------|-----------|--------|------|-------------|
  | Countries | âœ" | N/A | âœ" | N/A | âœ" |
  | SpaceX | âœ" | N/A | âœ" | N/A | âœ" |
  | Rick & Morty | âœ" | N/A | âœ" | N/A | âœ" |
  | GitHub | âœ" | âœ" (optional) | âœ" | âœ" | âœ" |
  ```

- [ ] Update CHANGELOG.md (v1.0.0 - Production Ready)

- [ ] Add example usage in README:
  ```typescript
  // Quick Start Example
  import { GraphQLTestClient } from './utils/graphql-client';
  
  const client = new GraphQLTestClient('https://countries.trevorblades.com/');
  
  const query = `
    query {
      countries {
        code
        name
      }
    }
  `;
  
  const response = await client.query(query);
  console.log(response.countries);
  ```

**Deliverables:**
- Comprehensive README.md
- ARCHITECTURE.md
- API_COVERAGE.md
- Updated CHANGELOG.md
- Code comments and inline documentation

---

### Week 3 Deliverables Checklist

- [ ] 10+ additional tests (auth, performance)
- [ ] GitHub Actions CI/CD pipeline working
- [ ] Comprehensive documentation (README, ARCHITECTURE)
- [ ] API coverage matrix
- [ ] Test coverage reporting
- [ ] Final polish and code review
- [ ] Create v1.0.0 release tag

---

## Final Project Structure

```
graphql-api-testing-suite/
├── tests/
│   ├── countries/
│   │   ├── countries-queries.test.ts
│   │   └── countries-schema.test.ts
│   ├── spacex/
│   │   ├── spacex-queries.test.ts
│   │   └── spacex-pagination.test.ts
│   ├── rickandmorty/
│   │   ├── rickandmorty-fragments.test.ts
│   │   └── rickandmorty-filters.test.ts
│   ├── github/
│   │   ├── github-auth.test.ts
│   │   └── github-repositories.test.ts
│   ├── mutations/
│   │   └── user-mutations.test.ts (mock server)
│   ├── schema/
│   │   └── introspection.test.ts
│   ├── errors/
│   │   └── error-handling.test.ts
│   └── performance/
│       └── performance.test.ts
├── utils/
│   ├── graphql-client.ts
│   ├── mock-server.ts
│   └── performance.ts
├── types/
│   ├── countries.types.ts
│   ├── spacex.types.ts
│   └── github.types.ts
├── config/
│   ├── endpoints.ts
│   └── auth.ts
├── fixtures/
│   └── test-data.ts
├── docs/
│   ├── ARCHITECTURE.md
│   └── API_COVERAGE.md
├── .github/
│   └── workflows/
│       └── graphql-tests.yml
├── coverage/
├── vitest.config.ts
├── tsconfig.json
├── CHANGELOG.md
├── README.md
└── package.json
```

---

## Success Metrics

### Test Coverage Goals
- **Minimum:** 40+ tests across all categories
- **Target Breakdown:**
  - Queries: 15-20 tests
  - Mutations: 4-5 tests (mock server)
  - Schema: 5-6 tests
  - Errors: 5-6 tests
  - Auth: 5-6 tests
  - Performance: 4-5 tests

### Code Quality
- TypeScript strict mode enabled
- 100% type coverage for API responses
- Comprehensive error handling
- CI/CD pipeline passing all tests

### Documentation
- Comprehensive README with examples
- Architecture documentation
- API coverage matrix
- Inline code comments

---

## Technology Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| Language | TypeScript | Type-safe test code |
| GraphQL Client | graphql-request | Lightweight GraphQL client |
| Testing Framework | Vitest | Fast unit testing |
| Mock Server | GraphQL Yoga | Mutation testing |
| CI/CD | GitHub Actions | Automated testing |
| Coverage | Vitest Coverage | Code coverage reporting |

---

## Skills Demonstrated

### GraphQL Expertise
- Query and mutation operations
- Schema introspection and validation
- Variables and fragments
- Error handling patterns
- Authentication with JWT tokens

### API Testing Skills
- Comprehensive test coverage (queries, mutations, schema)
- Data-driven testing patterns
- Performance benchmarking
- Error handling and edge cases

### Software Engineering
- TypeScript best practices
- Clean code architecture
- CI/CD integration
- Comprehensive documentation

---

## Portfolio Integration

### Narrative
"After building a modern UI testing framework with Playwright, I expanded my expertise to GraphQL API testing. This project demonstrates my ability to test modern API architectures, handle authentication, validate schemas, and ensure API performance meets requirements."

### Complementary to Project 1
- Project 1: UI testing (Playwright)
- Project 2: GraphQL API testing
- Together: Full-stack test automation coverage

### Preparation for Project 3
GraphQL knowledge provides foundation for gRPC:
- Both use schemas/types
- Both support streaming (subscriptions vs server streaming)
- Authentication patterns transfer

---

## Optional Advanced Features

If you have extra time or want to go deeper:

### WebSocket Subscriptions (2-3 hours)
- Set up subscription testing with `graphql-ws`
- Real-time data validation
- Connection handling tests

### GraphQL Code Generation (1-2 hours)
- Use `graphql-codegen` to generate TypeScript types from schema
- Demonstrates advanced GraphQL tooling knowledge

### Custom Directives (1-2 hours)
- Test `@include`, `@skip` directives
- Custom directive behavior validation

---

## Quick Start Commands

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test countries-queries

# Run tests in CI mode
npm run test:ci
```

---

## Weekly Time Breakdown

| Week | Focus Area | Hours |
|------|------------|-------|
| Week 1 | Setup + Basic Queries | 10 |
| Week 2 | Mutations + Schema + Errors | 10 |
| Week 3 | Auth + Performance + CI/CD | 10 |
| **Total** | | **30 hours** |

---

## Next Steps After Completion

1. **Add to portfolio README**: Update main portfolio progress tracker
2. **LinkedIn post**: Share GraphQL testing project completion
3. **GitHub pinned repo**: Make it visible on your profile
4. **Prepare for Project 3**: Review gRPC fundamentals (Protocol Buffers)

---

*Last Updated: January 14, 2026*
