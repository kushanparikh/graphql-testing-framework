# Design Decisions

**Project:** GraphQL API Testing Suite (Portfolio Project 2)  
**Purpose:** Document technology choices and trade-offs  
**Last Updated:** January 14, 2026

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

*Last Updated: January 14, 2026*
