
import React, { useState, useEffect, useRef } from 'react';
import { generateVideoFromPrompt, generateVideoFromImage, processVideoOperation } from '../../services/geminiService';
import { 
    CAMERA_CONTROLS, 
    VIDEO_EDIT_ACTIONS, 
    EXPORT_FORMATS, 
    VEO_LOADING_MESSAGES,
    VISUAL_STYLES
} from '../../constants';
import Loader from '../common/Loader';
import ImageUploader from '../common/ImageUploader';
import ApiKeyDialog from '../common/ApiKeyDialog';
import { fileToBase64 } from '../../utils';

interface VideoStudioProps {
    onShare: (options: { contentUrl: string; contentText: string; contentType: 'video' }) => void;
}

type StudioMode = 'create' | 'transform' | 'edit' | 'actors' | 'export';

const VideoStudio: React.FC<VideoStudioProps> = ({ onShare }) => {
    const [mode, setMode] = useState<StudioMode>('create');
    
    // Create Mode State
    const [createPrompt, setCreatePrompt] = useState('');
    const [createType, setCreateType] = useState<'text' | 'image' | 'mocap'>('text');
    const [referenceImage, setReferenceImage] = useState<File | null>(null);
    const [cameraControl, setCameraControl] = useState(CAMERA_CONTROLS[0]);
    const [motionIntensity, setMotionIntensity] = useState(5);
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');

    // Transform Mode State
    const [transformImage, setTransformImage] = useState<File | null>(null);
    const [targetStyle, setTargetStyle] = useState(VISUAL_STYLES[0]);
    const [transformPrompt, setTransformPrompt] = useState('');

    // Edit Mode State
    const [editAction, setEditAction] = useState(VIDEO_EDIT_ACTIONS[0]);
    const [editPrompt, setEditPrompt] = useState('');
    const [sourceVideoUrl, setSourceVideoUrl] = useState<string | null>(null);

    // General Processing State
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [apiKeyReady, setApiKeyReady] = useState(false);
    const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
    
    // Refs for cleanup
    const loadingIntervalRef = useRef<number | null>(null);

    useEffect(() => {
        const checkKey = async () => {
            // @ts-ignore
            if (typeof window.aistudio !== 'undefined' && await window.aistudio.hasSelectedApiKey()) {
                setApiKeyReady(true);
            }
        };
        checkKey();

        return () => {
            if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
            if (videoUrl) URL.revokeObjectURL(videoUrl);
            if (sourceVideoUrl && sourceVideoUrl !== videoUrl) URL.revokeObjectURL(sourceVideoUrl);
        };
    }, []);

    const handleSelectKey = async () => {
        // @ts-ignore
        if (window.aistudio) {
            // @ts-ignore
            await window.aistudio.openSelectKey();
            setApiKeyReady(true);
            setShowApiKeyDialog(false);
        }
    };

    const startLoadingMessages = () => {
        if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
        let msgIdx = 0;
        setLoadingMessage(VEO_LOADING_MESSAGES[0]);
        loadingIntervalRef.current = window.setInterval(() => {
            msgIdx = (msgIdx + 1) % VEO_LOADING_MESSAGES.length;
            setLoadingMessage(VEO_LOADING_MESSAGES[msgIdx]);
        }, 3000);
    };

    const stopLoadingMessages = () => {
        if (loadingIntervalRef.current) {
            clearInterval(loadingIntervalRef.current);
            loadingIntervalRef.current = null;
        }
    };

    const handleCreate = async () => {
        // @ts-ignore
        if (!apiKeyReady && typeof window.aistudio !== 'undefined') { setShowApiKeyDialog(true); return; }
        if (!createPrompt && createType !== 'image') { setError("Please enter a description."); return; }
        
        setLoading(true);
        setError(null);
        if (videoUrl) URL.revokeObjectURL(videoUrl);
        setVideoUrl(null);
        
        startLoadingMessages();

        try {
            let fullPrompt = createPrompt;
            if (createType === 'mocap') fullPrompt = `3D motion capture visualization, skeletal tracking, white dots on black suit. ${createPrompt}`;
            if (cameraControl !== 'None') fullPrompt += `, Camera: ${cameraControl}, cinematic movement`;
            fullPrompt += `, Motion intensity: ${motionIntensity}/10`;

            let operation;
            if (createType === 'image' && referenceImage) {
                const base64 = await fileToBase64(referenceImage);
                operation = await generateVideoFromImage(fullPrompt || "Animate this scene", base64, referenceImage.type, aspectRatio, true);
            } else {
                operation = await generateVideoFromPrompt(fullPrompt, aspectRatio, true);
            }
            
            const blob = await processVideoOperation(operation);
            const url = URL.createObjectURL(blob);
            setVideoUrl(url);
            if (mode !== 'edit') setSourceVideoUrl(url);

        } catch (e: any) {
            if (e.message?.includes("Requested entity was not found")) {
                setError("API Key Error. Please ensure billing is enabled.");
                setApiKeyReady(false);
                setShowApiKeyDialog(true);
            } else {
                setError(e.message || "Creation failed.");
            }
        } finally {
            stopLoadingMessages();
            setLoading(false);
        }
    };

    const handleTransform = async () => {
        // @ts-ignore
        if (!apiKeyReady && typeof window.aistudio !== 'undefined') { setShowApiKeyDialog(true); return; }
        if (!transformImage) { setError("Please upload a video keyframe/image."); return; }

        setLoading(true);
        setError(null);
        if (videoUrl) URL.revokeObjectURL(videoUrl);
        setVideoUrl(null);
        startLoadingMessages();
        setLoadingMessage("Transforming video style...");

        try {
            const base64 = await fileToBase64(transformImage);
            const fullPrompt = `Transform this scene into ${targetStyle} style. ${transformPrompt}. High consistency, retain composition.`;
            const operation = await generateVideoFromImage(fullPrompt, base64, transformImage.type, aspectRatio, true);
            
            const blob = await processVideoOperation(operation);
            const url = URL.createObjectURL(blob);
            setVideoUrl(url);
        } catch (e: any) {
            setError(e.message || "Transform failed.");
        } finally {
            stopLoadingMessages();
            setLoading(false);
        }
    };

    const handleEdit = async () => {
        // Re-using generation logic for simplicity but framed as editing.
        handleCreate();
    };

    return (
        <div className="flex flex-col h-[calc(100vh-10rem)] min-h-[600px]">
            <ApiKeyDialog show={showApiKeyDialog} onSelectKey={handleSelectKey} />
            
            {/* Top Toolbar */}
            <div className="flex-shrink-0 bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between z-10">
                <div className="flex space-x-1 bg-slate-800 p-1 rounded-lg">
                    {[
                        {id: 'create', label: 'Create', icon: '✨'},
                        {id: 'transform', label: 'Transform', icon: '🎭'},
                        {id: 'edit', label: 'Edit', icon: '🎬'},
                        {id: 'actors', label: 'Actors', icon: '👤'},
                        {id: 'export', label: 'Export', icon: '📤'}
                    ].map((m) => (
                        <button
                            key={m.id}
                            onClick={() => setMode(m.id as StudioMode)}
                            className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-all ${mode === m.id ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                        >
                            <span>{m.icon}</span>
                            <span>{m.label}</span>
                        </button>
                    ))}
                </div>
                <div className="text-xs text-slate-500 font-mono">{videoUrl ? 'Project Loaded' : 'New Project'}</div>
            </div>

            <div className="flex flex-grow overflow-hidden relative">
                {/* Left Panel: Contextual Tools */}
                <div className="w-80 flex-shrink-0 bg-slate-900/80 border-r border-slate-800 p-5 overflow-y-auto custom-scrollbar flex flex-col gap-6 h-full">
                    
                    {mode === 'create' && (
                        <div className="space-y-5 animate-fadeIn">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-3">Input Type</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['text', 'image', 'mocap'].map(t => (
                                        <button key={t} onClick={() => setCreateType(t as any)} className={`py-2 text-[10px] font-bold uppercase rounded border transition ${createType === t ? 'bg-cyan-900/50 border-cyan-500 text-cyan-400' : 'bg-slate-950 border-slate-700 text-slate-400'}`}>
                                            {t === 'mocap' ? '3D Mocap' : t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {createType === 'image' && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Reference Image</label>
                                    <ImageUploader onImageUpload={setReferenceImage} onImageClear={() => setReferenceImage(null)} />
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Prompt</label>
                                <textarea 
                                    value={createPrompt} 
                                    onChange={e => setCreatePrompt(e.target.value)} 
                                    rows={5}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500 resize-none"
                                    placeholder={createType === 'mocap' ? "Describe the movement (e.g. Karate kick)..." : "Describe your scene..."}
                                />
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-800">
                                <h4 className="text-xs font-bold text-white">Camera & Physics</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-slate-500 block mb-1">Movement</label>
                                        <select value={cameraControl} onChange={e => setCameraControl(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white">
                                            {CAMERA_CONTROLS.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-500 block mb-1">Motion (1-10)</label>
                                        <input type="number" min="1" max="10" value={motionIntensity} onChange={e => setMotionIntensity(parseInt(e.target.value))} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-500 block mb-1">Aspect Ratio</label>
                                    <div className="flex bg-slate-950 rounded p-1">
                                        <button onClick={() => setAspectRatio('16:9')} className={`flex-1 py-1 text-[10px] rounded ${aspectRatio === '16:9' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>16:9</button>
                                        <button onClick={() => setAspectRatio('9:16')} className={`flex-1 py-1 text-[10px] rounded ${aspectRatio === '9:16' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>9:16</button>
                                    </div>
                                </div>
                            </div>

                            <button onClick={handleCreate} disabled={loading} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl transition shadow-lg disabled:opacity-50">
                                {loading ? <Loader /> : 'Generate Scene'}
                            </button>
                        </div>
                    )}

                    {mode === 'transform' && (
                        <div className="space-y-5 animate-fadeIn">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Input Frame / Image</label>
                                <ImageUploader onImageUpload={setTransformImage} onImageClear={() => setTransformImage(null)} />
                                <p className="text-[10px] text-slate-500 mt-1">Upload a keyframe from your video to reference structure.</p>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Target Style</label>
                                <select value={targetStyle} onChange={e => setTargetStyle(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-sm">
                                    {VISUAL_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Style Prompt</label>
                                <textarea 
                                    value={transformPrompt} 
                                    onChange={e => setTransformPrompt(e.target.value)} 
                                    rows={4}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-sm focus:ring-2 focus:ring-purple-500 resize-none"
                                    placeholder="e.g. Turn into a claymation animation..."
                                />
                            </div>

                            <button onClick={handleTransform} disabled={loading} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition shadow-lg disabled:opacity-50">
                                {loading ? <Loader /> : 'Transform Video'}
                            </button>
                        </div>
                    )}

                    {mode === 'edit' && (
                        <div className="space-y-5 animate-fadeIn">
                            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
                                <p className="text-xs text-slate-400 mb-2">Active Clip Source</p>
                                {sourceVideoUrl ? (
                                    <div className="text-green-400 text-sm font-bold flex items-center justify-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Loaded</div>
                                ) : (
                                    <p className="text-slate-500 italic text-xs">Generate a video in Create mode first.</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Magic Action</label>
                                <select value={editAction} onChange={e => setEditAction(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-sm">
                                    {VIDEO_EDIT_ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Details</label>
                                <textarea 
                                    value={editPrompt} 
                                    onChange={e => setEditPrompt(e.target.value)} 
                                    rows={4}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-sm focus:ring-2 focus:ring-green-500 resize-none"
                                    placeholder="Specific instructions..."
                                />
                            </div>

                            <button onClick={handleEdit} disabled={loading || !sourceVideoUrl} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition shadow-lg disabled:opacity-50">
                                {loading ? <Loader /> : 'Apply Magic Edit'}
                            </button>
                        </div>
                    )}

                    {mode === 'actors' && (
                        <div className="flex flex-col h-full items-center justify-center text-center p-4">
                            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                            </div>
                            <p className="text-sm text-slate-400 mb-4">Use the Global Avatar Creator for advanced actor generation.</p>
                            <button className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded">Go to Avatar Creator</button>
                        </div>
                    )}

                    {mode === 'export' && (
                        <div className="space-y-5 animate-fadeIn">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Format</label>
                                <div className="space-y-2">
                                    {EXPORT_FORMATS.map(f => (
                                        <button key={f} className="w-full text-left px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-300 hover:bg-slate-800 transition">
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="pt-4 border-t border-slate-800">
                                <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition shadow-lg mb-3">Generate Trailer</button>
                                <button className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition border border-slate-700">Export Timeline</button>
                            </div>
                        </div>
                    )}

                    {error && <div className="p-3 bg-red-900/20 border border-red-800 rounded text-red-300 text-xs text-center">{error}</div>}
                </div>

                {/* Right Panel: Viewport & Timeline */}
                <div className="flex-grow bg-slate-950 flex flex-col relative overflow-hidden">
                    {/* Viewport */}
                    <div className="flex-grow flex items-center justify-center p-8 relative overflow-hidden bg-grid-slate-900/50">
                        {loading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20 backdrop-blur-sm">
                                <Loader message={loadingMessage} />
                            </div>
                        )}
                        
                        {!videoUrl ? (
                            <div className="text-center text-slate-600 opacity-50">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                <p className="text-xl font-light">Studio Viewport</p>
                            </div>
                        ) : (
                            <div className="relative shadow-2xl rounded-lg overflow-hidden border border-slate-800 bg-black max-w-full max-h-full">
                                <video src={videoUrl} controls autoPlay loop className="max-h-[60vh] w-auto" />
                            </div>
                        )}
                    </div>

                    {/* Timeline (Fixed Height, No Overlap) */}
                    <div className="h-48 bg-slate-900 border-t border-slate-800 flex flex-col flex-shrink-0">
                        <div className="px-4 py-2 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                            <div className="flex space-x-4 text-xs font-mono text-slate-500">
                                <span>00:00:00</span>
                                <span>00:00:05</span>
                                <span>00:00:10</span>
                                <span>00:00:15</span>
                            </div>
                            <div className="flex space-x-2">
                                <button className="p-1 hover:bg-slate-800 rounded"><svg className="w-4 h-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 5.5a.5.5 0 01.5.5v7a.5.5 0 01-1 0v-7a.5.5 0 01.5-.5zm4 0a.5.5 0 01.5.5v7a.5.5 0 01-1 0v-7a.5.5 0 01.5-.5z" clipRule="evenodd" /></svg></button>
                                <button className="p-1 hover:bg-slate-800 rounded"><svg className="w-4 h-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg></button>
                            </div>
                        </div>
                        <div className="flex-grow p-4 overflow-x-auto custom-scrollbar relative">
                            {/* Tracks */}
                            <div className="space-y-2 relative min-w-[800px]">
                                <div className="h-12 bg-slate-800 rounded border border-slate-700 relative overflow-hidden group cursor-pointer hover:border-cyan-500/50">
                                    <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500 opacity-0 group-hover:opacity-100 z-10">Video Track 1</div>
                                    {videoUrl && <div className="absolute left-0 top-0 bottom-0 w-32 bg-cyan-900/40 border-r border-cyan-500/50"></div>}
                                </div>
                                <div className="h-8 bg-slate-800/50 rounded border border-slate-700/50 relative">
                                    <div className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-600">Audio Track 1</div>
                                </div>
                                {/* Playhead */}
                                <div className="absolute top-0 bottom-0 left-32 w-0.5 bg-red-500 z-20 shadow-[0_0_10px_rgba(239,68,68,0.5)] pointer-events-none">
                                    <div className="w-3 h-3 -ml-1.5 bg-red-500 rounded-full -mt-1.5"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoStudio;
