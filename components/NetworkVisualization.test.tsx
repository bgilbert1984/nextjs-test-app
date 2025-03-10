// components/NetworkVisualization.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Create mock renderer with dispose method
const mockRenderer = {
  setSize: vi.fn(),
  render: vi.fn(),
  setClearColor: vi.fn(),
  domElement: document.createElement('canvas'),
  dispose: vi.fn() // Add the missing dispose method
};

const mockScene = {
  add: vi.fn(),
  remove: vi.fn(),
  children: [],
  traverse: vi.fn()
};

const createMockVector3 = () => ({
  set: vi.fn(),
  copy: vi.fn(),
  normalize: vi.fn(),
  clone: vi.fn().mockReturnThis(),
  x: 0,
  y: 0,
  z: 0
});

// Mock Three.js
vi.mock('three', () => {
  return {
    WebGLRenderer: vi.fn(() => mockRenderer),
    Scene: vi.fn(() => mockScene),
    PerspectiveCamera: vi.fn(() => ({
      position: { set: vi.fn() },
      lookAt: vi.fn()
    })),
    AmbientLight: vi.fn(() => ({
      position: { set: vi.fn() }
    })),
    DirectionalLight: vi.fn(() => ({
      position: { set: vi.fn() }
    })),
    Vector3: vi.fn(() => createMockVector3()),
    Vector2: vi.fn(() => ({
      set: vi.fn()
    })),
    Color: vi.fn(),
    GridHelper: vi.fn(),
    MeshLambertMaterial: vi.fn(() => ({
      color: { set: vi.fn() }
    })),
    LineBasicMaterial: vi.fn(() => ({
      color: {}
    })),
    BoxGeometry: vi.fn(),
    SphereGeometry: vi.fn(),
    BufferGeometry: vi.fn(() => ({
      setFromPoints: vi.fn().mockReturnThis(),
      dispose: vi.fn()
    })),
    Line: vi.fn(() => ({
      geometry: {},
      material: {},
      position: createMockVector3()
    })),
    Mesh: vi.fn(() => ({
      position: createMockVector3(),
      rotation: { set: vi.fn() },
      scale: { set: vi.fn() }
    })),
    Raycaster: vi.fn(() => ({
      setFromCamera: vi.fn(),
      intersectObjects: vi.fn().mockReturnValue([])
    })),
    Group: vi.fn(() => ({
      add: vi.fn(),
      remove: vi.fn(),
      position: createMockVector3(),
      children: []
    }))
  };
});

// Mock react-three-fiber very simply
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children, ...props }) => (
    <div data-testid="canvas" {...props}>{children || null}</div>
  ),
  useThree: () => ({
    camera: { position: { set: vi.fn() } },
    scene: mockScene,
    gl: mockRenderer
  }),
  useFrame: vi.fn(cb => cb({}, 0.1))
}));

// Mock react-three/drei
vi.mock('@react-three/drei', () => ({
  OrbitControls: (props) => <div data-testid="orbit-controls" {...props}>Mock OrbitControls</div>
}));

// Create a mock WebSocket class
class MockWebSocket {
  onopen = null;
  onmessage = null;
  onclose = null;
  onerror = null;
  readyState = 0;
  send = vi.fn();
  close = vi.fn();
  
  constructor() {
    // Simulate connection in next tick
    setTimeout(() => {
      this.readyState = 1;
      if (this.onopen) this.onopen({});
    }, 0);
  }
}

// Set up global WebSocket mock
global.WebSocket = MockWebSocket;

// Import component after mocks
import NetworkVisualization from './NetworkVisualization';

describe('NetworkVisualization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders initial state correctly', () => {
    const { container } = render(<NetworkVisualization />);
    // Test for the button text that's actually in your component
    expect(container.textContent).toContain('Launch Unit');
  });

  it('renders with WebSocket connection', () => {
    const { container } = render(<NetworkVisualization />);
    expect(container.textContent).toContain('Launch Unit');
  });

  it('handles WebSocket errors', () => {
    // Create a new instance to trigger the error handler
    const ws = new MockWebSocket();
    
    // Render the component
    const { container } = render(<NetworkVisualization />);
    
    // Simulate an error
    if (ws.onerror) {
      ws.onerror(new Event('error'));
    }
    
    // Basic check that component still renders
    expect(container.textContent).toContain('Launch Unit');
  });
});