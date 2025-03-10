// components/NeuralVisualization.tsx
"use client";
import { useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { 
  OrbitControls, 
  Html, 
  AmbientLight, 
  PointLight, 
  SphereGeometry, 
  MeshStandardMaterial 
} from "@react-three/drei";

interface NeuronData {
  position: [number, number, number];
  intensity: number;
}

interface NeuralVisualizationProps {
  neurons?: NeuronData[];
  status?: string;
}

const Neuron = ({ position, intensity }: NeuronData) => {
  const meshRef = useRef<any>();
  useFrame(() => {
    if(meshRef.current) meshRef.current.material.emissiveIntensity = Math.max(0.2, intensity);
  });
  return (
    <mesh ref={meshRef} position={position}>
      <SphereGeometry args={[0.2, 32, 32]} />
      <MeshStandardMaterial emissive="cyan" emissiveIntensity={intensity} />
    </mesh>
  );
};

const NeuralVisualization = ({ neurons = [], status = "Initializing..." }: NeuralVisualizationProps) => {
  const controlsRef = useRef(null);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <p>Status: {status}</p>
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <AmbientLight intensity={0.5} />
        <PointLight position={[10, 10, 10]} />
        {neurons.map((neuron, i) => (
          <Neuron key={i} position={neuron.position} intensity={neuron.intensity} />
        ))}
        <OrbitControls ref={controlsRef} />
        <Html position={[0, 5, 0]}>
          <div>Neural Activity Visualization</div>
        </Html>
      </Canvas>
    </div>
  );
};

export default NeuralVisualization;