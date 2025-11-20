
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
        <div className="max-w-7xl mx-auto space-y-10">
            {/* Header Section */}
            <div className="text-center space-y-4 py-8">
                <h2 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                    Trend Radar
                </h2>
                <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                    Real-time market intelligence powered by Google Search grounding.
                </p>
            </div>

            {/* Search Section */}
            <div className="max-w-3xl mx-auto">
                <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-6">
                    <div className="w-full relative group">
                         <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="relative w-full bg-slate-900 border border-slate-700 rounded-2xl p-6 text-center text-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 shadow-2xl"
                            placeholder="Enter industry, product, or topic..."
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full md:w-64 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-cyan-500/20"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center"><svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Scanning...</span>
                        ) : 'Generate Forecast'}
                    </button>
                </form>
                 {error && <div className="mt-4 bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-lg text-center">{error}</div>}
            </div>

             {/* Empty State Suggestions */}
            {!loading && !report && !error && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 opacity-60">
                    {['Sustainable Tech', 'AI in Healthcare', 'Micro-Learning', 'Smart Home 2.0'].map(t => (
                        <button key={t} onClick={() => setTopic(t)} className="p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 rounded-lg text-sm text-slate-400 hover:text-white transition text-center">
                            {t}
                        </button>
                    ))}
                </div>
            )}


            {/* Results Section */}
            {loading && (
                <div className="py-20 flex flex-col items-center justify-center">
                    <Loader message="Analyzing global signals..." />
                </div>
            )}

            {report && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in pb-12">
                    {/* Main Report */}
                    <div className="lg:col-span-2 bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-3xl p-8 shadow-2xl">
                        <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-white flex items-center">
                                    <span className="bg-cyan-500/10 text-cyan-400 p-2 rounded-lg mr-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                    </span>
                                    Trend Report
                                </h3>
                            </div>
                            <button 
                                onClick={() => onShare({ contentText: report, contentType: 'text' })}
                                className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition"
                            >
                                Share Report
                            </button>
                        </div>
                        <div className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-slate-300 prose-a:text-cyan-400 prose-li:text-slate-300">
                            <div dangerouslySetInnerHTML={{ __html: md.render(report) }}></div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                Live Signals
                            </h4>
                            {sources.length > 0 ? (
                                <div className="space-y-3">
                                    {sources.map((chunk, i) => (
                                        chunk.web && (
                                            <a key={i} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="block group">
                                                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 hover:border-cyan-500/30 transition">
                                                    <p className="text-sm font-medium text-white group-hover:text-cyan-400 line-clamp-2 transition-colors">{chunk.web.title}</p>
                                                    <p className="text-xs text-slate-500 mt-1 truncate">{new URL(chunk.web.uri).hostname}</p>
                                                </div>
                                            </a>
                                        )
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500">No external signals detected.</p>
                            )}
                        </div>

                        <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-2xl p-6">
                            <h4 className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-2">Strategic Tip</h4>
                            <p className="text-sm text-slate-300 leading-relaxed">
                                Use <strong>Marketing Assistant</strong> to turn these insights into a campaign, or <strong>App Launchpad</strong> to deploy a niche tool for this trend.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrendForecaster;
