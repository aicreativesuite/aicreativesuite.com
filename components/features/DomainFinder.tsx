import React, { useState } from 'react';
import { generateDomainAndHostingRecommendations } from '../../services/geminiService';
import Loader from '../common/Loader';

interface DomainFinderProps {
    onShare: (options: { contentText: string; contentType: 'text' }) => void;
}

interface HostingProvider {
    name: string;
    description: string;
    bestFor: string;
    freeTierFeatures: string;
}

interface Result {
    domains: string[];
    hosting: HostingProvider[];
}

const DomainFinder: React.FC<DomainFinderProps> = ({ onShare }) => {
    const [description, setDescription] = useState('');
    const [projectType, setProjectType] = useState('Static Website (HTML/React/Vue)');
    const [result, setResult] = useState<Result | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description) {
            setError('Please describe your project.');
            return;
        }
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await generateDomainAndHostingRecommendations(description, projectType);
            const parsedResult = JSON.parse(response.text);
            setResult(parsedResult);
        } catch (err) {
            setError('Failed to generate recommendations. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const projectTypes = [
        "Static Website (HTML/React/Vue)",
        "Full Stack App (Node.js/Python/Go)",
        "Mobile App Backend",
        "Blog / Content Site",
        "Portfolio",
        "E-commerce Store"
    ];

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-1/3 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4 bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                    <h3 className="text-xl font-bold text-white mb-4">Find Domains & Hosting</h3>
                    <fieldset disabled={loading} className="space-y-4">
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">Project Description</label>
                            <textarea
                                id="description"
                                rows={4}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 transition"
                                placeholder="e.g., A portfolio site for a 3D artist showcasing blender models"
                            />
                        </div>
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-slate-300 mb-2">Project Type</label>
                            <select
                                id="type"
                                value={projectType}
                                onChange={(e) => setProjectType(e.target.value)}
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 transition"
                            >
                                {projectTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-300 flex items-center justify-center space-x-2"
                        >
                            {loading ? 'Analyzing...' : 'Find Free Options'}
                        </button>
                        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                    </fieldset>
                </form>
            </div>

            <div className="w-full lg:w-2/3 min-h-[400px] bg-slate-800/30 rounded-lg border border-slate-700 p-6">
                {loading && <Loader message="Hunting for domains and free servers..." />}
                
                {!loading && !result && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 opacity-30 mb-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                        </svg>
                        <p>Enter your project details to see recommendations.</p>
                    </div>
                )}

                {result && (
                    <div className="space-y-8">
                         <div className="flex justify-between items-center">
                            <h3 className="text-2xl font-bold text-white">Recommendations</h3>
                            <button
                                onClick={() => onShare({ 
                                    contentText: `Project: ${description}\n\nDomains:\n${result.domains.join('\n')}\n\nHosting:\n${result.hosting.map(h => `${h.name}: ${h.bestFor}`).join('\n')}`, 
                                    contentType: 'text' 
                                })}
                                className="flex items-center space-x-2 text-sm bg-slate-700 hover:bg-slate-600 text-white py-2 px-3 rounded-lg transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
                                <span>Share</span>
                            </button>
                        </div>

                        <div>
                            <h4 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center">
                                <span className="mr-2">🌐</span> Domain Ideas
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {result.domains.map((domain, index) => (
                                    <div key={index} className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex justify-between items-center group hover:border-cyan-500/50 transition">
                                        <span className="font-mono text-slate-200">{domain}</span>
                                        <button 
                                            onClick={() => navigator.clipboard.writeText(domain)}
                                            className="text-xs text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-lg font-semibold text-green-400 mb-4 flex items-center">
                                <span className="mr-2">🚀</span> Free Hosting Options
                            </h4>
                            <div className="grid grid-cols-1 gap-4">
                                {result.hosting.map((host, index) => (
                                    <div key={index} className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                                        <div className="flex justify-between items-start mb-2">
                                            <h5 className="font-bold text-white text-lg">{host.name}</h5>
                                            <span className="text-xs bg-slate-700 text-cyan-300 px-2 py-1 rounded-full border border-slate-600">{host.bestFor}</span>
                                        </div>
                                        <p className="text-slate-300 text-sm mb-3">{host.description}</p>
                                        <div className="text-xs text-slate-400 bg-slate-900/50 p-2 rounded border border-slate-800">
                                            <strong className="text-slate-500 block mb-1">FREE TIER HIGHLIGHTS:</strong>
                                            {host.freeTierFeatures}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DomainFinder;
