// components/Sidebar.tsx
'use client';

import React, { useState } from 'react';
import { Bot, Settings, MessageSquarePlus, Youtube, Menu, X } from 'lucide-react';

interface SidebarProps {
    onNewChat: () => void;
    onThemeToggle: () => void;
    theme: 'light' | 'dark';
}

const Sidebar: React.FC<SidebarProps> = ({ onNewChat, onThemeToggle, theme }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => setIsOpen(!isOpen);

    return (
        <>
            {/* Mobile Menu Button - Always visible on mobile */}
            <button
                onClick={toggleSidebar}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-background border border-border"
            >
                {isOpen ? (
                    <X className="w-6 h-6 text-foreground" />
                ) : (
                    <Menu className="w-6 h-6 text-foreground" />
                )}
            </button>

            {/* Overlay - Only on mobile when sidebar is open */}
            {isOpen && (
                <div 
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed top-0 left-0 z-40 h-screen
                w-64 bg-background border-r border-border
                transition-transform duration-300 ease-in-out
                lg:translate-x-0 lg:static
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="h-full p-4 flex flex-col">
                    {/* Logo and Title */}
                    <div className="flex items-center gap-2 mb-6 mt-2">
                        <Bot className="w-6 h-6 text-orange-500" />
                        <h1 className="text-xl font-semibold text-foreground">Bodhi AI Chat</h1>
                    </div>
                    
                    {/* New Chat Button */}
                    <button 
                        onClick={() => {
                            onNewChat();
                            setIsOpen(false);
                        }}
                        className="flex items-center gap-2 w-full p-3 mb-4 rounded-lg text-left hover:bg-accent hover:text-accent-foreground transition-colors text-foreground"
                    >
                        <MessageSquarePlus className="w-5 h-5" />
                        New Chat
                    </button>
                    
                    {/* Theme Toggle */}
                    <div className="flex items-center justify-between p-3 mb-4 rounded-lg hover:bg-accent hover:text-accent-foreground">
                        <div className="flex items-center gap-2 text-foreground">
                            <Settings className="w-5 h-5" />
                            Theme
                        </div>
                        <button 
                            onClick={onThemeToggle}
                            className="text-sm bg-secondary text-secondary-foreground px-3 py-1 rounded-full"
                        >
                            {theme === 'light' ? '🌙' : '☀️'}
                        </button>
                    </div>
                    
                    {/* Features Section */}
                    <div className="mb-4">
                        <h2 className="text-sm font-semibold text-muted-foreground mb-2 px-3">FEATURES</h2>
                        <button 
                            className="flex items-center gap-2 w-full p-3 rounded-lg text-left hover:bg-accent hover:text-accent-foreground transition-colors text-foreground"
                            onClick={() => setIsOpen(false)}
                        >
                            <Youtube className="w-5 h-5" />
                            YouTube
                        </button>
                    </div>
                    
                    {/* Recent Chats Section */}
                    <div className="flex-1 overflow-y-auto">
                        <h2 className="text-sm font-semibold text-muted-foreground mb-2 px-3">RECENT CHATS</h2>
                        <div className="space-y-1">
                            {/* Add recent chats here */}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;