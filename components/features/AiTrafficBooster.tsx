
import React, { useState } from 'react';
import { generateTrafficStrategy } from '../../services/geminiService';
import Loader from '../common/Loader';

interface AiTrafficBoosterProps {
    onShare: (options: { contentText: string; contentType: 'text' }) => void;
}

interface StrategySection {
    title: string;
    [key: string]: any;
}

interface StrategyResult {
    geoStrategy: StrategySection & { tactics: string[], citationContent: string[] };
    socialStrategy: StrategySection & { repurposingTactics: string[], viralHooks: string[] };
    technicalStrategy: StrategySection & { schemaMarkup: string[], analyticsTips: string[] };
    growthStrategy: StrategySection & { adTargeting: string[], uxPersonalization: string[] };
}

const AiTrafficBooster: React.FC<AiTrafficBoosterProps> = ({ onShare }) => {
    const [niche, setNiche] = useState('');
    const [audience, setAudience] = useState('');
    const [websiteUrl, setWebsiteUrl] = useState('');
    const [result, setResult] = useState<StrategyResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!niche || !audience) {
            setError('Please enter your Niche and Target Audience.');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await generateTrafficStrategy(niche, audience, websiteUrl);
            const parsedResult = JSON.parse(response.text);
            setResult(parsedResult);
        } catch (err) {
            setError('Failed to generate strategy. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };
    
    const formatShareText = (res: StrategyResult) => {
        return `
**AI Traffic Booster Strategy: The 10 Billion Visit Shortcut**
Target: ${niche} | ${audience}

**1. Content & GEO (Generative Engine Optimization)**
${res.geoStrategy.tactics.map(t => `- ${t}`).join('\n')}
*Citation Assets:* ${res.geoStrategy.citationContent.join(', ')}

**2. Social Dominance**
${res.socialStrategy.repurposingTactics.map(t => `- ${t}`).join('\n')}
*Hooks:* ${res.socialStrategy.viralHooks.join(', ')}

**3. Technical Foundation**
${res.technicalStrategy.schemaMarkup.map(t => `- ${t}`).join('\n')}
*Tracking:* ${res.technicalStrategy.analyticsTips.join(', ')}

**4. Paid Growth & UX**
${res.growthStrategy.adTargeting.map(t => `- ${t}`).join('\n')}
*Personalization:* ${res.growthStrategy.uxPersonalization.join(', ')}
        `.trim();
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)] min-h-[600px]">
            {/* Sidebar Controls */}
            <div className="w-full lg:w-80 flex-shrink-0 bg-slate-900/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-800 overflow-y-auto custom-scrollbar">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-white mb-2">Strategy Setup</h3>
                        <p className="text-xs text-slate-400">Optimize for AI Search (GEO) and modern distribution channels.</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Niche / Industry</label>
                        <input
                            type="text"
                            value={niche}
                            onChange={(e) => setNiche(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500"
                            placeholder="e.g., AI Productivity"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Target Audience</label>
                        <input
                            type="text"
                            value={audience}
                            onChange={(e) => setAudience(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500"
                            placeholder="e.g., Remote Workers"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Website (Optional)</label>
                        <input
                            type="url"
                            value={websiteUrl}
                            onChange={(e) => setWebsiteUrl(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500"
                            placeholder="https://yourbrand.com"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-bold py-3 px-4 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg flex justify-center items-center gap-2"
                    >
                        {loading ? <Loader /> : <span>Generate Roadmap</span>}
                    </button>
                    {error && <p className="text-red-400 text-xs text-center bg-red-900/20 p-2 rounded">{error}</p>}
                </form>
            </div>

            {/* Main Result Area */}
            <div className="flex-grow bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col overflow-hidden relative">
                <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                    <h3 className="font-bold text-white text-sm uppercase tracking-wider">Growth Roadmap</h3>
                    {result && (
                        <button
                            onClick={() => onShare({ contentText: formatShareText(result), contentType: 'text' })}
                            className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded font-bold transition"
                        >
                            Share Strategy
                        </button>
                    )}
                </div>

                <div className="flex-grow p-8 overflow-y-auto relative custom-scrollbar">
                    <div className="absolute inset-0 bg-grid-slate-800/20 pointer-events-none"></div>
                    
                    {loading && (
                        <div className="h-full flex flex-col items-center justify-center">
                            <Loader message="Consulting AI Marketing Experts..." />
                        </div>
                    )}

                    {!loading && !result && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-60">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                            <p className="text-lg">Define your market to generate a strategy.</p>
                        </div>
                    )}

                    {result && (
                        <div className="space-y-6 relative z-10 max-w-5xl mx-auto animate-fadeIn">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Card 1: GEO & Content */}
                                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-md">
                                    <div className="flex items-center mb-4 text-cyan-400">
                                        <div className="p-2 bg-cyan-400/10 rounded-lg mr-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        </div>
                                        <h3 className="text-lg font-bold text-white">1. Content & GEO</h3>
                                    </div>
                                    <ul className="space-y-2 mb-4 text-slate-300 list-disc list-inside text-sm">
                                        {result.geoStrategy.tactics.map((t, i) => <li key={i}>{t}</li>)}
                                    </ul>
                                    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                                        <h4 className="text-[10px] font-bold text-cyan-500 uppercase mb-2">Assets</h4>
                                        <ul className="space-y-1">
                                            {result.geoStrategy.citationContent.map((idea, i) => (
                                                <li key={i} className="text-xs text-slate-400 flex justify-between group">
                                                    <span>{idea}</span>
                                                    <button onClick={() => handleCopy(idea)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-white transition-opacity" title="Copy">📋</button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* Card 2: Social */}
                                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-md">
                                    <div className="flex items-center mb-4 text-purple-400">
                                        <div className="p-2 bg-purple-400/10 rounded-lg mr-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
                                        </div>
                                        <h3 className="text-lg font-bold text-white">2. Social Dominance</h3>
                                    </div>
                                    <ul className="space-y-2 mb-4 text-slate-300 list-disc list-inside text-sm">
                                        {result.socialStrategy.repurposingTactics.map((t, i) => <li key={i}>{t}</li>)}
                                    </ul>
                                    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                                        <h4 className="text-[10px] font-bold text-purple-500 uppercase mb-2">Viral Hooks</h4>
                                        <ul className="space-y-1">
                                            {result.socialStrategy.viralHooks.map((hook, i) => (
                                                <li key={i} className="text-xs text-slate-400 flex justify-between group">
                                                    <span>"{hook}"</span>
                                                    <button onClick={() => handleCopy(hook)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-white transition-opacity" title="Copy">📋</button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* Card 3: Technical */}
                                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-md">
                                    <div className="flex items-center mb-4 text-green-400">
                                        <div className="p-2 bg-green-400/10 rounded-lg mr-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                                        </div>
                                        <h3 className="text-lg font-bold text-white">3. Technical Foundation</h3>
                                    </div>
                                    <ul className="space-y-2 mb-4 text-slate-300 list-disc list-inside text-sm">
                                        {result.technicalStrategy.analyticsTips.map((t, i) => <li key={i}>{t}</li>)}
                                    </ul>
                                    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                                        <h4 className="text-[10px] font-bold text-green-500 uppercase mb-2">Schema</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {result.technicalStrategy.schemaMarkup.map((schema, i) => (
                                                <span key={i} className="text-[10px] bg-green-900/30 text-green-200 px-2 py-1 rounded border border-green-700/50">{schema}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Card 4: Paid Growth */}
                                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-md">
                                    <div className="flex items-center mb-4 text-amber-400">
                                        <div className="p-2 bg-amber-400/10 rounded-lg mr-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </div>
                                        <h3 className="text-lg font-bold text-white">4. Growth & UX</h3>
                                    </div>
                                    <ul className="space-y-2 mb-4 text-slate-300 list-disc list-inside text-sm">
                                        {result.growthStrategy.adTargeting.map((t, i) => <li key={i}>{t}</li>)}
                                    </ul>
                                     <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                                        <h4 className="text-[10px] font-bold text-amber-500 uppercase mb-2">Personalization</h4>
                                        <ul className="space-y-1">
                                            {result.growthStrategy.uxPersonalization.map((idea, i) => (
                                                <li key={i} className="text-xs text-slate-400 flex justify-between">
                                                    <span>{idea}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AiTrafficBooster;
