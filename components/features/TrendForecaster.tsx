
import React, { useState } from 'react';
import { generateTrendReport } from '../../services/geminiService';
import Loader from '../common/Loader';
import { Remarkable } from 'remarkable';
import { GroundingChunk } from '@google/genai';

const md = new Remarkable({ html: true });

interface TrendForecasterProps {
    onShare: (options: { contentText: string; contentType: 'text' }) => void;
}

const TrendForecaster: React.FC<TrendForecasterProps> = ({ onShare }) => {
    const [topic, setTopic] = useState('');
    const [report, setReport] = useState<string | null>(null);
    const [sources, setSources] = useState<GroundingChunk[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim()) {
            setError('Please enter a topic or industry.');
            return;
        }
        setLoading(true);
        setError(null);
        setReport(null);
        setSources([]);

        try {
            const response = await generateTrendReport(topic);
            setReport(response.text);
            const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
            setSources(chunks);
        } catch (err) {
            setError('Failed to generate trend report. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)] min-h-[600px]">
            {/* Sidebar Controls */}
            <div className="w-full lg:w-80 flex-shrink-0 bg-slate-900/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-800 overflow-y-auto custom-scrollbar flex flex-col gap-6">
                <div>
                    <h3 className="text-xl font-bold text-white mb-1">Trend Radar</h3>
                    <p className="text-xs text-slate-400">Real-time market intelligence.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 flex-grow">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Topic / Industry</label>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500 placeholder-slate-600"
                            placeholder="e.g., AI in Healthcare"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-bold py-3 rounded-xl hover:from-cyan-500 hover:to-purple-500 transition shadow-lg disabled:opacity-50 flex justify-center"
                    >
                        {loading ? <Loader /> : 'Generate Forecast'}
                    </button>
                    {error && <p className="text-red-400 text-xs text-center bg-red-900/20 p-2 rounded">{error}</p>}
                </form>

                {/* Signals Sidebar Widget */}
                {sources.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-800">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Live Signals</h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                            {sources.map((chunk, i) => (
                                chunk.web && (
                                    <a key={i} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="block group p-2 bg-slate-800 rounded hover:bg-slate-700 transition">
                                        <p className="text-[10px] font-medium text-white group-hover:text-cyan-400 line-clamp-2">{chunk.web.title}</p>
                                        <p className="text-[9px] text-slate-500 mt-0.5 truncate">{new URL(chunk.web.uri).hostname}</p>
                                    </a>
                                )
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Main Report Area */}
            <div className="flex-grow bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col overflow-hidden relative">
                <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                    <h3 className="font-bold text-white text-sm uppercase tracking-wider">Report</h3>
                    {report && (
                        <button 
                            onClick={() => onShare({ contentText: report, contentType: 'text' })}
                            className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded font-bold transition"
                        >
                            Share
                        </button>
                    )}
                </div>

                <div className="flex-grow p-8 overflow-y-auto custom-scrollbar relative">
                    <div className="absolute inset-0 bg-grid-slate-800/20 pointer-events-none"></div>
                    
                    {loading && (
                        <div className="h-full flex flex-col items-center justify-center">
                            <Loader message="Scanning global trends..." />
                        </div>
                    )}

                    {!loading && !report && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-60">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                            <p className="text-lg">Enter a topic to forecast trends.</p>
                        </div>
                    )}

                    {report && (
                        <div className="max-w-4xl mx-auto bg-slate-900/80 backdrop-blur-md p-8 rounded-xl border border-slate-700 shadow-2xl relative z-10 prose prose-invert prose-sm max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: md.render(report) }}></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrendForecaster;
