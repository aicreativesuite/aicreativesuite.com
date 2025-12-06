
import React, { useState } from 'react';
import { generateText } from '../../services/geminiService';
import Loader from '../common/Loader';
import { Remarkable } from 'remarkable';

const md = new Remarkable({ html: true });

interface AutomationOSProps {
    onShare: (options: { contentText: string; contentType: 'text' }) => void;
}

const TOOLS = [
    { id: 'builder', name: 'Automation Builder', icon: '⚙️', description: 'Visual drag-and-drop workflow designer' },
    { id: 'scraper', name: 'Lead Scraper', icon: '🔍', description: 'Extract leads from Google Maps & Social' },
    { id: 'crm', name: 'CRM Sync', icon: '🔄', description: 'Sync data to HubSpot, Salesforce, Zoho' },
];

const AutomationOS: React.FC<AutomationOSProps> = ({ onShare }) => {
    const [activeTool, setActiveTool] = useState('builder');
    const [input, setInput] = useState('');
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Scraper State
    const [scraperQuery, setScraperQuery] = useState('');
    const [scraperLocation, setScraperLocation] = useState('');

    const handleBuilderSubmit = async () => {
        if (!input) return;
        setLoading(true);
        setResult(null);
        try {
            const prompt = `Design an automation workflow for: "${input}". 
            Break it down into:
            1. Triggers
            2. Logic/Conditions
            3. Actions
            4. Integration Points (e.g. Zapier, Make, API)
            Format as a structured list.`;
            const res = await generateText(prompt, 'gemini-2.5-flash');
            setResult(res.text);
        } catch (e) {
            setResult('Error generating workflow.');
        } finally {
            setLoading(false);
        }
    };

    const handleScraperSubmit = async () => {
        if (!scraperQuery || !scraperLocation) return;
        setLoading(true);
        setResult(null);
        try {
            // Using logic similar to TrafficBooster but generalized
            const prompt = `Simulate a lead scraping result for "${scraperQuery}" in "${scraperLocation}".
            Generate a Markdown table with 5 hypothetical leads including: Business Name, Address, Phone, Website, Email (Simulated).
            Also suggest specific search queries to find real leads on Google Maps and LinkedIn.`;
            const res = await generateText(prompt, 'gemini-2.5-flash');
            setResult(res.text);
        } catch (e) {
            setResult('Error simulating scraper.');
        } finally {
            setLoading(false);
        }
    };

    const handleCRMSubmit = async () => {
        if (!input) return;
        setLoading(true);
        setResult(null);
        try {
            const prompt = `Generate a data mapping schema to sync "${input}" data into a CRM (e.g. Salesforce/HubSpot).
            Show JSON structure for the Source Data and the Target CRM Object.`;
            const res = await generateText(prompt, 'gemini-2.5-flash');
            setResult(res.text);
        } catch (e) {
            setResult('Error generating map.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)] min-h-[600px]">
            {/* Sidebar */}
            <div className="w-full lg:w-80 flex-shrink-0 bg-slate-900/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-800 overflow-y-auto custom-scrollbar flex flex-col gap-6">
                <div>
                    <h3 className="text-xl font-bold text-white mb-2">AutomationOS</h3>
                    <p className="text-xs text-slate-400">Build workflows and extract data.</p>
                </div>

                <div className="flex flex-col gap-2">
                    {TOOLS.map(tool => (
                        <button
                            key={tool.id}
                            onClick={() => { setActiveTool(tool.id); setResult(null); setInput(''); }}
                            className={`flex items-center p-3 rounded-xl border transition-all text-left ${activeTool === tool.id ? 'bg-cyan-900/40 border-cyan-500/50 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'}`}
                        >
                            <span className="text-xl mr-3">{tool.icon}</span>
                            <div>
                                <div className="text-xs font-bold uppercase">{tool.name}</div>
                                <div className="text-[10px] opacity-70">{tool.description}</div>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="flex-grow space-y-4 pt-4 border-t border-slate-800">
                    {activeTool === 'builder' && (
                        <>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Workflow Goal</label>
                                <textarea 
                                    value={input} 
                                    onChange={e => setInput(e.target.value)} 
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500 resize-none"
                                    rows={5}
                                    placeholder="e.g. When a new lead fills a form, add to CRM and send Slack alert."
                                />
                            </div>
                            <button onClick={handleBuilderSubmit} disabled={loading} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl transition shadow-lg disabled:opacity-50 flex justify-center">{loading ? <Loader /> : 'Design Workflow'}</button>
                        </>
                    )}

                    {activeTool === 'scraper' && (
                        <>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Business Type</label>
                                <input value={scraperQuery} onChange={e => setScraperQuery(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm" placeholder="e.g. Gyms" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Location</label>
                                <input value={scraperLocation} onChange={e => setScraperLocation(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm" placeholder="e.g. New York, NY" />
                            </div>
                            <button onClick={handleScraperSubmit} disabled={loading} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl transition shadow-lg disabled:opacity-50 flex justify-center">{loading ? <Loader /> : 'Run Scraper'}</button>
                        </>
                    )}

                    {activeTool === 'crm' && (
                        <>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Data Source Description</label>
                                <textarea 
                                    value={input} 
                                    onChange={e => setInput(e.target.value)} 
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500 resize-none"
                                    rows={5}
                                    placeholder="e.g. A Google Sheet with columns: First Name, Last Name, Email, Status."
                                />
                            </div>
                            <button onClick={handleCRMSubmit} disabled={loading} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl transition shadow-lg disabled:opacity-50 flex justify-center">{loading ? <Loader /> : 'Map Data'}</button>
                        </>
                    )}
                </div>
            </div>

            {/* Preview */}
            <div className="flex-grow bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col overflow-hidden relative">
                <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                    <h3 className="font-bold text-white text-sm uppercase tracking-wider">Output Console</h3>
                    {result && (
                        <button onClick={() => onShare({ contentText: result, contentType: 'text' })} className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded font-bold transition">Share</button>
                    )}
                </div>

                <div className="flex-grow p-8 overflow-y-auto custom-scrollbar relative">
                    <div className="absolute inset-0 bg-grid-slate-800/20 pointer-events-none"></div>
                    
                    {!loading && !result && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-60">
                            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-3xl">🤖</div>
                            <p className="text-lg">Configure an automation task.</p>
                        </div>
                    )}

                    {loading && (
                        <div className="h-full flex flex-col items-center justify-center">
                            <Loader message="Processing automation logic..." />
                        </div>
                    )}

                    {result && (
                        <div className="relative z-10 max-w-4xl mx-auto bg-slate-950 p-8 rounded-xl border border-slate-700 shadow-xl prose prose-invert prose-sm">
                            <div dangerouslySetInnerHTML={{ __html: md.render(result) }} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AutomationOS;