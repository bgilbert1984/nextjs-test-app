const THREE = {
    Scene: jest.fn().mockImplementation(() => ({
      add: jest.fn(),
      remove: jest.fn(),
    })),
    PerspectiveCamera: jest.fn().mockImplementation(() => ({
      position: { set: jest.fn() },
      lookAt: jest.fn(),
    })),
    WebGLRenderer: jest.fn().mockImplementation(() => ({
      setSize: jest.fn(),
      domElement: document.createElement('canvas'),
    })),
    AmbientLight: jest.fn(),
    DirectionalLight: jest.fn(),
    SphereGeometry: jest.fn(),
    BoxGeometry: jest.fn(),
    MeshLambertMaterial: jest.fn(),
    MeshBasicMaterial: jest.fn(),
    LineBasicMaterial: jest.fn(),
    Mesh: jest.fn().mockImplementation(() => ({
      position: { set: jest.fn(), copy: jest.fn() },
    })),
    Line: jest.fn(),
    BufferGeometry: jest.fn(),
    Vector3: jest.fn().mockImplementation(() => ({
      set: jest.fn(),
      lerpVectors: jest.fn(),
      copy: jest.fn(),
    })),
    Box3: jest.fn().mockImplementation(() => ({
      setFromObject: jest.fn().mockReturnThis(),
      intersectsBox: jest.fn().mockReturnValue(false),
    })),
  };
  
  module.exports = THREE;
  