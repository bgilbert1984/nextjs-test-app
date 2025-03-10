// testUtils/setup.ts
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';
import '@testing-library/jest-dom';

// Add custom matchers from jest-dom
expect.extend(matchers);

// Run cleanup after each test
afterEach(() => {
  cleanup();
});

// Silence console errors during tests for Three.js components
const originalConsoleError = console.error;
console.error = (...args) => {
  // Filter out React Three Fiber errors about unknown elements
  const errorMsg = args[0]?.toString() || '';
  if (
    errorMsg.includes('<mesh>') || 
    errorMsg.includes('three') || 
    errorMsg.includes('Warning:')
  ) {
    return;
  }
  originalConsoleError(...args);
};