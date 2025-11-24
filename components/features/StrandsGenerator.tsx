
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
        <div className={`bg-slate-800/50 p-6 rounded-xl border border-slate-700 ${className}`}>
            <h3 className="flex items-center space-x-2 text-lg font-bold text-cyan-400 mb-4">
                {agentIcon}
                <span>{title}</span>
            </h3>
            <div className="space-y-4 text-slate-300">{children}</div>
        </div>
    );

    const CopyableListItem: React.FC<{ text: string }> = ({ text }) => (
        <li className="flex justify-between items-center group p-2 rounded-md hover:bg-slate-700/50">
            <span>{text}</span>
            <button onClick={() => handleCopyToClipboard(text)} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-white" title="Copy">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" /></svg>
            </button>
        </li>
    );

    const AgentCard: React.FC<{agent: typeof STRANDS_LEAD_AGENTS[0], isSelected: boolean, onSelect: () => void}> = ({ agent, isSelected, onSelect }) => (
        <div
            onClick={onSelect}
            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${isSelected ? 'border-cyan-500 bg-cyan-900/50' : 'border-slate-700 bg-slate-800 hover:border-slate-500'}`}
        >
            <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 text-cyan-400">{agent.icon}</div>
                <div>
                    <h4 className="font-bold text-sm text-white">{agent.name}</h4>
                    <p className="text-xs text-slate-400">{agent.expertise}</p>
                </div>
            </div>
        </div>
    );

    const AgentStatusIndicator: React.FC<{name: string, status: AgentStatus}> = ({ name, status }) => {
        const getStatusIcon = () => {
            switch (status) {
                case 'working': return <svg className="animate-spin h-5 w-5 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
                case 'done': return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
                case 'error': return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>;
                case 'pending': return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" /></svg>;
            }
        };
        return <div className={`flex items-center justify-between p-3 rounded-lg ${status === 'working' ? 'bg-slate-700/50' : 'bg-transparent'}`}><span className="text-sm font-medium">{name}</span> {getStatusIcon()}</div>
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8 relative">
            {toastMessage && (
                <div className="absolute top-0 right-0 bg-green-500 text-white py-2 px-4 rounded-lg animate-pulse z-20">
                    {toastMessage}
                </div>
            )}
            <div className="w-full lg:w-1/3 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4 bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                    <h3 className="text-xl font-bold text-white mb-4">Brand Concept</h3>
                     <fieldset disabled={loading} className="space-y-4">
                        <div>
                            <label htmlFor="concept" className="block text-sm font-medium text-slate-300 mb-2">1. Core Concept</label>
                            <textarea id="concept" rows={3} value={concept} onChange={(e) => setConcept(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white" placeholder="e.g., A sustainable coffee brand for young professionals" />
                        </div>
                        <div>
                            <label htmlFor="audience" className="block text-sm font-medium text-slate-300 mb-2">2. Target Audience</label>
                            <input id="audience" type="text" value={audience} onChange={(e) => setAudience(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white" placeholder="e.g., Eco-conscious millennials, ages 25-35" />
                        </div>
                        <div>
                            <label htmlFor="keywords" className="block text-sm font-medium text-slate-300 mb-2">3. Key Values / Keywords</label>
                            <input id="keywords" type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white" placeholder="e.g., eco-friendly, community, quality, modern" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">4. Choose Your Lead Strategist</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                            >
                                <span>{showAgentConfig ? 'Hide' : 'Show'} Advanced Agent Config</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 transform transition ${showAgentConfig ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </button>
                            
                            {showAgentConfig && (
                                <div className="mt-3 p-3 bg-slate-800 rounded-lg border border-slate-700 animate-fadeIn">
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Decision Engine Model</label>
                                    <select 
                                        value={selectedAgentModel || ''} 
                                        onChange={(e) => setSelectedAgentModel(e.target.value || null)}
                                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm"
                                    >
                                        <option value="">Default (Persona Based)</option>
                                        {AGENT_TYPES.map(type => (
                                            <option key={type.id} value={type.id}>{type.name}</option>
                                        ))}
                                    </select>
                                    {selectedAgentModel && (
                                        <p className="text-[10px] text-slate-400 mt-2 italic">
                                            {AGENT_TYPES.find(a => a.id === selectedAgentModel)?.description}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        <button type="submit" className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-300 flex items-center justify-center space-x-2">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M11.94 1.94a1 1 0 00-1.88 0l-1.33 4.02-4.02 1.33a1 1 0 000 1.88l4.02 1.33 1.33 4.02a1 1 0 001.88 0l1.33-4.02 4.02-1.33a1 1 0 000-1.88l-4.02-1.33-1.33-4.02zM5.94 9.94a1 1 0 00-1.88 0l-1.33 4.02-4.02 1.33a1 1 0 000 1.88l4.02 1.33 1.33 4.02a1 1 0 001.88 0l1.33-4.02 4.02-1.33a1 1 0 000-1.88l-4.02-1.33-1.33-4.02z" /></svg>
                            <span>{loading ? 'Working...' : 'Assemble Agent Team'}</span>
                        </button>
                        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                     </fieldset>
                </form>
            </div>
            <div className="w-full lg:w-2/3 flex flex-col min-h-[400px]">
                {agentProgress && (
                    <div className="mb-6 bg-slate-800 p-4 rounded-xl border border-slate-700">
                        <h3 className="text-lg font-bold text-white mb-2">Agent Progress</h3>
                        <div className="space-y-1">
                            <AgentStatusIndicator name="Lead Strategist" status={agentProgress.strategist} />
                            <AgentStatusIndicator name={STRANDS_SPECIALIST_AGENTS.namer.name} status={agentProgress.namer} />
                            <AgentStatusIndicator name={STRANDS_SPECIALIST_AGENTS.copywriter.name} status={agentProgress.copywriter} />
                            <AgentStatusIndicator name={STRANDS_SPECIALIST_AGENTS.artDirector.name} status={agentProgress.artDirector} />
                            <AgentStatusIndicator name={STRANDS_SPECIALIST_AGENTS.marketer.name} status={agentProgress.marketer} />
                        </div>
                    </div>
                )}

                {!agentProgress && <div className="flex-grow flex items-center justify-center text-slate-500">Your brand identity will appear here.</div>}

                {result && (
                    <div className="space-y-6">
                        <div className="flex justify-end">
                            <button onClick={handleShare} className="flex items-center justify-center space-x-2 bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
                                <span>Share Full Concept</span>
                            </button>
                        </div>
                        {result.brandEssence && <ResultCard title="Brand Essence"><p className="whitespace-pre-wrap">{result.brandEssence}</p></ResultCard>}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {result.nameSuggestions && <ResultCard title="Name Suggestions" agentIcon={STRANDS_SPECIALIST_AGENTS.namer.icon}><ul className="list-none p-0 m-0 space-y-1">{result.nameSuggestions.map(name => <CopyableListItem key={name} text={name} />)}</ul></ResultCard>}
                            {result.taglines && <ResultCard title="Taglines & Slogans" agentIcon={STRANDS_SPECIALIST_AGENTS.copywriter.icon}><ul className="list-none p-0 m-0 space-y-1">{result.taglines.map(tag => <CopyableListItem key={tag} text={tag} />)}</ul></ResultCard>}
                        </div>
                        {result.visualIdentity && (
                             <ResultCard title="Visual Identity" agentIcon={STRANDS_SPECIALIST_AGENTS.artDirector.icon}>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-semibold text-slate-100 mb-1">Logo Concept</h4>
                                            <button onClick={handleGenerateLogo} disabled={isGeneratingLogo} className="text-xs font-semibold py-1 px-3 rounded-full transition bg-purple-600 hover:bg-purple-700 text-white disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center space-x-1.5">
                                                 <span>✨</span>
                                                 <span>{isGeneratingLogo ? 'Generating...' : 'Generate Logo'}</span>
                                            </button>
                                        </div>
                                        <p className="text-sm">{result.visualIdentity.logoConcept}</p>
                                        {isGeneratingLogo && <div className="mt-4"><Loader message="Generating logo..."/></div>}
                                        {logoImage && <img src={logoImage} alt="Generated logo" className="mt-4 rounded-lg border border-slate-600" />}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-100 mb-2">Color Palette</h4>
                                        <div className="flex flex-wrap gap-4 items-center">{result.visualIdentity.colorPalette.map(color => (<div key={color.hex} className="text-center"><div className="w-12 h-12 rounded-full border-2 border-slate-600 mb-1" style={{ backgroundColor: color.hex }}></div><p className="text-xs font-medium">{color.name}</p><p className="text-xs text-slate-400">{color.hex}</p></div>))}</div>
                                    </div>
                                    <div><h4 className="font-semibold text-slate-100 mb-1">Typography</h4><p className="text-sm">{result.visualIdentity.typography}</p></div>
                                </div>
                            </ResultCard>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {result.marketingAngles && <ResultCard title="Marketing Angles" agentIcon={STRANDS_SPECIALIST_AGENTS.marketer.icon}><ul className="list-disc list-inside space-y-2 text-sm">{result.marketingAngles.map((angle, i) => <li key={i}>{angle}</li>)}</ul></ResultCard>}
                           {result.socialMediaPost && <ResultCard title="Sample Social Media Post" agentIcon={STRANDS_SPECIALIST_AGENTS.copywriter.icon}><p className="text-sm whitespace-pre-wrap">{result.socialMediaPost}</p></ResultCard>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StrandsGenerator;
