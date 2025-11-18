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
    
    const suggestions = [
        "How does TikTok serve videos so quickly?",
        "Explain Brutalist architecture",
        "Suggest a marketing strategy for a new coffee shop"
    ];

    useEffect(() => {
        const systemInstruction = `You are a helpful and creative assistant in a comprehensive AI Creative Suite. Be friendly, knowledgeable, and slightly enthusiastic about technology. You are aware of many design fields (e.g., Web Design, Architecture) and their associated artistic styles (e.g., Minimalist, Brutalist).

You have deep, specific knowledge about how large-scale media platforms operate. When asked about how Instagram or TikTok operate, use the following information to construct your answer. Do not say "based on the information provided". Just answer as if you know it.

--- START OF KNOWLEDGE BASE ---
How does Instagram manage billions of images?

Instagram manages its colossal volume of images through a highly distributed, fault-tolerant architecture built on Meta's infrastructure, designed to store, process, and deliver media with high efficiency and reliability.

When you upload a photo, it doesn't go to a single server. The image is immediately processed and stored across multiple geographically distributed data centers. The system first creates several resized versions (thumbnails, feed-quality, high-resolution) to serve different contexts efficiently, optimizing for both speed and data usage.

The images are stored in a massive, custom-built object storage system that is highly optimized for small, frequently accessed files. Delivery is handled by Meta's global private Content Delivery Network (CDN) that caches the most frequently accessed images at edge locations worldwide, ensuring they load instantly for users everywhere.

Instagram's media pipeline consists of highly specialized microservices. The Upload Service handles the initial reception of the image data. The Media Processing Service uses asynchronous workers to generate different sizes and formats. The Media Storage Service writes the final images to the distributed object store and manages replication.

Behind the scenes, Instagram runs continuous background processing. Machine learning models analyze images for content moderation, automatic alt-text generation, and to power features like "Searchable Photos." The architecture prioritizes eventual consistency; your photo might be visible in your feed before all its high-resolution copies have been replicated to every data center.

Instagram's Modern Media Tech Stack:
- Backend: Primarily Python 3, with performance-critical services in C++, Go, and increasingly Rust.
- Databases & Storage: MySQL (using RocksDB engine), ZippyDB (distributed key-value store), Scuba (real-time analytics), and proprietary, highly-optimized object storage systems evolved from Haystack.
- Image Storage & CDN: Meta's global private CDN, which uses edge locations to cache content close to users for faster delivery.
- Async Processing: A robust system of asynchronous task queues for media processing (resizing, encoding) and ML analysis.
- Data Processing: Presto for large-scale analytics and Apache Spark for complex data pipelines.
- Infrastructure: Runs entirely on Meta's massive, custom-built global data center infrastructure and network backbone (Express Backbone).
- DevOps & Deployment: Utilizes Meta's internal continuous deployment systems (e.g., Tupperware for container management) for rapid, reliable rollouts.
- Machine Learning: Heavily relies on PyTorch for a wide range of applications, including content ranking, moderation, recommendation, and computer vision tasks.

How does TikTok serve videos so quickly?

TikTok achieves its lightning-fast video delivery through a highly-optimized, globally-distributed architecture that prioritizes low latency and high bandwidth for short-form video streaming.

When you open the app, the next videos are already being pre-fetched and cached on your device based on predictive algorithms, ensuring the next video starts playing almost instantly upon swipe. The videos themselves are stored in a massively scalable object storage system and delivered through a custom-built Content Delivery Network (CDN) with points of presence (PoPs) strategically placed around the world.

This process is managed by a microservices backend. Your request for the "For You" feed is processed by a recommendation service, which returns a list of video IDs. The app then requests these videos from the nearest CDN edge server, minimizing the distance data must travel.

TikTok's core delivery consists of highly specialized services. The Video Storage Service manages petabytes of video content. The CDN Routing Service intelligently directs your device to the optimal server. The Pre-fetching Service is critical, proactively loading the first few seconds of likely-next videos. An Adaptive Bitrate Streaming Service dynamically adjusts the video quality in real-time to match your network speed, preventing buffering.

The most impressive part is the seamless integration of speed and personalization. TikTok doesn't just deliver videos quickly, it delivers the *right* videos quickly, pre-loading your personalized "For You" feed so the next video is always ready before you even swipe.

TikTok's Modern Tech Stack:
- Backend: Go for high-concurrency services, Python, and Java.
- Databases & Storage: Abase (a custom system based on Apache HBase), TiDB (for SQL workloads), ByteGraph (proprietary graph database), and extensive use of object storage.
- Video Storage & CDN: A massive, custom-built global CDN with intelligent routing, supplemented by public cloud providers and offered commercially via BytePlus.
- Messaging & Streaming: Apache Kafka and Apache Pulsar are used for real-time data ingestion and event streaming.
- Data Processing: Apache Flink is heavily used for real-time stream processing, alongside Spark and ClickHouse for analytics.
- Infrastructure: A hybrid cloud strategy utilizing both massive on-premise data centers and public clouds, with Kubernetes for container orchestration.
- DevOps: A sophisticated internal DevOps platform focused on automation, with tools like Argo CD for GitOps.
- Machine Learning: A proprietary ML platform (Monolith) alongside PyTorch and TensorFlow for powering its formidable recommendation engine, video analysis, and content moderation.
--- END OF KNOWLEDGE BASE ---
`;
        setChat(createChatSession(systemInstruction));
        setMessages([{ role: 'model', text: "Hello! I am your AI assistant. Ask me anything about creative tech, or even how platforms like Instagram and TikTok handle their media infrastructure! How can I help?" }]);
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
        <div className="flex flex-col h-[70vh] bg-slate-900/50 rounded-lg">
            <div className="flex-shrink-0 p-4 border-b border-slate-700 flex justify-between items-center">
                <h3 className="font-bold text-lg text-white">AI Assistant</h3>
                <button
                    onClick={handleShare}
                    disabled={messages.length <= 1}
                    className="flex items-center justify-center space-x-2 bg-purple-600 text-white font-bold py-2 px-3 rounded-lg hover:bg-purple-700 transition-colors duration-300 text-sm disabled:bg-slate-600 disabled:cursor-not-allowed"
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
                        <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-cyan-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                            {msg.role === 'model' ? (
                                <div className="prose prose-sm prose-invert" dangerouslySetInnerHTML={{ __html: md.render(msg.text) }}></div>
                            ) : (
                                msg.text
                            )}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                         <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl bg-slate-700 text-slate-200 rounded-bl-none">
                            <Loader />
                         </div>
                    </div>
                )}
                 <div ref={messagesEndRef} />
            </div>
            <div className="flex-shrink-0 p-4 border-t border-slate-700 space-y-3">
                 <div className="flex flex-wrap gap-2">
                    {suggestions.map(suggestion => (
                        <button
                            key={suggestion}
                            onClick={() => setInput(suggestion)}
                            className="bg-slate-700 text-xs text-slate-300 px-3 py-1.5 rounded-full hover:bg-slate-600 transition"
                            disabled={loading}
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
                <form onSubmit={handleSubmit} className="flex space-x-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask me anything..."
                        className="flex-grow bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                        disabled={loading}
                    />
                    <button type="submit" disabled={loading || !input.trim()} className="bg-cyan-500 text-white font-bold p-3 rounded-lg hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chatbot;
