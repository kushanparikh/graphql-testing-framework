# Changelog

All notable changes to the GraphQL API Testing Suite will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- GraphQL client wrapper implementation
- Countries API query tests (15-20 tests)
- SpaceX API complex query tests
- Rick and Morty API fragment tests
- GitHub API authentication tests
- Schema validation and introspection tests
- Error handling test suite
- Performance benchmarking utilities
- Mock GraphQL server for mutation testing
- CI/CD pipeline with GitHub Actions

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
| 0.1.0 | 2026-01-14 | Initial project setup and configuration |

---

## Upcoming Milestones

### v0.2.0 - Week 1 Completion (Target: ~10 hours)
- GraphQL client wrapper with error handling
- Countries API: 5-7 basic query tests
- SpaceX API: 4-5 complex query tests
- Response validation patterns
- TypeScript types for API responses

### v0.3.0 - Week 2 Completion (Target: ~10 hours)
- Rick and Morty API: Fragment and filter tests
- Mock GraphQL server setup
- Mutation testing: 4-5 tests
- Schema validation: 5-6 introspection tests
- Error handling: 5-6 edge case tests

### v1.0.0 - Week 3 Completion (Target: ~10 hours)
- GitHub API authentication tests
- Performance testing utilities
- CI/CD pipeline with GitHub Actions
- Comprehensive documentation (ARCHITECTURE.md, LEARNING_NOTES.md)
- Test coverage reporting
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
*Last Updated: January 14, 2026*