
import React, { useState, useEffect } from 'react';
import { generateText, generateImage } from '../../services/geminiService';
import Loader from '../common/Loader';
import { Remarkable } from 'remarkable';

const md = new Remarkable({ html: true });

interface ProductionPlannerProps { onShare: (options: { contentText: string; contentType: 'text' }) => void; }
type ToolId = 'dashboard' | 'call-sheet' | 'screenwriting' | 'av-scripts' | 'shot-lists' | 'storyboards' | 'mood-boards' | 'script-breakdowns' | 'shooting-schedules' | 'script-sides' | 'contacts' | 'task-boards' | 'calendar' | 'files';

const downloadFile = (filename: string, content: string) => {
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
};

const ToolActions = ({ onShare, onEdit, onDownload, onDiscard, isEditing }: any) => (
    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-700/50 justify-end">
        {onEdit && <button onClick={onEdit} className={`px-3 py-1.5 text-xs font-bold rounded transition ${isEditing ? 'bg-blue-600 text-white' : 'bg-slate-700 text-white'}`}>{isEditing ? 'Done' : 'Edit'}</button>}
        {onShare && <button onClick={onShare} className="px-3 py-1.5 text-xs font-bold bg-purple-600 text-white rounded">Share</button>}
        {onDownload && <button onClick={onDownload} className="px-3 py-1.5 text-xs font-bold bg-slate-700 text-white rounded">Download</button>}
        {onDiscard && <button onClick={onDiscard} className="px-3 py-1.5 text-xs font-bold bg-red-900/50 text-red-200 rounded">Discard</button>}
    </div>
);

// --- Generic Layout ---
const GenerativeToolLayout = ({ title, inputLabel, inputPlaceholder, inputValue, onInputChange, onGenerate, loading, loadingLabel, result, onResultChange, format = 'markdown', filename, onShare, onDiscard, extraInputs }: any) => {
    const [isEditing, setIsEditing] = useState(false);
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <div className="space-y-4 flex flex-col h-full bg-slate-800/30 p-6 rounded-xl border border-slate-700">
                <h3 className="font-bold text-white">{title}</h3>
                {extraInputs}
                <label className="block text-sm font-medium text-slate-400">{inputLabel}</label>
                <textarea className="w-full bg-slate-900 border border-slate-700 rounded-lg p-4 flex-grow focus:ring-2 focus:ring-cyan-500 text-white min-h-[200px] resize-none" placeholder={inputPlaceholder} value={inputValue} onChange={e => onInputChange(e.target.value)} />
                <button onClick={onGenerate} disabled={loading} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition disabled:opacity-50">{loading ? loadingLabel : `Generate ${title}`}</button>
            </div>
            <div className="bg-slate-900/80 p-6 rounded-lg border border-slate-700 shadow-lg h-full overflow-y-auto min-h-[400px] flex flex-col">
                <div className="flex-grow">
                    {result ? (isEditing ? <textarea className="w-full h-full bg-slate-800 text-white p-4 rounded resize-none" value={result} onChange={e => onResultChange(e.target.value)} /> : (format === 'markdown' ? <div className="prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: md.render(result) }} /> : <div className="whitespace-pre-wrap">{result}</div>)) : <div className="text-center text-slate-500 mt-20">Output will appear here.</div>}
                </div>
                {result && <ToolActions onShare={() => onShare({ contentText: result, contentType: 'text' })} onDownload={() => downloadFile(filename, result)} onEdit={() => setIsEditing(!isEditing)} isEditing={isEditing} onDiscard={onDiscard} />}
            </div>
        </div>
    );
};

// --- Tools ---
const ScreenwriterTool = ({ onShare }: { onShare: any }) => {
    const [val, setVal] = useState(''); const [res, setRes] = useState(''); const [load, setLoad] = useState(false);
    return <GenerativeToolLayout title="Scene Writer" inputLabel="Scene Idea" inputPlaceholder="A tense negotiation..." inputValue={val} onInputChange={setVal} result={res} onResultChange={setRes} loading={load} loadingLabel="Writing..." filename="script.txt" onShare={onShare} onDiscard={() => setRes('')} format="text" onGenerate={async () => { setLoad(true); try { const r = await generateText(`Write screenplay scene: "${val}".`, 'gemini-2.5-pro'); setRes(r.text); } catch(e) { console.error(e); } setLoad(false); }} />;
};

const AvScriptTool = ({ onShare }: { onShare: any }) => {
    const [val, setVal] = useState(''); const [res, setRes] = useState(''); const [load, setLoad] = useState(false);
    return <GenerativeToolLayout title="AV Script" inputLabel="Topic" inputPlaceholder="30s Commercial..." inputValue={val} onInputChange={setVal} result={res} onResultChange={setRes} loading={load} loadingLabel="Generating..." filename="av_script.md" onShare={onShare} onDiscard={() => setRes('')} onGenerate={async () => { setLoad(true); try { const r = await generateText(`2-column AV script for: "${val}". Markdown table.`, 'gemini-2.5-flash'); setRes(r.text); } catch(e) { console.error(e); } setLoad(false); }} />;
};

const ScriptBreakdownTool = ({ onShare }: { onShare: any }) => {
    const [val, setVal] = useState(''); const [res, setRes] = useState(''); const [load, setLoad] = useState(false);
    return <GenerativeToolLayout title="Breakdown" inputLabel="Scene Text" inputPlaceholder="INT. DINER..." inputValue={val} onInputChange={setVal} result={res} onResultChange={setRes} loading={load} loadingLabel="Analyzing..." filename="breakdown.md" onShare={onShare} onDiscard={() => setRes('')} onGenerate={async () => { setLoad(true); try { const r = await generateText(`Breakdown script into props, cast, sfx: "${val}". Markdown.`, 'gemini-2.5-flash'); setRes(r.text); } catch(e) { console.error(e); } setLoad(false); }} />;
};

const ProductionScheduleTool = ({ onShare }: { onShare: any }) => {
    const [val, setVal] = useState(''); const [res, setRes] = useState(''); const [load, setLoad] = useState(false);
    return <GenerativeToolLayout title="Schedule" inputLabel="Details" inputPlaceholder="Short film, 5 days..." inputValue={val} onInputChange={setVal} result={res} onResultChange={setRes} loading={load} loadingLabel="Scheduling..." filename="schedule.md" onShare={onShare} onDiscard={() => setRes('')} onGenerate={async () => { setLoad(true); try { const r = await generateText(`Shooting schedule for: ${val}. Markdown table.`, 'gemini-2.5-flash'); setRes(r.text); } catch(e) { console.error(e); } setLoad(false); }} />;
};

const ScriptSidesTool = ({ onShare }: { onShare: any }) => {
    const [char, setChar] = useState(''); const [scene, setScene] = useState(''); const [res, setRes] = useState(''); const [load, setLoad] = useState(false);
    return <GenerativeToolLayout title="Sides" inputLabel="Scene Context" inputPlaceholder="Paste scene..." inputValue={scene} onInputChange={setScene} extraInputs={<div><label className="text-sm text-slate-400">Character</label><input className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" value={char} onChange={e=>setChar(e.target.value)}/></div>} result={res} onResultChange={setRes} loading={load} loadingLabel="Generating..." filename="sides.txt" onShare={onShare} onDiscard={() => setRes('')} format="text" onGenerate={async () => { setLoad(true); try { const r = await generateText(`Script sides for "${char}" from: "${scene}".`, 'gemini-2.5-flash'); setRes(r.text); } catch(e) { console.error(e); } setLoad(false); }} />;
};

const ContactsTool = ({ onShare }: { onShare: any }) => {
    const [res, setRes] = useState(''); const [load, setLoad] = useState(false);
    return <div className="h-full flex flex-col"><div className="mb-4 flex justify-end"><button onClick={async()=>{setLoad(true); try { const r = await generateText(`Film crew contact list template. Markdown table.`, 'gemini-2.5-flash'); setRes(r.text); } catch(e){} setLoad(false);}} disabled={load} className="bg-slate-700 text-white px-4 py-2 rounded">Generate Template</button></div><div className="bg-slate-900/80 p-6 rounded-lg border border-slate-700 flex-grow overflow-y-auto min-h-[400px]">{res ? <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{__html: md.render(res)}}/> : <div className="text-center text-slate-500 mt-20">Template here.</div>}</div>{res && <ToolActions onShare={() => onShare({contentText: res, contentType: 'text'})} onDownload={() => downloadFile('contacts.md', res)} onDiscard={() => setRes('')} />}</div>;
};

const CallSheetTool = ({ onShare }: { onShare: any }) => {
    const [t, setT] = useState(''); const [d, setD] = useState(''); const [l, setL] = useState(''); const [res, setRes] = useState(''); const [load, setLoad] = useState(false);
    return <GenerativeToolLayout title="Call Sheet" inputLabel="Instructions" inputPlaceholder="Any specific notes..." inputValue="" onInputChange={()=>{}} extraInputs={<><input placeholder="Title" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" onChange={e=>setT(e.target.value)}/><input type="date" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" onChange={e=>setD(e.target.value)}/><input placeholder="Location" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" onChange={e=>setL(e.target.value)}/></>} result={res} onResultChange={setRes} loading={load} loadingLabel="Building..." filename="callsheet.md" onShare={onShare} onDiscard={() => setRes('')} onGenerate={async () => { if(!t) return; setLoad(true); try { const r = await generateText(`Call sheet. Title:${t}, Date:${d}, Loc:${l}. Markdown.`, 'gemini-2.5-flash'); setRes(r.text); } catch(e){} setLoad(false); }} />;
};

// --- Visual Tools ---
const MoodBoardTool = ({ onShare }: { onShare: any }) => {
    const [theme, setTheme] = useState(''); const [imgs, setImgs] = useState<string[]>([]); const [load, setLoad] = useState(false);
    return <div className="space-y-6"><div className="flex gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700"><input className="flex-grow bg-slate-900 border-slate-700 rounded p-3 text-white" placeholder="Theme" value={theme} onChange={e=>setTheme(e.target.value)}/><button onClick={async()=>{if(!theme)return; setLoad(true); setImgs([]); try{const ps=[`Cinematic ${theme}`,`Detail ${theme}`,`Wide ${theme}`,`Texture ${theme}`]; const rs=[]; for(const p of ps) rs.push(`data:image/jpeg;base64,${await generateImage(p,'1:1')}`); setImgs(rs);}catch(e){} setLoad(false);}} disabled={load} className="bg-pink-600 text-white px-6 rounded font-bold">Create</button></div><div className="grid grid-cols-4 gap-4 min-h-[300px]">{load?<Loader/>:imgs.map((s,i)=><img key={i} src={s} className="w-full rounded-xl"/>)}</div>{imgs.length>0&&<ToolActions onShare={()=>onShare({contentUrl:imgs[0], contentText:theme, contentType:'image'})} onDiscard={()=>setImgs([])}/>}</div>;
};

const StoryboardTool = ({ onShare }: { onShare: any }) => {
    const [desc, setDesc] = useState(''); const [panels, setPanels] = useState<{img:string,text:string}[]>([]); const [load, setLoad] = useState(false);
    return <div className="space-y-6"><div className="flex gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700"><input className="flex-grow bg-slate-900 border-slate-700 rounded p-3 text-white" placeholder="Scene Action" value={desc} onChange={e=>setDesc(e.target.value)}/><button onClick={async()=>{if(!desc)return; setLoad(true); try{const t = await generateText(`3 storyboard panel descs for: "${desc}". JSON array of strings.`, 'gemini-2.5-flash'); let ds=JSON.parse(t.text.match(/\[.*\]/s)?.[0]||`["${desc}"]`); const ps=[]; for(const d of ds.slice(0,3)) ps.push({img:`data:image/jpeg;base64,${await generateImage(`Storyboard sketch: ${d}`,'16:9')}`,text:d}); setPanels(ps);}catch(e){} setLoad(false);}} disabled={load} className="bg-blue-600 text-white px-6 rounded font-bold">Generate</button></div>{load?<Loader/>:<div className="grid grid-cols-3 gap-4">{panels.map((p,i)=><div key={i} className="bg-white p-2 rounded"><img src={p.img} className="w-full"/><p className="text-black text-xs">{p.text}</p></div>)}</div>}{panels.length>0&&<ToolActions onShare={()=>onShare({contentText:`Storyboard: ${desc}`, contentType:'text'})} onDiscard={()=>setPanels([])}/>}</div>;
};

const ShotListTool = ({ onShare }: { onShare: any }) => {
    const [desc, setDesc] = useState(''); const [shots, setShots] = useState<any[]>([]); const [load, setLoad] = useState(false);
    return <div className="space-y-6"><div className="flex gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700"><input className="flex-grow bg-slate-900 border-slate-700 rounded p-3 text-white" placeholder="Scene Context" value={desc} onChange={e=>setDesc(e.target.value)}/><button onClick={async()=>{if(!desc)return; setLoad(true); try{const r=await generateText(`Shot list for: "${desc}". JSON array {shotNumber, type, angle, movement, description}.`, 'gemini-2.5-flash'); setShots(JSON.parse(r.text.match(/\[.*\]/s)?.[0]||'[]'));}catch(e){} setLoad(false);}} disabled={load} className="bg-green-600 text-white px-6 rounded font-bold">Generate</button></div>{shots.length>0&&<><table className="w-full text-left text-sm text-slate-300"><thead className="bg-slate-800"><tr><th className="px-4 py-2">#</th><th className="px-4 py-2">Type</th><th className="px-4 py-2">Angle</th><th className="px-4 py-2">Move</th><th className="px-4 py-2">Desc</th></tr></thead><tbody>{shots.map((s,i)=><tr key={i} className="border-b border-slate-700"><td className="px-4 py-2">{s.shotNumber||i+1}</td><td className="px-4 py-2">{s.type}</td><td className="px-4 py-2">{s.angle}</td><td className="px-4 py-2">{s.movement}</td><td className="px-4 py-2">{s.description}</td></tr>)}</tbody></table><ToolActions onShare={()=>onShare({contentText:JSON.stringify(shots), contentType:'text'})} onDiscard={()=>setShots([])}/></>}</div>;
};

const DashboardTool = ({ onChangeTool }: any) => (
    <div className="space-y-8"><div className="bg-gradient-to-r from-slate-800 to-slate-900 p-8 rounded-2xl border border-slate-700 shadow-lg"><h2 className="text-3xl font-bold text-white mb-2">Production Overview</h2><div className="grid grid-cols-3 gap-6 mt-8"><div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700"><h4 className="text-sm font-bold text-slate-400 uppercase">Status</h4><div className="text-2xl font-bold text-green-400">Pre-Production</div></div><div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700"><h4 className="text-sm font-bold text-slate-400 uppercase">Next Shoot</h4><div className="text-xl font-bold text-white">Oct 24</div></div><div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700"><h4 className="text-sm font-bold text-slate-400 uppercase">Tasks</h4><div className="text-2xl font-bold text-amber-400">3 Urgent</div></div></div></div></div>
);

const ProductionPlanner: React.FC<ProductionPlannerProps> = ({ onShare }) => {
    const [activeTool, setActiveTool] = useState<ToolId>('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const menu = [
        { title: "Start", items: [{ id: 'dashboard', label: 'Dashboard', icon: '🏠' }] },
        { title: "Write", items: [{ id: 'screenwriting', label: 'Screenwriting', icon: '✍️' }, { id: 'av-scripts', label: 'AV Scripts', icon: '🎬' }] },
        { title: "Breakdown", items: [{ id: 'script-breakdowns', label: 'Script Breakdowns', icon: '🔍' }] },
        { title: "Visualize", items: [{ id: 'shot-lists', label: 'Shot Lists', icon: '🎥' }, { id: 'storyboards', label: 'Storyboards', icon: '🖼️' }, { id: 'mood-boards', label: 'Mood Boards', icon: '🎨' }] },
        { title: "Plan", items: [{ id: 'contacts', label: 'Contacts', icon: '👥' }, { id: 'task-boards', label: 'Task Boards', icon: '✅' }, { id: 'calendar', label: 'Calendar', icon: '🗓️' }, { id: 'files', label: 'Files', icon: '📁' }] },
        { title: "Shoot", items: [{ id: 'call-sheet', label: 'Call Sheet', icon: '📋' }, { id: 'shooting-schedules', label: 'Schedules', icon: '📅' }, { id: 'script-sides', label: 'Sides', icon: '📄' }] },
    ];

    const renderTool = () => {
        switch(activeTool) {
            case 'screenwriting': return <ScreenwriterTool onShare={onShare} />;
            case 'av-scripts': return <AvScriptTool onShare={onShare} />;
            case 'script-breakdowns': return <ScriptBreakdownTool onShare={onShare} />;
            case 'shot-lists': return <ShotListTool onShare={onShare} />;
            case 'storyboards': return <StoryboardTool onShare={onShare} />;
            case 'mood-boards': return <MoodBoardTool onShare={onShare} />;
            case 'contacts': return <ContactsTool onShare={onShare} />;
            case 'call-sheet': return <CallSheetTool onShare={onShare} />;
            case 'shooting-schedules': return <ProductionScheduleTool onShare={onShare} />;
            case 'script-sides': return <ScriptSidesTool onShare={onShare} />;
            case 'task-boards': return <div className="text-slate-500">Task Board Component</div>;
            case 'calendar': return <div className="text-slate-500">Calendar Component</div>;
            case 'files': return <div className="text-slate-500">File Sharing Component</div>;
            default: return <DashboardTool onChangeTool={setActiveTool} />;
        }
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] overflow-hidden bg-slate-950 rounded-xl border border-slate-800">
            <div className={`flex-shrink-0 bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col ${isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}`}>
                <div className="p-4 border-b border-slate-800 flex justify-between"><h3 className="font-bold text-white">Production</h3><button onClick={()=>setIsSidebarOpen(false)} className="lg:hidden">X</button></div>
                <div className="overflow-y-auto h-full pb-20">{menu.map((g, i) => <div key={i} className="mb-2"><h4 className="px-4 py-2 text-xs font-bold text-slate-500 uppercase">{g.title}</h4>{g.items.map(it => <button key={it.id} onClick={() => setActiveTool(it.id as ToolId)} className={`w-full text-left px-4 py-2.5 flex items-center space-x-3 hover:bg-slate-800 ${activeTool === it.id ? 'text-cyan-400 bg-slate-800' : 'text-slate-400'}`}><span>{it.icon}</span><span>{it.label}</span></button>)}</div>)}</div>
            </div>
            <div className="flex-grow flex flex-col min-w-0">
                <div className="h-16 border-b border-slate-800 flex items-center px-6 bg-slate-900/50"><button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="mr-4 text-slate-400">☰</button><h2 className="text-xl font-bold text-white">{menu.flatMap(g=>g.items).find(i=>i.id===activeTool)?.label}</h2></div>
                <div className="flex-grow overflow-y-auto p-6 bg-grid-slate-900/50">{renderTool()}</div>
            </div>
        </div>
    );
};

export default ProductionPlanner;
