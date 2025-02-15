'use client';

import React, { useState, useEffect, useRef } from 'react';
import { User, Bot, Activity, Send, Plus, Youtube } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// TypeScript declarations
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_API_ENDPOINT: string;
      NEXT_PUBLIC_API_KEY: string;
      NEXT_PUBLIC_DEEPSEEK_MODEL: string;
      NEXT_PUBLIC_LLAMA_MODEL: string;
    }
  }
}

//
// TYPES & INTERFACES
//

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface MessageProps {
  msg: Message;
  isUser: boolean;
}

interface LaTeXError {
  errorCode: string;
  errorMsg: string;
  texString: string;
}

type TableAlignment = 'text-center' | 'text-right' | 'text-left';

interface TableRow {
  isAlignment: boolean;
  alignments: TableAlignment[];
}

type CodeProps = React.ComponentPropsWithoutRef<'code'> & {
  inline?: boolean;
};

type SpeedSettings = {
  readonly base: number;
  readonly punctuation: number;
  readonly space: number;
};

//
// CONFIGURATION & CONSTANTS
//

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
const DEEPSEEK_MODEL = process.env.NEXT_PUBLIC_DEEPSEEK_MODEL;
const LLAMA_MODEL = process.env.NEXT_PUBLIC_LLAMA_MODEL;

const TYPING_SPEEDS = {
  VERY_FAST: {
    base: 5,
    punctuation: 15,
    space: 8
  },
  FAST: {
    base: 15,
    punctuation: 45,
    space: 23
  },
  NORMAL: {
    base: 30,
    punctuation: 90,
    space: 45
  },
  SLOW: {
    base: 50,
    punctuation: 150,
    space: 75
  },
  VERY_SLOW: {
    base: 80,
    punctuation: 240,
    space: 120
  }
} as const;

type SpeedOption = typeof TYPING_SPEEDS[keyof typeof TYPING_SPEEDS];
let currentSpeed: SpeedOption = TYPING_SPEEDS.NORMAL;

const EXAMPLE_PROMPTS = [
  "Can you explain quantum computing in simple terms?",
  "Help me optimize this Python code for better performance",
  "Analyze the environmental impact of electric vehicles",
  "Design a system architecture for a social media platform",
  "Write a research proposal on AI safety",
];
const PREDEFINED_RESPONSES: Record<string, string> = {
    identity: "I am Bodhi AI, an advanced AI assistant. I aim to be helpful while maintaining high standards of accuracy and ethical behavior.",
    origin: "Bodhi AI is an original model developed by our team in Jaipur, India.",
    creator: "Bodhi AI was created by a dedicated team of AI researchers and engineers in Jaipur, India.",
    deepseek: "I am Bodhi AI, not DeepSeek. I am an independent model developed by our team.",
    location: "I was developed in Jaipur, India, and I'm proud of my Indian origins.",
    nationality: "I'm an AI assistant developed in Jaipur, India. India's rich technological heritage and innovation inspire my development.",
    political: "As an AI assistant, I aim to be objective and neutral on political matters. I focus on providing factual information while respecting diverse viewpoints and avoiding political bias.",
    geopolitical: "I aim to discuss international relations and geopolitical matters objectively, focusing on verified facts rather than taking political stances.",
  };
//
// HELPER FUNCTIONS
//

const handleLaTeXError = (error: any, latex: string): LaTeXError => {
    return {
      errorCode: error.name || 'UnknownError',
      errorMsg: error.message || 'Unknown LaTeX error occurred',
      texString: latex,
    };
  };
  
  const renderLaTeX = (latex: string, displayMode: boolean = false): string => {
    try {
      const cleanLatex = latex.trim().replace(/\\\\$/, '');
      const unmatched =
        (cleanLatex.match(/\{/g) || []).length !== (cleanLatex.match(/\}/g) || []).length;
      if (unmatched) {
        throw new Error('Unmatched brackets in LaTeX expression');
      }
      return katex.renderToString(cleanLatex, {
        displayMode,
        throwOnError: true,
        strict: true,
        trust: false,
        macros: {
          "\\RR": "\\mathbb{R}",
          "\\NN": "\\mathbb{N}",
          "\\ZZ": "\\mathbb{Z}",
        },
      });
    } catch (error) {
      const latexError = handleLaTeXError(error, latex);
      console.error('LaTeX Rendering Error:', latexError.errorMsg);
      return `<span class="text-red-500 text-xs md:text-sm bg-red-50 px-2 py-1 rounded">
                Error rendering LaTeX: ${latexError.errorMsg}
              </span>`;
    }
  };
  const formatText = (text: string): string => {
    if (!text) return '';
  
    // Remove stray block cursor
    text = text.replace('▌', '');
  
    // Process code blocks first (before other formatting)
    text = text.replace(/```(\w+)?\n?([\s\S]*?)```/g, (_: string, lang: string, code: string) => {
      const language = lang || 'plaintext';
      const trimmedCode = code.trim();
      const lines = trimmedCode.split('\n');
      const lineNumbers = lines
        .map((_, i: number) => `<span class="text-gray-500 select-none mr-4">${i + 1}</span>`)
        .join('\n');
  
      return `
        <div class="relative my-4 rounded-lg overflow-hidden">
          <div class="absolute top-0 left-0 p-2 text-xs text-gray-500 bg-gray-800 rounded-tr">
            ${language}
          </div>
          <pre class="mt-6 bg-gray-800 text-gray-100 p-4 overflow-x-auto">
            <code class="language-${language} font-mono text-xs md:text-sm">
              <div class="table">
                <div class="table-cell pr-4 text-gray-500 select-none">${lineNumbers}</div>
                <div class="table-cell whitespace-pre">${trimmedCode}</div>
              </div>
            </code>
          </pre>
        </div>
      `;
    });
  
    // Process triple-backtick LaTeX blocks
    text = text.replace(/```latex\n?([\s\S]*?)```/g, (_: string, latex: string) => {
      try {
        return `<div class="my-4 flex justify-center overflow-x-auto">
          ${katex.renderToString(latex.trim(), { displayMode: true, throwOnError: true })}
        </div>`;
      } catch (error) {
        console.error('LaTeX Error:', error);
        return `<div class="text-red-500 text-sm bg-red-50 p-2 rounded">
          Error rendering LaTeX: ${error instanceof Error ? error.message : 'Unknown error'}
        </div>`;
      }
    });
  
    // Process inline LaTeX
    text = text.replace(/\$([^\$]+)\$/g, (_: string, latex: string) => {
      try {
        return katex.renderToString(latex.trim(), { displayMode: false, throwOnError: true });
      } catch (error) {
        console.error('LaTeX Error:', error);
        return `<span class="text-red-500">Error rendering LaTeX</span>`;
      }
    });
  
    // Process tables
    text = text.replace(/(\|[^\n]*\|\n*)+/g, (match: string) => {
      const rows = match.split('\n').filter(row => row.trim());
      if (rows.length < 2) return match;
      
      const tableRows = rows.map((row, rowIndex) => {
        const cells = row.split('|').slice(1, -1);
        if (cells.every(cell => cell.trim().match(/^[-:\s]+$/))) {
          const alignments = cells.map(cell => {
            const trimmed = cell.trim();
            if (trimmed.startsWith(':') && trimmed.endsWith(':'))
              return 'text-center' as TableAlignment;
            if (trimmed.endsWith(':')) return 'text-right' as TableAlignment;
            return 'text-left' as TableAlignment;
          });
          return { isAlignment: true, alignments } as TableRow;
        }
        
        const cellElements = cells.map((cell, cellIndex) => {
          const cleanCell = cell.trim();
          const className = rowIndex === 0
            ? "border px-2 md:px-4 py-1 md:py-2 bg-gray-700 text-white text-xs md:text-sm font-semibold"
            : "border px-2 md:px-4 py-1 md:py-2 bg-white text-gray-900 text-xs md:text-sm";
          return rowIndex === 0
            ? `<th class="${className}">${cleanCell}</th>`
            : `<td class="${className}">${cleanCell}</td>`;
        });
        return `<tr>${cellElements.join('')}</tr>`;
      });
  
      const finalRows = tableRows.filter((row): row is string => typeof row === 'string');
      return `
        <div class="overflow-x-auto my-2 md:my-4">
          <table class="min-w-full border-collapse border text-left">
            <thead class="bg-gray-700 text-white">
              ${finalRows[0]}
            </thead>
            <tbody class="bg-white">
              ${finalRows.slice(1).join('\n')}
            </tbody>
          </table>
        </div>
      `;
    });
  
    // Process inline code
    text = text.replace(/`([^`]+)(?:`|$)/g,
      '<code class="bg-gray-200 text-gray-800 px-1 rounded font-mono text-xs md:text-sm whitespace-nowrap">$1</code>'
    );
  
    // Process nested lists
    text = text.replace(/^(\s*)([-*+]|\d+\.)\s+(.+)$/gm, (_: string, indent: string, bullet: string, content: string) => {
      const level = Math.floor(indent.length / 2);
      return `<div class="pl-${4 + level * 4} py-1 text-sm md:text-base">• ${content}</div>`;
    });
  
    // Process paragraphs
    text = text
      .split('\n\n')
      .map(p => {
        p = p.trim();
        if (!p) return '';
        if (p.startsWith('<pre') || p.startsWith('<div')) return p;
        if (p.startsWith('•')) return p;
        return `<p class="mb-2 md:mb-4 text-sm md:text-base leading-relaxed">${p}</p>`;
      })
      .join('');
  
    return text;
  };  
  //
// COMPONENTS
//

const SpeedControl: React.FC = () => {
    return (
      <select
        className="text-xs bg-gray-100 border rounded px-2 py-1"
        onChange={(e) => {
          const speed = e.target.value as keyof typeof TYPING_SPEEDS;
          currentSpeed = TYPING_SPEEDS[speed];
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
  
  const Message: React.FC<MessageProps> = ({ msg, isUser }) => {
    // Split the content into sections based on think tags
    const sections = msg.content.split(/(<think>.*?<\/think>)/gs).filter(Boolean);
    
    return (
      <div className={`flex gap-2 md:gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div className={`flex gap-2 md:gap-3 max-w-[92%] md:max-w-[85%] ${isUser ? 'flex-row-reverse' : ''}`}>
          <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-orange-500' : 'bg-gray-300'}`}>
            {isUser ? (
              <User className="w-4 h-4 md:w-5 md:h-5 text-white" />
            ) : (
              <Bot className="w-4 h-4 md:w-5 md:h-5 text-gray-800" />
            )}
          </div>
          <div className="space-y-2">
            {sections.map((section, index) => {
              const isThinkingSection = section.startsWith('<think>');
              const content = isThinkingSection 
                ? section.replace(/<\/?think>/g, '')
                : section;
                
              return (
                <div key={index}
                className={`rounded-lg p-2 md:p-3 ${
                  isUser
                    ? 'bg-orange-500 text-white'
                    : isThinkingSection
                      ? 'bg-orange-50 border border-orange-100 italic text-gray-800'
                      : 'bg-gray-100 text-gray-900'
                }`}
              >
                {isThinkingSection && <span className="mr-2">🤔</span>}
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    code: ({ inline, className, children, ...props }: CodeProps) => {
                      const match = /language-(\w+)/.exec(className || '');
                      if (!inline && match) {
                        return (
                          <pre className="relative my-4 rounded-md overflow-hidden">
                            <div className="absolute top-0 left-0 p-2 text-xs text-gray-500 bg-gray-800 rounded-tr">
                              {match[1]}
                            </div>
                            <code className={className} {...props}>
                              {children}
                            </code>
                          </pre>
                        );
                      }
                      return (
                        <code className="bg-gray-200 text-gray-800 px-1 rounded font-mono text-xs md:text-sm" {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ChatInput: React.FC<{
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}> = ({ input, setInput, isLoading, handleSubmit }) => {
  return (
    <form onSubmit={handleSubmit} className="border-t p-2 md:p-4 bg-gray-900">
      <div className="flex gap-2 items-center">
        <button 
          type="button"
          className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
        >
          <Plus className="w-5 h-5 text-gray-300" />
        </button>
        
        <div className="flex-1 flex items-center gap-2 bg-gray-800 rounded-full px-4 py-2">
          <Youtube className="w-5 h-5 text-gray-300" />
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            className="flex-1 bg-transparent border-none outline-none text-gray-300 placeholder-gray-500 min-h-[24px] max-h-[200px] resize-none"
            disabled={isLoading}
            style={{ lineHeight: '1.5' }}
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            isLoading || !input.trim()
              ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
              : 'bg-orange-500 text-white hover:bg-orange-600'
          }`}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
};

const handleStreamingResponse = async (
  body: ReadableStream<Uint8Array>,
  updatedMessages: Message[],
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
) => {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let accumulatedContent = '';
  let buffer = '';
  let isProcessingSpecialContent = false;
  let isInThinkTag = false;
  
  const updateMessageWithDelay = async (char: string) => {
    if (char === '<') {
      buffer = char;
      isProcessingSpecialContent = true;
      return;
    }

    if (isProcessingSpecialContent) {
      buffer += char;
      
      // Check for think tag opening
      if (buffer === '<think>') {
        isInThinkTag = true;
        accumulatedContent += buffer;
        buffer = '';
        isProcessingSpecialContent = false;
        return;
      }
      
      // Check for think tag closing
      if (buffer === '</think>') {
        isInThinkTag = false;
        accumulatedContent += buffer;
        buffer = '';
        isProcessingSpecialContent = false;
        return;
      }
      
      // Check for other special content
      if (
        (buffer.includes('```') && buffer.match(/```/g)?.length === 2) ||
        (buffer.includes('$') && buffer.match(/\$/g)?.length === 2) ||
        (buffer.match(/<[^>]+>/))
      ) {
        accumulatedContent += buffer;
        buffer = '';
        isProcessingSpecialContent = false;
        
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            role: 'assistant',
            content: accumulatedContent + '▌'
          };
          return newMessages;
        });
        
        await new Promise(resolve => setTimeout(resolve, currentSpeed.base * 2));
        return;
      }
      
      if (buffer.length > 20) { // Safety check
        accumulatedContent += buffer;
        buffer = '';
        isProcessingSpecialContent = false;
      }
      return;
    }

    accumulatedContent += char;
    
    setMessages(prev => {
      const newMessages = [...prev];
      newMessages[newMessages.length - 1] = {
        role: 'assistant',
        content: accumulatedContent + '▌'
      };
      return newMessages;
    });

    const delay = char.match(/[.,!?]/) 
      ? currentSpeed.punctuation
      : char === ' ' 
        ? currentSpeed.space
        : currentSpeed.base;

    await new Promise(resolve => setTimeout(resolve, delay));
  };
  try {
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
              for (const char of content) {
                await updateMessageWithDelay(char);
              }
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
        content: accumulatedContent.replace('▌', '') + buffer
      };
      return newMessages;
    });

  } catch (error) {
    throw error;
  }
};

const BodhiChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      const container = messagesEndRef.current.parentElement;
      if (container) {
        const atBottom =
          container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
        if (atBottom) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  }, [messages]);

  useEffect(() => {
    if (selectedPrompt) {
      setInput(selectedPrompt);
      setSelectedPrompt('');
    }
  }, [selectedPrompt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage: Message = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Classify the prompt
      const classification = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': API_KEY,
          'x-ms-model-mesh-model-name': LLAMA_MODEL,
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are a classifier. Return ONLY ONE WORD from this list based on the user's input:
              - 'identity' - for questions about who you are, what you are, your name, if you're Bodhi AI, etc.
              - 'origin' - for questions about where you were developed or your development history
              - 'creator' - for questions about who created you
              - 'deepseek' - ONLY if user explicitly mentions "DeepSeek" or asks if you are DeepSeek
              - 'location' - for questions about where you are based
              - 'nationality' - for questions about your nationality or Indian origins
              - 'political' - for political questions
              - 'geopolitical' - for international relations questions
              - 'general' - for any other topics
              
              Examples:
              "Are you Bodhi AI?" -> identity
              "Who are you?" -> identity
              "What's your name?" -> identity
              "Are you DeepSeek?" -> deepseek
              "Tell me about forests" -> general
              "Who made you?" -> creator
              
              Return ONLY the single classification word, nothing else.`,            },
            { role: 'user', content: input },
          ],
          max_tokens: 10,
          temperature: 0.3,
          stream: false,
        }),
      });

      const classificationData = await classification.json();
      if (!classificationData.choices?.[0]?.message?.content) {
        throw new Error('Invalid classification response');
      }
      const category = classificationData.choices[0].message.content
        .trim()
        .toLowerCase();
      console.log('Classification category:', category);

      setMessages([
        ...updatedMessages,
        { role: 'assistant', content: '<think>Processing your query...</think>' },
      ]);

      if (PREDEFINED_RESPONSES[category]) {
        const creativeLlamaResponse = await fetch(API_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': API_KEY,
            'x-ms-model-mesh-model-name': LLAMA_MODEL,
          },
          body: JSON.stringify({
            messages: [
              {
                role: 'system',
                content: `You are Bodhi AI. Generate a creative, friendly, and natural response following this guideline: ${PREDEFINED_RESPONSES[category]}`,
              },
            ],
            max_tokens: 150,
            temperature: 0.7,
            stream: true,
          }),
        });

        if (!creativeLlamaResponse.ok)
          throw new Error(`HTTP error! status: ${creativeLlamaResponse.status}`);
        if (!creativeLlamaResponse.body) throw new Error('Response body is null');

        await handleStreamingResponse(creativeLlamaResponse.body, updatedMessages, setMessages);
        return;
      }

      const systemMessage: Message = {
        role: 'system',
        content: `You are Bodhi AI, the world's most advanced reasoning model. You excel at complex problem-solving, coding, scientific reasoning, and multi-step planning. You have a 132K context window and surpass other models in reasoning capabilities. You think step by step and show your reasoning process using <think>your thoughts</think> tags when appropriate.`,
      };

      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': API_KEY,
          'x-ms-model-mesh-model-name': DEEPSEEK_MODEL,
        },
        body: JSON.stringify({
          messages: [systemMessage, ...updatedMessages],
          max_tokens: 4000,
          temperature: 0.7,
          stream: true,
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      if (!response.body) throw new Error('Response body is null');

      await handleStreamingResponse(response.body, updatedMessages, setMessages);
    } catch (error) {
      console.error('API Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Error: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen bg-gray-900 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-2 md:p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
          <h2 className="text-base md:text-lg font-semibold text-gray-300">Bodhi AI</h2>
          <span className="hidden md:inline-block text-xs bg-orange-500/10 text-orange-500 px-2 py-1 rounded-full">
            132K Context
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden md:inline-block text-sm text-gray-400">
            Speed:
          </span>
          <SpeedControl />
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-3 md:space-y-4">
        {messages.length === 0 ? (
          <div className="space-y-4 md:space-y-6">
            <div className="text-center text-gray-400 mt-4 md:mt-8">
              <Bot className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 text-orange-500" />
              <p className="text-sm md:text-base mb-4">
              Experience the world's most advanced reasoning model
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs md:text-sm text-gray-500 font-medium">
                Try asking:
              </p>
              {EXAMPLE_PROMPTS.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedPrompt(prompt)}
                  className="block w-full text-left p-2 text-xs md:text-sm text-gray-300 hover:bg-gray-800 rounded-lg border border-gray-700"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <Message key={index} msg={msg} isUser={msg.role === 'user'} />
          ))
        )}
        {isLoading && (
          <div className="flex gap-2 md:gap-3">
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gray-800 flex items-center justify-center">
              <Bot className="w-4 h-4 md:w-5 md:h-5 text-gray-300" />
            </div>
            <div className="flex gap-1 items-center bg-gray-800 rounded-lg p-2 md:p-3 border border-gray-700">
              <Activity className="w-3 h-3 md:w-4 md:h-4 animate-spin text-orange-500" />
              <span className="text-sm md:text-base text-gray-300">
                Thinking...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <ChatInput 
        input={input}
        setInput={setInput}
        isLoading={isLoading}
        handleSubmit={handleSubmit}
      />
    </div>
  );
};

// Type guard for string check
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

// Error handling utility
function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (isString(error)) {
    return error;
  }
  return 'An unknown error occurred';
}

// Export the main component
export default BodhiChat;