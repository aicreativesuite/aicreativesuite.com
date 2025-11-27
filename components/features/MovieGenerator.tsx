
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
    DIRECTOR_STYLES_DESCRIPTIVE, 
    TTS_VOICES,
    BACKGROUND_OPTIONS,
    ASPECT_RATIOS
} from '../../constants';
import Loader from '../common/Loader';
import { Remarkable } from 'remarkable';
import ApiKeyDialog from '../common/ApiKeyDialog';
import { pcmToWav, decode } from '../../utils';

const md = new Remarkable({ html: true });

// --- Types ---
type Phase = 'concept' | 'story' | 'screenplay' | 'characters' | 'visuals' | 'animation' | 'audio' | 'production' | 'post' | 'branding';

interface CharacterData {
    name: string;
    role: string;
    bio: string;
    visual: string;
    sheet?: any;
    image?: string;
}

interface MovieState {
    title: string;
    logline: string;
    genre: string;
    tone: string;
    duration: string;
    
    // Outputs
    worldSetting: string;
    storyStructure: any;
    characters: CharacterData[];
    screenplayScenes: {id: string, title: string, content: string}[];
    visualPrompts: {sceneId: string, prompt: string, image?: string}[];
    animationClips: {prompt: string, videoUrl?: string}[];
    audioTracks: {type: 'dialogue'|'music'|'sfx', prompt: string, audioUrl?: string}[];
    productionDocs: string;
    marketingCopy: string;
    worldDetails?: any;
    storyAnalysis?: any;
    sceneBreakdowns: Record<string, any>;
    storySettings: {
        sceneCount: string;
        endingType: string;
    };
}

interface MovieGeneratorProps { onShare: (options: any) => void; }

const DURATION_OPTIONS = ['90 min', '120 min', '150 min'];
const SCENE_COUNT_OPTIONS = ['Short (30-50)', 'Feature (100-120)', 'Epic (150-200)'];
const ENDING_TYPE_OPTIONS = ['Happy', 'Tragic', 'Open-ended', 'Bittersweet', 'Twist Ending', 'Ambiguous'];

const SCREENPLAY_OPTIONS = [
    'Scene Headers (INT/EXT)',
    'Dialogue',
    'Camera Directions',
    'Transitions',
    'VFX Notes',
    'Cinematic Tone'
];

const SPECIAL_MODULES = [
    'Comedy dialogue style',
    'Action choreography prompts',
    'Romantic dialogues',
    'Villain monologues',
    'Hero transformation moments'
];

const MovieGenerator: React.FC<MovieGeneratorProps> = ({ onShare }) => {
    const [activePhase, setActivePhase] = useState<Phase>('concept');
    const [movie, setMovie] = useState<MovieState>({
        title: '', logline: '', genre: MOVIE_GENRES[0], tone: 'Dramatic', duration: '120 min',
        worldSetting: '', storyStructure: null, characters: [],
        screenplayScenes: [], visualPrompts: [], animationClips: [], audioTracks: [],
        productionDocs: '', marketingCopy: '', sceneBreakdowns: {},
        storySettings: { sceneCount: 'Feature (100-120)', endingType: 'Happy' }
    });

    // UI State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
    const [apiKeyReady, setApiKeyReady] = useState(false);
    
    // Refs
    const pollIntervalRef = useRef<number | null>(null);

    // Inputs for current operations
    const [currentInput, setCurrentInput] = useState(''); 
    const [selectedOption, setSelectedOption] = useState('');
    const [selectedSubTab, setSelectedSubTab] = useState<string>(''); // Generic sub-tab state
    
    // Screenplay specific
    const [screenplayDetails, setScreenplayDetails] = useState<string[]>(['Dialogue', 'Scene Headers (INT/EXT)']);

    useEffect(() => {
        return () => {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            movie.animationClips.forEach(c => c.videoUrl && URL.revokeObjectURL(c.videoUrl));
            movie.audioTracks.forEach(t => t.audioUrl && URL.revokeObjectURL(t.audioUrl));
        };
    }, []);

    const updateMovie = (updates: Partial<MovieState>) => setMovie(prev => ({ ...prev, ...updates }));
    
    const toggleScreenplayDetail = (detail: string) => {
        setScreenplayDetails(prev => prev.includes(detail) ? prev.filter(d => d !== detail) : [...prev, detail]);
    };

    // --- Phase 1: Concept & World ---
    const handleGenerateConcept = async () => {
        if (!movie.genre || !currentInput) return setError("Please enter a topic/premise.");
        setLoading(true);
        try {
            // World context removed as per request to simplify inputs
            const res = await generateMovieConcept(movie.genre, movie.tone, currentInput, movie.duration);
            const data = JSON.parse(res.text);
            updateMovie({ 
                title: data.title, 
                logline: data.logline, 
                worldSetting: data.worldDescription 
            });
            
            // Auto-generate detailed world specs based on the concept and inputs
            const worldRes = await generateWorldDetails(data.worldDescription);
            updateMovie({ worldDetails: JSON.parse(worldRes.text) });
            
            setActivePhase('story');
        } catch(e:any) { setError(e.message); } finally { setLoading(false); }
    };

    // --- Phase 2: Story ---
    const handleGenerateStory = async () => {
        setLoading(true);
        try {
            const structRes = await generateDetailedStory(
                movie.title, 
                movie.logline, 
                movie.genre,
                movie.storySettings.sceneCount,
                movie.storySettings.endingType
            );
            const structure = JSON.parse(structRes.text);
            updateMovie({ storyStructure: structure });
            
            // Analyze story immediately
            const analysisRes = await analyzeStoryStructure(JSON.stringify(structure));
            updateMovie({ storyAnalysis: JSON.parse(analysisRes.text) });
            
            setActivePhase('characters');
        } catch(e:any) { setError(e.message); } finally { setLoading(false); }
    };

    // --- Phase 3: Characters ---
    const handleGenerateCast = async () => {
        setLoading(true);
        try {
            const charRes = await generateDetailedCharacters(movie.title, movie.logline);
            const charsRaw = JSON.parse(charRes.text);
            const characters = charsRaw.map((c: any) => ({ name: c.name, role: c.role, bio: c.backstory, visual: c.visualDescription }));
            updateMovie({ characters });
        } catch(e:any) { setError(e.message); } finally { setLoading(false); }
    };

    const handleCharacterDeepDive = async (char: CharacterData, index: number) => {
        setLoading(true);
        try {
            const sheetRes = await generateCharacterSheet(char.name, char.bio);
            const sheet = JSON.parse(sheetRes.text);
            
            // Generate Visual
            const imgBytes = await generateImage(`Character portrait of ${char.name}, ${char.role}. ${char.visual}. ${sheet.costumeDetails}. High quality, cinematic lighting.`, "9:16");
            const imageUrl = `data:image/jpeg;base64,${imgBytes}`;

            const newChars = [...movie.characters];
            newChars[index] = { ...char, sheet, image: imageUrl };
            updateMovie({ characters: newChars });
        } catch(e:any) { setError(e.message); } finally { setLoading(false); }
    };

    // --- Phase 4: Screenplay ---
    const handleGenerateScreenplay = async () => {
        if (!selectedOption) return setError("Select a scene/beat to write.");
        setLoading(true);
        try {
            const res = await generateScreenplayScene(movie.title, selectedOption, currentInput || 'Standard', screenplayDetails); 
            updateMovie({ 
                screenplayScenes: [...movie.screenplayScenes, { 
                    id: Date.now().toString(), 
                    title: selectedOption.substring(0, 30) + '...', 
                    content: res.text 
                }] 
            });
        } catch(e:any) { setError(e.message); } finally { setLoading(false); }
    };

    // --- Phase 5: Visuals ---
    const handleGenerateVisuals = async () => {
        if (!selectedOption) return setError("Select a visual style.");
        setLoading(true);
        try {
            const scenes = movie.screenplayScenes.map(s => s.title).slice(0, 3);
            const res = await generateVisualPrompts(movie.title, selectedOption, scenes.length ? scenes : [movie.logline]);
            const prompts: any[] = JSON.parse(res.text);
            
            if (prompts.length > 0) {
                const imgBytes = await generateImage(prompts[0].prompt, '16:9');
                const imageUrl = `data:image/jpeg;base64,${imgBytes}`;
                prompts[0].image = imageUrl;
            }
            
            updateMovie({ visualPrompts: [...movie.visualPrompts, ...prompts] });
        } catch(e:any) { setError(e.message); } finally { setLoading(false); }
    };

    // --- Phase 6: Animation ---
    const handleGenerateAnimation = async (type: 'standard' | 'action' | 'lipsync') => {
        // @ts-ignore
        if (!apiKeyReady && typeof window.aistudio !== 'undefined') {
             // @ts-ignore
             const hasKey = await window.aistudio.hasSelectedApiKey();
             if(!hasKey) { setShowApiKeyDialog(true); return; }
             else setApiKeyReady(true);
        }

        if (!currentInput) return setError("Describe the action.");
        setLoading(true);
        
        try {
            let fullPrompt = currentInput;
            if (type === 'action') fullPrompt += " Dynamic camera movement, high intensity action, stunt simulation.";
            if (type === 'lipsync') fullPrompt += " Close up, precise lip synchronization, talking head.";

            const op = await generateVideoFromPrompt(fullPrompt, '16:9', false);
            const newClip = { prompt: currentInput, videoUrl: undefined };
            const clipIndex = movie.animationClips.length;
            updateMovie({ animationClips: [...movie.animationClips, newClip] });

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
                                const clips = [...prev.animationClips];
                                clips[clipIndex] = { ...clips[clipIndex], videoUrl: url };
                                return { ...prev, animationClips: clips };
                            });
                        }
                    }
                } catch(e) { clearInterval(pollIntervalRef.current!); setLoading(false); }
            }, 5000);
        } catch(e:any) { setLoading(false); setError(e.message); }
    };

    // --- Phase 7: Audio ---
    const handleGenerateAudio = async (type: 'dialogue' | 'music' | 'sfx') => {
        if (!currentInput) return setError("Enter dialogue or description.");
        setLoading(true);
        try {
            let audioUrl: string | undefined;
            if (type === 'dialogue') {
                const voice = TTS_VOICES[Math.floor(Math.random() * TTS_VOICES.length)]; 
                const base64 = await generateSpeech(currentInput, voice);
                if (base64) audioUrl = URL.createObjectURL(pcmToWav(decode(base64), 24000, 1, 16));
            } else {
                // Generate a text plan for now as specialized music generation isn't directly in this gemini subset
                // But we can simulate the "Plan" generation
                const res = await generateText(`Compose a detailed description for ${type} track: "${currentInput}". Include instruments, tempo, key, and mood changes.`, 'gemini-2.5-flash');
                // In a real app with Music Gen, we'd call that here. For now, we store the plan.
            }
            updateMovie({ audioTracks: [...movie.audioTracks, { type, prompt: currentInput, audioUrl }] });
        } catch(e:any) { setError(e.message); } finally { setLoading(false); }
    };

    // --- Phase 8: Production ---
    const handleSceneBreakdown = async () => {
        if (!currentInput) return;
        setLoading(true);
        try {
            const res = await generateSceneBreakdown(currentInput);
            const breakdown = JSON.parse(res.text);
            updateMovie({ sceneBreakdowns: { ...movie.sceneBreakdowns, [currentInput.substring(0, 20)]: breakdown } });
        } catch(e:any) { setError(e.message); } finally { setLoading(false); }
    };

    // --- Phase 10: Marketing ---
    const handleGenerateMarketing = async () => {
        setLoading(true);
        try {
            const res = await generateMarketingAssets(movie.title, movie.logline, selectedOption || 'Poster Concept');
            updateMovie({ marketingCopy: res.text });
        } catch(e:any) { setError(e.message); } finally { setLoading(false); }
    };

    // --- Components ---
    const SidebarItem = ({ id, icon, label }: { id: Phase, icon: string, label: string }) => (
        <button 
            onClick={() => { setActivePhase(id); setError(null); setCurrentInput(''); setSelectedOption(''); setSelectedSubTab(''); }}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition ${activePhase === id ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
            <span className="text-lg">{icon}</span>
            <span className="text-sm font-medium">{label}</span>
        </button>
    );

    const PhaseLayout = ({ title, children, actions, subTabs }: any) => (
        <div className="flex flex-col h-full animate-fadeIn">
            <div className="mb-4 border-b border-slate-800 pb-4">
                <h2 className="text-2xl font-bold text-white mb-1">{title}</h2>
                {movie.title && <p className="text-xs text-cyan-400 font-mono tracking-widest uppercase">PROJECT: {movie.title}</p>}
                {subTabs && (
                    <div className="flex space-x-2 mt-4 overflow-x-auto pb-1">
                        {subTabs.map((tab: string) => (
                            <button 
                                key={tab}
                                onClick={() => setSelectedSubTab(tab)}
                                className={`px-3 py-1 text-xs font-bold rounded-full transition ${selectedSubTab === tab ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <div className="flex-grow overflow-y-auto pr-2 space-y-6 custom-scrollbar">
                {children}
            </div>
            {actions && <div className="mt-4 pt-4 border-t border-slate-800">{actions}</div>}
        </div>
    );

    return (
        <>
            <ApiKeyDialog show={showApiKeyDialog} onSelectKey={async () => { 
                // @ts-ignore
                await window.aistudio.openSelectKey(); 
                setApiKeyReady(true); 
                setShowApiKeyDialog(false); 
            }} />
            
            <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)] min-h-[600px]">
                {/* Navigation */}
                <div className="w-full lg:w-64 flex-shrink-0 bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-800 flex flex-col overflow-hidden">
                    <div className="p-4 bg-slate-950 border-b border-slate-800">
                        <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">Master Prompt List</h3>
                    </div>
                    <div className="flex-grow overflow-y-auto p-2 space-y-1 custom-scrollbar">
                        <SidebarItem id="concept" icon="💡" label="1. Concept & World" />
                        <SidebarItem id="story" icon="📖" label="2. Story Development" />
                        <SidebarItem id="screenplay" icon="✍️" label="3. Screenplay" />
                        <SidebarItem id="characters" icon="👥" label="4. Characters" />
                        <SidebarItem id="visuals" icon="🎨" label="5. Visual Dev" />
                        <SidebarItem id="animation" icon="🎬" label="6. Animation" />
                        <SidebarItem id="audio" icon="🔊" label="7. Audio Studio" />
                        <SidebarItem id="production" icon="📋" label="8. Production" />
                        <SidebarItem id="post" icon="✂️" label="9. Post-Prod" />
                        <SidebarItem id="branding" icon="🚀" label="10. Marketing" />
                    </div>
                </div>

                {/* Workspace */}
                <div className="flex-grow bg-slate-900/50 rounded-2xl border border-slate-800 p-6 relative overflow-hidden flex flex-col">
                    {error && <div className="absolute top-4 right-4 z-50 bg-red-900/80 text-white px-4 py-2 rounded shadow-lg text-sm border border-red-500">{error} <button onClick={() => setError(null)} className="ml-2 font-bold">×</button></div>}
                    
                    {activePhase === 'concept' && (
                        <PhaseLayout title="Movie Concept & World" actions={
                            <button onClick={handleGenerateConcept} disabled={loading} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-lg font-bold transition disabled:opacity-50">{loading ? <Loader /> : 'Generate Concept & World'}</button>
                        }>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <div><label className="text-xs font-bold text-slate-400 uppercase block mb-1">Genre</label><select className="w-full bg-slate-800 border border-slate-700 rounded p-2.5 text-white" value={movie.genre} onChange={e => updateMovie({genre: e.target.value})}>{MOVIE_GENRES.map(g => <option key={g}>{g}</option>)}</select></div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div><label className="text-xs font-bold text-slate-400 uppercase block mb-1">Tone / Mood</label><input className="w-full bg-slate-800 border border-slate-700 rounded p-2.5 text-white" placeholder="Dark, gritty, funny, surreal..." value={movie.tone} onChange={e => updateMovie({tone: e.target.value})} /></div>
                                        <div><label className="text-xs font-bold text-slate-400 uppercase block mb-1">Duration</label><select className="w-full bg-slate-800 border border-slate-700 rounded p-2.5 text-white" value={movie.duration} onChange={e => updateMovie({duration: e.target.value})}>{DURATION_OPTIONS.map(d => <option key={d}>{d}</option>)}</select></div>
                                    </div>
                                </div>
                                <div><label className="text-xs font-bold text-slate-400 uppercase block mb-1">Premise</label><textarea className="w-full h-32 bg-slate-800 border border-slate-700 rounded p-3 text-white resize-none" placeholder="Describe your movie idea..." value={currentInput} onChange={e => setCurrentInput(e.target.value)} /></div>
                            </div>

                            {movie.worldDetails && (
                                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 mt-4">
                                    <h4 className="text-purple-400 font-bold mb-2 text-xs uppercase">Generated World Details</h4>
                                    <p className="text-sm text-slate-300 mb-2">{movie.worldDetails.environmentDescription}</p>
                                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                                        <div><strong className="text-slate-500">Unique Rules:</strong> {movie.worldDetails.uniqueRulesOrMagic}</div>
                                        <div><strong className="text-slate-500">Vehicles:</strong> {movie.worldDetails.vehicleDesigns?.join(', ')}</div>
                                    </div>
                                </div>
                            )}
                        </PhaseLayout>
                    )}

                    {activePhase === 'story' && (
                        <PhaseLayout title="Story Development" actions={
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Scene Count Range</label>
                                        <select 
                                            className="w-full bg-slate-800 border border-slate-700 rounded p-2.5 text-white text-sm"
                                            value={movie.storySettings.sceneCount}
                                            onChange={e => updateMovie({ storySettings: { ...movie.storySettings, sceneCount: e.target.value } })}
                                        >
                                            {SCENE_COUNT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Ending Type</label>
                                        <select 
                                            className="w-full bg-slate-800 border border-slate-700 rounded p-2.5 text-white text-sm"
                                            value={movie.storySettings.endingType}
                                            onChange={e => updateMovie({ storySettings: { ...movie.storySettings, endingType: e.target.value } })}
                                        >
                                            {ENDING_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <button onClick={handleGenerateStory} disabled={loading || !movie.title} className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-lg font-bold transition disabled:opacity-50">{loading ? <Loader /> : 'Generate Structure & Analysis'}</button>
                            </div>
                        }>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                    <h4 className="text-lg font-bold text-white mb-4">Structure</h4>
                                    {movie.storyStructure ? (
                                        <div className="space-y-4 text-sm">
                                            {movie.storyStructure.estimatedSceneCount && (
                                                <div className="bg-slate-900 p-2 rounded text-xs text-slate-400 mb-2">Estimated Scenes: <span className="text-white font-bold">{movie.storyStructure.estimatedSceneCount}</span></div>
                                            )}
                                            {movie.storyStructure.acts.map((act: any, i: number) => (
                                                <div key={i} className="bg-slate-900 p-3 rounded">
                                                    <div className="font-bold text-cyan-400">{act.name}</div>
                                                    <ul className="list-disc pl-4 text-slate-300 mt-1">{act.beats.map((b: string, j: number) => <li key={j}>{b}</li>)}</ul>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <div className="text-slate-500 italic text-center py-8">Generate concept first.</div>}
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                        <h4 className="text-lg font-bold text-white mb-4">Plot Points & Twists</h4>
                                        {movie.storyStructure ? (
                                            <div className="space-y-3 text-sm">
                                                <div><strong className="text-amber-400">Major Turning Points:</strong> <ul className="list-disc pl-4 text-slate-300">{movie.storyStructure.majorPlotPoints?.map((p:string,i:number)=><li key={i}>{p}</li>)}</ul></div>
                                                <div><strong className="text-red-400">Twists:</strong> <ul className="list-disc pl-4 text-slate-300">{movie.storyStructure.twists?.map((t:string,i:number)=><li key={i}>{t}</li>)}</ul></div>
                                                <div><strong className="text-green-400">Ending ({movie.storySettings.endingType}):</strong> <p className="text-slate-300 mt-1">{movie.storyStructure.endingDescription}</p></div>
                                            </div>
                                        ) : <div className="text-slate-500 italic text-center py-8">Structure pending.</div>}
                                    </div>
                                    
                                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                        <h4 className="text-lg font-bold text-white mb-4">AI Critique</h4>
                                        {movie.storyAnalysis ? (
                                            <div className="space-y-3 text-sm">
                                                <div><strong className="text-purple-400">Tension Curve:</strong> <p className="text-slate-300">{movie.storyAnalysis.tensionCurve}</p></div>
                                                <div><strong className="text-purple-400">Relationships:</strong> <ul className="list-disc pl-4 text-slate-300">{movie.storyAnalysis.characterRelationships?.map((r:string,i:number)=><li key={i}>{r}</li>)}</ul></div>
                                            </div>
                                        ) : <div className="text-slate-500 italic text-center py-8">Analysis will appear here.</div>}
                                    </div>
                                </div>
                            </div>
                        </PhaseLayout>
                    )}

                    {activePhase === 'screenplay' && (
                        <PhaseLayout title="Screenplay Writer" actions={
                            <button onClick={handleGenerateScreenplay} disabled={loading} className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg font-bold transition disabled:opacity-50">{loading ? <Loader /> : 'Write Scene'}</button>
                        }>
                            <div className="space-y-4">
                                <div><label className="text-xs font-bold text-slate-400 uppercase block mb-1">Select Beat</label><select className="w-full bg-slate-800 border border-slate-700 rounded p-2.5 text-white" value={selectedOption} onChange={e => setSelectedOption(e.target.value)}><option value="">-- Select --</option>{movie.storyStructure?.acts?.flatMap((a: any) => a.beats).map((b: string, i: number) => <option key={i} value={b}>{b.substring(0, 60)}...</option>)}<option value="Custom">Custom Scene</option></select></div>
                                <div><label className="text-xs font-bold text-slate-400 uppercase block mb-1">Style Instructions</label><input className="w-full bg-slate-800 border border-slate-700 rounded p-2.5 text-white" placeholder="e.g., Witty dialogue, Slow burn" value={currentInput} onChange={e => setCurrentInput(e.target.value)} /></div>
                                
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Special Modules</label>
                                    <div className="flex flex-wrap gap-2">
                                        {SPECIAL_MODULES.map(mod => (
                                            <button 
                                                key={mod}
                                                onClick={() => setCurrentInput(mod)}
                                                className="px-3 py-1.5 bg-slate-800 hover:bg-purple-900/30 hover:border-purple-500/50 border border-slate-700 rounded text-xs text-slate-300 transition-colors"
                                            >
                                                {mod}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                                    <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Include Elements</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {SCREENPLAY_OPTIONS.map(opt => (
                                            <label key={opt} className="flex items-center space-x-2 text-sm text-slate-300 cursor-pointer">
                                                <input type="checkbox" checked={screenplayDetails.includes(opt)} onChange={() => toggleScreenplayDetail(opt)} className="rounded border-slate-600 bg-slate-900 text-cyan-500 focus:ring-offset-0 focus:ring-cyan-500" />
                                                <span>{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-6 space-y-6 h-64 overflow-y-auto custom-scrollbar pr-2">
                                    {movie.screenplayScenes.map((scene) => (
                                        <div key={scene.id} className="bg-white text-slate-900 p-6 rounded shadow-xl font-mono text-sm whitespace-pre-wrap border-l-4 border-green-500">
                                            <h4 className="font-bold mb-4 text-slate-500 uppercase tracking-widest border-b pb-2">{scene.title}</h4>
                                            {scene.content}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </PhaseLayout>
                    )}

                    {activePhase === 'characters' && (
                        <PhaseLayout title="Character Design" actions={
                            <button onClick={handleGenerateCast} disabled={loading || !movie.title} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-bold transition disabled:opacity-50">{loading ? <Loader /> : 'Generate Initial Cast'}</button>
                        }>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {movie.characters.map((char, i) => (
                                    <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl font-bold overflow-hidden">
                                                {char.image ? <img src={char.image} className="w-full h-full object-cover" /> : char.name[0]}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white">{char.name}</h4>
                                                <p className="text-xs text-slate-400">{char.role}</p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-300 line-clamp-3 mb-3">{char.bio}</p>
                                        <button onClick={() => handleCharacterDeepDive(char, i)} className="mt-auto w-full py-2 bg-slate-700 hover:bg-slate-600 rounded text-xs font-bold text-cyan-400">Generate Sheet & Visual</button>
                                    </div>
                                ))}
                            </div>
                        </PhaseLayout>
                    )}

                    {activePhase === 'visuals' && (
                        <PhaseLayout title="Visual Development">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                                <div className="lg:col-span-1 space-y-4">
                                    <div><label className="text-xs font-bold text-slate-400 uppercase block mb-1">Art Style</label><select className="w-full bg-slate-800 border border-slate-700 rounded p-2.5 text-white" value={selectedOption} onChange={e => setSelectedOption(e.target.value)}>{VISUAL_STYLES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                                    <button onClick={handleGenerateVisuals} disabled={loading} className="w-full bg-pink-600 hover:bg-pink-500 text-white py-3 rounded-lg font-bold transition disabled:opacity-50">{loading ? <Loader /> : 'Generate Concepts'}</button>
                                </div>
                                <div className="lg:col-span-2 overflow-y-auto grid grid-cols-2 gap-4 p-1 max-h-[400px]">
                                    {movie.visualPrompts.map((vp, i) => (
                                        <div key={i} className="group relative rounded-xl overflow-hidden bg-black aspect-video">
                                            {vp.image ? <img src={vp.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-600 p-4 text-center text-xs">{vp.prompt}</div>}
                                            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition flex items-end p-4"><p className="text-white text-xs">{vp.prompt}</p></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </PhaseLayout>
                    )}

                    {activePhase === 'animation' && (
                        <PhaseLayout title="Animation & Action" actions={
                            <div className="grid grid-cols-3 gap-2">
                                <button onClick={() => handleGenerateAnimation('standard')} disabled={loading} className="bg-slate-700 hover:bg-slate-600 text-white py-2 rounded font-bold text-xs">Standard Motion</button>
                                <button onClick={() => handleGenerateAnimation('action')} disabled={loading} className="bg-red-700 hover:bg-red-600 text-white py-2 rounded font-bold text-xs">Action/Stunt</button>
                                <button onClick={() => handleGenerateAnimation('lipsync')} disabled={loading} className="bg-blue-700 hover:bg-blue-600 text-white py-2 rounded font-bold text-xs">Lip Sync</button>
                            </div>
                        }>
                            <textarea className="w-full bg-slate-800 border border-slate-700 rounded p-3 text-white resize-none h-24 mb-4" placeholder="Describe the movement (e.g. Hero jumps across rooftop, Close up speaking...)" value={currentInput} onChange={e => setCurrentInput(e.target.value)} />
                            <div className="grid grid-cols-2 gap-4">
                                {movie.animationClips.map((clip, i) => (
                                    <div key={i} className="bg-black rounded-lg overflow-hidden border border-slate-700 aspect-video">
                                        {clip.videoUrl ? <video src={clip.videoUrl} controls className="w-full h-full" /> : <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500 text-xs p-4">{loading ? <Loader /> : clip.prompt}</div>}
                                    </div>
                                ))}
                            </div>
                        </PhaseLayout>
                    )}

                    {activePhase === 'audio' && (
                        <PhaseLayout title="Audio Studio">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <textarea className="w-full bg-slate-800 border border-slate-700 rounded p-3 text-white resize-none h-32" placeholder="Dialogue line or sound description..." value={currentInput} onChange={e => setCurrentInput(e.target.value)} />
                                    <div className="flex gap-2">
                                        <button onClick={() => handleGenerateAudio('dialogue')} disabled={loading} className="flex-1 bg-cyan-600 text-white py-2 rounded font-bold text-xs">Dialogue</button>
                                        <button onClick={() => handleGenerateAudio('sfx')} disabled={loading} className="flex-1 bg-amber-600 text-white py-2 rounded font-bold text-xs">SFX</button>
                                        <button onClick={() => handleGenerateAudio('music')} disabled={loading} className="flex-1 bg-purple-600 text-white py-2 rounded font-bold text-xs">Score</button>
                                    </div>
                                </div>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {movie.audioTracks.map((track, i) => (
                                        <div key={i} className="bg-slate-800 p-3 rounded flex items-center gap-3">
                                            <span className="text-xs bg-slate-900 px-2 py-1 rounded uppercase text-slate-400">{track.type}</span>
                                            <div className="flex-grow min-w-0"><p className="text-white text-xs truncate">{track.prompt}</p>{track.audioUrl && <audio src={track.audioUrl} controls className="h-6 w-full mt-1" />}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </PhaseLayout>
                    )}

                    {activePhase === 'production' && (
                        <PhaseLayout title="Production Planning" actions={
                            <div className="flex gap-2">
                                <button onClick={async () => { setLoading(true); const r = await generateProductionPlan(movie.title, movie.duration); updateMovie({productionDocs: r.text}); setLoading(false); }} disabled={loading} className="flex-1 bg-slate-700 text-white py-2 rounded font-bold text-xs">Full Plan</button>
                                <button onClick={handleSceneBreakdown} disabled={loading} className="flex-1 bg-slate-700 text-white py-2 rounded font-bold text-xs">Scene Breakdown</button>
                            </div>
                        }>
                            <input className="w-full bg-slate-800 border border-slate-700 rounded p-2.5 text-white mb-4" placeholder="Scene Heading for Breakdown (e.g. INT. LAB - DAY)" value={currentInput} onChange={e => setCurrentInput(e.target.value)} />
                            {movie.productionDocs && <div className="bg-white text-black p-4 rounded shadow prose prose-sm max-w-none max-h-64 overflow-y-auto"><div dangerouslySetInnerHTML={{ __html: md.render(movie.productionDocs) }} /></div>}
                            <div className="grid grid-cols-1 gap-2 mt-4">
                                {Object.entries(movie.sceneBreakdowns).map(([scene, data], i) => (
                                    <div key={i} className="bg-slate-800 p-3 rounded border border-slate-700 text-xs">
                                        <strong className="text-cyan-400">{scene}</strong>
                                        <div className="mt-1 text-slate-400">Shots: {(data as any).shotList?.length} | VFX: {(data as any).vfxNotes ? 'Yes' : 'No'}</div>
                                    </div>
                                ))}
                            </div>
                        </PhaseLayout>
                    )}

                    {activePhase === 'post' && (
                        <PhaseLayout title="Post-Production">
                            <div className="text-center py-12 text-slate-500">
                                <p className="text-xl mb-2">✂️</p>
                                <p>Assemble your clips in the Video Editor.</p>
                                <button onClick={() => alert("Sending assets to Editor...")} className="mt-4 bg-slate-700 text-white px-4 py-2 rounded text-sm">Send Assets to Video Editor</button>
                            </div>
                        </PhaseLayout>
                    )}

                    {activePhase === 'branding' && (
                        <PhaseLayout title="Branding & Marketing" actions={
                            <button onClick={handleGenerateMarketing} disabled={loading} className="w-full bg-pink-600 hover:bg-pink-500 text-white py-3 rounded-lg font-bold transition disabled:opacity-50">{loading ? <Loader /> : 'Generate Assets'}</button>
                        }>
                            <select className="w-full bg-slate-800 border border-slate-700 rounded p-2.5 text-white mb-4" value={selectedOption} onChange={e => setSelectedOption(e.target.value)}>
                                <option value="Poster Concept">Poster Concept</option>
                                <option value="Tagline">Tagline & Hook</option>
                                <option value="Press Release">Press Release</option>
                            </select>
                            {movie.marketingCopy && <div className="bg-slate-800 p-4 rounded border border-slate-700 whitespace-pre-wrap text-slate-300 text-sm">{movie.marketingCopy}</div>}
                        </PhaseLayout>
                    )}
                </div>
            </div>
        </>
    );
};

export default MovieGenerator;
