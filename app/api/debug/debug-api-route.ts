// app/api/debug/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

// Helper function to run a command and return its output
async function runCommand(command: string): Promise<{ stdout: string; stderr: string }> {
  try {
    const { stdout, stderr } = await execPromise(command);
    return { stdout, stderr };
  } catch (error: any) {
    return { 
      stdout: error.stdout || '', 
      stderr: error.stderr || `Error executing command: ${error.message}` 
    };
  }
}

// Helper function to read file contents
async function readFile(filePath: string): Promise<string> {
  try {
    return await fs.readFile(path.resolve(process.cwd(), filePath), 'utf8');
  } catch (error: any) {
    return `Error reading file: ${error.message}`;
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { action, payload } = body;

    switch (action) {
      case 'runTest': {
        // Run a specific test or all tests
        const testPath = payload?.testPath || '';
        const command = testPath 
          ? `npx vitest run ${testPath}`
          : 'npx vitest run';
        
        const result = await runCommand(command);
        return NextResponse.json({ success: true, result });
      }

      case 'viewFile': {
        // View contents of a specific file
        const filePath = payload?.filePath;
        if (!filePath) {
          return NextResponse.json(
            { success: false, error: 'No file path provided' },
            { status: 400 }
          );
        }
        
        const content = await readFile(filePath);
        return NextResponse.json({ success: true, content });
      }

      case 'analyzeTests': {
        // Analyze test failures and suggest fixes
        const testResults = await runCommand('npx vitest run');
        
        // Try to extract failing test files and error messages
        const failureAnalysis = {
          failingTests: [],
          possibleIssues: [],
          suggestions: []
        };

        // Simple pattern matching to extract failing tests - could be enhanced with proper parsing
        const stderr = testResults.stderr;
        
        // Look for Three.js mockup issues
        if (stderr.includes('No "BufferGeometry" export is defined on the "three" mock')) {
          failureAnalysis.possibleIssues.push('Incomplete Three.js mocking');
          failureAnalysis.suggestions.push({
            title: 'Create proper Three.js mock',
            code: `
// In your test file or a dedicated mock file
vi.mock('three', async () => {
  const actual = await vi.importActual('three');
  return {
    ...actual,
    BufferGeometry: vi.fn().mockImplementation(() => ({
      setFromPoints: vi.fn().mockReturnThis(),
      dispose: vi.fn()
    })),
    Line: vi.fn().mockImplementation(() => ({
      geometry: {},
      material: {}
    })),
    LineBasicMaterial: vi.fn(),
    // Add other Three.js classes/methods as needed
  };
});`
          });
        }

        // Look for React Three Fiber issues
        if (stderr.includes('<mesh>') || stderr.includes('OrbitControls')) {
          failureAnalysis.possibleIssues.push('React Three Fiber component mocking issues');
          failureAnalysis.suggestions.push({
            title: 'Create @react-three/fiber and @react-three/drei mocks',
            code: `
// Create a __mocks__ folder in your project and add these files

// __mocks__/@react-three/fiber.js
module.exports = {
  Canvas: ({ children }) => <div data-testid="canvas">{children}</div>,
  useThree: vi.fn().mockReturnValue({
    camera: { position: { set: vi.fn() } },
    scene: {}
  }),
  // Add other exports as needed
};

// __mocks__/@react-three/drei.js
module.exports = {
  OrbitControls: (props) => <div data-testid="orbit-controls" {...props} />,
  // Add other components as needed
};`
          });
        }

        // Look for CrateDB mocking issues
        if (stderr.includes('ReferenceError: Cannot access') && stderr.includes('before initialization')) {
          failureAnalysis.possibleIssues.push('Hoisting issues with vi.mock');
          failureAnalysis.suggestions.push({
            title: 'Fix hoisting issue by moving mock variables',
            code: `
// AVOID this pattern:
const mockExecute = vi.fn();
vi.mock('node-crate', () => ({
  default: {
    execute: mockExecute
  }
}));

// DO this instead:
vi.mock('node-crate', () => ({
  default: {
    execute: vi.fn()
  }
}));
// Then access the mock later
const crate = await import('node-crate');
const mockExecute = crate.default.execute as MockedFunction<typeof crate.default.execute>;`
          });
        }

        return NextResponse.json({ 
          success: true, 
          testResults, 
          analysis: failureAnalysis 
        });
      }

      case 'fixThreeMocks': {
        // Generate a helper file for Three.js mocks
        const mockContent = `
// testUtils/threeMocks.ts
import { vi } from 'vitest';

// Create a file with common Three.js mocks for your tests
export function setupThreeMocks() {
  vi.mock('three', async () => {
    const actual = await vi.importActual('three');
    return {
      ...actual,
      // Geometry
      BufferGeometry: vi.fn().mockImplementation(() => ({
        setFromPoints: vi.fn().mockReturnThis(),
        dispose: vi.fn()
      })),
      SphereGeometry: vi.fn(),
      
      // Materials
      MeshStandardMaterial: vi.fn(),
      MeshLambertMaterial: vi.fn(),
      LineBasicMaterial: vi.fn(),
      
      // Objects
      Mesh: vi.fn().mockImplementation(() => ({
        position: { set: vi.fn() },
        rotation: { set: vi.fn() },
        scale: { set: vi.fn() }
      })),
      Line: vi.fn().mockImplementation(() => ({
        geometry: {},
        material: {}
      })),
      
      // Lights
      AmbientLight: vi.fn(),
      PointLight: vi.fn(),
      
      // Utilities
      Vector3: vi.fn().mockImplementation(() => ({
        set: vi.fn(),
        clone: vi.fn().mockReturnThis(),
        add: vi.fn().mockReturnThis(),
        sub: vi.fn().mockReturnThis(),
        normalize: vi.fn().mockReturnThis(),
        multiplyScalar: vi.fn().mockReturnThis()
      })),
      Raycaster: vi.fn().mockImplementation(() => ({
        setFromCamera: vi.fn(),
        intersectObjects: vi.fn().mockReturnValue([])
      })),
      
      // Math
      MathUtils: {
        randFloat: vi.fn().mockReturnValue(0.5),
        randInt: vi.fn().mockReturnValue(1)
      }
    };
  });
  
  // Mock React Three Fiber
  vi.mock('@react-three/fiber', () => ({
    Canvas: ({ children }) => <div data-testid="canvas">{children}</div>,
    useThree: vi.fn().mockReturnValue({
      camera: { position: { set: vi.fn() } },
      scene: { add: vi.fn(), remove: vi.fn() },
      gl: { domElement: document.createElement('div') }
    }),
    useFrame: vi.fn()
  }));
  
  // Mock React Three Drei
  vi.mock('@react-three/drei', () => ({
    OrbitControls: (props) => <div data-testid="orbit-controls" {...props} />,
    PerspectiveCamera: (props) => <div data-testid="perspective-camera" {...props} />,
    AmbientLight: (props) => <div data-testid="ambient-light" {...props} />,
    PointLight: (props) => <div data-testid="point-light" {...props} />
  }));
}
`;
        
        // Create the directory if it doesn't exist
        try {
          await fs.mkdir(path.resolve(process.cwd(), 'testUtils'), { recursive: true });
          await fs.writeFile(
            path.resolve(process.cwd(), 'testUtils/threeMocks.ts'), 
            mockContent
          );
          return NextResponse.json({ 
            success: true, 
            message: 'Created testUtils/threeMocks.ts helper file'
          });
        } catch (error: any) {
          return NextResponse.json({ 
            success: false, 
            error: `Failed to create mock helper: ${error.message}`
          });
        }
      }

      case 'updateVitestConfig': {
        // Create or update vitest config with proper settings for Next.js and Three.js
        const configContent = `
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./testUtils/setup.ts'],
    mockReset: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    deps: {
      inline: [/node_modules/],
    },
    // Handle any canvas/WebGL related errors that might occur
    environmentOptions: {
      jsdom: {
        resources: 'usable',
      },
    },
  },
  resolve: {
    alias: {
      // Add your path aliases, which should match those in tsconfig.json
      '@': resolve(__dirname, './'),
      '@/components': resolve(__dirname, './components'),
      '@/app': resolve(__dirname, './app'),
    },
  },
});
`;

        const setupContent = `
// testUtils/setup.ts
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';
import '@testing-library/jest-dom';
import { setupThreeMocks } from './threeMocks';

// Add custom matchers
expect.extend(matchers);

// Run cleanup after each test
afterEach(() => {
  cleanup();
});

// Set up all Three.js mocks
setupThreeMocks();

// Mock WebSocket
class MockWebSocket {
  onopen = null;
  onmessage = null;
  onclose = null;
  onerror = null;
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

// Mock window.requestAnimationFrame
global.requestAnimationFrame = vi.fn().mockImplementation(cb => setTimeout(cb, 0));
global.cancelAnimationFrame = vi.fn();
`;

        try {
          // Create testUtils directory if it doesn't exist
          await fs.mkdir(path.resolve(process.cwd(), 'testUtils'), { recursive: true });
          
          // Write configuration files
          await fs.writeFile(
            path.resolve(process.cwd(), 'vitest.config.ts'), 
            configContent
          );
          
          await fs.writeFile(
            path.resolve(process.cwd(), 'testUtils/setup.ts'), 
            setupContent
          );
          
          return NextResponse.json({ 
            success: true, 
            message: 'Created vitest.config.ts and testUtils/setup.ts'
          });
        } catch (error: any) {
          return NextResponse.json({ 
            success: false, 
            error: `Failed to create config: ${error.message}`
          });
        }
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('API route error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'An unknown error occurred' },
      { status: 500 }
    );
  }
}
