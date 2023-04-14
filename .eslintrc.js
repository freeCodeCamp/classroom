module.exports = {
  env: {
    node: true,
    browser: true,
    commonjs: true,
    es6: true
  },
  overrides: [
    {
      files: ['*.js', '*.jsx']
    }
  ],
  extends: [
    'eslint:recommended',
    'next/core-web-vitals',
    'plugin:cypress/recommended',
    'plugin:jest/recommended',
    'prettier'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2020
  },
  rules: {}
};
