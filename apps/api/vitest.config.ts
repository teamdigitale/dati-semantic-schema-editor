import { defineProject } from 'vitest/config';

export default defineProject({
  test: {
    globals: true,
    clearMocks: true,
    environment: 'node',
    include: ['src/**/*.spec.ts'],
  },
});
