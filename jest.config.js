const config = {
    preset: '@shelf/jest-mongodb',

    testEnvironment: 'node',

    setupFiles: ["<rootDir>/tests/load_env.js"],

    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },

    transform: {
        '^.+\\.(t|j)sx?$': ['@swc/jest'],
    },

    roots: ['<rootDir>/tests'],

    testMatch: ['<rootDir>/tests/**/*.test.ts', '<rootDir>/tests/**/*.spec.ts'],

    watchPathIgnorePatterns: ['globalConfig'],
};

module.exports = config;
