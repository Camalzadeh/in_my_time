const config = {
    preset: '@shelf/jest-mongodb',

    testEnvironment: 'node',

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