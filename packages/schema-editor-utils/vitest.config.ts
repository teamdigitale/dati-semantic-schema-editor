import { defineProject, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineProject({
    test: {
      globals: true,
      clearMocks: true,
      environment: 'node',
      include: ['src/**/*.spec.{ts,tsx}'],
    },
  }),
);
