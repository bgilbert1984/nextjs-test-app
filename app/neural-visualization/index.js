import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';

export default function Home() {
  const [voxels, setVoxels] = useState([]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3000/api/stream');
    ws.onmessage = (event) => setVoxels(JSON.parse(event.data));
    return () => ws.close();
  }, []);

  return (
    <Canvas camera={{ position: [0, 0, 100], fov: 60 }}>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      {voxels.map((v, i) => (
        <Sphere key={i} args={[0.5, 16, 16]} position={[v.x, v.y, v.z]}>
          <meshStandardMaterial color={`rgb(${v.intensity * 255}, 0, 255)`} />
        </Sphere>
      ))}
    </Canvas>
  );
}
