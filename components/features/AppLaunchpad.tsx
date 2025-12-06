
import React, { useState } from 'react';
import { generateUiComponent, generateFlowDiagram } from '../../services/geminiService';
import { APP_CATEGORIES, UI_PLATFORMS } from '../../constants';
import Loader from '../common/Loader';
import { Remarkable } from 'remarkable';

const md = new Remarkable({ html: true });

interface AppLaunchpadProps {
    onShare: (options: { contentText: string; contentType: 'text' }) => void;
}

const FLOWS = [
    'User Auth Flow (Signup -> Onboarding)',
    'Movie Generation Agent Flow',
    'E-commerce Checkout Flow',
    'Social Media Feed Algorithm'
];

const AppLaunchpad: React.FC<AppLaunchpadProps> = ({ onShare }) => {
    const [activeTab, setActiveTab] = useState<'screens' | 'flows' | 'uikit'>('screens');
    
    // Screens State
    const [selectedCategory, setSelectedCategory] = useState(APP_CATEGORIES[0]);
    const [platform, setPlatform] = useState(UI_PLATFORMS[0]);
    const [description, setDescription] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');
    
    // Flows State
    const [selectedFlow, setSelectedFlow] = useState(FLOWS[0]);
    const [flowDiagram, setFlowDiagram] = useState('');
    const [customFlowDesc, setCustomFlowDesc] = useState('');

    const [loading, setLoading] = useState(false);

    const handleGenerateScreen = async () => {
        setLoading(true);
        setGeneratedCode('');
        try {
            const prompt = `Create a ${selectedCategory} screen for a ${platform} app. Context: ${description || 'Modern, clean interface'}.`;
            const response = await generateUiComponent(prompt, platform.includes('Mobile') ? 'mobile' : platform.includes('Tablet') ? 'tablet' : 'desktop');
            let code = response.text.replace(/^```html\s*/, '').replace(/```$/, '');
            setGeneratedCode(code);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateFlow = async () => {
        setLoading(true);
        setFlowDiagram('');
        try {
            const prompt = customFlowDesc || selectedFlow;
            const response = await generateFlowDiagram(prompt);
            let code = response.text.replace(/^```mermaid\s*/, '').replace(/```$/, '');
            setFlowDiagram(code);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)] min-h-[600px]">
            {/* Sidebar */}
            <div className="w-full lg:w-80 flex-shrink-0 bg-slate-900/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-800 overflow-y-auto custom-scrollbar flex flex-col gap-6">
                <div>
                    <h3 className="text-xl font-bold text-white mb-2">App Launchpad</h3>
                    <p className="text-xs text-slate-400">Build 180+ Screens, User Flows & UI Kits.</p>
                </div>

                <div className="flex bg-slate-800 p-1 rounded-lg">
                    <button onClick={() => setActiveTab('screens')} className={`flex-1 py-2 text-xs font-bold rounded transition ${activeTab === 'screens' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}>Screens</button>
                    <button onClick={() => setActiveTab('flows')} className={`flex-1 py-2 text-xs font-bold rounded transition ${activeTab === 'flows' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}>Flows</button>
                    <button onClick={() => setActiveTab('uikit')} className={`flex-1 py-2 text-xs font-bold rounded transition ${activeTab === 'uikit' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}>UI Kit</button>
                </div>

                {activeTab === 'screens' && (
                    <div className="space-y-4 animate-fadeIn">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Category</label>
                            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-sm">
                                {APP_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Platform</label>
                            <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-sm">
                                {UI_PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Details</label>
                            <textarea 
                                value={description} 
                                onChange={(e) => setDescription(e.target.value)} 
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm resize-none"
                                rows={4}
                                placeholder="e.g. Dark mode login screen with social auth buttons..."
                            />
                        </div>
                        <button onClick={handleGenerateScreen} disabled={loading} className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold py-3 rounded-xl transition shadow-lg disabled:opacity-50">
                            {loading ? <Loader /> : 'Generate Screen'}
                        </button>
                    </div>
                )}

                {activeTab === 'flows' && (
                    <div className="space-y-4 animate-fadeIn">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Template Flow</label>
                            <select value={selectedFlow} onChange={(e) => setSelectedFlow(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-sm">
                                {FLOWS.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Custom Flow</label>
                            <textarea 
                                value={customFlowDesc} 
                                onChange={(e) => setCustomFlowDesc(e.target.value)} 
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm resize-none"
                                rows={4}
                                placeholder="Describe a custom user journey..."
                            />
                        </div>
                        <button onClick={handleGenerateFlow} disabled={loading} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition shadow-lg disabled:opacity-50">
                            {loading ? <Loader /> : 'Map User Journey'}
                        </button>
                    </div>
                )}

                {activeTab === 'uikit' && (
                    <div className="space-y-4 animate-fadeIn text-sm text-slate-400">
                        <p>Export Figma-ready tokens and components based on your generated designs.</p>
                        <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                            <h4 className="text-white font-bold mb-2">Included:</h4>
                            <ul className="list-disc pl-4 space-y-1">
                                <li>Colors (Primary #6C63FF)</li>
                                <li>Typography (Inter)</li>
                                <li>Shadows & Radius</li>
                                <li>Button Variants</li>
                            </ul>
                        </div>
                        <button onClick={() => onShare({ contentText: "Design System Export", contentType: 'text' })} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition border border-slate-700">
                            Download JSON Tokens
                        </button>
                    </div>
                )}
            </div>

            {/* Preview */}
            <div className="flex-grow bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col overflow-hidden relative">
                <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                    <h3 className="font-bold text-white text-sm uppercase tracking-wider">Canvas</h3>
                    <div className="flex gap-2">
                        {generatedCode && <button onClick={() => {navigator.clipboard.writeText(generatedCode); alert('Code Copied!')}} className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded hover:bg-slate-700 transition">Copy Code</button>}
                        {(generatedCode || flowDiagram) && <button onClick={() => onShare({ contentText: generatedCode || flowDiagram, contentType: 'text' })} className="text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-500 transition">Share</button>}
                    </div>
                </div>

                <div className="flex-grow bg-white/5 relative overflow-hidden">
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-20 backdrop-blur-sm">
                            <Loader message="Architecting solution..." />
                        </div>
                    )}

                    {activeTab === 'screens' && (
                        generatedCode ? (
                            <iframe srcDoc={generatedCode} className="w-full h-full bg-white" title="Preview" sandbox="allow-scripts" />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                <p>Select a category to generate a screen.</p>
                            </div>
                        )
                    )}

                    {activeTab === 'flows' && (
                        flowDiagram ? (
                            <div className="p-8 h-full overflow-auto">
                                <div className="bg-slate-900 p-6 rounded-xl border border-slate-700">
                                    <pre className="text-xs text-green-400 font-mono whitespace-pre">{flowDiagram}</pre>
                                    <p className="mt-4 text-xs text-slate-500 italic">* Rendering Mermaid.js diagram code. Paste into any Markdown viewer to visualize.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
                                <p>Define a flow to visualize the user journey.</p>
                            </div>
                        )
                    )}

                    {activeTab === 'uikit' && (
                        <div className="p-8 h-full overflow-auto">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="space-y-2">
                                    <div className="h-20 bg-[#6C63FF] rounded-lg shadow-lg"></div>
                                    <p className="text-xs text-white">Primary <span className="text-slate-500">#6C63FF</span></p>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-20 bg-[#FF6584] rounded-lg shadow-lg"></div>
                                    <p className="text-xs text-white">Secondary <span className="text-slate-500">#FF6584</span></p>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-20 bg-[#F9FAFB] rounded-lg shadow-lg"></div>
                                    <p className="text-xs text-white">Neutral <span className="text-slate-500">#F9FAFB</span></p>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-20 bg-[#00D1FF] rounded-lg shadow-lg"></div>
                                    <p className="text-xs text-white">Accent <span className="text-slate-500">#00D1FF</span></p>
                                </div>
                            </div>
                            <div className="mt-8 pt-8 border-t border-slate-800">
                                <h4 className="text-white font-bold mb-4">Typography</h4>
                                <h1 className="text-4xl font-bold text-white mb-2">Heading 1 (Inter Bold 36px)</h1>
                                <h2 className="text-2xl font-bold text-white mb-2">Heading 2 (Inter Bold 24px)</h2>
                                <p className="text-base text-slate-300">Body text (Inter Regular 16px). The quick brown fox jumps over the lazy dog.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AppLaunchpad;
