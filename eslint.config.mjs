import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import nextVitals from "eslint-config-next/core-web-vitals";
import { defineConfig, globalIgnores } from 'eslint/config';

const eslintConfig = defineConfig([
    ...nextVitals,

    {
        files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],

        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node
            }
        },

        rules: {
            "react-hooks/set-state-in-effect": "off",
            "prefer-const": "error",
            "no-console": "off",
            "no-unused-vars": "off",
        }
    },

    ...tseslint.configs.recommended,

    {
        files: ["**/*.{jsx,tsx}"],
        ...pluginReact.configs.flat.recommended,

        settings: {
            react: { version: 'detect' },
        },

        rules: {
            "react/react-in-jsx-scope": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "react-hooks/set-state-in-effect": "off",
            "@typescript-eslint/no-unused-vars": ["error", {
                "varsIgnorePattern": "^_",
                "argsIgnorePattern": "^_",
                "caughtErrors": "all",
                "caughtErrorsIgnorePattern": "^_$",
                "ignoreRestSiblings": true,
            }],
            "@typescript-eslint/no-require-imports": "error",
        }
    },

    {
        files: ["tests/**/*.{js,ts,jsx,tsx}", "**/*.test.{js,ts,jsx,tsx}"],
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest,
            }
        },
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-require-imports": "off"
        }
    },

    globalIgnores([
        '.next/**',
        'out/**',
        'build/**',
        'next-env.d.ts',
        '**/*.config.js',
    ]),
]);

export default eslintConfig;