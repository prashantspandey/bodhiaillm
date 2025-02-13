'use client';

import React from 'react';
import LandingPage from './components/LandingPage';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  
  return (
    <main>
      <LandingPage onChatOpen={() => router.push('/chat')} />
    </main>
  );
}