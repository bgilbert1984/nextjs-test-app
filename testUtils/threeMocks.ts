// testUtils/threeMocks.ts
import { vi } from 'vitest';
import React from 'react';

export function setupThreeMocks() {
  // Mock Three.js
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
      BoxGeometry: vi.fn(),
      
      // Materials
      MeshStandardMaterial: vi.fn(),
      MeshBasicMaterial: vi.fn(),
      MeshLambertMaterial: vi.fn(),
      LineBasicMaterial: vi.fn(),
      
      // Objects
      Mesh: vi.fn().mockImplementation(() => ({
        position: { 
          set: vi.fn(),
          copy: vi.fn(), 
          x: 0, 
          y: 0, 
          z: 0 
        },
        rotation: { 
          set: vi.fn(),
          x: 0, 
          y: 0, 
          z: 0 
        },
        scale: { 
          set: vi.fn(),
          x: 1, 
          y: 1, 
          z: 1 
        }
      })),
      Line: vi.fn().mockImplementation(() => ({
        geometry: {},
        material: {}
      })),
      Group: vi.fn().mockImplementation(() => ({
        add: vi.fn(),
        remove: vi.fn(),
        children: []
      })),
      
      // Lights
      AmbientLight: vi.fn(),
      PointLight: vi.fn(),
      DirectionalLight: vi.fn(),
      
      // Cameras
      PerspectiveCamera: vi.fn().mockImplementation(() => ({
        position: { set: vi.fn(), x: 0, y: 0, z: 0 },
        lookAt: vi.fn()
      })),
      
      // Utilities
      Vector3: vi.fn().mockImplementation(() => ({
        set: vi.fn().mockReturnThis(),
        clone: vi.fn().mockReturnThis(),
        copy: vi.fn().mockReturnThis(),
        add: vi.fn().mockReturnThis(),
        sub: vi.fn().mockReturnThis(),
        normalize: vi.fn().mockReturnThis(),
        multiplyScalar: vi.fn().mockReturnThis(),
        x: 0,
        y: 0,
        z: 0
      })),
      Raycaster: vi.fn().mockImplementation(() => ({
        setFromCamera: vi.fn(),
        intersectObjects: vi.fn().mockReturnValue([])
      })),
      
      // Math
      MathUtils: {
        randFloat: vi.fn().mockReturnValue(0.5),
        randInt: vi.fn().mockReturnValue(1),
        degToRad: vi.fn().mockImplementation((deg) => deg * Math.PI / 180)
      },
      
      // Color
      Color: vi.fn().mockImplementation(() => ({
        set: vi.fn().mockReturnThis(),
        r: 1,
        g: 1,
        b: 1
      })),
      
      // Scene
      Scene: vi.fn().mockImplementation(() => ({
        add: vi.fn(),
        remove: vi.fn(),
        children: []
      })),
      
      // Renderer
      WebGLRenderer: vi.fn().mockImplementation(() => ({
        setSize: vi.fn(),
        render: vi.fn(),
        setPixelRatio: vi.fn(),
        setClearColor: vi.fn(),
        domElement: document.createElement('canvas')
      }))
    };
  });
  
  // Mock React Three Fiber
  vi.mock('@react-three/fiber', () => ({
    Canvas: ({ children, ...props }) => (
      <div data-testid="r3f-canvas" {...props}>{children}</div>
    ),
    useThree: vi.fn().mockReturnValue({
      camera: { 
        position: { set: vi.fn(), x: 0, y: 0, z: 0 },
        lookAt: vi.fn()
      },
      scene: { 
        add: vi.fn(), 
        remove: vi.fn(), 
        children: [] 
      },
      gl: { 
        domElement: document.createElement('canvas'),
        render: vi.fn()
      },
      size: { width: 800, height: 600 }
    }),
    useFrame: vi.fn((callback) => callback({}, 0.016)),
    extend: vi.fn()
  }));
  
  // Mock React Three Drei
  vi.mock('@react-three/drei', () => ({
    OrbitControls: (props) => <div data-testid="orbit-controls" {...props} />,
    PerspectiveCamera: (props) => <div data-testid="perspective-camera" {...props} />,
    AmbientLight: (props) => <div data-testid="ambient-light" {...props} />,
    PointLight: (props) => <div data-testid="point-light" {...props} />,
    useTexture: vi.fn().mockReturnValue({}),
    Stats: (props) => <div data-testid="drei-stats" {...props} />,
    Html: ({ children, ...props }) => <div data-testid="drei-html" {...props}>{children}</div>,
    Box: (props) => <div data-testid="drei-box" {...props} />,
    Sphere: (props) => <div data-testid="drei-sphere" {...props} />,
    Line: (props) => <div data-testid="drei-line" {...props} />,
    Plane: (props) => <div data-testid="drei-plane" {...props} />
  }));