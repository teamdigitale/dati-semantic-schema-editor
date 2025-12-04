import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), dts({ insertTypesEntry: true })],
  assetsInclude: ['**/*.md'],
  build: {
    lib: {
      entry: path.resolve(__dirname, './src/index.ts'),
      name: 'schema-editor',
      fileName: 'index',
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', 'swagger-editor', 'swagger-ui'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'React-dom',
          'react/jsx-runtime': 'react/jsx-runtime',
          'swagger-editor': 'swagger-editor',
          'swagger-ui': 'swagger-ui',
        },
      },
    },
  },
});
