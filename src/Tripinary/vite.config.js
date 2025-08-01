/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  test: {
    // General Vitest configuration
    globals: true, // Makes describe, test, expect available globally without imports
    environment: 'jsdom', // or 'happy-dom' for faster DOM emulation
    setupFiles: ['./vitest.setup.js'], // Path to your setup file
    include: ['**/*.test.{js,jsx,ts,tsx}'], // Pattern to find test files

    // Configuration for backend tests (Node.js environment)
    environmentMatchGlobs: [
      ['./server.test.js', 'node'], // Explicitly run server.test.js in Node environment
    ],
    // Mocking environment variables for tests
    env: {
      VITE_GOOGLE_PLACES_API_KEY: 'mock_frontend_api_key', // For frontend tests
      GOOGLE_PLACES_API_KEY: 'mock_google_api_key', // For backend tests
      OPENROUTER_API_KEY: 'mock_openrouter_api_key', // For backend tests
      PORT: '5001' // For backend tests
    },
  },
  resolve: {
    alias: {
      // Mock specific image paths used in slideout.jsx
      // Ensure these paths correctly reflect the relative path from your vite.config.js
      // to the image files within your project structure.
      '../src/pages/slide-out/Tripinary.png': path.resolve(__dirname, '__mocks__/fileMock.js'),
      '../src/pages/slide-out/search.png': path.resolve(__dirname, '__mocks__/fileMock.js'),
      // If you have other aliases (e.g., for '@/src' or similar), add them here:
      // '@': path.resolve(__dirname, './src'),
    },
  },
});
