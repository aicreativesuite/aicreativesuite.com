
import React, { useState, useRef } from 'react';
import { generateVibeApp } from '../../services/geminiService';
import Loader from '../common/Loader';

interface VibeCodingProps {
    onShare: (options: { contentUrl?: string; contentText: string; contentType: 'text' }) => void;
}

const VibeCoding: React.FC<VibeCodingProps> = ({ onShare }) => {
    const [prompt, setPrompt] = useState('');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) {
            setError('Please describe your app idea.');
            return;
        }
        setLoading(true);
        setError(null);
        setCode('');

        try {
            const response = await generateVibeApp(prompt);
            let generatedCode = response.text;
            
            // Clean up potential markdown code blocks
            generatedCode = generatedCode.replace(/^```html\s*/, '').replace(/```$/, '');
            
            setCode(generatedCode);
        } catch (err) {
            setError('Failed to generate app code. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        const blob = new Blob([code], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'vibe-app.html';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="h-[calc(100vh-10rem)] flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4 h-full">
                {/* Left Panel: Controls & Code */}
                <div className="w-full md:w-1/3 flex flex-col gap-4">
                    <form onSubmit={handleSubmit} className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex-shrink-0">
                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                            <span className="text-yellow-400">⚡</span> Vibe Coding
                        </h3>
                        <p className="text-xs text-slate-400 mb-4">Describe an app, game, or tool, and watch it come to life.</p>
                        
                        <textarea 
                            rows={4}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-yellow-500 placeholder-slate-600 resize-none mb-3"
                            placeholder="e.g., A retro snake game with neon colors, or a Pomodoro timer with a cosmic background."
                        />
                        
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-bold py-3 px-4 rounded-lg hover:from-yellow-500 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex justify-center items-center space-x-2"
                        >
                            {loading ? <Loader /> : <span>Generate App</span>}
                        </button>
                        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
                    </form>

                    {code && (
                        <div className="flex-grow bg-slate-900 rounded-xl border border-slate-800 flex flex-col overflow-hidden">
                            <div className="p-2 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
                                <span className="text-xs font-mono text-slate-400">index.html</span>
                                <div className="flex gap-2">
                                    <button onClick={() => navigator.clipboard.writeText(code)} className="text-xs text-slate-400 hover:text-white">Copy</button>
                                    <button onClick={handleDownload} className="text-xs text-cyan-400 hover:text-cyan-300">Download</button>
                                </div>
                            </div>
                            <textarea 
                                readOnly
                                value={code}
                                className="flex-grow w-full bg-transparent p-3 text-xs font-mono text-slate-300 resize-none focus:outline-none"
                            />
                        </div>
                    )}
                </div>

                {/* Right Panel: Preview */}
                <div className="w-full md:w-2/3 bg-white rounded-xl overflow-hidden border border-slate-700 flex flex-col relative">
                    <div className="bg-slate-100 border-b border-slate-200 p-2 flex items-center gap-2">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>
                        <div className="flex-grow bg-white rounded-md h-6 mx-4 flex items-center px-2 text-xs text-gray-400 truncate">
                            localhost:3000
                        </div>
                    </div>
                    
                    {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
                            <Loader message="Coding your vibe..." />
                        </div>
                    ) : !code ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 text-slate-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                            <p>Your app preview will appear here.</p>
                        </div>
                    ) : (
                        <iframe 
                            ref={iframeRef}
                            srcDoc={code}
                            title="App Preview"
                            className="flex-grow w-full h-full bg-white"
                            sandbox="allow-scripts allow-modals"
                        />
                    )}
                    
                    {code && (
                        <div className="absolute bottom-4 right-4">
                             <button 
                                onClick={() => onShare({ contentText: code, contentType: 'text' })}
                                className="bg-slate-900/90 text-white text-xs font-bold py-2 px-4 rounded-full hover:bg-black shadow-lg backdrop-blur-sm transition"
                            >
                                Share Code
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VibeCoding;
