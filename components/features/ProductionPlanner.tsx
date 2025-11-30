
import React, { useState } from 'react';
import { generateText, generateImage } from '../../services/geminiService';
import Loader from '../common/Loader';
import { Remarkable } from 'remarkable';

const md = new Remarkable({ html: true });

interface ProductionPlannerProps { onShare: (options: { contentText: string; contentType: 'text' }) => void; }

type ToolCategory = 'Overview' | 'Development' | 'Pre-Production' | 'Production';
type ToolId = 'dashboard' | 'screenwriter' | 'concept' | 'pitch' | 'storyboard' | 'moodboard' | 'shotlist' | 'casting' | 'callsheet' | 'dpr' | 'sides';

const downloadFile = (filename: string, content: string) => {
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
};

// --- Icons ---
const Icons = {
    Dashboard: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    Script: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
    Image: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    List: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
    Calendar: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    People: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
};

const CATEGORIES: { name: ToolCategory, items: { id: ToolId, label: string, icon: React.FC<any> }[] }[] = [
    { name: 'Overview', items: [{ id: 'dashboard', label: 'Dashboard', icon: Icons.Dashboard }] },
    { name: 'Development', items: [{ id: 'concept', label: 'Concept Dev', icon: Icons.List }, { id: 'screenwriter', label: 'Screenwriter', icon: Icons.Script }, { id: 'pitch', label: 'Pitch Deck', icon: Icons.Image }] },
    { name: 'Pre-Production', items: [{ id: 'storyboard', label: 'Storyboarder', icon: Icons.Image }, { id: 'shotlist', label: 'Shot List', icon: Icons.List }, { id: 'moodboard', label: 'Mood Board', icon: Icons.Image }, { id: 'casting', label: 'Casting', icon: Icons.People }] },
    { name: 'Production', items: [{ id: 'callsheet', label: 'Call Sheet', icon: Icons.Calendar }, { id: 'dpr', label: 'Daily Report', icon: Icons.List }, { id: 'sides', label: 'Script Sides', icon: Icons.Script }] },
];

const ProductionPlanner: React.FC<ProductionPlannerProps> = ({ onShare }) => {
    // Selection State
    const [activeCategory, setActiveCategory] = useState<ToolCategory>('Overview');
    const [activeTool, setActiveTool] = useState<ToolId>('dashboard');

    // Input States
    const [inputs, setInputs] = useState({
        sceneText: '',
        genericPrompt: '',
        callSheet: { title: 'Untitled Project', date: new Date().toISOString().split('T')[0], callTime: '08:00', location: '', weather: '', notes: '' }
    });

    // Output States
    const [outputs, setOutputs] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(false);

    // Helpers
    const updateInput = (field: string, value: any) => setInputs(prev => ({ ...prev, [field]: value }));
    const updateCallSheet = (field: string, value: any) => setInputs(prev => ({ ...prev, callSheet: { ...prev.callSheet, [field]: value } }));

    const handleGenerate = async () => {
        setLoading(true);
        try {
            if (activeTool === 'screenwriter') {
                const prompt = `Write a screenplay scene based on this description: "${inputs.sceneText}". Use standard Fountain/Screenplay format. Include Scene Headings (INT./EXT.), Action Lines, and Dialogue. Keep it professional.`;
                const res = await generateText(prompt, 'gemini-3-pro-preview');
                setOutputs(prev => ({ ...prev, screenwriter: res.text }));
            }
            else if (activeTool === 'storyboard') {
                // 1. Generate descriptions
                const descRes = await generateText(`Break down this scene into 3 distinct storyboard panels. Return ONLY a JSON array of strings describing each shot visual. Scene: "${inputs.sceneText}"`, 'gemini-2.5-flash');
                let descriptions = [];
                try {
                    descriptions = JSON.parse(descRes.text.match(/\[.*\]/s)?.[0] || '[]');
                } catch {
                    descriptions = [inputs.sceneText];
                }
                // 2. Generate images
                const newPanels = [];
                for (const desc of descriptions.slice(0, 3)) {
                    const imgBytes = await generateImage(`Storyboard sketch, cinematic composition, rough pencil style: ${desc}`, '16:9');
                    newPanels.push({ img: `data:image/jpeg;base64,${imgBytes}`, text: desc });
                }
                setOutputs(prev => ({ ...prev, storyboard: newPanels }));
            }
            else if (activeTool === 'callsheet') {
                const { title, date, callTime, location, weather, notes } = inputs.callSheet;
                const prompt = `Create a professional film production Call Sheet. 
                Production Title: ${title}
                Date: ${date}
                General Crew Call: ${callTime}
                Location: ${location}
                Weather Forecast: ${weather}
                Notes: ${notes}
                
                Include sections for: Production Office, Key Crew, Scenes to be Shot (make up 3 realistic scenes), Cast List (make up 3 cast members), and Safety Notes. Use Markdown format table structures.`;
                const res = await generateText(prompt, 'gemini-2.5-flash');
                setOutputs(prev => ({ ...prev, callsheet: res.text }));
            }
            else if (['shotlist', 'dpr', 'casting', 'sides', 'concept', 'pitch'].includes(activeTool)) {
                let promptPrefix = '';
                if (activeTool === 'shotlist') promptPrefix = "Create a detailed shot list for the scene:";
                if (activeTool === 'dpr') promptPrefix = "Generate a Daily Production Report template/report for:";
                if (activeTool === 'casting') promptPrefix = "Create a casting breakdown for characters:";
                if (activeTool === 'sides') promptPrefix = "Extract/Write script sides for:";
                if (activeTool === 'concept') promptPrefix = "Develop a film concept from:";
                if (activeTool === 'pitch') promptPrefix = "Create a pitch deck outline for:";
                
                const res = await generateText(`${promptPrefix} "${inputs.genericPrompt}". Return as a Markdown table or structured list.`, 'gemini-2.5-flash');
                setOutputs(prev => ({ ...prev, [activeTool]: res.text }));
            }
            else if (activeTool === 'moodboard') {
                 // Reuse storyboarder logic conceptually but simpler prompts
                 const imgBytes = await generateImage(`Moodboard collage for film concept: ${inputs.genericPrompt}. Cinematic, high detail.`, '16:9');
                 setOutputs(prev => ({...prev, moodboard: `data:image/jpeg;base64,${imgBytes}`}));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const activeToolData = CATEGORIES.flatMap(c => c.items).find(i => i.id === activeTool);

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)] min-h-[600px]">
            {/* Sidebar Controls */}
            <div className="w-full lg:w-80 flex-shrink-0 bg-slate-900/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-800 overflow-y-auto custom-scrollbar flex flex-col">
                
                {/* Category Navigation */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                    {CATEGORIES.map(c => (
                        <button
                            key={c.name}
                            onClick={() => { setActiveCategory(c.name); setActiveTool(c.items[0].id); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${activeCategory === c.name ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                        >
                            {c.name}
                        </button>
                    ))}
                </div>

                {/* Tool Selector */}
                <div className="mb-6">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Select Tool</label>
                    <div className="grid grid-cols-2 gap-2">
                        {CATEGORIES.find(c => c.name === activeCategory)?.items.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTool(item.id)}
                                className={`flex items-center space-x-2 p-2 rounded-lg text-xs font-medium transition-all ${activeTool === item.id ? 'bg-slate-800 border-l-2 border-cyan-400 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                            >
                                <span className={activeTool === item.id ? 'text-cyan-400' : 'text-slate-500'}>{<item.icon />}</span>
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Dynamic Inputs */}
                {activeTool !== 'dashboard' && (
                    <div className="space-y-4 flex-grow">
                        <div className="h-px bg-slate-800 w-full mb-4"></div>
                        
                        {(activeTool === 'screenwriter' || activeTool === 'storyboard') && (
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Scene Description</label>
                                <textarea
                                    rows={6}
                                    value={inputs.sceneText}
                                    onChange={(e) => updateInput('sceneText', e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500 resize-none"
                                    placeholder="INT. COFFEE SHOP - DAY. Two spies trade secrets..."
                                />
                            </div>
                        )}

                        {activeTool === 'callsheet' && (
                            <div className="space-y-3">
                                <div><label className="text-xs text-slate-400 block mb-1">Production Title</label><input className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs" value={inputs.callSheet.title} onChange={e => updateCallSheet('title', e.target.value)} /></div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div><label className="text-xs text-slate-400 block mb-1">Date</label><input type="date" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs" value={inputs.callSheet.date} onChange={e => updateCallSheet('date', e.target.value)} /></div>
                                    <div><label className="text-xs text-slate-400 block mb-1">Call Time</label><input type="time" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs" value={inputs.callSheet.callTime} onChange={e => updateCallSheet('callTime', e.target.value)} /></div>
                                </div>
                                <div><label className="text-xs text-slate-400 block mb-1">Location</label><input className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs" value={inputs.callSheet.location} onChange={e => updateCallSheet('location', e.target.value)} placeholder="123 Studio Way" /></div>
                                <div><label className="text-xs text-slate-400 block mb-1">Notes</label><textarea className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs h-20 resize-none" value={inputs.callSheet.notes} onChange={e => updateCallSheet('notes', e.target.value)} placeholder="Parking info, safety..." /></div>
                            </div>
                        )}

                        {['shotlist', 'dpr', 'casting', 'sides', 'concept', 'pitch', 'moodboard'].includes(activeTool) && (
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Prompt / Details</label>
                                <textarea
                                    rows={6}
                                    value={inputs.genericPrompt}
                                    onChange={(e) => updateInput('genericPrompt', e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500 resize-none"
                                    placeholder="Describe requirements..."
                                />
                            </div>
                        )}

                        <button 
                            onClick={handleGenerate} 
                            disabled={loading}
                            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition shadow-lg disabled:opacity-50 flex justify-center items-center"
                        >
                            {loading ? <Loader /> : 'Generate Content'}
                        </button>
                    </div>
                )}
            </div>

            {/* Main Preview Area */}
            <div className="flex-grow bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col overflow-hidden relative">
                {/* Header */}
                <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <span className="text-cyan-400 text-xl">{activeToolData && <activeToolData.icon />}</span>
                        <div>
                            <h3 className="font-bold text-white text-sm uppercase tracking-wider">{activeToolData?.label || 'Production Planner'}</h3>
                            <p className="text-[10px] text-slate-500">Project: {inputs.callSheet.title}</p>
                        </div>
                    </div>
                    {(outputs[activeTool]) && (
                        <div className="flex gap-2">
                            <button onClick={() => downloadFile(`${activeTool}_output.txt`, typeof outputs[activeTool] === 'string' ? outputs[activeTool] : JSON.stringify(outputs[activeTool]))} className="p-2 rounded hover:bg-slate-800 text-slate-400" title="Download">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </button>
                            <button onClick={() => onShare({ contentText: typeof outputs[activeTool] === 'string' ? outputs[activeTool] : 'Check out my production assets!', contentType: 'text' })} className="p-2 rounded hover:bg-slate-800 text-purple-400" title="Share">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
                            </button>
                        </div>
                    )}
                </div>

                {/* Output Content */}
                <div className="flex-grow overflow-y-auto p-8 relative">
                    <div className="absolute inset-0 bg-grid-slate-800/20 pointer-events-none"></div>
                    
                    {activeTool === 'dashboard' && (
                        <div className="space-y-6 relative z-10">
                            <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-8 rounded-2xl border border-slate-700 shadow-xl">
                                <h2 className="text-3xl font-bold text-white mb-2">Production Hub</h2>
                                <p className="text-slate-400">Status: <span className="text-green-400 font-bold">Active</span></p>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
                                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-600/50 backdrop-blur-sm">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Phase</h4>
                                        <div className="text-xl font-bold text-white">Pre-Production</div>
                                    </div>
                                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-600/50 backdrop-blur-sm">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Shoot Date</h4>
                                        <div className="text-xl font-bold text-cyan-400">{inputs.callSheet.date || 'TBD'}</div>
                                    </div>
                                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-600/50 backdrop-blur-sm">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Crew</h4>
                                        <div className="text-xl font-bold text-purple-400">12 Pending</div>
                                    </div>
                                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-600/50 backdrop-blur-sm">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tasks</h4>
                                        <div className="text-xl font-bold text-amber-400">5 Urgent</div>
                                    </div>
                                </div>
                            </div>
                            <div className="text-center text-slate-500 mt-12">
                                <p>Select a tool from the sidebar to begin creating.</p>
                            </div>
                        </div>
                    )}

                    {activeTool === 'storyboard' && outputs.storyboard && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                            {outputs.storyboard.map((panel: any, idx: number) => (
                                <div key={idx} className="bg-white p-3 rounded-lg shadow-xl">
                                    <div className="aspect-video bg-slate-100 mb-3 overflow-hidden rounded border border-slate-200">
                                        <img src={panel.img} alt={`Panel ${idx+1}`} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex justify-between items-start">
                                        <p className="text-slate-800 text-xs font-medium leading-tight">{panel.text}</p>
                                        <span className="text-slate-400 text-[10px] font-bold ml-2">#{idx+1}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTool === 'moodboard' && outputs.moodboard && (
                         <div className="relative z-10 flex items-center justify-center h-full">
                             <img src={outputs.moodboard} alt="Moodboard" className="max-w-full max-h-full rounded-lg shadow-2xl" />
                         </div>
                    )}

                    {(['screenwriter', 'callsheet', 'shotlist', 'dpr', 'casting', 'sides', 'concept', 'pitch'].includes(activeTool)) && (
                        <div className="bg-white text-slate-900 p-8 rounded-xl shadow-2xl min-h-full relative z-10 font-mono text-sm leading-relaxed border-l-4 border-cyan-500">
                            {outputs[activeTool] ? (
                                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: md.render(outputs[activeTool]) }} />
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-400 italic">
                                    Generated content will appear here.
                                </div>
                            )}
                        </div>
                    )}
                    
                    {!outputs[activeTool] && activeTool !== 'dashboard' && !loading && (
                         <div className="h-full flex flex-col items-center justify-center text-slate-600 relative z-10 opacity-60">
                            <div className="text-6xl mb-4">✨</div>
                            <p>Enter details on the left and click Generate.</p>
                        </div>
                    )}
                    
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 z-20 backdrop-blur-sm">
                            <Loader message="Producing content..." />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductionPlanner;
