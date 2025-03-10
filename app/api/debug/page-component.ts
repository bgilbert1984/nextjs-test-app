// app/debug/page.tsx
import React from 'react';
import DebugPanel from '@/components/DebugPanel';

export const metadata = {
  title: 'Claude 3.7 Debug Panel',
  description: 'Debug Node.js, React, TypeScript and Vitest issues with Claude 3.7',
};

export default function DebugPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <DebugPanel />
    </main>
  );
}
