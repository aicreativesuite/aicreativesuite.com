
import React, { useState, useRef, useEffect } from 'react';
import { createChatSession, generateBulkEmails, generateBulkSms, generateAbTestCopy, generateText } from '../../services/geminiService';
import { Chat, GenerateContentResponse } from '@google/genai';
import Loader from '../common/Loader';
import { Remarkable } from 'remarkable';
import { AGENT_TYPES } from '../../constants';

const md = new Remarkable({ html: true });

interface Message {
    role: 'user' | 'model';
    text: string;
}

interface BulkEmail {
    subject: string;
    body: string;
}

interface BulkSms {
    body: string;
}

interface AbTestCopy {
    angle: string;
    copy: string;
}

interface MarketingAssistantProps {
    onShare: (options: { contentText: string; contentType: 'text' }) => void;
}

const MarketingAssistant: React.FC<MarketingAssistantProps> = ({ onShare }) => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    
    const [activeTool, setActiveTool] = useState<'email' | 'sms' | 'ab-test' | 'agent-explorer' | null>(null);

    // Email/SMS state
    const [emailSmsTemplate, setEmailSmsTemplate] = useState('');
    const [parsedBulkResult, setParsedBulkResult] = useState<BulkEmail[] | null>(null);
    const [parsedSmsResult, setParsedSmsResult] = useState<BulkSms[] | null>(null);
    
    // A/B Test state
    const [abProduct, setAbProduct] = useState('');
    const [abMessage, setAbMessage] = useState('');
    const [abAudience, setAbAudience] = useState('');
    const [parsedAbTestResult, setParsedAbTestResult] = useState<AbTestCopy[] | null>(null);
    
    // Agent Explorer state
    const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
    const [agentStrategyResult, setAgentStrategyResult] = useState<string | null>(null);

    // Common tool state
    const [rawToolResult, setRawToolResult] = useState('');
    const [toolLoading, setToolLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

     const displayToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(''), 3000);
    };

    useEffect(() => {
        const systemInstruction = `You are an expert AI Marketing Agent named 'Strand'. Provide creative marketing strategies, write compelling ad copy, generate email campaigns, and offer SEO advice. You can also suggest visual ideas incorporating various design styles (like packaging, branding, web design) and specific artistic styles (like Minimalist, Vintage, Modern). Be professional, data-driven, and innovative.`;
        setChat(createChatSession(systemInstruction));
        setMessages([{ role: 'model', text: "Hello! Strand, your AI Marketing Agent, at your service. Ask me about marketing strategy, ad copy, or campaign ideas. How can we boost your brand today?" }]);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const handleChatSubmit = async (e: React.FormEvent) => {
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
            const errorMessage: Message = { role: 'model', text: 'Sorry, I encountered an error.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };
    
     const handleShareChat = () => {
        const chatText = messages.map(m => `${m.role === 'user' ? 'Me' : 'Strand (AI Agent)'}: ${m.text}`).join('\n\n');
        onShare({ contentText: chatText, contentType: 'text' });
    };

    const handleToolSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if ((activeTool === 'email' || activeTool === 'sms') && !emailSmsTemplate.trim()) return;
        if (activeTool === 'ab-test' && (!abProduct.trim() || !abMessage.trim() || !abAudience.trim())) return;

        setToolLoading(true);
        setRawToolResult('');
        setParsedBulkResult(null);
        setParsedSmsResult(null);
        setParsedAbTestResult(null);

        try {
            if (activeTool === 'email') {
                const response = await generateBulkEmails(emailSmsTemplate);
                try {
                    const parsed = JSON.parse(response.text);
                    if (Array.isArray(parsed) && parsed.length > 0 && 'subject' in parsed[0] && 'body' in parsed[0]) {
                        setParsedBulkResult(parsed);
                    } else {
                        setRawToolResult(response.text);
                    }
                } catch (parseError) {
                    setRawToolResult(response.text);
                }
            } else if (activeTool === 'sms') {
                const response = await generateBulkSms(emailSmsTemplate);
                 try {
                    const parsed = JSON.parse(response.text);
                    if (Array.isArray(parsed) && parsed.length > 0 && 'body' in parsed[0]) {
                        setParsedSmsResult(parsed);
                    } else {
                        setRawToolResult(response.text);
                    }
                } catch (parseError) {
                    setRawToolResult(response.text);
                }
            } else if (activeTool === 'ab-test') {
                const response = await generateAbTestCopy(abProduct, abMessage, abAudience);
                try {
                    const parsed = JSON.parse(response.text);
                    if (Array.isArray(parsed) && parsed.length > 0 && 'angle' in parsed[0] && 'copy' in parsed[0]) {
                        setParsedAbTestResult(parsed);
                    } else {
                        setRawToolResult(response.text);
                    }
                } catch (parseError) {
                    console.error("Failed to parse A/B test response:", parseError);
                    setRawToolResult(response.text);
                }
            }
        } catch(err) {
            setRawToolResult('Failed to generate content.');
        } finally {
            setToolLoading(false);
        }
    }

    const handleAgentStrategyGenerate = async () => {
        if (!selectedAgentId) return;
        const agent = AGENT_TYPES.find(a => a.id === selectedAgentId);
        if (!agent) return;

        setToolLoading(true);
        setAgentStrategyResult(null);
        try {
            const prompt = `Explain how a "${agent.name}" (${agent.description}) can be applied in a modern marketing context. Provide a specific, hypothetical scenario where using this type of agent would significantly improve decision-making or campaign performance compared to traditional methods.`;
            const response = await generateText(prompt, 'gemini-2.5-flash');
            setAgentStrategyResult(response.text);
        } catch (err) {
            console.error(err);
            setAgentStrategyResult("Failed to generate strategy.");
        } finally {
            setToolLoading(false);
        }
    };

    const handleDeleteItem = (index: number, type: 'email' | 'sms' | 'ab') => {
        if (type === 'email' && parsedBulkResult) {
            setParsedBulkResult(parsedBulkResult.filter((_, i) => i !== index));
        } else if (type === 'sms' && parsedSmsResult) {
            setParsedSmsResult(parsedSmsResult.filter((_, i) => i !== index));
        } else if (type === 'ab' && parsedAbTestResult) {
            setParsedAbTestResult(parsedAbTestResult.filter((_, i) => i !== index));
        }
    }

    const handleDownloadItem = (content: string, filename: string) => {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        displayToast('Downloaded!');
    }

    const renderToolForm = () => {
        if (!activeTool) return null;
        
        if (activeTool === 'agent-explorer') {
            const selectedAgent = AGENT_TYPES.find(a => a.id === selectedAgentId);
            return (
                <div className="space-y-4 bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                    <h3 className="text-lg font-bold">Agentic AI Explorer</h3>
                    <p className="text-sm text-slate-400 -mt-2">Discover how different AI agent architectures can revolutionize marketing.</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                        {AGENT_TYPES.map(agent => (
                            <button
                                key={agent.id}
                                onClick={() => { setSelectedAgentId(agent.id); setAgentStrategyResult(null); }}
                                className={`text-left p-3 rounded-lg border transition-all text-sm ${selectedAgentId === agent.id ? 'bg-purple-900/40 border-purple-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}`}
                            >
                                <div className="font-bold">{agent.name}</div>
                            </button>
                        ))}
                    </div>

                    {selectedAgent && (
                        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 animate-fadeIn">
                            <h4 className="font-bold text-white mb-2">{selectedAgent.name}</h4>
                            <p className="text-slate-300 text-sm mb-4">{selectedAgent.description}</p>
                            <button 
                                onClick={handleAgentStrategyGenerate}
                                disabled={toolLoading}
                                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {toolLoading ? 'Analyzing...' : 'Generate Marketing Use Case'}
                            </button>
                        </div>
                    )}
                </div>
            );
        }

        if (activeTool === 'ab-test') {
             return (
                 <form onSubmit={handleToolSubmit} className="space-y-4 bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                    <h3 className="text-lg font-bold">A/B Test Copy Generator</h3>
                    <p className="text-sm text-slate-400 -mt-2">Generate copy variations with different marketing angles.</p>
                    <textarea rows={3} value={abProduct} onChange={(e) => setAbProduct(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white" placeholder="Product/Service Description..." />
                    <input type="text" value={abMessage} onChange={(e) => setAbMessage(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white" placeholder="Key Message / Goal..." />
                    <input type="text" value={abAudience} onChange={(e) => setAbAudience(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white" placeholder="Target Audience..." />
                    <button type="submit" disabled={toolLoading} className="w-full bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-600 disabled:bg-slate-600">
                        {toolLoading ? 'Generating...' : 'Generate Variations'}
                    </button>
                </form>
            );
        }
        
        return (
             <form onSubmit={handleToolSubmit} className="space-y-4 bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                <h3 className="text-lg font-bold">Bulk {activeTool === 'email' ? 'Email' : 'SMS'} Generator</h3>
                 <p className="text-sm text-slate-400 -mt-2">Create multiple variations from a single template.</p>
                <textarea rows={6} value={emailSmsTemplate} onChange={(e) => setEmailSmsTemplate(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white" placeholder={`Enter ${activeTool} template. Use [Name], [Product], etc.`} />
                <button type="submit" disabled={toolLoading} className="w-full bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-600 disabled:bg-slate-600">
                    {toolLoading ? 'Generating...' : 'Generate Examples'}
                </button>
            </form>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8 relative">
            {toastMessage && (
                <div className="absolute top-5 right-5 bg-green-500 text-white py-2 px-4 rounded-lg animate-pulse z-20">
                    {toastMessage}
                </div>
            )}
            <div className="lg:w-1/2 flex flex-col h-[70vh] bg-slate-900/50 rounded-lg border border-slate-800">
                <div className="flex-shrink-0 p-4 border-b border-slate-700 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-white">AI Marketing Agent</h3>
                    <button
                        onClick={handleShareChat}
                        className="flex items-center justify-center space-x-2 bg-purple-600 text-white font-bold py-2 px-3 rounded-lg hover:bg-purple-700 transition-colors duration-300 text-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                           <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                        </svg>
                        <span>Share Chat</span>
                    </button>
                </div>
                <div className="flex-grow p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-cyan-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`} dangerouslySetInnerHTML={{ __html: md.render(msg.text) }}>
                            </div>
                        </div>
                    ))}
                    {loading && <div className="flex justify-start"><Loader /></div>}
                     <div ref={messagesEndRef} />
                </div>
                <div className="flex-shrink-0 p-4 border-t border-slate-700">
                    <form onSubmit={handleChatSubmit} className="flex space-x-3">
                        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask for marketing advice..." className="flex-grow bg-slate-700 border border-slate-600 rounded-lg p-3 text-white" disabled={loading} />
                        <button type="submit" disabled={loading} className="bg-cyan-500 text-white font-bold p-3 rounded-lg hover:bg-cyan-600 disabled:bg-slate-600">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                        </button>
                    </form>
                </div>
            </div>
            <div className="lg:w-1/2 space-y-4">
                <div className="flex bg-slate-700 rounded-lg p-1 overflow-x-auto">
                    <button onClick={() => setActiveTool('email')} className={`flex-1 p-2 rounded-md text-xs sm:text-sm font-semibold whitespace-nowrap transition ${activeTool === 'email' ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:bg-slate-600'}`}>Bulk Email</button>
                    <button onClick={() => setActiveTool('sms')} className={`flex-1 p-2 rounded-md text-xs sm:text-sm font-semibold whitespace-nowrap transition ${activeTool === 'sms' ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:bg-slate-600'}`}>Bulk SMS</button>
                    <button onClick={() => setActiveTool('ab-test')} className={`flex-1 p-2 rounded-md text-xs sm:text-sm font-semibold whitespace-nowrap transition ${activeTool === 'ab-test' ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:bg-slate-600'}`}>A/B Test</button>
                    <button onClick={() => setActiveTool('agent-explorer')} className={`flex-1 p-2 rounded-md text-xs sm:text-sm font-semibold whitespace-nowrap transition ${activeTool === 'agent-explorer' ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:bg-slate-600'}`}>Agent Explorer</button>
                </div>
                {renderToolForm()}
                 <div className="min-h-[200px] bg-slate-900/50 rounded-lg p-4 prose-sm prose-invert max-w-none border border-slate-800">
                    {toolLoading && <Loader />}
                    {agentStrategyResult ? (
                        <div className="animate-fadeIn">
                            <div dangerouslySetInnerHTML={{ __html: md.render(agentStrategyResult) }} />
                            <div className="mt-4 pt-4 border-t border-slate-700 flex justify-end">
                                <button
                                    onClick={() => onShare({ contentText: agentStrategyResult, contentType: 'text' })}
                                    className="inline-flex items-center space-x-1 bg-purple-600 text-white font-semibold text-xs py-1.5 px-3 rounded-md hover:bg-purple-700 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
                                    <span>Share Strategy</span>
                                </button>
                            </div>
                        </div>
                    ) : parsedAbTestResult ? (
                        <div className="space-y-4 not-prose">
                            {parsedAbTestResult.map((item, index) => (
                                <div key={index} className="bg-slate-800 p-4 rounded-lg border border-slate-700 relative group">
                                    <button onClick={() => handleDeleteItem(index, 'ab')} className="absolute top-2 right-2 text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition" title="Delete">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                    </button>
                                    <h4 className="font-bold text-cyan-400 mb-2 text-base">{item.angle}</h4>
                                    <p className="text-slate-300 whitespace-pre-wrap mb-4 text-sm">{item.copy}</p>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => { navigator.clipboard.writeText(item.copy); displayToast('Copied to clipboard!'); }}
                                            className="inline-flex items-center space-x-1 bg-slate-600 text-white font-semibold text-xs py-1.5 px-3 rounded-md hover:bg-slate-500 transition-colors"
                                        >
                                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" /></svg>
                                            <span>Copy</span>
                                        </button>
                                        <button
                                            onClick={() => handleDownloadItem(item.copy, `ab_copy_${item.angle.replace(/\s+/g, '_')}.txt`)}
                                            className="inline-flex items-center space-x-1 bg-slate-600 text-white font-semibold text-xs py-1.5 px-3 rounded-md hover:bg-slate-500 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                            <span>Download</span>
                                        </button>
                                         <button
                                            onClick={() => onShare({ contentText: `[${item.angle}] ${item.copy}`, contentType: 'text' })}
                                            className="inline-flex items-center space-x-1 bg-purple-600 text-white font-semibold text-xs py-1.5 px-3 rounded-md hover:bg-purple-700 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
                                            <span>Share</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : parsedSmsResult ? (
                        <div className="space-y-4 not-prose">
                            {parsedSmsResult.map((sms, index) => (
                                <div key={index} className="bg-slate-800 p-4 rounded-lg border border-slate-700 relative group">
                                    <button onClick={() => handleDeleteItem(index, 'sms')} className="absolute top-2 right-2 text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition" title="Delete">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                    </button>
                                    <p className="text-slate-300 whitespace-pre-wrap mb-4 text-sm">{sms.body}</p>
                                    <div className="flex flex-wrap gap-2">
                                        <a 
                                            href={`sms:?body=${encodeURIComponent(sms.body)}`}
                                            className="inline-flex items-center space-x-1 bg-green-600 text-white font-semibold text-xs py-1.5 px-3 rounded-md hover:bg-green-700 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                                <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-14.304 0c-1.978-.292-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.678 3.348-3.97zM6.75 8.25a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H7.5z" clipRule="evenodd" />
                                            </svg>
                                            <span>Send SMS</span>
                                        </a>
                                        <button
                                            onClick={() => handleDownloadItem(sms.body, `sms_${index}.txt`)}
                                            className="inline-flex items-center space-x-1 bg-slate-600 text-white font-semibold text-xs py-1.5 px-3 rounded-md hover:bg-slate-500 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                            <span>Download</span>
                                        </button>
                                         <button
                                            onClick={() => onShare({ contentText: sms.body, contentType: 'text' })}
                                            className="inline-flex items-center space-x-1 bg-slate-600 text-white font-semibold text-xs py-1.5 px-3 rounded-md hover:bg-slate-500 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
                                            <span>Share</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : parsedBulkResult ? (
                        <div className="space-y-4 not-prose">
                            {parsedBulkResult.map((email, index) => (
                                <div key={index} className="bg-slate-800 p-4 rounded-lg border border-slate-700 relative group">
                                    <button onClick={() => handleDeleteItem(index, 'email')} className="absolute top-2 right-2 text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition" title="Delete">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                    </button>
                                    <h4 className="font-bold text-white mb-2 text-base">{email.subject}</h4>
                                    <p className="text-slate-300 whitespace-pre-wrap mb-4 text-sm">{email.body}</p>
                                    <div className="flex flex-wrap gap-2">
                                        <a 
                                            href={`mailto:?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`}
                                            className="inline-flex items-center space-x-1 bg-cyan-600 text-white font-semibold text-xs py-1.5 px-3 rounded-md hover:bg-cyan-700 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.532 60.532 0 0021.056-10.151.75.75 0 000-1.172A60.533 60.533 0 003.478 2.405z" /></svg>
                                            <span>Send Email</span>
                                        </a>
                                        <button
                                            onClick={() => handleDownloadItem(`Subject: ${email.subject}\n\n${email.body}`, `email_${index}.txt`)}
                                            className="inline-flex items-center space-x-1 bg-slate-600 text-white font-semibold text-xs py-1.5 px-3 rounded-md hover:bg-slate-500 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                            <span>Download</span>
                                        </button>
                                        <button
                                            onClick={() => onShare({ contentText: `Subject: ${email.subject}\n\n${email.body}`, contentType: 'text' })}
                                            className="inline-flex items-center space-x-1 bg-slate-600 text-white font-semibold text-xs py-1.5 px-3 rounded-md hover:bg-slate-500 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
                                            <span>Share</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : rawToolResult && (
                        <div dangerouslySetInnerHTML={{ __html: md.render(rawToolResult) }} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default MarketingAssistant;
