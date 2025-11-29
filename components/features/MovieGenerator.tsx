
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
type Phase = 'concept' | 'story' | 'screenplay' | 'characters' | 'visuals' | 'animation' | 'audio' | 'production' | 'branding';

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
    'Comedy dialogue',
    'Action beats',
    'Romantic subtext',
    'Villain monologue',
    'Hero moment'
];

const PHASES: { id: Phase, label: string, icon: string }[] = [
    { id: 'concept', label: '1. Concept', icon: '💡' },
    { id: 'story', label: '2. Story', icon: '📖' },
    { id: 'characters', label: '3. Characters', icon: '👥' },
    { id: 'screenplay', label: '4. Screenplay', icon: '✍️' },
    { id: 'visuals', label: '5. Visuals', icon: '🎨' },
    { id: 'animation', label: '6. Animation', icon: '🎬' },
    { id: 'audio', label: '7. Audio', icon: '🔊' },
    { id: 'production', label: '8. Production', icon: '📋' },
    { id: 'branding', label: '9. Marketing', icon: '🚀' },
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
            const res = await generateMovieConcept(movie.genre, movie.tone, currentInput, movie.duration);
            const data = JSON.parse(res.text);
            updateMovie({ 
                title: data.title, 
                logline: data.logline, 
                worldSetting: data.worldDescription 
            });
            
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
                const res = await generateText(`Compose a detailed description for ${type} track: "${currentInput}". Include instruments, tempo, key, and mood changes.`, 'gemini-2.5-flash');
                // Placeholder for music gen logic, using prompt for now
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

    // --- Phase 9: Marketing ---
    const handleGenerateMarketing = async () => {
        setLoading(true);
        try {
            const res = await generateMarketingAssets(movie.title, movie.logline, selectedOption || 'Poster Concept');
            updateMovie({ marketingCopy: res.text });
        } catch(e:any) { setError(e.message); } finally { setLoading(false); }
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
                {/* Sidebar Controls */}
                <div className="w-full lg:w-80 flex-shrink-0 bg-slate-900/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-800 overflow-y-auto custom-scrollbar flex flex-col">
                    
                    {/* Phase Navigation */}
                    <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
                        {PHASES.map(p => (
                            <button
                                key={p.id}
                                onClick={() => { setActivePhase(p.id); setError(null); setCurrentInput(''); setSelectedOption(''); }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${activePhase === p.id ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                            >
                                {p.icon} {p.label.split('. ')[1]}
                            </button>
                        ))}
                    </div>

                    <div className="flex-grow space-y-5 animate-fadeIn">
                        {activePhase === 'concept' && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Premise</label>
                                    <textarea className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500 resize-none" rows={4} placeholder="Describe your movie idea..." value={currentInput} onChange={e => setCurrentInput(e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Genre</label>
                                        <select className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white" value={movie.genre} onChange={e => updateMovie({genre: e.target.value})}>{MOVIE_GENRES.map(g => <option key={g}>{g}</option>)}</select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Duration</label>
                                        <select className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white" value={movie.duration} onChange={e => updateMovie({duration: e.target.value})}>{DURATION_OPTIONS.map(d => <option key={d}>{d}</option>)}</select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tone</label>
                                    <input className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white" placeholder="Dark, gritty..." value={movie.tone} onChange={e => updateMovie({tone: e.target.value})} />
                                </div>
                                <button onClick={handleGenerateConcept} disabled={loading} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition shadow-lg disabled:opacity-50 flex justify-center">{loading ? <Loader /> : 'Generate Concept'}</button>
                            </>
                        )}

                        {activePhase === 'story' && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Scene Count</label>
                                    <select className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white" value={movie.storySettings.sceneCount} onChange={e => updateMovie({ storySettings: { ...movie.storySettings, sceneCount: e.target.value } })}>{SCENE_COUNT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Ending Type</label>
                                    <select className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white" value={movie.storySettings.endingType} onChange={e => updateMovie({ storySettings: { ...movie.storySettings, endingType: e.target.value } })}>{ENDING_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select>
                                </div>
                                <button onClick={handleGenerateStory} disabled={loading || !movie.title} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg transition shadow-lg disabled:opacity-50 flex justify-center">{loading ? <Loader /> : 'Generate Structure'}</button>
                            </>
                        )}

                        {activePhase === 'characters' && (
                            <button onClick={handleGenerateCast} disabled={loading || !movie.title} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition shadow-lg disabled:opacity-50 flex justify-center">{loading ? <Loader /> : 'Generate Cast'}</button>
                        )}

                        {activePhase === 'screenplay' && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Select Beat</label>
                                    <select className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white" value={selectedOption} onChange={e => setSelectedOption(e.target.value)}>
                                        <option value="">-- Select Scene --</option>
                                        {movie.storyStructure?.acts?.flatMap((a: any) => a.beats).map((b: string, i: number) => <option key={i} value={b}>{b.substring(0, 40)}...</option>)}
                                        <option value="Custom">Custom Scene</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Style Instructions</label>
                                    <input className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white" placeholder="e.g. Witty dialogue" value={currentInput} onChange={e => setCurrentInput(e.target.value)} />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {SPECIAL_MODULES.map(mod => (
                                        <button key={mod} onClick={() => setCurrentInput(mod)} className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-300 hover:text-white transition">{mod}</button>
                                    ))}
                                </div>
                                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                                    <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Include</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {SCREENPLAY_OPTIONS.map(opt => (
                                            <label key={opt} className="flex items-center space-x-2 text-[10px] text-slate-300 cursor-pointer">
                                                <input type="checkbox" checked={screenplayDetails.includes(opt)} onChange={() => toggleScreenplayDetail(opt)} className="rounded border-slate-600 bg-slate-900 text-cyan-500" />
                                                <span>{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <button onClick={handleGenerateScreenplay} disabled={loading} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg transition shadow-lg disabled:opacity-50 flex justify-center">{loading ? <Loader /> : 'Write Scene'}</button>
                            </>
                        )}

                        {activePhase === 'visuals' && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Art Style</label>
                                    <select className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white" value={selectedOption} onChange={e => setSelectedOption(e.target.value)}>{VISUAL_STYLES.map(s => <option key={s} value={s}>{s}</option>)}</select>
                                </div>
                                <button onClick={handleGenerateVisuals} disabled={loading} className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-3 rounded-lg transition shadow-lg disabled:opacity-50 flex justify-center">{loading ? <Loader /> : 'Generate Concepts'}</button>
                            </>
                        )}

                        {activePhase === 'animation' && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Action Description</label>
                                    <textarea className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500 resize-none" rows={4} placeholder="Describe movement..." value={currentInput} onChange={e => setCurrentInput(e.target.value)} />
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    <button onClick={() => handleGenerateAnimation('standard')} disabled={loading} className="bg-slate-700 hover:bg-slate-600 text-white py-2 rounded font-bold text-xs">Standard Motion</button>
                                    <button onClick={() => handleGenerateAnimation('action')} disabled={loading} className="bg-red-700 hover:bg-red-600 text-white py-2 rounded font-bold text-xs">Action / Stunt</button>
                                    <button onClick={() => handleGenerateAnimation('lipsync')} disabled={loading} className="bg-blue-700 hover:bg-blue-600 text-white py-2 rounded font-bold text-xs">Lip Sync</button>
                                </div>
                            </>
                        )}

                        {activePhase === 'audio' && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Audio Prompt</label>
                                    <textarea className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500 resize-none" rows={3} placeholder="Dialogue line or sound description..." value={currentInput} onChange={e => setCurrentInput(e.target.value)} />
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <button onClick={() => handleGenerateAudio('dialogue')} disabled={loading} className="bg-cyan-600 text-white py-2 rounded font-bold text-xs hover:opacity-90">Dialogue</button>
                                    <button onClick={() => handleGenerateAudio('sfx')} disabled={loading} className="bg-amber-600 text-white py-2 rounded font-bold text-xs hover:opacity-90">SFX</button>
                                    <button onClick={() => handleGenerateAudio('music')} disabled={loading} className="bg-purple-600 text-white py-2 rounded font-bold text-xs hover:opacity-90">Score</button>
                                </div>
                            </>
                        )}

                        {activePhase === 'production' && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Scene Heading</label>
                                    <input className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-sm" placeholder="INT. LAB - DAY" value={currentInput} onChange={e => setCurrentInput(e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={async () => { setLoading(true); const r = await generateProductionPlan(movie.title, movie.duration); updateMovie({productionDocs: r.text}); setLoading(false); }} disabled={loading} className="bg-slate-700 text-white py-2 rounded font-bold text-xs hover:bg-slate-600">Full Plan</button>
                                    <button onClick={handleSceneBreakdown} disabled={loading} className="bg-slate-700 text-white py-2 rounded font-bold text-xs hover:bg-slate-600">Breakdown</button>
                                </div>
                            </>
                        )}

                        {activePhase === 'branding' && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Asset Type</label>
                                    <select className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white" value={selectedOption} onChange={e => setSelectedOption(e.target.value)}>
                                        <option value="Poster Concept">Poster Concept</option>
                                        <option value="Tagline">Tagline & Hook</option>
                                        <option value="Press Release">Press Release</option>
                                    </select>
                                </div>
                                <button onClick={handleGenerateMarketing} disabled={loading} className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-3 rounded-lg transition shadow-lg disabled:opacity-50 flex justify-center">{loading ? <Loader /> : 'Generate Asset'}</button>
                            </>
                        )}
                        
                        {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                    </div>
                </div>

                {/* Main Preview Area */}
                <div className="flex-grow bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col overflow-hidden relative">
                    <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-white uppercase tracking-wider text-sm">{movie.title || 'Untitled Project'}</h3>
                            <p className="text-[10px] text-slate-500">{PHASES.find(p => p.id === activePhase)?.label}</p>
                        </div>
                        <button onClick={() => onShare({ contentText: JSON.stringify(movie, null, 2), contentType: 'text' })} className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded font-bold transition">Share Project</button>
                    </div>

                    <div className="flex-grow overflow-y-auto p-8 relative">
                        <div className="absolute inset-0 bg-grid-slate-800/20 pointer-events-none"></div>
                        
                        {activePhase === 'concept' && movie.worldSetting ? (
                            <div className="space-y-6 relative z-10">
                                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                                    <h2 className="text-2xl font-bold text-white mb-2">{movie.title}</h2>
                                    <p className="text-cyan-400 font-mono text-sm mb-4">{movie.logline}</p>
                                    <div className="h-px bg-slate-700 my-4"></div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">World Setting</h4>
                                    <p className="text-slate-300 text-sm leading-relaxed">{movie.worldSetting}</p>
                                </div>
                                {movie.worldDetails && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                            <h5 className="text-purple-400 font-bold text-xs uppercase mb-2">Environment</h5>
                                            <p className="text-xs text-slate-300">{movie.worldDetails.environmentDescription}</p>
                                        </div>
                                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                            <h5 className="text-purple-400 font-bold text-xs uppercase mb-2">Rules & Magic</h5>
                                            <p className="text-xs text-slate-300">{movie.worldDetails.uniqueRulesOrMagic}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : activePhase === 'concept' && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-60">
                                <span className="text-6xl mb-2">💡</span>
                                <p>Start by generating a concept on the left.</p>
                            </div>
                        )}

                        {activePhase === 'story' && movie.storyStructure && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
                                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                                    <h4 className="text-lg font-bold text-white mb-4">Structure</h4>
                                    <div className="space-y-4 text-sm">
                                        {movie.storyStructure.acts.map((act: any, i: number) => (
                                            <div key={i}>
                                                <div className="font-bold text-cyan-400 mb-1">{act.name}</div>
                                                <ul className="list-disc pl-4 text-slate-300 space-y-1">{act.beats.map((b: string, j: number) => <li key={j}>{b}</li>)}</ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                        <h4 className="text-sm font-bold text-white mb-2">Key Beats</h4>
                                        <div className="space-y-2 text-xs text-slate-300">
                                            {movie.storyStructure.majorPlotPoints?.map((p:string,i:number)=><div key={i} className="flex gap-2"><span className="text-amber-400">•</span>{p}</div>)}
                                        </div>
                                    </div>
                                    {movie.storyAnalysis && (
                                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                            <h4 className="text-sm font-bold text-white mb-2">AI Analysis</h4>
                                            <p className="text-xs text-slate-300">{movie.storyAnalysis.tensionCurve}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activePhase === 'characters' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
                                {movie.characters.map((char, i) => (
                                    <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden flex flex-col">
                                        {char.image && <div className="aspect-video bg-slate-900"><img src={char.image} className="w-full h-full object-cover opacity-80" /></div>}
                                        <div className="p-4 flex-grow">
                                            <h4 className="font-bold text-white text-lg">{char.name}</h4>
                                            <p className="text-xs text-cyan-400 uppercase tracking-wider mb-2">{char.role}</p>
                                            <p className="text-xs text-slate-300 line-clamp-4">{char.bio}</p>
                                        </div>
                                        <div className="p-4 pt-0">
                                            <button onClick={() => handleCharacterDeepDive(char, i)} className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded text-xs font-bold text-white transition">Generate Visual Sheet</button>
                                        </div>
                                    </div>
                                ))}
                                {movie.characters.length === 0 && <div className="col-span-full text-center text-slate-500 py-12">No characters generated yet.</div>}
                            </div>
                        )}

                        {activePhase === 'screenplay' && (
                            <div className="space-y-6 relative z-10">
                                {movie.screenplayScenes.map((scene) => (
                                    <div key={scene.id} className="bg-white text-slate-900 p-8 rounded-xl shadow-2xl font-mono text-sm leading-relaxed border-l-4 border-green-500 relative">
                                        <div className="absolute top-0 right-0 bg-slate-100 px-3 py-1 text-[10px] text-slate-500 uppercase rounded-bl-lg">Formatted</div>
                                        <h4 className="font-bold mb-4 text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-2">{scene.title}</h4>
                                        <div className="whitespace-pre-wrap">{scene.content}</div>
                                    </div>
                                ))}
                                {movie.screenplayScenes.length === 0 && <div className="text-center text-slate-500 py-12">Select a scene beat to generate a script.</div>}
                            </div>
                        )}

                        {activePhase === 'visuals' && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 relative z-10">
                                {movie.visualPrompts.map((vp, i) => (
                                    <div key={i} className="group relative rounded-xl overflow-hidden bg-black aspect-video shadow-lg">
                                        {vp.image ? <img src={vp.image} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="w-full h-full flex items-center justify-center text-slate-600 p-4 text-center text-xs">{vp.prompt}</div>}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-4">
                                            <p className="text-white text-xs">{vp.prompt}</p>
                                        </div>
                                    </div>
                                ))}
                                {movie.visualPrompts.length === 0 && <div className="col-span-full text-center text-slate-500 py-12">Generate visuals to see storyboards here.</div>}
                            </div>
                        )}

                        {activePhase === 'animation' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                                {movie.animationClips.map((clip, i) => (
                                    <div key={i} className="bg-black rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
                                        {clip.videoUrl ? <video src={clip.videoUrl} controls loop autoPlay className="w-full" /> : <div className="aspect-video w-full flex items-center justify-center bg-slate-800 text-slate-500 text-xs p-8 text-center">{loading ? <Loader /> : clip.prompt}</div>}
                                        <div className="p-3 bg-slate-900 border-t border-slate-800">
                                            <p className="text-[10px] text-slate-400 truncate">{clip.prompt}</p>
                                        </div>
                                    </div>
                                ))}
                                {movie.animationClips.length === 0 && <div className="col-span-full text-center text-slate-500 py-12">No animation clips yet.</div>}
                            </div>
                        )}

                        {activePhase === 'audio' && (
                            <div className="space-y-3 relative z-10">
                                {movie.audioTracks.map((track, i) => (
                                    <div key={i} className="bg-slate-800 p-4 rounded-xl flex items-center gap-4 border border-slate-700">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs ${track.type === 'dialogue' ? 'bg-cyan-600' : track.type === 'sfx' ? 'bg-amber-600' : 'bg-purple-600'}`}>
                                            {track.type.substring(0,3).toUpperCase()}
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <p className="text-xs text-slate-400 mb-1 truncate">{track.prompt}</p>
                                            {track.audioUrl && <audio src={track.audioUrl} controls className="h-8 w-full" />}
                                        </div>
                                    </div>
                                ))}
                                {movie.audioTracks.length === 0 && <div className="text-center text-slate-500 py-12">Generate audio assets to see them listed here.</div>}
                            </div>
                        )}

                        {activePhase === 'production' && (
                            <div className="space-y-6 relative z-10">
                                {movie.productionDocs && (
                                    <div className="bg-white text-black p-8 rounded-xl shadow-lg prose prose-sm max-w-none">
                                        <div dangerouslySetInnerHTML={{ __html: md.render(movie.productionDocs) }} />
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.entries(movie.sceneBreakdowns).map(([scene, data], i) => (
                                        <div key={i} className="bg-slate-800 p-4 rounded-xl border border-slate-700 text-xs">
                                            <strong className="text-cyan-400 text-sm block mb-2">{scene}</strong>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="bg-slate-900 p-2 rounded">
                                                    <span className="text-slate-500 block">Props</span>
                                                    <span className="text-slate-300">{(data as any).props?.length || 0} items</span>
                                                </div>
                                                <div className="bg-slate-900 p-2 rounded">
                                                    <span className="text-slate-500 block">VFX</span>
                                                    <span className="text-slate-300">{(data as any).vfxNotes ? 'Required' : 'None'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activePhase === 'branding' && movie.marketingCopy && (
                            <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 whitespace-pre-wrap text-slate-300 text-sm leading-relaxed relative z-10 shadow-lg">
                                {movie.marketingCopy}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default MovieGenerator;
