import React from 'react';
import Link from 'next/link';
import Hero from '../components/hero';
import SlateEditor from '../components/SlateEditor';
import CrateTest from '../components/CrateTest';
import CaptivePortal from '../components/CaptivePortal';
import WebSocketClient from '../components/WebSocketClient';
import dynamic from 'next/dynamic';

// Use dynamic import with SSR disabled for components that use browser-only APIs
const NeuralVisualization = dynamic(
  () => import('../components/NeuralVisualization'), 
  { ssr: false }
);

const NetworkVisualization = dynamic(
  () => import('../components/NetworkVisualization'),
  { ssr: false }
);

const Page: React.FC = () => {
  return (
    <main className="container mx-auto px-4">
      <Hero />
      
      <nav className="my-6 flex gap-4">
        <Link href="/network-visualization" className="px-4 py-2 bg-blue-500 text-white rounded">
          View Network Visualization
        </Link>
        <Link href="/api/hello" className="px-4 py-2 bg-green-500 text-white rounded">
          Run Python Script
        </Link>
      </nav>
      
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Slate Editor</h2>
        <SlateEditor />
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">CrateDB Integration</h2>
        <CrateTest />
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Captive Portal</h2>
        <CaptivePortal />
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">WebSocket Example (Direct)</h2>
        <WebSocketClient />
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Real-Time Brain Visualization</h2>
        <NeuralVisualization />
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Network Visualization</h2>
        <NetworkVisualization />
      </section>
    </main>
  );
};

export default Page;