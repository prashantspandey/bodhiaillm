'use client';

import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import BodhiChat from './components/BodhiChat';

export default function Home() {
  const [showChat, setShowChat] = useState(false);
  
  return (
    <main>
      <LandingPage onChatOpen={() => setShowChat(true)} />
      
      {/* Chat Modal */}
      {showChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl">
            <div className="relative">
              <button
                onClick={() => setShowChat(false)}
                className="absolute -top-2 -right-2 bg-white text-gray-800 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-100 focus:outline-none z-10"
              >
                ✕
              </button>
              <BodhiChat />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}