// components/NeuralVisualization.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";

const WS_URL = "ws://100.99.242.6:8000/ws"; // USE THE TAILSCALE IP AND PORT 8000!

const Neuron = ({ position, intensity }: { position: [number, number, number]; intensity: number }) => {
  const meshRef = useRef<any>();
  useFrame(() => {
    if (meshRef.current) meshRef.current.material.emissiveIntensity = Math.max(0.2, intensity);
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.2, 32, 32]} />
      <meshStandardMaterial emissive="cyan" emissiveIntensity={intensity} />
    </mesh>
  );
};

const NeuralVisualization = () => {
  const [neurons, setNeurons] = useState<[number, number, number][]>([]);
  const [decodedSpeech, setDecodedSpeech] = useState("Waiting for data..."); //Initial value
  const [status, setStatus] = useState("Disconnected");
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);

  const connectWebSocket = () => {
    setStatus("Connecting...");
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      setStatus("Connected");
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      console.log("WebSocket connected"); // Add this for debugging
    };

     ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received data:", data); // Add this line
        setNeurons(data.fmri_data); //This is an array of arrays.
        // setDecodedSpeech(data.speech);  // Temporarily remove
      } catch (error) {
        console.error("WebSocket JSON parse error:", error);
      }
    };

    ws.onclose = () => {
      setStatus("Reconnecting...");
      reconnectTimer.current = setTimeout(connectWebSocket, 2000); // Retry in 2s
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      ws.close(); // Force reconnect on error
    };

    wsRef.current = ws;
  };

  useEffect(() => {
    connectWebSocket();
    return () => {
        if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
        wsRef.current?.close()
    };
  }, []);

  return (
    <div className="w-full h-screen">
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <OrbitControls />

         {/*Render a few test neurons initially*/}
        <Neuron key={0} position={[0, 0, 0]} intensity={0.5} />
        <Neuron key={1} position={[1, 1, 1]} intensity={0.8} />
        <Neuron key={2} position={[-1, -1, -1]} intensity={0.2} />

        <Html position={[0, 5, 0]}>
          <div className="bg-black text-white p-2 rounded-md shadow-lg">{decodedSpeech}</div>
          <div className={`mt-2 text-xs ${status === "Connected" ? "text-green-400" : "text-red-400"}`}>
            {status}
          </div>
        </Html>
      </Canvas>
    </div>
  );
};
export default NeuralVisualization;