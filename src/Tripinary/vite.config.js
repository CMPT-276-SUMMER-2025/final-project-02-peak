import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
    test: {
    // General Vitest configuration
    globals: true, // Makes describe, test, expect available globally without imports
    environment: 'jsdom', // or 'happy-dom' for faster DOM emulation
    setupFiles: ['./vitest.setup.js'], // Path to your setup file
    include: ['**/*.test.{js,jsx,ts,tsx}'], // Pattern to find test files

    // Configuration for frontend tests (React components)
    // By default, environment is 'jsdom' which is good for React.

    // Configuration for backend tests (Node.js environment)
    // You can use a specific environment for backend tests if needed,
    // but Vitest's default Node.js environment is usually sufficient.
    // We'll use a naming convention for backend tests (e.g., server.test.js)
    // and ensure they run in Node.js environment.
    environmentMatchGlobs: [
      ['**/*.server.test.js', 'node'], // Example: if you name backend tests with .server.test.js
      ['./server.test.js', 'node'], // Explicitly run server.test.js in Node environment
    ],
    // Mocking environment variables for tests
    env: {
      VITE_GOOGLE_PLACES_API_KEY: 'mock_frontend_api_key', // For frontend tests
      GOOGLE_PLACES_API_KEY: 'mock_google_api_key', // For backend tests
      OPENROUTER_API_KEY: 'mock_openrouter_api_key', // For backend tests
      PORT: '5001' // For backend tests
    },
    // You might need to configure `resolve.alias` if you have path aliases in your project
    // For example:
    // resolve: {
    //   alias: {
    //     '@': path.resolve(__dirname, './src'),
    //   },
    // },
  },
})
