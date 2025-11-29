
import React, { useState } from 'react';
import { expandContent } from '../../services/geminiService';
import { EXPANDED_CONTENT_TYPES, CONTENT_TONES } from '../../constants';
import Loader from '../common/Loader';
import { Remarkable } from 'remarkable';

const md = new Remarkable({ html: true });

interface ContentGeneratorProps {
    onShare: (options: { contentText: string; contentType: 'text' }) => void;
}

const ContentGenerator: React.FC<ContentGeneratorProps> = ({ onShare }) => {
    const [topic, setTopic] = useState('');
    const [contentType, setContentType] = useState(EXPANDED_CONTENT_TYPES[0]);
    const [tone, setTone] = useState(CONTENT_TONES[0]);
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic) {
            setError('Please enter a topic or idea.');
            return;
        }
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await expandContent(topic, contentType, tone);
            setResult(response.text);
        } catch (err) {
            setError('Failed to generate content. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (!result) return;
        const blob = new Blob([result], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `content_${contentType.replace(/\s+/g, '_')}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)] min-h-[600px]">
            {/* Sidebar Controls */}
            <div className="w-full lg:w-80 flex-shrink-0 bg-slate-900/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-800 overflow-y-auto custom-scrollbar">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="topic" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Topic / Idea</label>
                        <textarea
                            id="topic"
                            rows={6}
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500 placeholder-slate-600 resize-none transition"
                            placeholder="e.g., The benefits of remote work for small businesses"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="content-type" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Format</label>
                        <select
                            id="content-type"
                            value={contentType}
                            onChange={(e) => setContentType(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                        >
                            {EXPANDED_CONTENT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                    
                    <div>
                        <label htmlFor="tone" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tone</label>
                        <select
                            id="tone"
                            value={tone}
                            onChange={(e) => setTone(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                        >
                            {CONTENT_TONES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-xl transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                    >
                         {loading ? <Loader /> : 'Generate Content'}
                    </button>
                    {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                </form>
            </div>

            {/* Main Preview Area */}
            <div className="flex-grow bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col overflow-hidden relative">
                {/* Header */}
                <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                    <h3 className="font-bold text-white text-sm uppercase tracking-wider">Draft</h3>
                    {result && (
                        <div className="flex gap-2">
                             <button
                                onClick={handleDownload}
                                className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 px-3 rounded font-bold transition"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                <span>Download</span>
                            </button>
                            <button
                                onClick={() => onShare({ contentText: result, contentType: 'text' })}
                                className="flex items-center space-x-2 text-xs bg-purple-600 hover:bg-purple-500 text-white py-1.5 px-3 rounded font-bold transition"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
                                <span>Share</span>
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex-grow overflow-y-auto p-8 relative custom-scrollbar">
                    <div className="absolute inset-0 bg-grid-slate-800/20 pointer-events-none"></div>
                    
                    {loading && (
                        <div className="h-full flex flex-col items-center justify-center">
                            <Loader message="Expanding your ideas..." />
                        </div>
                    )}
                    
                    {!loading && !result && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-60">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                            <p className="text-lg">Generated content will appear here.</p>
                        </div>
                    )}

                    {result && (
                        <div className="relative z-10 max-w-4xl mx-auto">
                            <div className="bg-white text-slate-900 p-10 rounded-xl shadow-2xl prose prose-slate max-w-none">
                                <div dangerouslySetInnerHTML={{ __html: md.render(result) }}></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContentGenerator;
