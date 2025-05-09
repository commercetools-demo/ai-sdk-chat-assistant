import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'AIAssistant',
      formats: ['es', 'umd'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`,
    },
    // For the demo version - bundle dependencies
    rollupOptions: {
      output: {
        // Include React and @ai-sdk/react for easier demo usage
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@ai-sdk/react': 'AiSdkReact',
        },
      },
    },
  },
}); 