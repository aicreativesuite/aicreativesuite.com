
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
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Controls */}
            <div className="w-full lg:w-1/3 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4 bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                    <h3 className="text-xl font-bold text-white mb-4">Content Generator</h3>
                    <fieldset disabled={loading} className="space-y-4">
                        <div>
                            <label htmlFor="topic" className="block text-sm font-medium text-slate-300 mb-2">Topic / Idea</label>
                            <textarea
                                id="topic"
                                rows={4}
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white"
                                placeholder="e.g., The benefits of remote work for small businesses"
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="content-type" className="block text-sm font-medium text-slate-300 mb-2">Content Type</label>
                                <select
                                    id="content-type"
                                    value={contentType}
                                    onChange={(e) => setContentType(e.target.value)}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white"
                                >
                                    {EXPANDED_CONTENT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                </select>
                            </div>
                             <div>
                                <label htmlFor="tone" className="block text-sm font-medium text-slate-300 mb-2">Tone of Voice</label>
                                <select
                                    id="tone"
                                    value={tone}
                                    onChange={(e) => setTone(e.target.value)}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white"
                                >
                                    {CONTENT_TONES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 disabled:bg-slate-600">
                            {loading ? 'Generating...' : 'Generate Content'}
                        </button>
                        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                    </fieldset>
                </form>
            </div>

            {/* Result */}
            <div className="w-full lg:w-2/3 flex flex-col bg-slate-800/50 rounded-lg border border-slate-700 min-h-[400px]">
                <div className="flex-shrink-0 p-4 border-b border-slate-700 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-white">Generated Content</h3>
                    {result && (
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={handleDownload}
                                className="flex items-center space-x-1 bg-slate-700 text-white font-bold py-2 px-3 rounded-lg hover:bg-slate-600 transition-colors duration-300 text-sm"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                <span>Download</span>
                            </button>
                            <button
                                onClick={() => onShare({ contentText: result, contentType: 'text' })}
                                className="flex items-center space-x-1 bg-purple-600 text-white font-bold py-2 px-3 rounded-lg hover:bg-purple-700 transition-colors duration-300 text-sm"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                                </svg>
                                <span>Share</span>
                            </button>
                             <button
                                onClick={() => setResult(null)}
                                className="flex items-center space-x-1 bg-red-900/50 text-red-200 font-bold py-2 px-3 rounded-lg hover:bg-red-900/70 transition-colors duration-300 text-sm"
                                title="Discard"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            </button>
                        </div>
                    )}
                </div>
                <div className="flex-grow p-6 overflow-y-auto">
                    {loading && <Loader message="Writing your content..." />}
                    {!loading && !result && <div className="flex items-center justify-center h-full"><p className="text-slate-500">Your generated content will appear here.</p></div>}
                    {result && (
                        <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: md.render(result) }}></div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContentGenerator;
