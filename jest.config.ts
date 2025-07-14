// Jest configuration for Stock Portfolio Tracker
// Uses ts-jest to handle TypeScript and JSX/TSX files
// Ensures browser-like testing environment and clean module imports

const config = {
  // Use ts-jest preset to handle TypeScript and TSX files
  preset: 'ts-jest',

  // Set the test environment to jsdom for browser-like testing
  testEnvironment: 'jsdom',

  // Run setup files after the test framework is installed
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // Map module aliases for cleaner imports (e.g., @/module)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },

  // Transform TypeScript and TSX files using ts-jest
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },

  // Ignore test paths in node_modules and e2e tests
  testPathIgnorePatterns: ['/node_modules/', '/tests/e2e/'],
};

export default config;
