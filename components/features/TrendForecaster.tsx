
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
        <div className="max-w-5xl mx-auto space-y-8">
             <div className="bg-gradient-to-r from-indigo-900 to-blue-900 rounded-2xl p-8 border border-indigo-700 text-center shadow-xl">
                <h2 className="text-3xl font-bold text-white mb-2">Future Trend Radar</h2>
                <p className="text-indigo-200">Leverage real-time search data and AI reasoning to spot emerging opportunities.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-4">
                <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="flex-grow bg-slate-800 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-indigo-500 text-lg"
                    placeholder="Enter an Industry or Topic (e.g., Sustainable Fashion, Remote Work, EV Batteries)"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 whitespace-nowrap"
                >
                    {loading ? 'Analyzing...' : 'Forecast Trends'}
                </button>
            </form>
            
            {error && <p className="text-red-400 text-center">{error}</p>}

            {loading && (
                <div className="py-12">
                    <Loader message="Scanning global data streams..." />
                </div>
            )}

            {report && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-8 shadow-lg">
                            <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
                                <h3 className="text-2xl font-bold text-white">Strategic Forecast</h3>
                                <button 
                                    onClick={() => onShare({ contentText: report, contentType: 'text' })}
                                    className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-4 rounded-lg transition"
                                >
                                    Share Report
                                </button>
                            </div>
                            <div className="prose prose-invert max-w-none prose-headings:text-indigo-300 prose-strong:text-white prose-li:marker:text-indigo-500">
                                <div dangerouslySetInnerHTML={{ __html: md.render(report) }}></div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                            <h4 className="font-bold text-white mb-4 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                                Sources & Signals
                            </h4>
                            {sources.length > 0 ? (
                                <ul className="space-y-3">
                                    {sources.map((chunk, i) => (
                                        chunk.web && (
                                            <li key={i} className="text-sm">
                                                <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="block p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition group">
                                                    <p className="font-semibold text-indigo-300 group-hover:text-white truncate">{chunk.web.title}</p>
                                                    <p className="text-slate-400 text-xs truncate mt-1">{chunk.web.uri}</p>
                                                </a>
                                            </li>
                                        )
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-slate-500 text-sm">No specific web sources cited directly, but analysis is based on general knowledge.</p>
                            )}
                        </div>
                        
                         <div className="bg-gradient-to-br from-slate-800 to-indigo-900/20 border border-slate-700 rounded-xl p-6">
                            <h4 className="font-bold text-white mb-2">Pro Tip</h4>
                            <p className="text-sm text-slate-300">Use these insights to guide your "Marketing Assistant" content strategy or generate "Viral Memes" about the emerging trends.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrendForecaster;
