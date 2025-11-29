
import React, { useState, useRef, useEffect } from 'react';
import { createChatSession } from '../../services/geminiService';
import { Chat, GenerateContentResponse } from '@google/genai';
import Loader from '../common/Loader';
import { Remarkable } from 'remarkable';

const md = new Remarkable({ html: true });

interface Message {
    role: 'user' | 'model';
    text: string;
}

interface ChatbotProps {
    onShare: (options: { contentText: string; contentType: 'text' }) => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ onShare }) => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    // Sidebar State
    const [systemInstruction, setSystemInstruction] = useState('You are a helpful AI assistant.');
    
    // Advanced Config
    const [showConfig, setShowConfig] = useState(false);
    const [temperature, setTemperature] = useState(1.0);
    
    const suggestions = [
        "How does TikTok serve videos so quickly?",
        "Explain Brutalist architecture",
        "Suggest a marketing strategy for a new coffee shop"
    ];

    const initChat = () => {
        // Temperature isn't directly exposed in this simplified service wrapper easily without refactor
        // but we can pass config if we updated the service. 
        // Assuming update to createChatSession to accept config.
        setChat(createChatSession(systemInstruction, { temperature }));
        setMessages([{ role: 'model', text: "Hello! I am your AI assistant. How can I help you today?" }]);
    };

    useEffect(() => {
        initChat();
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages, loading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !chat || loading) return;

        const userMessage: Message = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response: GenerateContentResponse = await chat.sendMessage({ message: input });
            const modelMessage: Message = { role: 'model', text: response.text };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage: Message = { role: 'model', text: 'Sorry, I encountered an error. Please try again.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };
    
    const handleShare = () => {
        const chatText = messages.map(m => `${m.role === 'user' ? 'You' : 'AI Assistant'}: ${m.text}`).join('\n\n');
        onShare({ contentText: chatText, contentType: 'text' });
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)] min-h-[600px]">
            {/* Sidebar Controls */}
            <div className="w-full lg:w-80 flex-shrink-0 bg-slate-900/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-800 flex flex-col gap-6">
                <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Chat Settings</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">System Persona</label>
                            <textarea 
                                rows={4}
                                value={systemInstruction}
                                onChange={(e) => setSystemInstruction(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-xs focus:ring-2 focus:ring-cyan-500 resize-none"
                                placeholder="Define how the AI should behave..."
                            />
                        </div>
                        
                        <div>
                            <button 
                                onClick={() => setShowConfig(!showConfig)}
                                className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase mb-2 hover:text-white"
                            >
                                <span>Model Parameters</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 transform transition ${showConfig ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </button>
                            
                            {showConfig && (
                                <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-700 animate-fadeIn space-y-3">
                                    <div>
                                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                                            <span>Temperature (Creativity)</span>
                                            <span>{temperature}</span>
                                        </div>
                                        <input 
                                            type="range" 
                                            min="0" 
                                            max="2" 
                                            step="0.1" 
                                            value={temperature} 
                                            onChange={(e) => setTemperature(parseFloat(e.target.value))}
                                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <button 
                            onClick={initChat} 
                            className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2 px-4 rounded-lg transition border border-slate-700"
                        >
                            Update Persona & Reset
                        </button>
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto custom-scrollbar">
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Quick Prompts</h4>
                    <div className="space-y-2">
                        {suggestions.map((s, i) => (
                            <button 
                                key={i}
                                onClick={() => setInput(s)}
                                className="w-full text-left p-2 rounded-lg bg-slate-950/50 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 transition text-xs text-slate-300"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-grow bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col overflow-hidden relative">
                {/* Header */}
                <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <h3 className="font-bold text-white text-sm uppercase tracking-wider">AI Assistant</h3>
                    </div>
                    <button onClick={handleShare} className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded font-bold transition">
                        Share Chat
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar relative">
                    {messages.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-600 opacity-50">
                            <p>Start the conversation...</p>
                        </div>
                    )}
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] lg:max-w-[75%] px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-cyan-600 text-white rounded-tr-sm' : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700'}`}>
                                {msg.role === 'model' ? (
                                    <div className="prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: md.render(msg.text) }}></div>
                                ) : (
                                    msg.text
                                )}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                             <div className="px-5 py-4 rounded-2xl bg-slate-800 border border-slate-700 rounded-tl-sm">
                                <Loader />
                             </div>
                        </div>
                    )}
                     <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-slate-900 border-t border-slate-800">
                    <form onSubmit={handleSubmit} className="flex gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-grow bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition shadow-inner"
                            disabled={loading}
                        />
                        <button 
                            type="submit" 
                            disabled={loading || !input.trim()} 
                            className="bg-cyan-600 hover:bg-cyan-500 text-white p-3 rounded-xl transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Chatbot;
