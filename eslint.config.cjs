const js = require('@eslint/js')
const tseslint = require('@typescript-eslint/eslint-plugin')
const tsParser = require('@typescript-eslint/parser')
let unicorn = require('eslint-plugin-unicorn')
const globals = require('globals')
const unusedImports = require('eslint-plugin-unused-imports')

const prettierPlugin = require('eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');

unicorn = unicorn.default ?? unicorn;

/** @type {import("eslint").Linter.FlatConfig[]} */
module.exports = [
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
      },
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },

    plugins: {
      '@typescript-eslint': tseslint,
      "unused-imports": unusedImports,
      prettier: prettierPlugin,
      unicorn,
    },
    rules: {
      // Unicorn-specific rules
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/no-null': 'off',
      'unicorn/filename-case': [
        'error',
        {
          cases: {
            kebabCase: true,
          },
        },
      ],

      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-unused-vars': 'off',
      "no-eval": "error",
      "no-new-func": "error",
      "no-implied-eval": "error",
      "no-cond-assign": ["error", "always"],
      'unicorn/better-regex': 'warn',

      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          "vars": "all",
          "varsIgnorePattern": "^_",
          "args": "after-used",
          "argsIgnorePattern": "^_",
          "caughtErrors": "all",
          "caughtErrorsIgnorePattern": "^_"
        }
      ],
      "unused-imports/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",

      'unicode-bom': ['error', 'never'],
      'linebreak-style': ['error', 'unix'],

      "complexity": ["warn", 40],
      "max-lines": ["warn", 1000],
      "no-console": ["warn", { "allow": ["warn", "error"] }],

      "@typescript-eslint/interface-name-prefix": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "off",

      'prettier/prettier': 'error',
    },
  },
  ...prettierConfig.flat || [],
  {
    ignores: ['dist', 'node_modules', 'migrations'],
  },
];
