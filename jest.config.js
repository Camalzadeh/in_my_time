const config = {
    testEnvironment: 'node',

    setupFiles: ['<rootDir>/tests/setup-env.js'],

    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },

    transform: {
        '^.+\.(t|j)sx?$': ['@swc/jest'],
    },

    roots: ['<rootDir>/tests'],

    testMatch: ['<rootDir>/tests/**/*.test.ts', '<rootDir>/tests/**/*.spec.ts'],

    // Integration tests share one database, so they must not run concurrently.
    maxWorkers: 1,
};

module.exports = config;
