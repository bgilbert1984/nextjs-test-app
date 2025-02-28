// cypress.config.ts
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000', // Adjust if your dev server runs on a different port
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});