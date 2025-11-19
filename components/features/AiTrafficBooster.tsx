
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
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 border border-slate-700 text-center shadow-xl">
                <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-4">
                    The 10 Billion Visit Shortcut
                </h2>
                <p className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
                    Stop chasing algorithms. Start optimizing for the new era of AI Search (GEO) and hyper-efficient distribution. 
                    Generate a complete 4-pillar roadmap to capture your slice of the global traffic pie.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 space-y-6 shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Niche / Industry</label>
                        <input
                            type="text"
                            value={niche}
                            onChange={(e) => setNiche(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 transition-all"
                            placeholder="e.g., AI Productivity Tools, Organic Coffee"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Target Audience</label>
                        <input
                            type="text"
                            value={audience}
                            onChange={(e) => setAudience(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 transition-all"
                            placeholder="e.g., Remote Workers, Coffee Connoisseurs"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Website URL (Optional)</label>
                    <input
                        type="url"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 transition-all"
                        placeholder="https://yourbrand.com"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-bold py-4 px-6 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-cyan-500/20 flex justify-center items-center space-x-2"
                >
                    {loading ? (
                        <><span>Analyzing Market...</span></>
                    ) : (
                        <><span>Generate 10 Billion Visit Strategy</span></>
                    )}
                </button>
                {error && <p className="text-red-400 text-center font-medium">{error}</p>}
            </form>

            {loading && <Loader message="Consulting AI Marketing Experts to build your roadmap..." />}

            {result && (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold text-white">Your Custom Roadmap</h3>
                         <button
                            onClick={() => onShare({ contentText: formatShareText(result), contentType: 'text' })}
                            className="flex items-center space-x-2 bg-slate-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-600 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                            </svg>
                            <span>Share Strategy</span>
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Card 1: GEO & Content */}
                        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-cyan-500/50 transition-all shadow-md">
                            <div className="flex items-center mb-4 text-cyan-400">
                                <div className="p-2 bg-cyan-400/10 rounded-lg mr-3">
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                </div>
                                <h3 className="text-xl font-bold text-white">1. Content & GEO</h3>
                            </div>
                            <p className="text-xs text-slate-400 mb-4 uppercase tracking-wider font-semibold">Optimize for AI Search (Google SGE, ChatGPT)</p>
                            <ul className="space-y-2 mb-4 text-slate-300 list-disc list-inside">
                                {result.geoStrategy.tactics.map((t, i) => <li key={i}>{t}</li>)}
                            </ul>
                            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                                <h4 className="text-xs font-bold text-cyan-500 uppercase mb-2">Citation-Worthy Assets</h4>
                                <ul className="space-y-1">
                                    {result.geoStrategy.citationContent.map((idea, i) => (
                                        <li key={i} className="text-sm text-slate-300 flex justify-between group">
                                            <span>{idea}</span>
                                            <button onClick={() => handleCopy(idea)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-white transition-opacity" title="Copy"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" /></svg></button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Card 2: Social Distribution */}
                        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-purple-500/50 transition-all shadow-md">
                            <div className="flex items-center mb-4 text-purple-400">
                                <div className="p-2 bg-purple-400/10 rounded-lg mr-3">
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
                                </div>
                                <h3 className="text-xl font-bold text-white">2. Social Dominance</h3>
                            </div>
                             <p className="text-xs text-slate-400 mb-4 uppercase tracking-wider font-semibold">Viral Distribution & Repurposing</p>
                            <ul className="space-y-2 mb-4 text-slate-300 list-disc list-inside">
                                {result.socialStrategy.repurposingTactics.map((t, i) => <li key={i}>{t}</li>)}
                            </ul>
                            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                                <h4 className="text-xs font-bold text-purple-500 uppercase mb-2">Viral Hooks</h4>
                                <ul className="space-y-1">
                                    {result.socialStrategy.viralHooks.map((hook, i) => (
                                        <li key={i} className="text-sm text-slate-300 flex justify-between group">
                                            <span>"{hook}"</span>
                                            <button onClick={() => handleCopy(hook)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-white transition-opacity" title="Copy"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" /></svg></button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Card 3: Technical & Analytics */}
                        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-green-500/50 transition-all shadow-md">
                            <div className="flex items-center mb-4 text-green-400">
                                <div className="p-2 bg-green-400/10 rounded-lg mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                                </div>
                                <h3 className="text-xl font-bold text-white">3. Technical Foundation</h3>
                            </div>
                            <p className="text-xs text-slate-400 mb-4 uppercase tracking-wider font-semibold">Schema Markup & AI Tracking</p>
                            <ul className="space-y-2 mb-4 text-slate-300 list-disc list-inside">
                                {result.technicalStrategy.analyticsTips.map((t, i) => <li key={i}>{t}</li>)}
                            </ul>
                            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                                <h4 className="text-xs font-bold text-green-500 uppercase mb-2">Essential Schema</h4>
                                <div className="flex flex-wrap gap-2">
                                    {result.technicalStrategy.schemaMarkup.map((schema, i) => (
                                        <span key={i} className="text-xs bg-green-900/30 text-green-200 px-2 py-1 rounded border border-green-700/50">{schema}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Card 4: Paid Growth & UX */}
                        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-amber-500/50 transition-all shadow-md">
                            <div className="flex items-center mb-4 text-amber-400">
                                <div className="p-2 bg-amber-400/10 rounded-lg mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <h3 className="text-xl font-bold text-white">4. Paid Growth & UX</h3>
                            </div>
                            <p className="text-xs text-slate-400 mb-4 uppercase tracking-wider font-semibold">High ROI Ads & Conversion</p>
                            <ul className="space-y-2 mb-4 text-slate-300 list-disc list-inside">
                                {result.growthStrategy.adTargeting.map((t, i) => <li key={i}>{t}</li>)}
                            </ul>
                             <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                                <h4 className="text-xs font-bold text-amber-500 uppercase mb-2">Personalization Ideas</h4>
                                <ul className="space-y-1">
                                    {result.growthStrategy.uxPersonalization.map((idea, i) => (
                                        <li key={i} className="text-sm text-slate-300 flex justify-between group">
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
    );
};

export default AiTrafficBooster;
