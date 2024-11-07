import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'apps/*',
  'packages/*',
  {
    test: {
      environment: 'jsdom',
      server: {
        deps: {
          inline: ['design-react-kit'],
        },
      },
    },
  },
]);
