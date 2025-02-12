import React from 'react';
import Hero from '@/components/hero';
import SlateEditor from '@/components/SlateEditor';
import MongoTest from '@/components/MongoTest';
import CaptivePortal from '../components/CaptivePortal';

const Page: React.FC = () => {
  return (
    <main>
      <Hero />
      <SlateEditor />
      <MongoTest />
      <CaptivePortal />
    </main>
  );
};

export default Page;