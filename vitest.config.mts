import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    css: {
      include: [/\.module\.css$/],
      modules: { classNameStrategy: 'non-scoped' }
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'dom',
          environment: 'jsdom',
          include: ['__tests__/**/*.test.tsx']
        }
      },
      {
        extends: true,
        test: {
          name: 'node',
          environment: 'node',
          include: ['__tests__/**/*.test.ts']
        }
      }
    ]
  }
});
