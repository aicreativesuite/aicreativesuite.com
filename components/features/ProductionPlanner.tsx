
import React, { useState } from 'react';
import { generateText, generateImage } from '../../services/geminiService';
import Loader from '../common/Loader';
import { Remarkable } from 'remarkable';

const md = new Remarkable({ html: true });

interface ProductionPlannerProps { onShare: (options: { contentText: string; contentType: 'text' }) => void; }

type ToolCategory = 'Overview' | 'Development' | 'Pre-Production' | 'Production' | 'Post-Production';
type ToolId = 'dashboard' | 'screenwriter' | 'concept' | 'pitch' | 'storyboard' | 'moodboard' | 'shotlist' | 'casting' | 'callsheet' | 'dpr' | 'sides';

const downloadFile = (filename: string, content: string) => {
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
};

// --- Icons ---
const Icons = {
    Dashboard: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    Script: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
    Image: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    List: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
    Calendar: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    People: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
};

// --- Specialized Tools ---

const DashboardView = ({ onChangeTool }: { onChangeTool: (t: ToolId) => void }) => (
    <div className="space-y-6 animate-fadeIn">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
                <svg className="w-32 h-32 text-cyan-400" fill="currentColor" viewBox="0 0 24 24"><path d="M4 6h16v2H4zm2 4h12v2H6zm2 4h8v2H8zm-4 4h16v2H4z"/></svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Production Hub</h2>
            <p className="text-slate-400">Welcome back, Producer. Status: <span className="text-green-400 font-bold">Active</span></p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8 relative z-10">
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-600/50 backdrop-blur-sm">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Current Phase</h4>
                    <div className="text-xl font-bold text-white">Pre-Production</div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-600/50 backdrop-blur-sm">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Next Shoot</h4>
                    <div className="text-xl font-bold text-cyan-400">Oct 24, 08:00</div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-600/50 backdrop-blur-sm">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Cast & Crew</h4>
                    <div className="text-xl font-bold text-purple-400">14 Confirmed</div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-600/50 backdrop-blur-sm">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pending Tasks</h4>
                    <div className="text-xl font-bold text-amber-400">3 Urgent</div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div 
                onClick={() => onChangeTool('callsheet')}
                className="group bg-slate-900/50 p-6 rounded-xl border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all hover:bg-slate-800"
            >
                <div className="flex items-center justify-between mb-4">
                    <span className="p-3 bg-cyan-900/20 text-cyan-400 rounded-lg group-hover:scale-110 transition-transform"><Icons.Calendar /></span>
                    <span className="text-xs text-slate-500 group-hover:text-cyan-400">Create New →</span>
                </div>
                <h3 className="font-bold text-white mb-1">Daily Call Sheet</h3>
                <p className="text-sm text-slate-400">Generate tomorrow's schedule and crew details instantly.</p>
            </div>

            <div 
                onClick={() => onChangeTool('storyboard')}
                className="group bg-slate-900/50 p-6 rounded-xl border border-slate-800 hover:border-purple-500/50 cursor-pointer transition-all hover:bg-slate-800"
            >
                <div className="flex items-center justify-between mb-4">
                    <span className="p-3 bg-purple-900/20 text-purple-400 rounded-lg group-hover:scale-110 transition-transform"><Icons.Image /></span>
                    <span className="text-xs text-slate-500 group-hover:text-purple-400">Visualize →</span>
                </div>
                <h3 className="font-bold text-white mb-1">AI Storyboarder</h3>
                <p className="text-sm text-slate-400">Turn script descriptions into visual shot references.</p>
            </div>

            <div 
                onClick={() => onChangeTool('screenwriter')}
                className="group bg-slate-900/50 p-6 rounded-xl border border-slate-800 hover:border-green-500/50 cursor-pointer transition-all hover:bg-slate-800"
            >
                <div className="flex items-center justify-between mb-4">
                    <span className="p-3 bg-green-900/20 text-green-400 rounded-lg group-hover:scale-110 transition-transform"><Icons.Script /></span>
                    <span className="text-xs text-slate-500 group-hover:text-green-400">Write →</span>
                </div>
                <h3 className="font-bold text-white mb-1">Screenwriter</h3>
                <p className="text-sm text-slate-400">Format and generate dialogue scenes with AI.</p>
            </div>
        </div>
    </div>
);

const ScreenwriterTool = ({ onShare }: { onShare: any }) => {
    const [scene, setScene] = useState('');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        if (!scene) return;
        setLoading(true);
        try {
            const prompt = `Write a screenplay scene based on this description: "${scene}". Use standard Fountain/Screenplay format. Include Scene Headings (INT./EXT.), Action Lines, and Dialogue. Keep it professional.`;
            const res = await generateText(prompt, 'gemini-2.5-pro');
            setResult(res.text);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    return (
        <div className="flex flex-col h-full gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                <div className="lg:col-span-1 flex flex-col gap-4 bg-slate-900/50 p-5 rounded-xl border border-slate-800">
                    <h3 className="font-bold text-white flex items-center gap-2"><Icons.Script /> Scene Setup</h3>
                    <textarea 
                        className="flex-grow w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm resize-none focus:ring-2 focus:ring-green-500" 
                        placeholder="Describe the scene... e.g., 'INT. COFFEE SHOP - DAY. Two spies trade secrets over latte art.'"
                        value={scene}
                        onChange={e => setScene(e.target.value)}
                    />
                    <div className="flex gap-2">
                        {['INT.', 'EXT.', 'DAY', 'NIGHT'].map(tag => (
                            <button key={tag} onClick={() => setScene(prev => prev + (prev ? ' ' : '') + tag)} className="px-2 py-1 bg-slate-800 text-xs text-slate-300 rounded border border-slate-700 hover:bg-slate-700">{tag}</button>
                        ))}
                    </div>
                    <button 
                        onClick={handleGenerate} 
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
                    >
                        {loading ? 'Writing...' : 'Generate Scene'}
                    </button>
                </div>
                <div className="lg:col-span-2 bg-white text-slate-900 p-8 rounded-xl shadow-2xl overflow-y-auto font-mono text-sm leading-relaxed border-l-4 border-green-500">
                    {result ? (
                        <div className="whitespace-pre-wrap">{result}</div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-400 italic">
                            Script output will appear here in standard format.
                        </div>
                    )}
                </div>
            </div>
            {result && (
                <div className="flex justify-end gap-2">
                    <button onClick={() => downloadFile('script.txt', result)} className="px-4 py-2 bg-slate-700 text-white rounded font-bold text-sm">Download .txt</button>
                    <button onClick={() => onShare({ contentText: result, contentType: 'text' })} className="px-4 py-2 bg-purple-600 text-white rounded font-bold text-sm">Share</button>
                </div>
            )}
        </div>
    );
};

const StoryboardTool = ({ onShare }: { onShare: any }) => {
    const [sceneDesc, setSceneDesc] = useState('');
    const [panels, setPanels] = useState<{img: string, text: string}[]>([]);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        if (!sceneDesc) return;
        setLoading(true);
        setPanels([]);
        try {
            // 1. Generate visual descriptions
            const descRes = await generateText(`Break down this scene into 3 distinct storyboard panels. Return ONLY a JSON array of strings describing each shot visual. Scene: "${sceneDesc}"`, 'gemini-2.5-flash');
            let descriptions = [];
            try {
                descriptions = JSON.parse(descRes.text.match(/\[.*\]/s)?.[0] || '[]');
            } catch {
                descriptions = [sceneDesc]; 
            }

            // 2. Generate images
            const newPanels = [];
            for (const desc of descriptions.slice(0, 3)) {
                const imgBytes = await generateImage(`Storyboard sketch, cinematic composition, rough pencil style: ${desc}`, '16:9');
                newPanels.push({
                    img: `data:image/jpeg;base64,${imgBytes}`,
                    text: desc
                });
            }
            setPanels(newPanels);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    return (
        <div className="flex flex-col h-full gap-6">
            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                <div className="flex gap-4">
                    <input 
                        className="flex-grow bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500" 
                        placeholder="Describe the action sequence for storyboarding..."
                        value={sceneDesc}
                        onChange={e => setSceneDesc(e.target.value)}
                    />
                    <button 
                        onClick={handleGenerate} 
                        disabled={loading}
                        className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 rounded-lg transition disabled:opacity-50 min-w-[120px]"
                    >
                        {loading ? <Loader /> : 'Visualize'}
                    </button>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto custom-scrollbar">
                {panels.length === 0 && !loading && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
                        <Icons.Image />
                        <p className="mt-2">Enter a scene to generate panels</p>
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {panels.map((panel, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-lg shadow-xl transform transition hover:-translate-y-1">
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
            </div>
            {panels.length > 0 && (
                <div className="flex justify-end">
                    <button onClick={() => onShare({ contentText: `Storyboard: ${sceneDesc}`, contentType: 'text' })} className="px-4 py-2 bg-slate-700 text-white rounded font-bold text-sm">Share Board</button>
                </div>
            )}
        </div>
    );
};

const CallSheetTool = ({ onShare }: { onShare: any }) => {
    const [data, setData] = useState({ title: '', date: '', callTime: '08:00', location: '', weather: '', notes: '' });
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const prompt = `Create a professional film production Call Sheet. 
            Production Title: ${data.title}
            Date: ${data.date}
            General Crew Call: ${data.callTime}
            Location: ${data.location}
            Weather Forecast: ${data.weather}
            Notes: ${data.notes}
            
            Include sections for: Production Office, Key Crew, Scenes to be Shot (make up 3 realistic scenes), Cast List (make up 3 cast members), and Safety Notes. Use Markdown format table structures.`;
            
            const res = await generateText(prompt, 'gemini-2.5-flash');
            setResult(res.text);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 flex flex-col gap-4 overflow-y-auto">
                <h3 className="font-bold text-white flex items-center gap-2"><Icons.Calendar /> Call Sheet Details</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-slate-400 block mb-1">Production Title</label>
                        <input className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm" value={data.title} onChange={e => setData({...data, title: e.target.value})} placeholder="Project Name" />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 block mb-1">Date</label>
                        <input type="date" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm" value={data.date} onChange={e => setData({...data, date: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 block mb-1">General Call</label>
                        <input type="time" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm" value={data.callTime} onChange={e => setData({...data, callTime: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 block mb-1">Weather</label>
                        <input className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm" value={data.weather} onChange={e => setData({...data, weather: e.target.value})} placeholder="e.g. Sunny, 75F" />
                    </div>
                </div>
                <div>
                    <label className="text-xs text-slate-400 block mb-1">Location</label>
                    <input className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm" value={data.location} onChange={e => setData({...data, location: e.target.value})} placeholder="123 Studio Way, Hollywood" />
                </div>
                <div>
                    <label className="text-xs text-slate-400 block mb-1">Special Notes</label>
                    <textarea className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm h-24 resize-none" value={data.notes} onChange={e => setData({...data, notes: e.target.value})} placeholder="Parking info, safety gear required..." />
                </div>
                <button onClick={handleGenerate} disabled={loading} className="mt-auto w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition disabled:opacity-50">{loading ? 'Generating...' : 'Create Call Sheet'}</button>
            </div>

            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col h-full">
                <div className="flex-grow overflow-y-auto bg-white rounded-lg p-8 text-slate-900 shadow-inner">
                    {result ? (
                        <div className="prose prose-sm max-w-none font-mono" dangerouslySetInnerHTML={{ __html: md.render(result) }} />
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-400 text-sm">Preview will appear here</div>
                    )}
                </div>
                {result && (
                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-800">
                        <button onClick={() => downloadFile(`callsheet_${data.date}.md`, result)} className="px-4 py-2 bg-slate-700 text-white rounded font-bold text-sm">Download</button>
                        <button onClick={() => onShare({ contentText: result, contentType: 'text' })} className="px-4 py-2 bg-purple-600 text-white rounded font-bold text-sm">Share</button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Generic Text Tool (Shotlist, Breakdown) ---
const TextGenTool = ({ title, promptPrefix, placeholder, onShare }: any) => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGen = async () => {
        if(!input) return;
        setLoading(true);
        try {
            const res = await generateText(`${promptPrefix} "${input}". Return as a Markdown table or structured list.`, 'gemini-2.5-flash');
            setOutput(res.text);
        } catch(e) { console.error(e); } finally { setLoading(false); }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 flex flex-col gap-4">
                <h3 className="font-bold text-white">{title}</h3>
                <textarea className="flex-grow w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm resize-none" placeholder={placeholder} value={input} onChange={e => setInput(e.target.value)} />
                <button onClick={handleGen} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition disabled:opacity-50">{loading ? 'Processing...' : 'Generate'}</button>
            </div>
            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 overflow-y-auto">
                {output ? <div className="prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: md.render(output) }} /> : <div className="text-center text-slate-500 mt-20">Output here</div>}
                {output && <div className="mt-4 flex justify-end"><button onClick={() => onShare({contentText: output, contentType: 'text'})} className="px-4 py-2 bg-purple-600 text-white rounded text-sm font-bold">Share</button></div>}
            </div>
        </div>
    );
};

// --- Main Layout ---

const ProductionPlanner: React.FC<ProductionPlannerProps> = ({ onShare }) => {
    const [activeTool, setActiveTool] = useState<ToolId>('dashboard');
    const [collapsed, setCollapsed] = useState(false);

    const categories: { name: ToolCategory, items: { id: ToolId, label: string, icon: React.FC<any> }[] }[] = [
        { name: 'Overview', items: [{ id: 'dashboard', label: 'Dashboard', icon: Icons.Dashboard }] },
        { name: 'Development', items: [{ id: 'concept', label: 'Concept Dev', icon: Icons.List }, { id: 'screenwriter', label: 'Screenwriter', icon: Icons.Script }, { id: 'pitch', label: 'Pitch Deck', icon: Icons.Image }] },
        { name: 'Pre-Production', items: [{ id: 'storyboard', label: 'Storyboarder', icon: Icons.Image }, { id: 'shotlist', label: 'Shot List', icon: Icons.List }, { id: 'moodboard', label: 'Mood Board', icon: Icons.Image }, { id: 'casting', label: 'Casting', icon: Icons.People }] },
        { name: 'Production', items: [{ id: 'callsheet', label: 'Call Sheet', icon: Icons.Calendar }, { id: 'dpr', label: 'Daily Report', icon: Icons.List }, { id: 'sides', label: 'Script Sides', icon: Icons.Script }] },
    ];

    const renderTool = () => {
        switch (activeTool) {
            case 'dashboard': return <DashboardView onChangeTool={setActiveTool} />;
            case 'screenwriter': return <ScreenwriterTool onShare={onShare} />;
            case 'storyboard': return <StoryboardTool onShare={onShare} />;
            case 'callsheet': return <CallSheetTool onShare={onShare} />;
            case 'shotlist': return <TextGenTool title="Shot List Creator" promptPrefix="Create a detailed shot list for the scene:" placeholder="Describe scene action..." onShare={onShare} />;
            case 'dpr': return <TextGenTool title="Daily Production Report" promptPrefix="Generate a DPR template/report for:" placeholder="Production details..." onShare={onShare} />;
            case 'casting': return <TextGenTool title="Casting Breakdown" promptPrefix="Create a casting breakdown for characters:" placeholder="Character descriptions..." onShare={onShare} />;
            case 'sides': return <TextGenTool title="Script Sides Generator" promptPrefix="Extract script sides for character:" placeholder="Paste scene and character name..." onShare={onShare} />;
            case 'concept': return <TextGenTool title="Concept Developer" promptPrefix="Develop a film concept from:" placeholder="Logline or idea..." onShare={onShare} />;
            case 'pitch': return <TextGenTool title="Pitch Deck Outline" promptPrefix="Create a pitch deck outline for:" placeholder="Movie title and synopsis..." onShare={onShare} />;
            case 'moodboard': return <div className="flex flex-col items-center justify-center h-full text-slate-500"><Icons.Image /><p className="mt-4">Use the <span className="text-cyan-400 cursor-pointer font-bold" onClick={() => setActiveTool('storyboard')}>Storyboarder</span> for visual generation.</p></div>;
            default: return <div className="p-8 text-center text-slate-500">Tool under maintenance.</div>;
        }
    };

    return (
        <div className="flex h-[calc(100vh-140px)] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
            {/* Sidebar */}
            <div className={`flex-shrink-0 bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col ${collapsed ? 'w-16' : 'w-64'}`}>
                <div className="p-4 border-b border-slate-800 flex justify-between items-center h-16">
                    {!collapsed && <span className="font-bold text-white uppercase tracking-widest text-xs">Production</span>}
                    <button onClick={() => setCollapsed(!collapsed)} className="text-slate-400 hover:text-white">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={collapsed ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"} /></svg>
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto py-4 space-y-6 custom-scrollbar">
                    {categories.map((cat) => (
                        <div key={cat.name}>
                            {!collapsed && <h4 className="px-6 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{cat.name}</h4>}
                            <div className="space-y-0.5">
                                {cat.items.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTool(item.id)}
                                        title={collapsed ? item.label : ''}
                                        className={`w-full flex items-center px-6 py-2.5 transition-colors ${activeTool === item.id ? 'bg-cyan-900/20 text-cyan-400 border-r-2 border-cyan-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
                                    >
                                        <span className={`${collapsed ? 'mx-auto' : 'mr-3'}`}>{<item.icon />}</span>
                                        {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-grow flex flex-col min-w-0 bg-slate-950 relative">
                {/* Header */}
                <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-sm z-10">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        {categories.flatMap(c => c.items).find(i => i.id === activeTool)?.label}
                    </h2>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span>Project: <span className="text-white font-bold">Untitled Film</span></span>
                    </div>
                </header>

                {/* Workspace */}
                <div className="flex-grow overflow-y-auto p-8 custom-scrollbar">
                    {renderTool()}
                </div>
            </div>
        </div>
    );
};

export default ProductionPlanner;
