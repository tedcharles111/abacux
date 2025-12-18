import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Declare process to avoid TypeScript errors if node types are missing
declare const process: { env: Record<string, string | undefined> };

export default defineConfig({
  plugins: [react()],
  define: {
    // This allows the browser code to access process.env.API_KEY as a global constant
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ''),
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  }
});