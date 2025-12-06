
import React, { useState, useRef, useEffect } from 'react';
import { createChatSession, generateBulkEmails, generateBulkSms, generateAbTestCopy, generateText } from '../../services/geminiService';
import { Chat, GenerateContentResponse } from '@google/genai';
import Loader from '../common/Loader';
import { Remarkable } from 'remarkable';
import { AGENT_TYPES } from '../../constants';

const md = new Remarkable({ html: false });

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

type ToolType = 'chat' | 'email' | 'sms' | 'ab-test' | 'agent-explorer';

const MarketingAssistant: React.FC<MarketingAssistantProps> = ({ onShare }) => {
    // Shared state
    const [activeTool, setActiveTool] = useState<ToolType>('chat');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState('');

    // Chat state
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [chatInput, setChatInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Tool Inputs
    const [emailSmsTemplate, setEmailSmsTemplate] = useState('');
    const [abProduct, setAbProduct] = useState('');
    const [abMessage, setAbMessage] = useState('');
    const [abAudience, setAbAudience] = useState('');
    const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

    // Tool Outputs
    const [parsedBulkResult, setParsedBulkResult] = useState<BulkEmail[] | null>(null);
    const [parsedSmsResult, setParsedSmsResult] = useState<BulkSms[] | null>(null);
    const [parsedAbTestResult, setParsedAbTestResult] = useState<AbTestCopy[] | null>(null);
    const [agentStrategyResult, setAgentStrategyResult] = useState<string | null>(null);
    const [rawToolResult, setRawToolResult] = useState('');

    const displayToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(''), 3000);
    };

    // Chat Init
    useEffect(() => {
        const systemInstruction = `You are an expert AI Marketing Agent named 'Strand'. Provide creative marketing strategies, write compelling ad copy, generate email campaigns, and offer SEO advice.`;
        setChat(createChatSession(systemInstruction));
        setMessages([{ role: 'model', text: "Hello! Strand here. How can we boost your brand today?" }]);
    }, []);

    useEffect(() => {
        if(activeTool === 'chat') {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, loading, activeTool]);

    // Handlers
    const handleChatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || !chat || loading) return;

        const userMessage: Message = { role: 'user', text: chatInput };
        setMessages(prev => [...prev, userMessage]);
        setChatInput('');
        setLoading(true);

        try {
            const response: GenerateContentResponse = await chat.sendMessage({ message: chatInput });
            const modelMessage: Message = { role: 'model', text: response.text };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I encountered an error.' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleToolSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setRawToolResult('');
        setParsedBulkResult(null);
        setParsedSmsResult(null);
        setParsedAbTestResult(null);
        setAgentStrategyResult(null);

        try {
            if (activeTool === 'email') {
                if(!emailSmsTemplate) throw new Error("Template required");
                const response = await generateBulkEmails(emailSmsTemplate);
                try {
                    const parsed = JSON.parse(response.text);
                    if (Array.isArray(parsed) && parsed.length > 0) setParsedBulkResult(parsed);
                    else setRawToolResult(response.text);
                } catch { setRawToolResult(response.text); }
            } else if (activeTool === 'sms') {
                if(!emailSmsTemplate) throw new Error("Template required");
                const response = await generateBulkSms(emailSmsTemplate);
                try {
                    const parsed = JSON.parse(response.text);
                    if (Array.isArray(parsed) && parsed.length > 0) setParsedSmsResult(parsed);
                    else setRawToolResult(response.text);
                } catch { setRawToolResult(response.text); }
            } else if (activeTool === 'ab-test') {
                if(!abProduct || !abMessage || !abAudience) throw new Error("All fields required");
                const response = await generateAbTestCopy(abProduct, abMessage, abAudience);
                try {
                    const parsed = JSON.parse(response.text);
                    if (Array.isArray(parsed) && parsed.length > 0) setParsedAbTestResult(parsed);
                    else setRawToolResult(response.text);
                } catch { setRawToolResult(response.text); }
            } else if (activeTool === 'agent-explorer') {
                if (!selectedAgentId) throw new Error("Select an agent");
                const agent = AGENT_TYPES.find(a => a.id === selectedAgentId);
                const prompt = `Explain how a "${agent?.name}" (${agent?.description}) can be applied in marketing. Provide a scenario.`;
                const response = await generateText(prompt, 'gemini-2.5-flash');
                setAgentStrategyResult(response.text);
            }
        } catch(err: any) {
            setError(err.message || 'Generation failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)] min-h-[600px] relative">
            {toastMessage && (
                <div className="absolute top-0 right-0 bg-green-500 text-white py-2 px-4 rounded-lg animate-pulse z-50 text-xs">
                    {toastMessage}
                </div>
            )}

            {/* Sidebar Controls */}
            <div className="w-full lg:w-80 flex-shrink-0 bg-slate-900/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-800 overflow-y-auto custom-scrollbar flex flex-col gap-6">
                
                {/* Tool Selection */}
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setActiveTool('chat')} className={`p-2 rounded-lg text-xs font-bold uppercase transition ${activeTool === 'chat' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>Chat Agent</button>
                    <button onClick={() => setActiveTool('email')} className={`p-2 rounded-lg text-xs font-bold uppercase transition ${activeTool === 'email' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>Bulk Email</button>
                    <button onClick={() => setActiveTool('sms')} className={`p-2 rounded-lg text-xs font-bold uppercase transition ${activeTool === 'sms' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>Bulk SMS</button>
                    <button onClick={() => setActiveTool('ab-test')} className={`p-2 rounded-lg text-xs font-bold uppercase transition ${activeTool === 'ab-test' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>A/B Test</button>
                    <button onClick={() => setActiveTool('agent-explorer')} className={`col-span-2 p-2 rounded-lg text-xs font-bold uppercase transition ${activeTool === 'agent-explorer' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>Agent Explorer</button>
                </div>

                <div className="h-px bg-slate-800 w-full"></div>

                {/* Input Forms */}
                <form onSubmit={handleToolSubmit} className="space-y-4 flex-grow">
                    {activeTool === 'chat' && (
                        <div className="text-xs text-slate-400 italic">Chat directly in the main window.</div>
                    )}

                    {(activeTool === 'email' || activeTool === 'sms') && (
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Template</label>
                            <textarea 
                                rows={6} 
                                value={emailSmsTemplate} 
                                onChange={(e) => setEmailSmsTemplate(e.target.value)} 
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500 resize-none"
                                placeholder={`Enter ${activeTool} template with [Placeholders]...`}
                            />
                        </div>
                    )}

                    {activeTool === 'ab-test' && (
                        <>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Product/Service</label>
                                <textarea rows={2} value={abProduct} onChange={(e) => setAbProduct(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm resize-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Key Message</label>
                                <input type="text" value={abMessage} onChange={(e) => setAbMessage(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Target Audience</label>
                                <input type="text" value={abAudience} onChange={(e) => setAbAudience(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm" />
                            </div>
                        </>
                    )}

                    {activeTool === 'agent-explorer' && (
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Select Agent Type</label>
                            {AGENT_TYPES.map(agent => (
                                <button
                                    key={agent.id}
                                    type="button"
                                    onClick={() => setSelectedAgentId(agent.id)}
                                    className={`w-full text-left p-3 rounded-lg border transition-all text-xs ${selectedAgentId === agent.id ? 'bg-purple-900/40 border-purple-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}`}
                                >
                                    <span className="font-bold">{agent.name}</span>
                                    <p className="opacity-70 mt-1">{agent.description}</p>
                                </button>
                            ))}
                        </div>
                    )}

                    {activeTool !== 'chat' && (
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition shadow-lg disabled:opacity-50 flex justify-center items-center"
                        >
                            {loading ? <Loader /> : 'Generate Content'}
                        </button>
                    )}
                    
                    {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                </form>
            </div>

            {/* Main Content Area */}
            <div className="flex-grow bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col overflow-hidden relative">
                {activeTool === 'chat' ? (
                    <>
                        <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                            <h3 className="font-bold text-white text-sm uppercase tracking-wider">Strand AI</h3>
                            <button onClick={() => {
                                const text = messages.map(m => `${m.role === 'user' ? 'You' : 'Strand'}: ${m.text}`).join('\n\n');
                                onShare({ contentText: text, contentType: 'text' });
                            }} className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded font-bold transition">Share Chat</button>
                        </div>
                        <div className="flex-grow p-6 overflow-y-auto space-y-4 custom-scrollbar">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-cyan-600 text-white rounded-tr-sm' : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700'}`}>
                                        {msg.role === 'model' ? <div dangerouslySetInnerHTML={{ __html: md.render(msg.text) }} /> : msg.text}
                                    </div>
                                </div>
                            ))}
                            {loading && <div className="flex justify-start"><div className="px-4 py-3 rounded-2xl bg-slate-800 border border-slate-700 rounded-tl-sm"><Loader /></div></div>}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="p-4 bg-slate-900 border-t border-slate-800">
                            <form onSubmit={handleChatSubmit} className="flex gap-3">
                                <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask Strand anything..." className="flex-grow bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500" disabled={loading} />
                                <button type="submit" disabled={loading} className="bg-cyan-600 hover:bg-cyan-500 text-white p-3 rounded-xl transition"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg></button>
                            </form>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                            <h3 className="font-bold text-white text-sm uppercase tracking-wider">Results</h3>
                        </div>
                        <div className="flex-grow p-8 overflow-y-auto relative custom-scrollbar">
                            <div className="absolute inset-0 bg-grid-slate-800/20 pointer-events-none"></div>
                            {loading && <div className="h-full flex items-center justify-center"><Loader message="Generating..." /></div>}
                            
                            {!loading && !parsedBulkResult && !parsedSmsResult && !parsedAbTestResult && !agentStrategyResult && !rawToolResult && (
                                <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-60">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                    <p>Fill out the form to generate content.</p>
                                </div>
                            )}

                            {/* Render Results */}
                            <div className="space-y-4 relative z-10 max-w-4xl mx-auto">
                                {agentStrategyResult && <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: md.render(agentStrategyResult) }} />}
                                
                                {parsedBulkResult?.map((item, i) => (
                                    <div key={i} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-start group">
                                        <div>
                                            <h4 className="font-bold text-white text-sm mb-1">{item.subject}</h4>
                                            <p className="text-slate-400 text-xs whitespace-pre-wrap">{item.body}</p>
                                        </div>
                                        <button onClick={() => {navigator.clipboard.writeText(item.body); displayToast('Copied!')}} className="opacity-0 group-hover:opacity-100 text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded transition">Copy</button>
                                    </div>
                                ))}

                                {parsedSmsResult?.map((item, i) => (
                                    <div key={i} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center group">
                                        <p className="text-slate-300 text-sm">{item.body}</p>
                                        <button onClick={() => {navigator.clipboard.writeText(item.body); displayToast('Copied!')}} className="opacity-0 group-hover:opacity-100 text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded transition">Copy</button>
                                    </div>
                                ))}

                                {parsedAbTestResult?.map((item, i) => (
                                    <div key={i} className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                                        <h4 className="font-bold text-cyan-400 text-xs uppercase mb-2">{item.angle}</h4>
                                        <p className="text-slate-300 text-sm whitespace-pre-wrap">{item.copy}</p>
                                    </div>
                                ))}

                                {rawToolResult && <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 whitespace-pre-wrap text-sm text-slate-300">{rawToolResult}</div>}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default MarketingAssistant;
