// components/Sidebar.tsx
'use client';

import React from 'react';
import { Bot, Settings, MessageSquarePlus, Youtube } from 'lucide-react';

interface SidebarProps {
    onNewChat: () => void;
    onThemeToggle: () => void;
    theme: 'light' | 'dark';
}

const Sidebar: React.FC<SidebarProps> = ({ onNewChat, onThemeToggle, theme }) => {
    return (
        <div className="w-64 bg-white border-r h-screen p-4 flex flex-col">
            <div className="flex items-center gap-2 mb-6">
                <Bot className="w-6 h-6 text-orange-500" />
                <h1 className="text-xl font-semibold">Bodhi AI Chat</h1>
            </div>

            {/* New Chat Button */}
            <button 
                onClick={onNewChat}
                className="flex items-center gap-2 w-full p-3 mb-4 rounded-lg text-left hover:bg-gray-100 transition-colors"
            >
                <MessageSquarePlus className="w-5 h-5" />
                New Chat
            </button>

            {/* Theme Toggle */}
            <div className="flex items-center justify-between p-3 mb-4 rounded-lg hover:bg-gray-100">
                <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Theme
                </div>
                <button 
                    onClick={onThemeToggle}
                    className="text-sm bg-gray-200 px-3 py-1 rounded-full"
                >
                    {theme === 'light' ? '🌙' : '☀️'}
                </button>
            </div>

            {/* Features Section */}
            <div className="mb-4">
                <h2 className="text-sm font-semibold text-gray-500 mb-2 px-3">FEATURES</h2>
                <button className="flex items-center gap-2 w-full p-3 rounded-lg text-left hover:bg-gray-100 transition-colors">
                    <Youtube className="w-5 h-5" />
                    YouTube
                </button>
            </div>

            {/* Recent Chats Section */}
            <div className="flex-1">
                <h2 className="text-sm font-semibold text-gray-500 mb-2 px-3">RECENT CHATS</h2>
                <div className="space-y-1">
                    {/* Add recent chats here */}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;