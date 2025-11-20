
import React, { useState, useEffect, useRef } from 'react';
import { generateVideoFromPrompt, generateVideoFromImage, pollVideoOperation } from '../../services/geminiService';
import { VIDEO_ASPECT_RATIOS, VEO_LOADING_MESSAGES, DESIGN_STYLES, VISUAL_EFFECTS } from '../../constants';
import { fileToBase64 } from '../../utils';
import ImageUploader from '../common/ImageUploader';
import Loader from '../common/Loader';
import ApiKeyDialog from '../common/ApiKeyDialog';


type Mode = 'text-to-video' | 'image-to-video';

interface VideoGeneratorProps {
    onShare: (options: { contentUrl: string; contentText: string; contentType: 'video' }) => void;
}

const VideoGenerator: React.FC<VideoGeneratorProps> = ({ onShare }) => {
    const [mode, setMode] = useState<Mode>('text-to-video');
    const [prompt, setPrompt] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    const [isHighQuality, setIsHighQuality] = useState(false);
    const [videoStyle, setVideoStyle] = useState(DESIGN_STYLES[0]);
    const [visualEffect, setVisualEffect] = useState(VISUAL_EFFECTS[0]);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState(VEO_LOADING_MESSAGES[0]);
    const [error, setError] = useState<string | null>(null);
    const pollIntervalRef = useRef<number | null>(null);
    const messageIntervalRef = useRef<number | null>(null);
    const [isSaved, setIsSaved] = useState(false);
    
    const [apiKeyReady, setApiKeyReady] = useState(false);
    const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);

    useEffect(() => {
        const checkKey = async () => {
            // @ts-ignore
            if (typeof window.aistudio !== 'undefined') {
                // @ts-ignore
                if (await window.aistudio.hasSelectedApiKey()) {
                    setApiKeyReady(true);
                    setShowApiKeyDialog(false);
                } else {
                    setApiKeyReady(false);
                    setShowApiKeyDialog(true);
                }
            } else {
                setApiKeyReady(true);
                setShowApiKeyDialog(false);
            }
        };
        checkKey();

        return () => {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
        };
    }, []);

    const handleSelectKey = async () => {
        // @ts-ignore
        if (window.aistudio) {
            // @ts-ignore
            await window.aistudio.openSelectKey();
            // Assume success to improve UX and avoid race conditions
            setApiKeyReady(true);
            setShowApiKeyDialog(false);
        }
    };

    const startLoadingMessages = () => {
        let i = 0;
        setLoadingMessage(VEO_LOADING_MESSAGES[0]);
        messageIntervalRef.current = window.setInterval(() => {
            i = (i + 1) % VEO_LOADING_MESSAGES.length;
            setLoadingMessage(VEO_LOADING_MESSAGES[i]);
        }, 3000);
    };

    const stopLoadingMessages = () => {
        if (messageIntervalRef.current) {
            clearInterval(messageIntervalRef.current);
            messageIntervalRef.current = null;
        }
    };
    
    const cleanupPolling = () => {
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
        }
    };

    const handlePolling = (initialOperation: any) => {
        let op = initialOperation;
        pollIntervalRef.current = window.setInterval(async () => {
            try {
                op = await pollVideoOperation(op);
                if (op.done) {
                    cleanupPolling();
                    stopLoadingMessages();
                    setLoading(false);
                    const uri = op.response?.generatedVideos?.[0]?.video?.uri;
                    if (uri) {
                        const response = await fetch(`${uri}&key=${process.env.API_KEY}`);
                        const blob = await response.blob();
                        setVideoUrl(URL.createObjectURL(blob));
                    } else {
                        setError('Video generation finished, but no video URL was returned.');
                    }
                }
            } catch (err) {
                cleanupPolling();
                stopLoadingMessages();
                setLoading(false);
                setError('An error occurred while checking video status.');
                console.error(err);
            }
        }, 10000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // @ts-ignore
        if (!apiKeyReady && typeof window.aistudio !== 'undefined') {
            setShowApiKeyDialog(true);
            return;
        }
        
        if (mode === 'image-to-video' && !imageFile) {
            setError('Please upload an image for image-to-video mode.');
            return;
        }
        if (mode === 'text-to-video' && !prompt) {
            setError('Please enter a prompt.');
            return;
        }

        setLoading(true);
        setError(null);
        setVideoUrl(null);
        setIsSaved(false);
        startLoadingMessages();

        try {
            let fullPrompt = prompt;
            if (mode === 'text-to-video') {
                fullPrompt += `, in ${videoStyle} style`;
            }
            if (visualEffect !== 'None') {
                fullPrompt += `, with ${visualEffect} effects`;
            }

            let operation: any;
            if (mode === 'image-to-video' && imageFile) {
                const imageBase64 = await fileToBase64(imageFile);
                operation = await generateVideoFromImage(fullPrompt, imageBase64, imageFile.type, aspectRatio, isHighQuality);
            } else {
                operation = await generateVideoFromPrompt(fullPrompt, aspectRatio, isHighQuality);
            }
            handlePolling(operation);
        } catch (err: any) {
            stopLoadingMessages();
            setLoading(false);
            if(err.message?.includes("Requested entity was not found")) {
                setError("An API Key error occurred. Please select a valid key and ensure your project has billing enabled.");
                setApiKeyReady(false);
                setShowApiKeyDialog(true);
            } else {
                setError('Failed to start video generation. Please check your prompt and try again.');
            }
            console.error(err);
        }
    };
    
    const handleSave = () => {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };
    
    return (
        <>
            <ApiKeyDialog show={showApiKeyDialog} onSelectKey={handleSelectKey} />
            
            {/* Main Layout Container - Full Height Dashboard Style */}
            <div className="flex flex-col xl:flex-row gap-6 h-[calc(100vh-120px)] min-h-[600px]">
                
                {/* Sidebar Controls */}
                <div className="w-full xl:w-96 flex-shrink-0 flex flex-col bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
                    <div className="p-5 border-b border-slate-800">
                         <div className="flex bg-slate-800 rounded-lg p-1">
                            <button 
                                type="button" 
                                onClick={() => { setMode('text-to-video'); setImageFile(null); }} 
                                className={`flex-1 p-2.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${mode === 'text-to-video' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                            >
                                Text to Video
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setMode('image-to-video')} 
                                className={`flex-1 p-2.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${mode === 'image-to-video' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                            >
                                Image to Video
                            </button>
                        </div>
                    </div>

                    <div className="flex-grow overflow-y-auto p-5 custom-scrollbar">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {mode === 'image-to-video' && (
                                <div className="animate-fadeIn">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Source Image</label>
                                    <ImageUploader onImageUpload={setImageFile} onImageClear={() => setImageFile(null)} />
                                </div>
                            )}
                        
                            <div>
                                <label htmlFor="prompt-vid" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Prompt</label>
                                <textarea
                                    id="prompt-vid"
                                    rows={5}
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500 placeholder-slate-600 resize-none"
                                    placeholder={mode === 'image-to-video' ? "e.g., Make the clouds move (optional)" : "e.g., A neon hologram of a cat driving fast"}
                                />
                            </div>

                            <div className="space-y-4">
                                {mode === 'text-to-video' && (
                                    <div>
                                        <label htmlFor="video-style" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Video Style</label>
                                        <select id="video-style" value={videoStyle} onChange={(e) => setVideoStyle(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-cyan-500 transition">
                                            {DESIGN_STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                )}
                                <div>
                                    <label htmlFor="visual-effect" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Visual Effect</label>
                                    <select id="visual-effect" value={visualEffect} onChange={(e) => setVisualEffect(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-cyan-500 transition">
                                        {VISUAL_EFFECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>

                             <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Settings</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {/* Aspect Ratio Column */}
                                    <div className="col-span-2 grid grid-cols-2 gap-2">
                                        {VIDEO_ASPECT_RATIOS.map((ratio) => (
                                            <button
                                                key={ratio}
                                                type="button"
                                                onClick={() => setAspectRatio(ratio as '16:9' | '9:16')}
                                                className={`py-2 px-2 rounded-lg border text-xs font-medium transition flex flex-col items-center justify-center gap-1 ${aspectRatio === ratio ? 'bg-cyan-600 text-white border-cyan-500' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                                            >
                                                 {ratio === '16:9' ? (
                                                    <div className="w-6 h-3.5 border border-current rounded-sm opacity-80"></div>
                                                ) : (
                                                    <div className="w-3.5 h-6 border border-current rounded-sm opacity-80"></div>
                                                )}
                                                {ratio === '16:9' ? 'Landscape' : 'Portrait'}
                                            </button>
                                        ))}
                                    </div>
                                    
                                    {/* Quality Toggle - Full Width */}
                                    <div className="col-span-2 flex items-center justify-between bg-slate-800 rounded-lg p-3 border border-slate-700">
                                        <span className="text-xs text-slate-300 font-medium">High Quality Mode</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" checked={isHighQuality} onChange={() => setIsHighQuality(!isHighQuality)} className="sr-only peer" />
                                            <div className="w-9 h-5 bg-slate-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold py-3.5 px-4 rounded-xl hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-900/20 flex items-center justify-center space-x-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        <span>Generating...</span>
                                    </>
                                ) : (
                                    <span>Generate Video</span>
                                )}
                            </button>
                            {error && <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-xs text-center">{error}</div>}
                        </form>
                    </div>
                </div>

                {/* Preview Area */}
                <div className="flex-grow bg-slate-900/50 rounded-2xl border border-slate-800 p-6 flex items-center justify-center relative overflow-hidden shadow-inner">
                     {/* Background Grid Pattern */}
                     <div className="absolute inset-0 bg-grid-slate-800/20 [mask-image:linear-gradient(to_bottom,white,transparent)] pointer-events-none"></div>

                    {loading && <Loader message={loadingMessage} />}
                    {!loading && videoUrl && (
                        <div className="text-center w-full max-w-4xl relative z-10">
                            <div className={`relative rounded-xl overflow-hidden shadow-2xl shadow-black/50 border border-slate-700/50 mx-auto ${aspectRatio === '9:16' ? 'max-w-[350px]' : 'max-w-full'}`}>
                                <video src={videoUrl} controls autoPlay loop className="w-full h-auto bg-black" />
                            </div>
                            
                            <div className="mt-6 flex justify-center space-x-4">
                                <a href={videoUrl} download={`generated-video-${Date.now()}.mp4`} className="flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors border border-slate-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                    <span>Download</span>
                                </a>
                                <button
                                    onClick={handleSave}
                                    className={`flex items-center justify-center space-x-2 font-bold py-2.5 px-6 rounded-lg transition-colors duration-300 ${isSaved ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
                                >
                                    {isSaved ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg>
                                    )}
                                    <span>{isSaved ? 'Saved' : 'Save'}</span>
                                </button>
                                <button
                                    onClick={() => onShare({ contentUrl: videoUrl, contentText: prompt, contentType: 'video' })}
                                    className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 px-6 rounded-lg transition-colors shadow-lg shadow-purple-900/20"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                                    </svg>
                                    <span>Share</span>
                                </button>
                                <button onClick={() => setVideoUrl(null)} className="p-2.5 text-slate-400 hover:text-red-400 transition-colors" title="Discard">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        </div>
                    )}
                    {!loading && !videoUrl && (
                        <div className="text-slate-600 text-center flex flex-col items-center">
                            <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 opacity-40" viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3.5l4 4v-11l-4 4z"/></svg>
                            </div>
                            <h4 className="text-lg font-medium text-slate-500">Ready to Create</h4>
                            <p className="text-sm text-slate-600 mt-1 max-w-xs">Configure your video settings on the left and click generate to see the magic happen.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default VideoGenerator;
