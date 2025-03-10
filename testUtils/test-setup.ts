// testUtils/setup.ts
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';
import '@testing-library/jest-dom';
import { setupThreeMocks } from './threeMocks';

// Add custom matchers from jest-dom
expect.extend(matchers);

// Run cleanup after each test
afterEach(() => {
  cleanup();
});

// Set up all Three.js mocks
setupThreeMocks();

// Mock WebSocket
class MockWebSocket {
  onopen: ((this: WebSocket, ev: Event) => any) | null = null;
  onmessage: ((this: WebSocket, ev: MessageEvent) => any) | null = null;
  onclose: ((this: WebSocket, ev: CloseEvent) => any) | null = null;
  onerror: ((this: WebSocket, ev: Event) => any) | null = null;
  readyState = 0;
  send = vi.fn();
  close = vi.fn();
  
  constructor() {
    setTimeout(() => {
      this.readyState = 1;
      if (this.onopen) this.onopen({} as any);
    }, 0);
  }
}

// Replace global WebSocket with mock
global.WebSocket = MockWebSocket as any;

// Mock canvas API
const mockContext2D = {
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(() => ({
    data: new Uint8ClampedArray(Math.floor(Math.random() * 100)),
  })),
  putImageData: vi.fn(),
  createImageData: vi.fn(),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  scale: vi.fn(),
  measureText: vi.fn(() => ({ width: 10 })),
  fillText: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  bezierCurveTo: vi.fn(),
  arc: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  fill: vi.fn(),
};

// Mock HTMLCanvasElement.prototype.getContext
HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext2D);

// Mock window.requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = vi.fn().mockImplementation(callback => {
  return setTimeout(callback, 0);
});
global.cancelAnimationFrame = vi.fn().mockImplementation(id => {
  clearTimeout(id);
});

// Mock ResizeObserver
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

global.ResizeObserver = MockResizeObserver as any;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Silence console errors during tests
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
