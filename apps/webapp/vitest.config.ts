import { defineProject, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';
import path from 'path';

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
    resolve: {
      alias: {
        'design-react-kit': path.resolve(__dirname, 'node_modules/design-react-kit/dist/index.js'),
      },
    },
  }),
);
