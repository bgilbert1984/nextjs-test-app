// /home/ashben/www/html/tipics/nextjs-test-app/app/page.tsx
import React from 'react';
import Link from 'next/link';
import Hero from '@/components/hero';
import SlateEditor from '@/components/SlateEditor';
import CrateTest from '@/components/CrateTest';
import CaptivePortal from '@/components/CaptivePortal'; // Use alias.
import WebSocketClient from '@/components/WebSocketClient'; // Direct connection
import dynamic from 'next/dynamic';

const NeuralVisualization = dynamic(() => import('@/components/NeuralVisualization'), { ssr: false });


const Page: React.FC = () => {
  return (
    <main>
      <Hero />
      <nav>
        <Link href="/network-visualization">
          View Network Visualization
        </Link>
        <Link href="/api/hello">
          Run Python Script
        </Link>
      </nav>
      <SlateEditor />
      <CrateTest />
      <CaptivePortal />
      <div>
        <h1>WebSocket Example (Direct)</h1>
        <WebSocketClient />
      </div>
      <div>
          <h1>Real-Time Brain Visualization</h1>
          <NeuralVisualization />
      </div>
    </main>
  );
};

export default Page;