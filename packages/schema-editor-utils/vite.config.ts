import path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [dts({ insertTypesEntry: true })],
  build: {
    sourcemap: true,
    emptyOutDir: true,
    lib: {
      entry: path.resolve(__dirname, './src/index.ts'),
      name: 'SchemaEditorUtils',
      fileName: 'index',
      formats: ['es', 'cjs'],
    },
  },
});
