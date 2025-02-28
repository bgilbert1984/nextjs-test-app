import { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import useWebSocket from "./useWebSocket";

const BrainPoints = () => {
  const data = useWebSocket("ws://0.0.0.0:8000/ws"); // Adjust WebSocket URL
  const ref = useRef();

  useFrame(() => {
    if (data.length && ref.current) {
      // Update point cloud positions dynamically
      ref.current.geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(data.flat(), 3)
      );
    }
  });

  return (
    <Points ref={ref}>
      <PointMaterial color="cyan" size={0.02} />
    </Points>
  );
};

export default function BrainVisualization() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
      <ambientLight />
      <BrainPoints />
    </Canvas>
  );
}
