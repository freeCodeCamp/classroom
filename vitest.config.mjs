import { defineConfig } from 'vitest/config';

export default defineConfig({
  oxc: {
    include: /\.[jt]sx?$/,
    exclude: [],
    lang: 'jsx',
    jsx: { runtime: 'automatic' }
  },
  css: {
    modules: { classNameStrategy: 'non-scoped' }
  },
  test: {
    globals: true,
    setupFiles: ['./vitest.setup.mjs'],
    css: { include: [/\.module\.css$/] },
    projects: [
      {
        extends: true,
        test: {
          name: 'dom',
          environment: 'jsdom',
          include: ['__tests__/**/*.test.jsx']
        }
      },
      {
        extends: true,
        test: {
          name: 'node',
          environment: 'node',
          include: ['__tests__/**/*.test.js']
        }
      }
    ]
  }
});
