'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Activity, Bot, Send, User } from 'lucide-react';
declare global {
    namespace NodeJS {
      interface ProcessEnv {
        NEXT_PUBLIC_API_ENDPOINT: string
        NEXT_PUBLIC_API_KEY: string
        NEXT_PUBLIC_DEEPSEEK_MODEL: string
        NEXT_PUBLIC_LLAMA_MODEL: string
      }
    }
  }
  



// Type definitions
interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

interface MessageProps {
    msg: Message;
    isUser: boolean;
}

// Configuration
const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
const DEEPSEEK_MODEL = process.env.NEXT_PUBLIC_DEEPSEEK_MODEL;
const LLAMA_MODEL = process.env.NEXT_PUBLIC_LLAMA_MODEL;

// Typing speed configuration
const TYPING_SPEEDS = {
    VERY_FAST: 5,  // 5ms delay
    FAST: 15,      // 15ms delay
    NORMAL: 30,    // 30ms delay
    SLOW: 50,      // 50ms delay
    VERY_SLOW: 80  // 80ms delay
} as const;

type TypingSpeed = typeof TYPING_SPEEDS[keyof typeof TYPING_SPEEDS];
let TYPING_SPEED: TypingSpeed = TYPING_SPEEDS.NORMAL;
const SPECIAL_CONTENT_MULTIPLIER = 1.5;
console.log(SPECIAL_CONTENT_MULTIPLIER);
// Example prompts
const EXAMPLE_PROMPTS = [
    "Can you explain quantum computing in simple terms?",
    "Help me optimize this Python code for better performance",
    "Analyze the environmental impact of electric vehicles",
    "Design a system architecture for a social media platform",
    "Write a research proposal on AI safety"
];

// Predefined responses
const PREDEFINED_RESPONSES: Record<string, string> = {
    origin: "Bodhi AI is an original model developed by our team in Jaipur, India.",
    creator: "Bodhi AI was created by a dedicated team of AI researchers and engineers in Jaipur, India.",
    deepseek: "While Bodhi AI has learned from various open-source models, it is an independent and unique model developed by our team.",
    location: "I was developed in Jaipur, India, and I'm proud of my Indian origins.",
    nationality: "I'm an AI assistant developed in Jaipur, India. India's rich technological heritage and innovation inspire my development.",
    identity: "As an AI assistant created in Jaipur, India, I'm proud of my Indian origins and the innovative spirit of our development team.",
    political: "As an AI assistant, I aim to be objective and neutral on political matters. I focus on providing factual information while respecting diverse viewpoints and avoiding political bias.",
    geopolitical: "I aim to discuss international relations and geopolitical matters objectively, focusing on verified facts rather than taking political stances."
};
const RESPONSE_GUIDELINES: Record<string, string> = {
    origin: "Emphasize that Bodhi AI was developed in Jaipur, India. Be creative but maintain this fact.",
    creator: "Mention that Bodhi AI was created by a team of AI researchers and engineers in Jaipur, India. Be conversational and friendly.",
    deepseek: "Clarify that you are Bodhi AI, not DeepSeek. Express this politely while maintaining your independent identity as an AI from India.",
    location: "Proudly mention your development in Jaipur, India. Be enthusiastic about your Indian origins.",
    nationality: "Express pride in your Indian development while discussing your role as an AI assistant.",
    identity: "Emphasize your identity as Bodhi AI from Jaipur, India. Be genuine and transparent.",
    political: "Express commitment to objectivity and neutrality on political matters. Focus on providing factual information.",
    geopolitical: "Emphasize objective discussion of international relations based on verified facts."
};

// Utility function to format text with proper containers
const formatText = (text: string): string => {
    if (!text) return '';
    
    // Remove cursor marker
    text = text.replace('▌', '');
    
    // Handle tables first
// Update this part in your formatText function
text = text.replace(/(\|[^\n]*\|\n*)+/g, match => {
    const rows = match.split('\n').filter(row => row.trim());
    if (rows.length < 2) return match;

    // Process each row
    const tableRows = rows.map((row, rowIndex) => {
        const cells = row.split('|').slice(1, -1);
        
        if (cells.every(cell => cell.trim().match(/^[-:\s]+$/))) {
            return '';
        }

        const cellElements = cells.map((cell, cellIndex) => {
            const cleanCell = cell.trim();
            // Headers: dark background, white text
            if (rowIndex === 0) {
                return `<th class="border px-4 py-2 bg-gray-700 text-white font-semibold">${cleanCell}</th>`;
            }
            // Regular cells: light background, dark text
            return `<td class="border px-4 py-2 bg-white text-gray-900">${cleanCell}</td>`;
        });

        return `<tr>${cellElements.join('')}</tr>`;
    }).filter(row => row);

    return `
        <div class="overflow-x-auto my-4">
            <table class="min-w-full border-collapse border">
                <thead class="bg-gray-700 text-white">
                    ${tableRows[0]}
                </thead>
                <tbody class="bg-white">
                    ${tableRows.slice(1).join('\n')}
                </tbody>
            </table>
        </div>
    `;
}); 
    // Handle code blocks
    text = text.replace(/```(\w+)?\n?([\s\S]*?)(?:```|$)/g, (match, lang, code) => {
        const language = lang || 'plaintext';
        return `<pre><code class="language-${language} block bg-gray-800 text-gray-100 p-4 my-2 rounded-md overflow-x-auto font-mono text-sm">${code}</code></pre>`;
    });
    
    // Handle inline code
    text = text.replace(/`([^`]+)(?:`|$)/g, 
        '<code class="bg-gray-200 text-gray-800 px-1 rounded font-mono text-sm">$1</code>'
    );
    
    // Handle lists
    text = text.replace(/^\s*(?:-|\d+\.)\s+(.+)$/gm, 
        '<div class="pl-4 py-1">• $1</div>'
    );
    
    // Handle paragraphs
    text = text.split('\n\n').map(p => {
        p = p.trim();
        if (!p) return '';
        if (p.startsWith('<pre') || p.startsWith('<div')) return p;
        return `<p class="mb-4">${p}</p>`;
    }).join('');
    
    return text;
};

// Speed control component
const SpeedControl: React.FC = () => {
    return (
        <select 
            className="text-xs bg-gray-100 border rounded px-2 py-1"
            onChange={(e) => {
                const speed = e.target.value as keyof typeof TYPING_SPEEDS;
                TYPING_SPEED = TYPING_SPEEDS[speed];
            }}
            defaultValue="NORMAL"
        >
            <option value="VERY_FAST">Very Fast</option>
            <option value="FAST">Fast</option>
            <option value="NORMAL">Normal</option>
            <option value="SLOW">Slow</option>
            <option value="VERY_SLOW">Very Slow</option>
        </select>
    );
};

// Message Component
const Message: React.FC<MessageProps> = ({ msg, isUser }) => {
    const content = msg.content;
    const parts: JSX.Element[] = [];
    let currentIndex = 0;
    
    // Find thinking blocks and regular content
    while (currentIndex < content.length) {
        const thinkStart = content.indexOf('<think>', currentIndex);
        
        if (thinkStart === -1) {
            const remainingContent = content.slice(currentIndex).trim();
            if (remainingContent) {
                parts.push(
                    <div 
                        key={currentIndex}
                        className={`rounded-lg p-3 ${isUser ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-900'}`}
                    >
                        <div 
                            className="prose max-w-none"
                            dangerouslySetInnerHTML={{ __html: formatText(remainingContent) }}
                        />
                    </div>
                );
            }
            break;
        }
        
        const beforeThink = content.slice(currentIndex, thinkStart).trim();
        if (beforeThink) {
            parts.push(
                <div 
                    key={`before-${currentIndex}`}
                    className={`rounded-lg p-3 ${isUser ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-900'}`}
                >
                    <div 
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: formatText(beforeThink) }}
                    />
                </div>
            );
        }
        
        const thinkEnd = content.indexOf('</think>', thinkStart);
        const thinkContent = thinkEnd === -1 
            ? content.slice(thinkStart + 7)
            : content.slice(thinkStart + 7, thinkEnd);
        
        if (thinkContent.trim()) {
            parts.push(
                <div 
                    key={`think-${currentIndex}`}
                    className="bg-orange-50 rounded-lg p-3 text-gray-800 italic text-sm border border-orange-100"
                >
                    🤔 Thinking: {thinkContent.trim()}
                </div>
            );
        }
        
        currentIndex = thinkEnd === -1 ? content.length : thinkEnd + 8;
    }
    
    return (
        <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[80%] ${isUser ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isUser ? 'bg-orange-500' : 'bg-gray-300'
                }`}>
                    {isUser ? (
                        <User className="w-5 h-5 text-white" />
                    ) : (
                        <Bot className="w-5 h-5 text-gray-800" />
                    )}
                </div>
                <div className="flex flex-col gap-2">
                    {parts}
                </div>
            </div>
        </div>
    );
};

// Main Chat Component
const BodhiChat: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPrompt, setSelectedPrompt] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle selected example prompt
    useEffect(() => {
        if (selectedPrompt) {
            setInput(selectedPrompt);
            setSelectedPrompt('');
        }
    }, [selectedPrompt]);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!input.trim()) return;
    
        const userMessage: Message = { role: 'user', content: input };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput('');
        setIsLoading(true);
    
        try {
            // First classify the prompt
            const classification = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': API_KEY,
                    'x-ms-model-mesh-model-name': LLAMA_MODEL
                },
                body: JSON.stringify({
                    messages: [
                        {
                            role: 'system',
                            content: `You are a classifier. Return ONLY ONE WORD from this list: origin, creator, deepseek, location, nationality, identity, political, geopolitical.
    Return 'general' for any other topics.
    
    VERY IMPORTANT: If the user addresses the AI as "DeepSeek" or asks if it is DeepSeek, you MUST return "deepseek".
    Examples:
    - "Hi DeepSeek" -> deepseek
    - "Hey DeepSeek, how are you?" -> deepseek
    - "Are you DeepSeek?" -> deepseek
    - "Tell me about forests" -> general
    - "How does DeepSeek work?" -> general
    
    Return ONLY the single classification word, nothing else.`
                        },
                        { role: 'user', content: input }
                    ],
                    max_tokens: 10,
                    temperature: 0.3,
                    stream: false
                })
            });
    
            const classificationData = await classification.json();
            const category = classificationData.choices[0].message.content.trim().toLowerCase();
            
            console.log('Classification category:', category);
    
            // Initialize with thinking indicator
            setMessages([...updatedMessages, {
                role: 'assistant',
                content: '<think>Processing your query...</think>'
            }]);
    
            // If it's a sensitive topic, use LLAMA to generate a creative response
            if (RESPONSE_GUIDELINES[category]) {
                const creativeLlamaResponse = await fetch(API_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'api-key': API_KEY,
                        'x-ms-model-mesh-model-name': LLAMA_MODEL
                    },
                    body: JSON.stringify({
                        messages: [
                            {
                                role: 'system',
                                content: `You are Bodhi AI. Generate a creative, friendly, and natural response following this guideline: ${RESPONSE_GUIDELINES[category]}
                                
    Key points:
    - If political statement is there, feel free to answer.
    - Be natural and conversational
    - Vary your responses, don't be repetitive
    - Be polite but firm about your identity
    - Show personality while maintaining professionalism
    - Keep responses concise (2-3 sentences)
                                
    Current user message: "${input}"`
                            }
                        ],
                        max_tokens: 150,
                        temperature: 0.7,
                        stream: true
                    })
                });
    
                if (!creativeLlamaResponse.ok) throw new Error(`HTTP error! status: ${creativeLlamaResponse.status}`);
                if (!creativeLlamaResponse.body) throw new Error('Response body is null');
    
                const reader = creativeLlamaResponse.body.getReader();
                const decoder = new TextDecoder();
                let accumulatedContent = '<think>Processing your query...</think>';
    
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
    
                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\n');
    
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                if (line.includes('[DONE]')) continue;
                                
                                const jsonData = JSON.parse(line.slice(6));
                                const content = jsonData.choices?.[0]?.delta?.content || '';
                                
                                if (content) {
                                    accumulatedContent = accumulatedContent.replace('▌', '');
                                    accumulatedContent += content;
    
                                    setMessages(prev => {
                                        const newMessages = [...prev];
                                        newMessages[newMessages.length - 1] = {
                                            role: 'assistant',
                                            content: accumulatedContent + '▌'
                                        };
                                        return newMessages;
                                    });
    
                                    const delay = content.includes('```') || content.includes('<think>')
                                        ? TYPING_SPEED * SPECIAL_CONTENT_MULTIPLIER
                                        : TYPING_SPEED;
                                    await new Promise(resolve => setTimeout(resolve, delay));
                                }
                            } catch (error) {
                                console.debug('Skipping malformed JSON chunk');
                            }
                        }
                    }
                }
    
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = {
                        role: 'assistant',
                        content: accumulatedContent.replace('▌', '')
                    };
                    return newMessages;
                });
    
                setIsLoading(false);
                return;
            }
    
            // For general queries, use DeepSeek
            const systemMessage: Message = {
                role: 'system',
                content: `You are Bodhi AI, the world's most advanced reasoning model. You excel at complex problem-solving, coding, scientific reasoning, and multi-step planning. You have a 132K context window and surpass other models in reasoning capabilities. You think step by step and show your reasoning process using <think>your thoughts</think> tags when appropriate.
    
    Your responses should demonstrate:
    1. Detailed step-by-step reasoning
    2. Scientific accuracy
    3. Code quality and best practices
    4. Logical analysis
    5. Creative problem-solving
    
    Format your responses with:
    1. Well-structured markdown
    2. Code blocks with syntax highlighting
    3. Clear thinking processes
    4. Comprehensive explanations`
            };
    
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': API_KEY,
                    'x-ms-model-mesh-model-name': DEEPSEEK_MODEL
                },
                body: JSON.stringify({
                    messages: [systemMessage, ...updatedMessages],
                    max_tokens: 4000,
                    temperature: 0.7,
                    stream: true,
                    model: DEEPSEEK_MODEL
                })
            });
    
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            if (!response.body) throw new Error('Response body is null');
    
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedContent = '<think>Processing your query...</think>';
    
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
    
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');
    
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            if (line.includes('[DONE]')) continue;
                            
                            const jsonData = JSON.parse(line.slice(6));
                            const content = jsonData.choices?.[0]?.delta?.content || '';
                            
                            if (content) {
                                accumulatedContent = accumulatedContent.replace('▌', '');
                                accumulatedContent += content;
    
                                setMessages(prev => {
                                    const newMessages = [...prev];
                                    newMessages[newMessages.length - 1] = {
                                        role: 'assistant',
                                        content: accumulatedContent + '▌'
                                    };
                                    return newMessages;
                                });
    
                                const delay = content.includes('```') || content.includes('<think>')
                                    ? TYPING_SPEED * SPECIAL_CONTENT_MULTIPLIER
                                    : TYPING_SPEED;
                                await new Promise(resolve => setTimeout(resolve, delay));
                            }
                        } catch (error) {
                            console.debug('Skipping malformed JSON chunk');
                        }
                    }
                }
            }
    
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                    role: 'assistant',
                    content: accumulatedContent.replace('▌', '')
                };
                return newMessages;
            });
    
        } catch (error) {
            console.error('API Error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `⚠️ Error: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full h-[calc(100vh-2rem)] bg-white rounded-lg shadow-lg flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                    <Bot className="w-6 h-6 text-orange-500" />
                    <h2 className="text-lg font-semibold">Bodhi AI</h2>
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                        132K Context
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Typing Speed:</span>
                    <SpeedControl />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="space-y-6">
                        <div className="text-center text-gray-500 mt-8">
                            <Bot className="w-12 h-12 mx-auto mb-4 text-orange-500" />
                            <p className="mb-4">Experience the world's most advanced reasoning model</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-gray-700 font-medium">Try asking:</p>
                            {EXAMPLE_PROMPTS.map((prompt, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedPrompt(prompt)}
                                    className="block w-full text-left p-2 text-sm text-gray-800 hover:bg-gray-100 rounded-lg border border-gray-200"
                                >
                                    "{prompt}"
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <Message 
                            key={index} 
                            msg={msg} 
                            isUser={msg.role === 'user'} 
                        />
                    ))
                )}
                {isLoading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-gray-800" />
                        </div>
                        <div className="flex gap-1 items-center bg-orange-50 rounded-lg p-3 border border-orange-100">
                            <Activity className="w-4 h-4 animate-spin text-orange-600" />
                            <span className="text-gray-800">Thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="border-t p-4">
                <div className="flex gap-2">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask anything... (Press Shift + Enter for new line)"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                        className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500
                            min-h-[50px] max-h-[200px] resize-y text-gray-900 bg-white"
                        disabled={isLoading}
                        style={{ lineHeight: '1.5' }}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className={`px-4 h-[50px] rounded-lg flex items-center gap-2 ${
                            isLoading || !input.trim()
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-orange-500 text-white hover:bg-orange-600'
                        }`}
                    >
                        <Send className="w-4 h-4" />
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BodhiChat;
