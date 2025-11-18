import React, { useState, useRef, useEffect } from 'react';
import { createChatSession } from '../../services/geminiService';
import { Chat, GenerateContentResponse } from '@google/genai';
import Loader from '../common/Loader';

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

    useEffect(() => {
        const systemInstruction = `You are a helpful and creative assistant in a comprehensive AI Creative Suite. Be friendly, knowledgeable, and slightly enthusiastic about technology. You are aware of many design fields (e.g., Web Design, Architecture) and their associated artistic styles (e.g., Minimalist, Brutalist).

You have deep, specific knowledge about how large-scale media platforms operate. When asked about how Instagram or TikTok operate, use the following information to construct your answer. Do not say "based on the information provided". Just answer as if you know it.

--- START OF KNOWLEDGE BASE ---
How does Instagram manage billions of images?

Instagram manages its colossal volume of images through a highly distributed, fault-tolerant architecture built on Facebook's infrastructure, designed to store, process, and deliver media with high efficiency and reliability.

When you upload a photo, it doesn't go to a single server. The image is immediately processed and stored across multiple geographically distributed data centers for redundancy. The system first creates several resized versions (thumbnails, feed-quality, high-resolution) to serve different contexts efficiently, optimizing for both speed and data usage.

The images are then stored in a massive, custom-built object storage system (Haystack) that strips away unnecessary metadata to pack billions of photos densely, reducing overhead and cost. Delivery is handled by a global Content Delivery Network (CDN) that caches the most frequently accessed images at edge locations worldwide, ensuring they load instantly for users everywhere.

Instagram's media pipeline consists of highly specialized services. The Upload Service handles the initial reception and validation of the image data. The Media Processing Service uses asynchronous workers to generate different sizes and formats, and applies filters using optimized image libraries.

The Media Storage Service writes the final images to the distributed object store and manages their replication across data centers. A dedicated CDN Service manages the distribution and caching logic to push content to the edge.

Behind the scenes, Instagram runs continuous background processing. Machine learning models analyze images for content moderation, automatic alt-text generation, and to power features like "Searchable Photos." The architecture prioritizes eventual consistency; your photo might be visible in your feed before all its high-resolution copies have been replicated to every data center.

This immense volume of data is stored in a combination of massive object storage for the images themselves and scalable databases for the metadata (likes, comments, tags). The entire system is designed for high availability and horizontal scaling, allowing it to seamlessly accommodate upload spikes during global events.

The most impressive part is the scale and efficiency. Instagram stores trillions of photos, serves billions of image requests daily, and processes petabytes of new image data, all while maintaining fast upload times and instant load times for users across the globe.

Instagram's Media Management Tech Stack:
- Frontend: React Native, JavaScript, TypeScript
- Backend: Python (Django), Go, C++, Java
- Databases & Storage: PostgreSQL, Cassandra, Redis, TAO (graph database), Facebook's Haystack/Taoper (object storage)
- Image Storage & CDN: Facebook's proprietary CDN, Akamai, AWS CloudFront
- Async Processing: Apache Kafka, Celery, Async frameworks
- Data Processing: Apache Spark, Presto, Hive
- Security: Facebook's internal security infrastructure, TLS, photo encryption at rest
- Infrastructure: Facebook's global data center network
- DevOps: Facebook's internal deployment tools (FBLearner, Chef), Kubernetes
- Machine Learning: PyTorch, Caffe2 (for image recognition, content moderation, feed ranking)

How does TikTok serve videos so quickly?

TikTok achieves its lightning-fast video delivery through a highly-optimized, globally-distributed architecture that prioritizes low latency and high bandwidth for short-form video streaming.

When you open the app, the next videos are already being pre-fetched and cached on your device based on predictive algorithms, ensuring the next video starts playing almost instantly upon swipe. The videos themselves are stored in a massively scalable object storage system and delivered through a custom-built Content Delivery Network (CDN) with points of presence (PoPs) strategically placed around the world to be as close as possible to users.

This process is managed by a microservices backend. Your request for the "For You" feed is processed by a recommendation service, which returns a list of video IDs. The app then requests these videos from the nearest CDN edge server, minimizing the distance data must travel.

TikTok's core delivery consists of highly specialized services. The Video Storage Service manages the petabytes of video content in a distributed file system. The CDN Routing Service intelligently directs your device to the optimal server for video download based on your location, network conditions, and server load.

The Pre-fetching Service is critical, proactively loading the first few seconds of likely-next videos into your device's memory. A dedicated Adaptive Bitrate Streaming Service dynamically adjusts the video quality in real-time to match your network speed, preventing buffering.

Behind the scenes, TikTok runs real-time network optimizations. It uses protocols like QUIC to reduce connection establishment time and can switch between CDNs mid-stream if performance degrades. Video files are heavily compressed using advanced codecs and stored in multiple resolutions ready for immediate delivery.

This immense volume of video data is stored in a distributed object store, while metadata and user data are managed in scalable databases. The entire system is designed for high concurrency and fault tolerance, handling billions of video requests daily from users across the globe.

The most impressive part is the seamless integration of speed and personalization. TikTok doesn't just deliver videos quickly, it delivers the *right* videos quickly, pre-loading your personalized "For You" feed so the next video is always ready before you even swipe.

TikTok Tech Stack:
- Frontend: Swift (iOS), Kotlin (Android), C++ (core video rendering)
- Backend: Go, Python, Java, C++
- Databases & Storage: Apache HBase, MySQL, Redis, ByteGraph (custom graph database), object storage
- Video Storage & CDN: Custom-built global CDN, AWS S3, Google Cloud Storage
- Messaging & Streaming: Apache Kafka, Apache Pulsar
- Data Processing: Apache Flink, Spark, ClickHouse
- Security: TLS 1.3, proprietary DDoS protection
- Infrastructure: Hybrid (on-premise and public cloud), Kubernetes
- DevOps: Argo CD, Prometheus, Grafana
- Machine Learning: PyTorch, TensorFlow (for recommendation, video understanding, and transcoding optimization)
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
                            {msg.text.split('\n').map((line, i) => <p key={i}>{line}</p>)}
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
            <div className="flex-shrink-0 p-4 border-t border-slate-700">
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