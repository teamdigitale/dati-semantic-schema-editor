import { defineProject, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineProject({
    test: {
      globals: true,
      clearMocks: true,
      environment: 'happy-dom',
      include: ['src/**/*.spec.{ts,tsx}'],
      server: {
        deps: {
          inline: ['design-react-kit'],
        },
      },
    },
  }),
);
