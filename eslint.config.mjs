import eslintJs from '@eslint/js';
import nextVitals from 'eslint-config-next/core-web-vitals';
import vitest from '@vitest/eslint-plugin';
import prettierConfig from 'eslint-config-prettier/flat';
import globals from 'globals';

const config = [
  {
    ignores: [
      '.next/**',
      'dist/**',
      'generated/**',
      'node_modules/**',
      'pnpm-lock.yaml'
    ]
  },
  eslintJs.configs.recommended,
  ...nextVitals,
  {
    files: ['__tests__/**'],
    plugins: { vitest },
    rules: vitest.configs.recommended.rules,
    languageOptions: { globals: vitest.environments.env.globals }
  },
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
      'no-unused-vars': ['error', { caughtErrors: 'none' }],
      'react-hooks/set-state-in-effect': 'warn'
    }
  }
];

export default config;
