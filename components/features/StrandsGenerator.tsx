
import React, { useState } from 'react';
import {
    generateBrandEssence,
    generateNameSuggestions,
    generateTaglinesAndSocial,
    generateVisualIdentity,
    generateMarketingAngles,
    generateImage,
} from '../../services/geminiService';
import Loader from '../common/Loader';
import { STRANDS_LEAD_AGENTS, STRANDS_SPECIALIST_AGENTS, AGENT_TYPES } from '../../constants';

// --- Types ---
interface StrandsGeneratorProps {
    onShare: (options: { contentText: string; contentType: 'text' }) => void;
}

interface BrandStrands {
    brandEssence: string;
    nameSuggestions: string[];
    taglines: string[];
    visualIdentity: {
        logoConcept: string;
        colorPalette: { name: string; hex: string }[];
        typography: string;
    };
    marketingAngles: string[];
    socialMediaPost: string;
}

type AgentName = keyof typeof STRANDS_SPECIALIST_AGENTS | 'strategist';
type AgentStatus = 'pending' | 'working' | 'done' | 'error';

const initialProgress: Record<AgentName, AgentStatus> = {
    strategist: 'pending',
    namer: 'pending',
    copywriter: 'pending',
    artDirector: 'pending',
    marketer: 'pending',
};

// --- Main Component ---
const StrandsGenerator: React.FC<StrandsGeneratorProps> = ({ onShare }) => {
    // Inputs
    const [concept, setConcept] = useState('');
    const [audience, setAudience] = useState('');
    const [keywords, setKeywords] = useState('');
    const [selectedAgentId, setSelectedAgentId] = useState<string>(STRANDS_LEAD_AGENTS[0].id);
    
    // New Agent Config
    const [selectedAgentModel, setSelectedAgentModel] = useState<string | null>(null);
    const [showAgentConfig, setShowAgentConfig] = useState(false);

    // Outputs & State
    const [result, setResult] = useState<Partial<BrandStrands> | null>(null);
    const [logoImage, setLogoImage] = useState<string | null>(null);
    const [isGeneratingLogo, setIsGeneratingLogo] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState('');
    const [agentProgress, setAgentProgress] = useState<Record<AgentName, AgentStatus> | null>(null);

    const displayToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(''), 2000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!concept || !audience || !keywords) {
            setError('Please fill in all fields to generate strands.');
            return;
        }
        
        setLoading(true);
        setError(null);
        setResult(null);
        setLogoImage(null);
        setAgentProgress({ ...initialProgress, strategist: 'working' });

        try {
            const leadAgent = STRANDS_LEAD_AGENTS.find(agent => agent.id === selectedAgentId);
            if (!leadAgent) throw new Error("Selected agent not found.");

            let instruction = leadAgent.systemInstruction;
            
            // Enhance instruction with selected Agent Model if present
            if (selectedAgentModel) {
                const agentType = AGENT_TYPES.find(a => a.id === selectedAgentModel);
                if (agentType) {
                    instruction = `You are acting as a ${agentType.name}. ${agentType.description}\n\n${instruction}`;
                }
            }

            // 1. Strategist generates Brand Essence
            const essenceResponse = await generateBrandEssence(concept, audience, keywords, instruction);
            const { brandEssence } = JSON.parse(essenceResponse.text);
            setResult({ brandEssence });
            setAgentProgress(prev => ({ ...prev!, strategist: 'done', namer: 'working' }));

            // 2. Namer generates Names
            const namesResponse = await generateNameSuggestions(brandEssence, STRANDS_SPECIALIST_AGENTS.namer.systemInstruction);
            const { nameSuggestions } = JSON.parse(namesResponse.text);
            setResult(prev => ({ ...prev, nameSuggestions }));
            setAgentProgress(prev => ({ ...prev!, namer: 'done', copywriter: 'working' }));
            
            // 3. Copywriter generates Taglines & Social Post
            const copywriterResponse = await generateTaglinesAndSocial(brandEssence, STRANDS_SPECIALIST_AGENTS.copywriter.systemInstruction);
            const { taglines, socialMediaPost } = JSON.parse(copywriterResponse.text);
            setResult(prev => ({ ...prev, taglines, socialMediaPost }));
            setAgentProgress(prev => ({ ...prev!, copywriter: 'done', artDirector: 'working' }));
            
            // 4. Art Director generates Visual Identity
            const artDirectorResponse = await generateVisualIdentity(brandEssence, STRANDS_SPECIALIST_AGENTS.artDirector.systemInstruction);
            const { visualIdentity } = JSON.parse(artDirectorResponse.text);
            setResult(prev => ({ ...prev, visualIdentity }));
            setAgentProgress(prev => ({ ...prev!, artDirector: 'done', marketer: 'working' }));

            // 5. Marketer generates Angles
            const marketerResponse = await generateMarketingAngles(brandEssence, STRANDS_SPECIALIST_AGENTS.marketer.systemInstruction);
            const { marketingAngles } = JSON.parse(marketerResponse.text);
            setResult(prev => ({ ...prev, marketingAngles }));
            setAgentProgress(prev => ({ ...prev!, marketer: 'done' }));

        } catch (err) {
            setError('An agent failed its task. Please check your input and try again.');
            setAgentProgress(prev => {
                if (!prev) return null;
                const updatedProgress = { ...prev };
                const workingAgent = Object.keys(updatedProgress).find(key => updatedProgress[key as AgentName] === 'working');
                if (workingAgent) {
                    updatedProgress[workingAgent as AgentName] = 'error';
                }
                return updatedProgress;
            });
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
    const handleGenerateLogo = async () => {
        if (!result?.visualIdentity?.logoConcept) return;

        setIsGeneratingLogo(true);
        setLogoImage(null);
        try {
            const prompt = `A minimalist, vector-style logo based on the following concept: "${result.visualIdentity.logoConcept}". The logo should be on a clean, white background.`;
            const imageBytes = await generateImage(prompt, '1:1');
            setLogoImage(`data:image/jpeg;base64,${imageBytes}`);
        } catch(err) {
            console.error("Logo generation failed:", err);
            displayToast("Logo generation failed.");
        } finally {
            setIsGeneratingLogo(false);
        }
    };

    const handleCopyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        displayToast('Copied to clipboard!');
    };
    
    const handleShare = () => {
        if (!result) return;
        const fullText = `
        **My Brand Concept: ${concept}**

        **Brand Essence:**
        ${result.brandEssence || ''}

        **Name Suggestions:**
        ${result.nameSuggestions?.map(n => `- ${n}`).join('\n') || ''}

        **Taglines:**
        ${result.taglines?.map(t => `- ${t}`).join('\n') || ''}

        **Visual Identity:**
        - Logo: ${result.visualIdentity?.logoConcept || ''}
        - Colors: ${result.visualIdentity?.colorPalette.map(c => `${c.name} (${c.hex})`).join(', ') || ''}
        - Typography: ${result.visualIdentity?.typography || ''}

        **Marketing Angles:**
        ${result.marketingAngles?.map(a => `- ${a}`).join('\n') || ''}

        **Sample Social Media Post:**
        ${result.socialMediaPost || ''}
        `;
        onShare({ contentText: fullText.trim(), contentType: 'text' });
    }

    const ResultCard: React.FC<{ title: string; agentIcon?: React.ReactNode, children: React.ReactNode; className?: string }> = ({ title, agentIcon, children, className }) => (
        <div className={`bg-slate-800/50 p-6 rounded-xl border border-slate-700 ${className} shadow-sm`}>
            <h3 className="flex items-center space-x-2 text-sm font-bold text-cyan-400 uppercase tracking-wider mb-4 border-b border-slate-700/50 pb-2">
                {agentIcon && <span className="text-lg">{agentIcon}</span>}
                <span>{title}</span>
            </h3>
            <div className="space-y-4 text-slate-300 text-sm leading-relaxed">{children}</div>
        </div>
    );

    const CopyableListItem: React.FC<{ text: string }> = ({ text }) => (
        <li className="flex justify-between items-center group p-2 rounded-md hover:bg-slate-700/50 transition-colors">
            <span>{text}</span>
            <button onClick={() => handleCopyToClipboard(text)} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-white" title="Copy">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" /></svg>
            </button>
        </li>
    );

    const AgentCard: React.FC<{agent: typeof STRANDS_LEAD_AGENTS[0], isSelected: boolean, onSelect: () => void}> = ({ agent, isSelected, onSelect }) => (
        <div
            onClick={onSelect}
            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${isSelected ? 'border-cyan-500 bg-cyan-900/20' : 'border-slate-700 bg-slate-800 hover:border-slate-500'}`}
        >
            <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 text-2xl">{agent.icon}</div>
                <div>
                    <h4 className="font-bold text-xs text-white uppercase">{agent.name}</h4>
                    <p className="text-[10px] text-slate-400">{agent.expertise}</p>
                </div>
            </div>
        </div>
    );

    const AgentStatusIndicator: React.FC<{name: string, status: AgentStatus}> = ({ name, status }) => {
        const getStatusIcon = () => {
            switch (status) {
                case 'working': return <svg className="animate-spin h-4 w-4 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
                case 'done': return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
                case 'error': return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>;
                case 'pending': return <div className="h-2 w-2 bg-slate-600 rounded-full"></div>;
            }
        };
        return (
            <div className={`flex items-center justify-between p-2 rounded-lg transition-colors ${status === 'working' ? 'bg-cyan-900/20 border border-cyan-800/50' : 'bg-transparent border border-transparent'}`}>
                <span className={`text-xs font-medium ${status === 'working' ? 'text-white' : 'text-slate-400'}`}>{name}</span> 
                {getStatusIcon()}
            </div>
        )
    }

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)] min-h-[600px] relative">
            {toastMessage && (
                <div className="absolute top-0 right-0 bg-green-500 text-white py-2 px-4 rounded-lg animate-pulse z-50 text-xs">
                    {toastMessage}
                </div>
            )}
            
            {/* Sidebar Controls */}
            <div className="w-full lg:w-80 flex-shrink-0 bg-slate-900/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-800 overflow-y-auto custom-scrollbar">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <fieldset disabled={loading} className="space-y-5">
                        <div>
                            <label htmlFor="concept" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">1. Core Concept</label>
                            <textarea id="concept" rows={3} value={concept} onChange={(e) => setConcept(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500 placeholder-slate-600 resize-none transition" placeholder="e.g., A sustainable coffee brand for young professionals" />
                        </div>
                        <div>
                            <label htmlFor="audience" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">2. Target Audience</label>
                            <input id="audience" type="text" value={audience} onChange={(e) => setAudience(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500" placeholder="e.g., Eco-conscious millennials" />
                        </div>
                        <div>
                            <label htmlFor="keywords" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">3. Keywords</label>
                            <input id="keywords" type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500" placeholder="e.g., eco-friendly, community, modern" />
                        </div>
                         <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">4. Lead Strategist</label>
                            <div className="grid grid-cols-1 gap-2">
                                {STRANDS_LEAD_AGENTS.map(agent => (
                                    <AgentCard
                                        key={agent.id}
                                        agent={agent}
                                        isSelected={selectedAgentId === agent.id}
                                        onSelect={() => setSelectedAgentId(agent.id)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Advanced Config Toggle */}
                        <div>
                            <button
                                type="button"
                                onClick={() => setShowAgentConfig(!showAgentConfig)}
                                className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 uppercase font-bold tracking-wider"
                            >
                                <span>{showAgentConfig ? 'Hide' : 'Show'} Agent Config</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 transform transition ${showAgentConfig ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </button>
                            
                            {showAgentConfig && (
                                <div className="mt-3 p-3 bg-slate-800 rounded-lg border border-slate-700 animate-fadeIn">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Decision Model</label>
                                    <select 
                                        value={selectedAgentModel || ''} 
                                        onChange={(e) => setSelectedAgentModel(e.target.value || null)}
                                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-xs"
                                    >
                                        <option value="">Default (Persona Based)</option>
                                        {AGENT_TYPES.map(type => (
                                            <option key={type.id} value={type.id}>{type.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed">
                           {loading ? <Loader /> : <span>Start Agent Workflow</span>}
                        </button>
                        {error && <p className="text-red-400 text-xs text-center bg-red-900/20 p-2 rounded">{error}</p>}
                     </fieldset>
                </form>
            </div>

            {/* Main Result Area */}
            <div className="flex-grow bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col overflow-hidden relative">
                {/* Header */}
                <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                    <h3 className="font-bold text-white text-sm uppercase tracking-wider">Brand Identity System</h3>
                    {result && (
                        <button onClick={handleShare} className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded font-bold transition">Share Concept</button>
                    )}
                </div>

                <div className="flex-grow overflow-y-auto p-8 relative custom-scrollbar">
                    <div className="absolute inset-0 bg-grid-slate-800/20 pointer-events-none"></div>
                    
                    {agentProgress && (
                        <div className="mb-8 bg-slate-950 rounded-xl border border-slate-800 p-4 shadow-lg relative z-10">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Agent Activity</h3>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                <AgentStatusIndicator name="Lead Strategist" status={agentProgress.strategist} />
                                <AgentStatusIndicator name="Namer" status={agentProgress.namer} />
                                <AgentStatusIndicator name="Copywriter" status={agentProgress.copywriter} />
                                <AgentStatusIndicator name="Art Director" status={agentProgress.artDirector} />
                                <AgentStatusIndicator name="Marketer" status={agentProgress.marketer} />
                            </div>
                        </div>
                    )}

                    {!agentProgress && !result && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-60">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                            <p className="text-lg">Initialize agents to build your brand.</p>
                        </div>
                    )}

                    {result && (
                        <div className="space-y-6 relative z-10 max-w-5xl mx-auto animate-fadeIn">
                            {result.brandEssence && <ResultCard title="Brand Essence"><p className="whitespace-pre-wrap">{result.brandEssence}</p></ResultCard>}
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {result.nameSuggestions && <ResultCard title="Naming Options" agentIcon={STRANDS_SPECIALIST_AGENTS.namer.icon}><ul className="list-none p-0 m-0 space-y-1">{result.nameSuggestions.map(name => <CopyableListItem key={name} text={name} />)}</ul></ResultCard>}
                                {result.taglines && <ResultCard title="Taglines" agentIcon={STRANDS_SPECIALIST_AGENTS.copywriter.icon}><ul className="list-none p-0 m-0 space-y-1">{result.taglines.map(tag => <CopyableListItem key={tag} text={tag} />)}</ul></ResultCard>}
                            </div>
                            
                            {result.visualIdentity && (
                                 <ResultCard title="Visual Identity" agentIcon={STRANDS_SPECIALIST_AGENTS.artDirector.icon}>
                                    <div className="space-y-6">
                                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="text-xs font-bold text-slate-400 uppercase">Logo Concept</h4>
                                                <button onClick={handleGenerateLogo} disabled={isGeneratingLogo} className="text-[10px] font-bold py-1 px-3 rounded-full transition bg-cyan-600 hover:bg-cyan-500 text-white disabled:bg-slate-700 disabled:cursor-not-allowed flex items-center space-x-1">
                                                     <span>{isGeneratingLogo ? 'Generating...' : 'Visualize Logo'}</span>
                                                </button>
                                            </div>
                                            <p className="text-sm mb-4 italic text-slate-400">{result.visualIdentity.logoConcept}</p>
                                            {isGeneratingLogo && <div className="mt-4"><Loader message="Designing logo..." small /></div>}
                                            {logoImage && <img src={logoImage} alt="Generated logo" className="mt-4 rounded-lg border border-slate-600 max-w-[200px] shadow-lg" />}
                                        </div>
                                        
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Color Palette</h4>
                                            <div className="flex flex-wrap gap-4 items-center">{result.visualIdentity.colorPalette.map(color => (<div key={color.hex} className="text-center group cursor-pointer" onClick={() => handleCopyToClipboard(color.hex)}><div className="w-14 h-14 rounded-full border-4 border-slate-800 shadow-lg mb-2 transition transform group-hover:scale-110" style={{ backgroundColor: color.hex }}></div><p className="text-xs font-bold text-white">{color.name}</p><p className="text-[10px] text-slate-500 font-mono">{color.hex}</p></div>))}</div>
                                        </div>
                                        
                                        <div><h4 className="text-xs font-bold text-slate-400 uppercase mb-1">Typography</h4><p className="text-sm font-serif">{result.visualIdentity.typography}</p></div>
                                    </div>
                                </ResultCard>
                            )}
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               {result.marketingAngles && <ResultCard title="Marketing Angles" agentIcon={STRANDS_SPECIALIST_AGENTS.marketer.icon}><ul className="list-disc list-inside space-y-2 text-sm text-slate-300">{result.marketingAngles.map((angle, i) => <li key={i}>{angle}</li>)}</ul></ResultCard>}
                               {result.socialMediaPost && <ResultCard title="Sample Social Post" agentIcon={STRANDS_SPECIALIST_AGENTS.copywriter.icon}><div className="bg-slate-900 p-4 rounded-lg text-sm whitespace-pre-wrap border border-slate-800 italic">{result.socialMediaPost}</div></ResultCard>}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StrandsGenerator;
