'use client';

import React, { useState } from 'react';
import BodhiChat from '../components/BodhiChat';
import Sidebar from '../components/Sidebar';

export default function ChatPage() {
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');

    const handleNewChat = () => {
        // Handle new chat creation
        console.log('New chat');
    };

    const handleThemeToggle = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <div className="flex h-screen">
            <Sidebar 
                onNewChat={handleNewChat}
                onThemeToggle={handleThemeToggle}
                theme={theme}
            />
            <main className="flex-1 bg-gradient-to-b from-orange-50 to-white">
                <div className="h-screen">
                    <BodhiChat />
                </div>
            </main>
        </div>
    );
}