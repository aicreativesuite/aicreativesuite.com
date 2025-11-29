
import React, { useState, useEffect } from 'react';
import { performGroundedSearch } from '../../services/geminiService';
import Loader from '../common/Loader';
import { GenerateContentResponse, GroundingChunk } from '@google/genai';
import { Remarkable } from 'remarkable';

const md = new Remarkable({ html: true });

const GroundingChunkDisplay: React.FC<{ chunk: GroundingChunk }> = ({ chunk }) => {
    if (chunk.web) {
        return (
            <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="block p-3 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors text-sm group">
                <p className="font-bold text-cyan-400 truncate group-hover:text-cyan-300">{chunk.web.title}</p>
                <p className="text-slate-500 text-xs truncate mt-1">{chunk.web.uri}</p>
            </a>
        );
    }
    if (chunk.maps) {
        return (
            <a href={chunk.maps.uri} target="_blank" rel="noopener noreferrer" className="block p-3 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors text-sm group">
                 <p className="font-bold text-green-400 truncate group-hover:text-green-300">{chunk.maps.title}</p>
                 <p className="text-slate-400 text-xs truncate mt-1">{(chunk.maps.placeAnswerSources?.reviewSnippets?.[0] as any)?.snippet ?? 'View on Google Maps'}</p>
            </a>
        );
    }
    return null;
};

interface GroundedSearchProps {
    onShare: (options: { contentText: string; contentType: 'text' }) => void;
}

const GroundedSearch: React.FC<GroundedSearchProps> = ({ onShare }) => {
    const [prompt, setPrompt] = useState('');
    const [useMaps, setUseMaps] = useState(false);
    const [location, setLocation] = useState<{ latitude: number, longitude: number } | null>(null);
    const [response, setResponse] = useState<GenerateContentResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (useMaps && !location) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                (geoError) => {
                    setError('Could not get location. Please enable location services in your browser.');
                    setUseMaps(false);
                }
            );
        }
    }, [useMaps, location]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt) {
            setError('Please enter a query.');
            return;
        }
        setLoading(true);
        setError(null);
        setResponse(null);

        try {
            const result = await performGroundedSearch(prompt, useMaps, location ?? undefined);
            setResponse(result);
        } catch (err) {
            setError('Failed to get a grounded response. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
    const groundingChunks = response?.candidates?.[0]?.groundingMetadata?.groundingChunks;

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)] min-h-[600px]">
            {/* Sidebar Controls */}
            <div className="w-full lg:w-80 flex-shrink-0 bg-slate-900/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-800 overflow-y-auto custom-scrollbar">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Search Query</label>
                        <textarea
                            rows={6}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500 placeholder-slate-600 resize-none transition"
                            placeholder="e.g., 'Who won the big game last night?' or 'Best Italian restaurants nearby'"
                        />
                    </div>

                    <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                        <div className="flex items-center">
                            <input
                                id="use-maps"
                                type="checkbox"
                                checked={useMaps}
                                onChange={(e) => setUseMaps(e.target.checked)}
                                className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-cyan-600 focus:ring-cyan-500"
                            />
                            <label htmlFor="use-maps" className="ml-2 block text-sm text-slate-300 font-medium">
                                Use Google Maps
                            </label>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 ml-6">Requires location permission for local results.</p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                        {loading ? <Loader /> : 'Search with Grounding'}
                    </button>
                    {error && <p className="text-red-400 text-xs text-center bg-red-900/20 p-2 rounded">{error}</p>}
                </form>
            </div>

            {/* Main Result Area */}
            <div className="flex-grow bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col overflow-hidden relative">
                {/* Header */}
                <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                    <h3 className="font-bold text-white text-sm uppercase tracking-wider">Results</h3>
                    {response && (
                        <button 
                            onClick={() => onShare({ contentText: response.text, contentType: 'text' })}
                            className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded font-bold transition"
                        >
                            Share Answer
                        </button>
                    )}
                </div>

                <div className="flex-grow overflow-y-auto p-8 relative custom-scrollbar">
                    <div className="absolute inset-0 bg-grid-slate-800/20 pointer-events-none"></div>
                    
                    {loading && (
                        <div className="h-full flex flex-col items-center justify-center">
                            <Loader message="Searching real-time sources..." />
                        </div>
                    )}

                    {!loading && !response && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-60">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <p className="text-lg">Enter a query to get grounded answers.</p>
                        </div>
                    )}

                    {response && (
                        <div className="relative z-10 max-w-4xl mx-auto">
                            <div className="bg-white text-slate-900 p-8 rounded-xl shadow-xl prose prose-sm max-w-none">
                                <div dangerouslySetInnerHTML={{ __html: md.render(response.text) }}></div>
                            </div>

                            {groundingChunks && groundingChunks.length > 0 && (
                                <div className="mt-8">
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Grounding Sources</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {groundingChunks.map((chunk, index) => (
                                            <GroundingChunkDisplay key={index} chunk={chunk} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GroundedSearch;
