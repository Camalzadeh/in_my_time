const config = {
    testEnvironment: 'node',

    setupFiles: ['<rootDir>/tests/setup-env.js'],

    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
        // `server-only` throws unless it is loaded by the React Server
        // Components runtime, which Jest is not. Its job is to fail the build
        // when a client component imports a server module — that check belongs
        // to `next build`, so here it is stubbed out.
        '^server-only$': '<rootDir>/tests/stubs/server-only.js',
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
