// components/NetworkVisualization.tsx
import React, { useEffect, useState, useRef } from 'react';

interface NetworkNode {
  id: string;
  x: number;
  y: number;
  z: number;
  intensity: number;
}

const NetworkVisualization: React.FC = () => {
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Function to initialize WebSocket connection
  const connectWebSocket = () => {
    try {
      // Close existing connection if any
      if (wsRef.current) {
        wsRef.current.close();
      }

      // Create new WebSocket connection
      const ws = new WebSocket('ws://localhost:8080');
      wsRef.current = ws;

      // WebSocket event handlers
      ws.onopen = () => {
        console.log('WebSocket connection established');
        setIsConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setNodes(data);
        } catch (err: any) {
          console.error('Error parsing WebSocket data:', err);
          setError(`Error parsing data: ${err.message}`);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed');
        setIsConnected(false);
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        setError('WebSocket connection error');
        setIsConnected(false);
      };
    } catch (err: any) {
      console.error('Error setting up WebSocket:', err);
      setError(`Error setting up WebSocket: ${err.message}`);
      setIsConnected(false);
    }
  };

  // Connect on component mount
  useEffect(() => {
    // No auto-connect to avoid test issues
    return () => {
      // Clean up WebSocket connection on unmount
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
      
      {nodes.length > 0 && (
        <div>
          <h3>Network Nodes ({nodes.length})</h3>
          <ul>
            {nodes.slice(0, 5).map((node, index) => (
              <li key={node.id || index}>
                Node {index + 1}: x={node.x.toFixed(2)}, y={node.y.toFixed(2)}, z={node.z.toFixed(2)}, intensity={node.intensity.toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NetworkVisualization;
