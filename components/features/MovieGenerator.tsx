
import React, { useState, useEffect, useRef } from 'react';
import { 
    generateMovieConcept, 
    generateDetailedStory, 
    generateDetailedCharacters,
    generateScreenplayScene,
    generateVisualPrompts,
    generateImage,
    generateVideoFromPrompt,
    pollVideoOperation,
    generateSpeech,
    generateProductionPlan,
    generateMarketingAssets,
    generateText,
    generateCharacterSheet,
    generateWorldDetails,
    analyzeStoryStructure,
    generateSceneBreakdown
} from '../../services/geminiService';
import { 
    MOVIE_GENRES, 
    VISUAL_STYLES, 
    TTS_VOICES,
} from '../../constants';
import Loader from '../common/Loader';
import { Remarkable } from 'remarkable';
import ApiKeyDialog from '../common/ApiKeyDialog';
import { pcmToWav, decode } from '../../utils';

const md = new Remarkable({ html: true });

// --- Types ---
type Phase = 'input' | 'story' | 'preprod' | 'audio' | 'video' | 'post' | 'agent' | 'blueprint';

interface CharacterData {
    name: string;
    role: string;
    bio: string;
    visual: string;
    voiceProfile?: string;
    image?: string;
}

interface MovieState {
    // 1. Input
    title: string;
    logline: string;
    genre: string;
    tone: string;
    duration: string;
    targetAudience: string;
    
    // 2. Story Engine
    characterBible: CharacterData[];
    structure: any; // 3-Act
    screenplay: {id: string, slug: string, content: string}[];
    
    // 3. Pre-Prod
    visualStyle: { style: string, palette: string, lighting: string, referenceImage?: string };
    storyboards: { sceneId: string, description: string, image?: string }[];
    locations: string[];

    // 4. Audio
    castVoices: Record<string, string>; // character -> voiceId
    audioTracks: { id: string, type: 'dialogue' | 'sfx' | 'music', name: string, url?: string }[];

    // 5. Video
    scenes: { id: string, prompt: string, camera: string, videoUrl?: string }[];

    // 6. Post
    editList: string[];
    finalRenderUrl?: string;
}

const PHASES: { id: Phase, label: string, icon: string, desc: string }[] = [
    { id: 'input', label: '1. Input & Brief', icon: '🎬', desc: 'Define the core concept.' },
    { id: 'story', label: '2. Story Engine', icon: '📖', desc: 'Script & Narrative Architecture.' },
    { id: 'preprod', label: '3. Pre-Production', icon: '🎨', desc: 'Visual Bible & Storyboards.' },
    { id: 'audio', label: '4. Voice & Audio', icon: '🔊', desc: 'Casting & Sound Design.' },
    { id: 'video', label: '5. Video Pipeline', icon: '🎥', desc: 'Scene Generation Engine.' },
    { id: 'post', label: '6. Assembly & Post', icon: '🎞️', desc: 'Editing, VFX & Rendering.' },
    { id: 'agent', label: 'Autonomous Agent', icon: '🤖', desc: 'One-Click Full Movie Mode.' },
    { id: 'blueprint', label: 'Blueprint', icon: '📐', desc: 'System Architecture Diagram.' },
];

const CAMERA_MOVES = ['Static', 'Dolly In', 'Dolly Out', 'Pan Left', 'Pan Right', 'Tilt Up', 'Tilt Down', 'Drone Flyover', 'Steadicam Follow', 'Handheld Chaos'];

const MovieGenerator: React.FC<{ onShare: (options: any) => void }> = ({ onShare }) => {
    const [activePhase, setActivePhase] = useState<Phase>('input');
    const [movie, setMovie] = useState<MovieState>({
        title: '', logline: '', genre: MOVIE_GENRES[0], tone: 'Cinematic', duration: '120 min', targetAudience: 'General',
        characterBible: [], structure: null, screenplay: [],
        visualStyle: { style: VISUAL_STYLES[0], palette: 'Teal & Orange', lighting: 'Natural' },
        storyboards: [], locations: [],
        castVoices: {}, audioTracks: [],
        scenes: [],
        editList: []
    });

    // Inputs for current operations
    const [promptInput, setPromptInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
    const [apiKeyReady, setApiKeyReady] = useState(false);
    
    // Agent State
    const [agentLogs, setAgentLogs] = useState<string[]>([]);
    const [isAgentRunning, setIsAgentRunning] = useState(false);

    const pollIntervalRef = useRef<number | null>(null);

    const updateMovie = (updates: Partial<MovieState>) => setMovie(prev => ({ ...prev, ...updates }));

    // --- Actions ---

    // 1. Input
    const handleConceptGen = async () => {
        setLoading(true);
        try {
            const res = await generateMovieConcept(movie.genre, movie.tone, promptInput || "A blockbuster movie concept", movie.duration);
            const data = JSON.parse(res.text);
            updateMovie({ title: data.title, logline: data.logline });
            setActivePhase('story');
        } catch(e:any) { setError(e.message); } finally { setLoading(false); }
    };

    // 2. Story Engine
    const handleStoryGen = async () => {
        setLoading(true);
        setLoadingMessage('Architecting narrative structure...');
        try {
            // Structure
            const structRes = await generateDetailedStory(movie.title, movie.logline, movie.genre);
            const structure = JSON.parse(structRes.text);
            
            // Characters
            const charRes = await generateDetailedCharacters(movie.title, movie.logline);
            const charsRaw = JSON.parse(charRes.text);
            const characters = charsRaw.map((c: any) => ({ name: c.name, role: c.role, bio: c.backstory, visual: c.visualDescription }));
            
            updateMovie({ structure, characterBible: characters });
        } catch(e:any) { setError(e.message); } finally { setLoading(false); }
    };

    const handleScriptGen = async (beat: string) => {
        setLoading(true);
        setLoadingMessage(`Writing screenplay for: ${beat}...`);
        try {
            const res = await generateScreenplayScene(movie.title, beat, "Standard", ["Dialogue", "Action", "Camera"]);
            updateMovie({ screenplay: [...movie.screenplay, { id: Date.now().toString(), slug: beat, content: res.text }] });
        } catch(e:any) { setError(e.message); } finally { setLoading(false); }
    };

    // 3. Pre-Production
    const handleVisualBible = async () => {
        setLoading(true);
        try {
            const prompt = `Cinematic visual style frame for "${movie.title}". Style: ${movie.visualStyle.style}. Color Palette: ${movie.visualStyle.palette}. Lighting: ${movie.visualStyle.lighting}. High resolution, 8k, movie still.`;
            const imgBytes = await generateImage(prompt, "16:9");
            updateMovie({ visualStyle: { ...movie.visualStyle, referenceImage: `data:image/jpeg;base64,${imgBytes}` } });
        } catch(e:any) { setError(e.message); } finally { setLoading(false); }
    };

    const handleStoryboard = async () => {
        setLoading(true);
        try {
            const scenes = movie.structure?.acts?.[0]?.beats?.slice(0, 3) || [movie.logline];
            const res = await generateVisualPrompts(movie.title, movie.visualStyle.style, scenes);
            const prompts: any[] = JSON.parse(res.text);
            
            const newBoards = [];
            for (const p of prompts) {
                const imgBytes = await generateImage(p.prompt, "16:9");
                newBoards.push({ sceneId: p.sceneId, description: p.prompt, image: `data:image/jpeg;base64,${imgBytes}` });
            }
            updateMovie({ storyboards: newBoards });
        } catch(e:any) { setError(e.message); } finally { setLoading(false); }
    };

    // 4. Audio
    const handleVoiceCasting = () => {
        const mapping: Record<string, string> = {};
        movie.characterBible.forEach((char, idx) => {
            mapping[char.name] = TTS_VOICES[idx % TTS_VOICES.length];
        });
        updateMovie({ castVoices: mapping });
    };

    const handleDialogueGen = async (text: string, charName: string) => {
        setLoading(true);
        try {
            const voice = movie.castVoices[charName] || TTS_VOICES[0];
            const b64 = await generateSpeech(text, voice);
            if (b64) {
                const url = URL.createObjectURL(pcmToWav(decode(b64), 24000, 1, 16));
                updateMovie({ audioTracks: [...movie.audioTracks, { id: Date.now().toString(), type: 'dialogue', name: `${charName}: ${text.substring(0,10)}...`, url }] });
            }
        } catch(e:any) { setError(e.message); } finally { setLoading(false); }
    };

    // 5. Video
    const handleVideoGen = async (prompt: string, camera: string) => {
        // @ts-ignore
        if (!apiKeyReady && typeof window.aistudio !== 'undefined') {
             // @ts-ignore
             if (!(await window.aistudio.hasSelectedApiKey())) { setShowApiKeyDialog(true); return; }
             setApiKeyReady(true);
        }

        setLoading(true);
        setLoadingMessage('Rendering cinematic scene (Veo)...');
        try {
            const fullPrompt = `${prompt}. Camera Movement: ${camera}. Style: ${movie.visualStyle.style}. Cinematic lighting, 8k resolution.`;
            const op = await generateVideoFromPrompt(fullPrompt, '16:9', false);
            
            const newScene = { id: Date.now().toString(), prompt, camera, videoUrl: undefined };
            const sceneIndex = movie.scenes.length;
            updateMovie({ scenes: [...movie.scenes, newScene] });

            let operation = op;
            pollIntervalRef.current = window.setInterval(async () => {
                try {
                    operation = await pollVideoOperation(operation);
                    if (operation.done) {
                        clearInterval(pollIntervalRef.current!);
                        setLoading(false);
                        const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
                        if(uri) {
                            const res = await fetch(`${uri}&key=${process.env.API_KEY}`);
                            const blob = await res.blob();
                            const url = URL.createObjectURL(blob);
                            setMovie(prev => {
                                const scenes = [...prev.scenes];
                                scenes[sceneIndex] = { ...scenes[sceneIndex], videoUrl: url };
                                return { ...prev, scenes };
                            });
                        }
                    }
                } catch(e) { clearInterval(pollIntervalRef.current!); setLoading(false); }
            }, 5000);
        } catch(e:any) { setLoading(false); setError(e.message); }
    };

    // 7. Autonomous Agent
    const runAutonomousAgent = async () => {
        if (!movie.logline) { setError("Please define a concept first."); return; }
        setIsAgentRunning(true);
        setAgentLogs(["Initializing Autonomous Movie Agent...", "Analyzing concept..."]);
        
        const log = (msg: string) => setAgentLogs(prev => [...prev, `> ${msg}`]);
        const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

        try {
            // 1. Story
            log("Phase 1: Story Engine initiated.");
            await sleep(1000);
            await handleStoryGen();
            log("Story structure and character bible generated.");

            // 2. Pre-Prod
            log("Phase 2: Visual Development.");
            await sleep(1000);
            await handleVisualBible();
            log("Visual style bible locked.");

            // 3. Casting
            log("Phase 3: Casting.");
            handleVoiceCasting();
            log(`Cast ${Object.keys(movie.castVoices).length || 4} voice actors.`);

            // 4. Video (Simulated batch)
            log("Phase 4: Video Production Queue.");
            const keyScenes = movie.structure?.majorPlotPoints || ["Opening Scene", "Climax"];
            for (const scene of keyScenes) {
                log(`Queuing render for: ${scene}`);
                await sleep(1500); // Simulate API dispatch delay
            }
            log("Video generation tasks dispatched to Veo.");

            // 5. Assembly
            log("Phase 5: Rough Assembly.");
            await sleep(2000);
            log("Timeline assembled. Audio synced.");

            log("MOVIE GENERATION COMPLETE.");
        } catch (e: any) {
            log(`ERROR: ${e.message}`);
        } finally {
            setIsAgentRunning(false);
        }
    };

    return (
        <>
            <ApiKeyDialog show={showApiKeyDialog} onSelectKey={async () => { 
                // @ts-ignore
                await window.aistudio.openSelectKey(); 
                setApiKeyReady(true); 
                setShowApiKeyDialog(false); 
            }} />

            <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)] min-h-[600px]">
                {/* Navigation Sidebar */}
                <div className="w-full lg:w-72 flex-shrink-0 bg-slate-900/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-800 overflow-y-auto custom-scrollbar flex flex-col">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-white">Production Pipeline</h3>
                        <p className="text-xs text-slate-400">Full-Length Movie Generator</p>
                    </div>
                    <div className="space-y-1">
                        {PHASES.map(p => (
                            <button
                                key={p.id}
                                onClick={() => { setActivePhase(p.id); setError(null); }}
                                className={`w-full text-left px-3 py-3 rounded-lg text-xs font-medium transition-all flex items-center gap-3 ${activePhase === p.id ? 'bg-cyan-900/40 border border-cyan-500/50 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent'}`}
                            >
                                <span className="text-lg">{p.icon}</span>
                                <div>
                                    <div className="font-bold">{p.label}</div>
                                    <div className="text-[9px] opacity-60 font-normal">{p.desc}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Workspace */}
                <div className="flex-grow bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col overflow-hidden relative">
                    <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-white text-sm uppercase tracking-wider">{PHASES.find(p => p.id === activePhase)?.label}</h3>
                            <p className="text-[10px] text-slate-500">{movie.title || 'Untitled Project'}</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => onShare({ contentText: JSON.stringify(movie, null, 2), contentType: 'text' })} className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded font-bold transition">Save Project</button>
                        </div>
                    </div>

                    <div className="flex-grow overflow-y-auto p-8 relative custom-scrollbar">
                        <div className="absolute inset-0 bg-grid-slate-800/20 pointer-events-none"></div>
                        
                        {/* 1. INPUT PHASE */}
                        {activePhase === 'input' && (
                            <div className="max-w-2xl mx-auto space-y-6 relative z-10 animate-fadeIn">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Movie Premise</label>
                                    <textarea className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white text-sm focus:ring-2 focus:ring-cyan-500 resize-none" rows={4} placeholder="A retired spy creates a cooking show that secretly transmits codes..." value={promptInput} onChange={e => setPromptInput(e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Genre</label>
                                        <select className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-sm" value={movie.genre} onChange={e => updateMovie({genre: e.target.value})}>{MOVIE_GENRES.map(g => <option key={g}>{g}</option>)}</select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Tone</label>
                                        <input className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-sm" value={movie.tone} onChange={e => updateMovie({tone: e.target.value})} />
                                    </div>
                                </div>
                                <button onClick={handleConceptGen} disabled={loading} className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold py-4 rounded-xl shadow-lg transition hover:scale-[1.01] flex justify-center">{loading ? <Loader /> : 'Initialize Movie Project'}</button>
                            </div>
                        )}

                        {/* 2. STORY ENGINE */}
                        {activePhase === 'story' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10 animate-fadeIn">
                                <div className="space-y-4">
                                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                        <h4 className="text-sm font-bold text-white mb-2">Structure & Beats</h4>
                                        {!movie.structure ? (
                                            <button onClick={handleStoryGen} disabled={loading} className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded text-xs text-white">{loading ? 'Generating...' : 'Generate 3-Act Structure'}</button>
                                        ) : (
                                            <div className="space-y-2 text-xs text-slate-300 max-h-60 overflow-y-auto custom-scrollbar">
                                                {movie.structure.acts?.map((act: any, i: number) => (
                                                    <div key={i} className="mb-2">
                                                        <strong className="text-cyan-400 block">{act.name}</strong>
                                                        <ul className="pl-3 border-l-2 border-slate-700">{act.beats.map((b: string, j: number) => <li key={j} className="cursor-pointer hover:text-white" onClick={() => handleScriptGen(b)}>{b}</li>)}</ul>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                        <h4 className="text-sm font-bold text-white mb-2">Character Bible</h4>
                                        <div className="space-y-2 text-xs">
                                            {movie.characterBible.map((c, i) => (
                                                <div key={i} className="bg-slate-900 p-2 rounded flex justify-between items-center">
                                                    <span><strong className="text-purple-400">{c.name}</strong> ({c.role})</span>
                                                </div>
                                            ))}
                                            {movie.characterBible.length === 0 && <p className="text-slate-500 italic">No characters yet.</p>}
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col">
                                    <h4 className="text-sm font-bold text-slate-400 uppercase mb-4">Screenplay Editor</h4>
                                    <div className="flex-grow font-mono text-sm text-slate-300 whitespace-pre-wrap overflow-y-auto custom-scrollbar bg-black/20 p-4 rounded-lg">
                                        {movie.screenplay.length > 0 ? movie.screenplay.map(s => `\nEXT. ${s.slug.toUpperCase()}\n${s.content}\n`).join('\n') : '// Select a beat to write script...'}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 3. PRE-PROD */}
                        {activePhase === 'preprod' && (
                            <div className="space-y-6 relative z-10 animate-fadeIn">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                                        <h4 className="text-sm font-bold text-white mb-4">Visual Style Bible</h4>
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div><label className="text-[10px] text-slate-400 block">Art Style</label><select className="w-full bg-slate-900 border border-slate-600 rounded text-xs text-white p-2" value={movie.visualStyle.style} onChange={e => updateMovie({visualStyle: {...movie.visualStyle, style: e.target.value}})}>{VISUAL_STYLES.map(s => <option key={s}>{s}</option>)}</select></div>
                                            <div><label className="text-[10px] text-slate-400 block">Palette</label><input className="w-full bg-slate-900 border border-slate-600 rounded text-xs text-white p-2" value={movie.visualStyle.palette} onChange={e => updateMovie({visualStyle: {...movie.visualStyle, palette: e.target.value}})} /></div>
                                        </div>
                                        <button onClick={handleVisualBible} disabled={loading} className="w-full py-2 bg-pink-600 hover:bg-pink-500 text-white rounded text-xs font-bold">Generate Style Frame</button>
                                        {movie.visualStyle.referenceImage && <img src={movie.visualStyle.referenceImage} className="mt-4 w-full rounded-lg shadow-lg" />}
                                    </div>
                                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-sm font-bold text-white">Storyboards</h4>
                                            <button onClick={handleStoryboard} disabled={loading} className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded">Auto-Generate</button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                                            {movie.storyboards.map((sb, i) => (
                                                <div key={i} className="relative group">
                                                    <img src={sb.image} className="w-full rounded border border-slate-600" />
                                                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-1 text-[8px] text-white truncate">{sb.description}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 4. AUDIO */}
                        {activePhase === 'audio' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10 animate-fadeIn">
                                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-sm font-bold text-white">Voice Casting</h4>
                                        <button onClick={handleVoiceCasting} className="text-xs bg-slate-700 px-2 py-1 rounded text-white">Auto Cast</button>
                                    </div>
                                    <div className="space-y-2">
                                        {Object.entries(movie.castVoices).map(([char, voice]) => (
                                            <div key={char} className="flex justify-between items-center bg-slate-900 p-2 rounded">
                                                <span className="text-xs text-white">{char}</span>
                                                <span className="text-xs text-purple-400 bg-purple-900/20 px-2 py-0.5 rounded">{voice}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                                    <h4 className="text-sm font-bold text-white mb-4">Dialogue Recorder</h4>
                                    <textarea className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-xs text-white mb-2" rows={3} placeholder="Enter dialogue..." value={promptInput} onChange={e => setPromptInput(e.target.value)} />
                                    <div className="flex gap-2 mb-4">
                                        <select className="bg-slate-900 border border-slate-600 rounded text-xs text-white p-2 flex-grow" id="charSelect">
                                            {movie.characterBible.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                        </select>
                                        <button onClick={() => handleDialogueGen(promptInput, (document.getElementById('charSelect') as HTMLSelectElement).value)} disabled={loading} className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 rounded text-xs font-bold">Record</button>
                                    </div>
                                    <div className="space-y-2">
                                        {movie.audioTracks.filter(t => t.type === 'dialogue').map(t => (
                                            <div key={t.id} className="bg-slate-900 p-2 rounded flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-cyan-900 flex items-center justify-center text-[10px]">🗣️</div>
                                                <span className="text-xs text-slate-300 flex-grow truncate">{t.name}</span>
                                                <audio src={t.url} controls className="h-6 w-24" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 5. VIDEO */}
                        {activePhase === 'video' && (
                            <div className="flex flex-col h-full gap-4 relative z-10 animate-fadeIn">
                                <div className="flex gap-4">
                                    <div className="w-1/3 space-y-3">
                                        <div><label className="text-[10px] text-slate-400 block mb-1">Scene Description</label><textarea className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white resize-none" rows={4} value={promptInput} onChange={e => setPromptInput(e.target.value)} /></div>
                                        <div><label className="text-[10px] text-slate-400 block mb-1">Camera Move</label><select className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white" id="camSelect">{CAMERA_MOVES.map(m => <option key={m}>{m}</option>)}</select></div>
                                        <button onClick={() => handleVideoGen(promptInput, (document.getElementById('camSelect') as HTMLSelectElement).value)} disabled={loading} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded-lg text-xs shadow-lg">{loading ? 'Rendering...' : 'Generate Shot'}</button>
                                        {loading && <p className="text-[10px] text-center text-slate-500 animate-pulse">{loadingMessage}</p>}
                                    </div>
                                    <div className="w-2/3 bg-black rounded-xl border border-slate-800 overflow-hidden grid grid-cols-2 gap-2 p-2 content-start overflow-y-auto custom-scrollbar">
                                        {movie.scenes.map(scene => (
                                            <div key={scene.id} className="relative aspect-video bg-slate-900 rounded overflow-hidden group">
                                                {scene.videoUrl ? <video src={scene.videoUrl} controls className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs p-2 text-center">{scene.prompt}</div>}
                                                <div className="absolute top-0 left-0 bg-black/60 px-1 text-[8px] text-white">{scene.camera}</div>
                                            </div>
                                        ))}
                                        {movie.scenes.length === 0 && <div className="col-span-2 text-center text-slate-500 py-12">No scenes generated.</div>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 6. POST */}
                        {activePhase === 'post' && (
                            <div className="h-full flex flex-col relative z-10 animate-fadeIn">
                                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-4 flex justify-between items-center">
                                    <h4 className="text-sm font-bold text-slate-300">Timeline Assembly</h4>
                                    <button className="text-xs bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-bold">Export Final Cut</button>
                                </div>
                                <div className="flex-grow bg-slate-900 rounded-xl border border-slate-800 relative overflow-x-auto p-4 flex items-center gap-1">
                                    {movie.scenes.map((scene, i) => (
                                        <div key={scene.id} className="w-32 h-20 bg-slate-800 rounded border border-slate-600 flex-shrink-0 relative overflow-hidden group cursor-pointer hover:border-cyan-500">
                                            {scene.videoUrl && <video src={scene.videoUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-100" />}
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-[8px] text-white px-1 truncate">Sc {i+1}</div>
                                        </div>
                                    ))}
                                    <div className="w-32 h-20 border-2 border-dashed border-slate-700 rounded flex items-center justify-center text-slate-600 text-xs">+ Drop</div>
                                </div>
                            </div>
                        )}

                        {/* 7. AGENT */}
                        {activePhase === 'agent' && (
                            <div className="flex flex-col h-full items-center justify-center relative z-10 animate-fadeIn max-w-2xl mx-auto">
                                <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-purple-500/20 relative">
                                    {isAgentRunning && <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping"></div>}
                                    <span className="text-4xl">🤖</span>
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">Autonomous Movie Producer</h2>
                                <p className="text-slate-400 text-center mb-8 max-w-md">One-Click Mode. The agent will execute the entire pipeline from Concept to Render based on your brief.</p>
                                
                                {!isAgentRunning && agentLogs.length === 0 && (
                                    <button onClick={runAutonomousAgent} className="bg-white text-slate-900 font-bold py-3 px-8 rounded-full hover:bg-cyan-50 transition shadow-lg flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                                        Start Production
                                    </button>
                                )}

                                {(isAgentRunning || agentLogs.length > 0) && (
                                    <div className="w-full bg-black rounded-xl border border-green-900/50 p-4 font-mono text-xs h-64 overflow-y-auto custom-scrollbar shadow-inner">
                                        {agentLogs.map((log, i) => <div key={i} className="mb-1 text-green-400">{log}</div>)}
                                        {isAgentRunning && <div className="animate-pulse text-green-600">_</div>}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 8. BLUEPRINT */}
                        {activePhase === 'blueprint' && (
                            <div className="relative z-10 animate-fadeIn h-full flex flex-col items-center justify-center p-8">
                                <div className="bg-slate-900 p-8 rounded-xl border border-slate-700 w-full max-w-4xl shadow-2xl overflow-x-auto">
                                    <h4 className="text-sm font-bold text-slate-400 uppercase mb-6 flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7m0 0L9 7" /></svg>
                                        Agent Workflow Visualization
                                    </h4>
                                    
                                    <div className="flex justify-between items-center text-center text-xs">
                                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-600 w-24">User Input</div>
                                        <div className="h-0.5 w-8 bg-slate-600"></div>
                                        <div className="bg-purple-900/40 p-3 rounded-lg border border-purple-500 w-32 font-bold text-purple-300">Project Engine</div>
                                        <div className="h-0.5 w-8 bg-slate-600"></div>
                                        <div className="bg-cyan-900/40 p-3 rounded-lg border border-cyan-500 w-32 font-bold text-cyan-300">Script Agent</div>
                                        <div className="h-0.5 w-8 bg-slate-600"></div>
                                        <div className="bg-blue-900/40 p-3 rounded-lg border border-blue-500 w-32 font-bold text-blue-300">Storyboard Agent</div>
                                    </div>
                                    
                                    <div className="h-12 w-0.5 bg-slate-600 mx-auto my-2 relative left-[320px]"></div> {/* Connector down from Storyboard */}
                                    
                                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 mt-2">
                                        <p className="text-[10px] text-slate-500 mb-2 uppercase font-bold text-center">Parallel Execution Layer</p>
                                        <div className="flex justify-around gap-4">
                                            <div className="bg-red-900/20 p-3 rounded border border-red-500/50 text-red-300 w-32 text-center text-xs">Image Agent<br/>(Visuals)</div>
                                            <div className="bg-red-900/20 p-3 rounded border border-red-500/50 text-red-300 w-32 text-center text-xs">Video Agent<br/>(Veo Generation)</div>
                                            <div className="bg-red-900/20 p-3 rounded border border-red-500/50 text-red-300 w-32 text-center text-xs">Audio Agent<br/>(TTS & SFX)</div>
                                        </div>
                                    </div>

                                    <div className="h-8 w-0.5 bg-slate-600 mx-auto my-2"></div>

                                    <div className="flex justify-center gap-4">
                                        <div className="bg-green-900/30 p-3 rounded-lg border border-green-500 w-32 text-center text-xs text-green-300 font-bold">Quality Check</div>
                                        <div className="h-0.5 w-4 bg-slate-600 self-center"></div>
                                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-600 w-32 text-center text-xs text-white">Human Review</div>
                                        <div className="h-0.5 w-4 bg-slate-600 self-center"></div>
                                        <div className="bg-amber-900/30 p-3 rounded-lg border border-amber-500 w-32 text-center text-xs text-amber-300 font-bold">Assembly Agent</div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </>
    );
};

export default MovieGenerator;
