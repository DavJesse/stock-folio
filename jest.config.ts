export default {
    // Use ts-jest preset to handle TypeScript files
    preset: 'ts-jest',
    // Set the test environment to jsdom for browser-like testing
    testEnvironment: 'jsdom',
    // Run setup files after the test framework is installed
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    // Map module aliases for cleaner imports (e.g., @/module)
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
    transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    },
};
