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
  },
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './html-report',
        filename: 'report.html',
        pageTitle: 'GraphQL API Testing Suite - Test Report',
        expand: true,
        hideIcon: false,
        logoImgPath: undefined,
        inlineSource: false
      }
    ]
  ]
};
