'use client';

import React from 'react';
import { Brain, Sparkles, Zap, Youtube, Network, Cpu, Workflow, GitBranch, Scale,Menu } from 'lucide-react';

interface LandingPageProps {
    onChatOpen: () => void;
}

interface ReasoningCardProps {
    title: string;
    features: string[];
    highlighted?: boolean;
}

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
    return (
        <div className="bg-white p-6 rounded-lg hover:shadow-lg transition-shadow border border-gray-100">
            <div className="text-orange-500 mb-4">{icon}</div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </div>
    );
};

const ReasoningCard: React.FC<ReasoningCardProps> = ({ title, features, highlighted = false }) => {
    return (
        <div className={`p-6 rounded-lg shadow-lg ${highlighted ? 'bg-orange-500 text-white' : 'bg-white text-gray-600'}`}>
            <h3 className={`text-xl font-semibold mb-6 ${highlighted ? 'text-white' : 'text-gray-900'}`}>
                {title}
            </h3>
            <ul className="space-y-4">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                        <span className="mr-2">✓</span>
                        {feature}
                    </li>
                ))}
            </ul>
        </div>
    );
};

const LandingPage: React.FC<LandingPageProps> = ({ onChatOpen }) => {
    return (
        <div className="min-h-screen bg-white text-gray-900">
            {/* Navigation Bar */}
            <nav className="border-b border-gray-100 bg-white">
                <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <a href="/" className="text-2xl font-bold text-gray-900 flex items-center">
                                <span className="text-orange-500">Bodhi</span>AI
                            </a>
                        </div>
                        <div className="hidden md:flex items-center space-x-4">
                            <button className="text-gray-600 hover:text-orange-500 px-4 py-2 rounded-lg transition-colors">
                                Documentation
                            </button>
                            <button className="text-gray-600 hover:text-orange-500 px-4 py-2 rounded-lg transition-colors">
                                About
                            </button>
                            <button className="border border-orange-500 text-orange-500 hover:bg-orange-50 px-4 py-2 rounded-lg transition-colors">
                                Log In
                            </button>
                            <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors">
                                Sign Up
                            </button>
                        </div>
                        <button className="md:hidden text-gray-600 hover:text-orange-500 p-2">
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="container mx-auto px-6 py-20">
                <div className="text-center">
                    <div className="mb-6">
                        <span className="bg-orange-50 text-orange-500 px-4 py-1 rounded-full text-sm font-semibold">
                            World's Most Advanced Reasoning Model
                        </span>
                    </div>
                    <h1 className="text-6xl font-bold mb-6 text-gray-900">Bodhi AI</h1>
                    <p className="text-2xl text-gray-600 mb-4 max-w-3xl mx-auto">
                        Setting New Global Standards in AI Reasoning
                    </p>
                    <p className="text-lg text-orange-500 mb-8">Made with ❤️ in Jaipur, India</p>
                    <div className="flex justify-center items-center space-x-8 mb-12">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-gray-900">Unmatched</div>
                            <div className="text-gray-600">Reasoning Depth</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-gray-900">132K</div>
                            <div className="text-gray-600">Context Window</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-gray-900">Global</div>
                            <div className="text-gray-600">#1 in Benchmarks</div>
                        </div>
                    </div>
                    <div className="flex justify-center gap-4">
                    <button 
    onClick={onChatOpen}
    className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
>
    Experience Superior Reasoning
</button>
                        <button className="border border-orange-500 hover:bg-orange-50 text-orange-500 font-bold py-3 px-8 rounded-lg text-lg transition-colors">
                            View Documentation
                        </button>
                    </div>
                </div>
            </header>

            {/* Global Leadership Section */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center mb-4">Global Leadership in AI Reasoning</h2>
                    <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
                        Surpassing every benchmark and setting new standards in AI reasoning capabilities
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <ReasoningCard 
                            title="Unmatched Reasoning"
                            features={[
                                "Superior problem decomposition",
                                "Advanced hypothesis testing",
                                "Multi-step logical analysis",
                                "Dynamic reasoning paths"
                            ]}
                        />
                        <ReasoningCard 
                            title="Global Innovation"
                            features={[
                                "Beyond O3 capabilities",
                                "Surpassing DeepSeek R1",
                                "Revolutionary architecture",
                                "Breakthrough performance"
                            ]}
                        />
                        <ReasoningCard 
                            title="Unique Capabilities"
                            features={[
                                "Video content analysis",
                                "Multimodal reasoning",
                                "Extended context processing",
                                "Advanced code synthesis"
                            ]}
                            highlighted={true}
                        />
                    </div>
                </div>
            </section>

            {/* Core Capabilities */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center mb-4">World-Leading Capabilities</h2>
                    <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
                        Setting global standards in AI reasoning and problem-solving
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard 
                            icon={<Brain className="w-8 h-8" />}
                            title="Superior Reasoning"
                            description="Unmatched problem-solving capabilities exceeding all current models"
                        />
                        <FeatureCard 
                            icon={<GitBranch className="w-8 h-8" />}
                            title="Advanced Code Generation"
                            description="State-of-the-art code synthesis with deep architectural understanding"
                        />
                        <FeatureCard 
                            icon={<Youtube className="w-8 h-8" />}
                            title="Video Analysis"
                            description="Revolutionary capability to reason about video content"
                        />
                        <FeatureCard 
                            icon={<Workflow className="w-8 h-8" />}
                            title="Strategic Planning"
                            description="Unparalleled multi-step planning and optimization"
                        />
                        <FeatureCard 
                            icon={<Scale className="w-8 h-8" />}
                            title="Adaptive Intelligence"
                            description="Dynamic reasoning depth adjustments for optimal results"
                        />
                        <FeatureCard 
                            icon={<Network className="w-8 h-8" />}
                            title="Transparent Thinking"
                            description="Clear chain-of-thought processes for complete understanding"
                        />
                    </div>
                </div>
            </section>

            {/* Performance Comparison */}
            <section className="py-20 bg-orange-50">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl font-bold mb-8 text-gray-900">Setting Global Standards</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h3 className="text-xl font-bold mb-4 text-gray-900">Beyond Current Leaders</h3>
                            <ul className="text-left space-y-3 text-gray-600">
                                <li className="flex items-center">
                                    <Sparkles className="w-5 h-5 mr-2 text-orange-500" />
                                    Surpassing O3 in Reasoning Depth
                                </li>
                                <li className="flex items-center">
                                    <Sparkles className="w-5 h-5 mr-2 text-orange-500" />
                                    Exceeding DeepSeek R1 Performance
                                </li>
                                <li className="flex items-center">
                                    <Sparkles className="w-5 h-5 mr-2 text-orange-500" />
                                    Leading in Global Benchmarks
                                </li>
                            </ul>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h3 className="text-xl font-bold mb-4 text-gray-900">Revolutionary Features</h3>
                            <ul className="text-left space-y-3 text-gray-600">
                                <li className="flex items-center">
                                    <Zap className="w-5 h-5 mr-2 text-orange-500" />
                                    First-Ever Video Reasoning
                                </li>
                                <li className="flex items-center">
                                    <Zap className="w-5 h-5 mr-2 text-orange-500" />
                                    Superior Multimodal Analysis
                                </li>
                                <li className="flex items-center">
                                    <Zap className="w-5 h-5 mr-2 text-orange-500" />
                                    Breakthrough Context Processing
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl font-bold mb-6 text-gray-900">Experience the Future of AI Reasoning</h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-600">
                        Join global leaders using the world's most advanced reasoning model
                    </p>
                    <button 
    onClick={onChatOpen}
    className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
>
    Get Started
</button>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white py-8 border-t border-gray-100">
                <div className="container mx-auto px-6 text-center">
                    <p className="text-lg text-orange-500 mb-2">Made with ❤️ in Jaipur, India 🇮🇳</p>
                    <p className="text-gray-600">© 2025 Bodhi AI. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;