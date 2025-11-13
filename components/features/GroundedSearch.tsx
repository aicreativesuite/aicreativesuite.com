
import React, { useState, useEffect } from 'react';
import { performGroundedSearch } from '../../services/geminiService';
import Loader from '../common/Loader';
import { GenerateContentResponse, GroundingChunk } from '@google/genai';
import { Remarkable } from 'remarkable';

const md = new Remarkable({ html: true });

const GroundingChunkDisplay: React.FC<{ chunk: GroundingChunk }> = ({ chunk }) => {
    if (chunk.web) {
        return (
            <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="block p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-sm">
                <p className="font-semibold text-cyan-400 truncate">{chunk.web.title}</p>
                <p className="text-slate-400 text-xs truncate">{chunk.web.uri}</p>
            </a>
        );
    }
    if (chunk.maps) {
        return (
            <a href={chunk.maps.uri} target="_blank" rel="noopener noreferrer" className="block p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-sm">
                 <p className="font-semibold text-cyan-400 truncate">{chunk.maps.title}</p>
                 <p className="text-slate-400 text-xs truncate">{(chunk.maps.placeAnswerSources?.reviewSnippets?.[0] as any)?.snippet ?? 'View on Google Maps'}</p>
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
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                    rows={3}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                    placeholder="Ask something recent, like 'Who won the big game last night?' or 'What are good cafes near me?'"
                />
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input
                            id="use-maps"
                            type="checkbox"
                            checked={useMaps}
                            onChange={(e) => setUseMaps(e.target.checked)}
                            className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-cyan-600 focus:ring-cyan-500"
                        />
                        <label htmlFor="use-maps" className="ml-2 block text-sm text-slate-300">
                            Use Google Maps (requires location permission)
                        </label>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-300"
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </div>
                 {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </form>

            <div className="min-h-[300px] bg-slate-900/50 rounded-lg p-6 relative">
                {loading && <Loader message="Searching for real-time information..." />}
                {!loading && !response && <p className="text-slate-500 text-center pt-10">Your grounded answer will appear here.</p>}
                {response && (
                    <>
                        <div className="absolute top-6 right-6">
                            <button
                                onClick={() => onShare({ contentText: response.text, contentType: 'text' })}
                                className="flex items-center justify-center space-x-2 bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-300"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                                </svg>
                                <span>Share</span>
                            </button>
                        </div>
                        <div className="prose prose-invert prose-p:text-slate-300 prose-headings:text-white prose-a:text-cyan-400 max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: md.render(response.text) }}></div>

                        {groundingChunks && groundingChunks.length > 0 && (
                            <div className="mt-8 border-t border-slate-700 pt-4">
                                <h4 className="font-semibold text-lg text-slate-200 mb-3">Sources</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {groundingChunks.map((chunk, index) => (
                                        <GroundingChunkDisplay key={index} chunk={chunk} />
                                    ))}
                                </div>
                            </div>
                        )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default GroundedSearch;
