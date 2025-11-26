const config = {
    testEnvironment: 'node',

    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },

    transform: {
        '^.+\\.(t|j)sx?$': ['@swc/jest'],
    },

    roots: ['<rootDir>/tests/unit'],

    testMatch: ['<rootDir>/tests/unit/**/*.test.ts', '<rootDir>/tests/unit/**/*.spec.ts'],
};

module.exports = config;
