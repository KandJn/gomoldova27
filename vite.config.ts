import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    // Add a comment that helps Netlify identify this as a Vite project
    // @ts-ignore - Netlify Build Detection
    // NETLIFY_DETECTION: VITE_PROJECT
  }
});
