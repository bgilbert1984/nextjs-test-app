// pages/index.tsx
import dynamic from 'next/dynamic';
import React, { useState, useEffect } from 'react';

// Use dynamic import with ssr: false for components using Three.js
const NeuralVisualization = dynamic(() => import('../components/NeuralVisualization'), {
  ssr: false,
});

interface NeuronData {
    position: number[];
    intensity: number;
}
interface AppState {
  neurons: NeuronData[];
  status: string;
}


const Home: React.FC = () => {
    const [appState, setAppState] = useState<AppState>({neurons: [], status: "Disconnected"});

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8000/ws');

        ws.onopen = () => {
            setAppState(prev => ({ ...prev, status: "Connected" }));
        };

        ws.onmessage = (event) => {
            const receivedData = JSON.parse(event.data);
            const newNeurons = receivedData.fmri_data.map((position: number[]) => ({
                position: position,
                intensity: Math.random(), // Example:  Random intensity
              }));
              setAppState(prev => ({ ...prev, neurons: newNeurons}));

        };

        ws.onclose = () => {
          setAppState(prev => ({ ...prev, status: "Disconnected" }));
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            setAppState(prev => ({ ...prev, status: "Error" }));
          ws.close();

        };


        return () => {
          ws.close();

        }
    }, []);


    return (
        <div>
            <NeuralVisualization neurons={appState.neurons} status={appState.status} />
        </div>
    );
};

export default Home;