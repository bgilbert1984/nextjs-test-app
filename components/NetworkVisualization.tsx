// NetworkVisualization.tsx

"use client";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import * as dat from "dat.gui";
import { Client } from 'pg';

interface DataItem {
  id: number;
  name: string;
  created_at: string;
}

interface Unit {
  mesh: THREE.Mesh;
  startNodeIndex: number;
  endNodeIndex: number;
  progress: number;
  speed: number;
  connection: THREE.Line;
}

const NetworkVisualization = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const connectWebSocket = () => {
    try {
      if (wsRef.current) {
        wsRef.current.close();
      }

      const ws = new WebSocket('ws://localhost:8080');
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // Handle data updates here
        } catch (err: any) {
          setError(`Error parsing data: ${err.message}`);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
      };

      ws.onerror = () => {
        setError('WebSocket connection error');
        setIsConnected(false);
      };
    } catch (err: any) {
      setError(`Error setting up WebSocket: ${err.message}`);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return (
    <div>
      <div>NetworkVisualization Component</div>
      <button onClick={connectWebSocket}>Launch Unit</button>
      {isConnected && <div>Connected to WebSocket server</div>}
      {error && <div>Error: {error}</div>}
    </div>
  );
};

export default NetworkVisualization;