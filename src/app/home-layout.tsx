'use client';

import React, { useState } from 'react';
import LandingPage from '../app/components/LandingPage';
import BodhiChat from '../app/components/BodhiChat';
import Sidebar from '../app/components/Sidebar';
import { useTheme } from 'next-themes';

export default function Home() {
  const [showLanding, setShowLanding] = useState(true);
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  if (showLanding) {
    return <LandingPage onChatOpen={() => setShowLanding(false)} />;
  }

  return (
    <main className="flex h-screen overflow-hidden">
      <Sidebar 
        onNewChat={() => {}} 
        onThemeToggle={toggleTheme}
        theme={theme === 'dark' ? 'dark' : 'light'}
      />
      <BodhiChat />
    </main>
  );
}