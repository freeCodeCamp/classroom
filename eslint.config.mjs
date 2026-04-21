import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import eslintJs from '@eslint/js';
import cypressPlugin from 'eslint-plugin-cypress/flat';
import jestPlugin from 'eslint-plugin-jest';
import prettierConfig from 'eslint-config-prettier/flat';
import globals from 'globals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: eslintJs.configs.recommended
});

const config = [
  {
    ignores: ['.next/**', 'dist/**', 'node_modules/**', 'package-lock.json']
  },
  eslintJs.configs.recommended,
  ...compat.extends('next/core-web-vitals'),
  cypressPlugin.configs.recommended,
  jestPlugin.configs['flat/recommended'],
  prettierConfig,
  {
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.commonjs,
        ...globals.es2017,
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': ['error', { caughtErrors: 'none' }]
    }
  }
];

export default config;
