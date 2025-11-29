
import React, { useState, useEffect, useRef } from 'react';
import { generateVideoFromPrompt, pollVideoOperation } from '../../services/geminiService';
import { DANCE_STYLES, VIDEO_ASPECT_RATIOS, VEO_LOADING_MESSAGES } from '../../constants';
import Loader from '../common/Loader';
import ApiKeyDialog from '../common/ApiKeyDialog';

interface DanceGeneratorProps {
    onShare: (options: { contentUrl: string; contentText: string; contentType: 'video' }) => void;
}

const DanceGenerator: React.FC<DanceGeneratorProps> = ({ onShare }) => {
    // Form Inputs
    const [danceStyle, setDanceStyle] = useState(DANCE_STYLES[0]);
    const [characterDescription, setCharacterDescription] = useState('');
    const [setting, setSetting] = useState('');
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('9:16');
    
    // Outputs & State
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState(VEO_LOADING_MESSAGES[0]);
    const [error, setError] = useState<string | null>(null);
    const pollIntervalRef = useRef<number | null>(null);
    const messageIntervalRef = useRef<number | null>(null);
    const [isSaved, setIsSaved] = useState(false);
    
    // API Key State
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
            // Assume success to avoid race conditions
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

    const stopLoading = () => {
        setLoading(false);
        if (messageIntervalRef.current) {
            clearInterval(messageIntervalRef.current);
            messageIntervalRef.current = null;
        }
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
                    stopLoading();
                    const uri = op.response?.generatedVideos?.[0]?.video?.uri;
                    if (uri) {
                        const response = await fetch(`${uri}&key=${process.env.API_KEY}`);
                        const blob = await response.blob();
                        setVideoUrl(URL.createObjectURL(blob));
                    } else {
                        setError('Video generation finished, but no video URL was returned.');
                    }
                }
            } catch (err: any) {
                stopLoading();
                 if(err.message?.includes("Requested entity was not found")) {
                    setError("An API Key error occurred. Please select a valid key and ensure your project has billing enabled.");
                    setApiKeyReady(false);
                    setShowApiKeyDialog(true);
                } else {
                    setError('An error occurred while checking video status.');
                }
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
        
        if (!characterDescription || !setting) {
            setError('Please describe the character and setting.');
            return;
        }

        setLoading(true);
        setError(null);
        setVideoUrl(null);
        setIsSaved(false);
        startLoadingMessages();

        try {
            const prompt = `A video of a ${characterDescription} performing a ${danceStyle} dance in ${setting}.`;
            const operation = await generateVideoFromPrompt(prompt, aspectRatio, false); // use standard quality for speed
            handlePolling(operation);
        } catch (err: any) {
            stopLoading();
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

    const fullPromptText = `A video of a ${characterDescription} performing a ${danceStyle} dance in ${setting}.`;
    
    return (
        <>
            <ApiKeyDialog show={showApiKeyDialog} onSelectKey={handleSelectKey} />
            <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)] min-h-[600px]">
                {/* Sidebar Controls */}
                <div className="w-full lg:w-80 flex-shrink-0 bg-slate-900/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-800 overflow-y-auto custom-scrollbar">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="danceStyle" className="block text-xs font-bold text-slate-400 uppercase mb-2">Dance Style</label>
                            <select id="danceStyle" value={danceStyle} onChange={(e) => setDanceStyle(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:ring-2 focus:ring-cyan-500 transition">
                                {DANCE_STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    
                        <div>
                            <label htmlFor="character" className="block text-xs font-bold text-slate-400 uppercase mb-2">Character</label>
                            <textarea
                                id="character"
                                rows={3}
                                value={characterDescription}
                                onChange={(e) => setCharacterDescription(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500 transition resize-none"
                                placeholder={"e.g., a cheerful robot, a knight in shining armor"}
                            />
                        </div>

                         <div>
                            <label htmlFor="setting" className="block text-xs font-bold text-slate-400 uppercase mb-2">Setting</label>
                            <textarea
                                id="setting"
                                rows={2}
                                value={setting}
                                onChange={(e) => setSetting(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500 transition resize-none"
                                placeholder={"e.g., a futuristic city, a medieval castle"}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Aspect Ratio</label>
                            <div className="grid grid-cols-2 gap-2">
                                {VIDEO_ASPECT_RATIOS.map((ratio) => (
                                    <button
                                        key={ratio}
                                        type="button"
                                        onClick={() => setAspectRatio(ratio as '16:9' | '9:16')}
                                        className={`p-2 rounded-lg border text-xs transition ${aspectRatio === ratio ? 'bg-cyan-600 border-cyan-500 text-white font-bold' : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-400'}`}
                                    >
                                        {ratio === '16:9' ? 'Landscape' : 'Portrait'}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-xl hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex justify-center items-center space-x-2"
                        >
                            {loading ? <Loader /> : <span>Generate Dance</span>}
                        </button>
                        {error && <p className="text-red-400 text-xs text-center bg-red-900/20 p-2 rounded">{error}</p>}
                    </form>
                </div>

                {/* Main Preview Area */}
                <div className="flex-grow bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col overflow-hidden relative">
                    <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                        <h3 className="font-bold text-white text-sm uppercase tracking-wider">Video Preview</h3>
                        {videoUrl && (
                            <button
                                onClick={() => onShare({ contentUrl: videoUrl, contentText: fullPromptText, contentType: 'video' })}
                                className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded font-bold transition"
                            >
                                Share & Promote
                            </button>
                        )}
                    </div>

                    <div className="flex-grow p-8 flex items-center justify-center relative bg-slate-950/30">
                        <div className="absolute inset-0 bg-grid-slate-800/20 pointer-events-none"></div>
                        
                        {loading && <Loader message={loadingMessage} />}
                        
                        {!loading && videoUrl && (
                            <div className="text-center w-full max-w-full relative z-10">
                                <video src={videoUrl} controls autoPlay loop className="max-w-full max-h-[calc(100vh-16rem)] rounded-xl shadow-2xl shadow-black/50 mx-auto" />
                                <div className="mt-4 flex justify-center space-x-4">
                                    <a href={videoUrl} download={`dance-video-${Date.now()}.mp4`} className="flex items-center justify-center space-x-2 bg-slate-800 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors text-xs border border-slate-700">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                        <span>Download</span>
                                    </a>
                                    <button
                                        onClick={handleSave}
                                        className={`flex items-center justify-center space-x-2 font-bold py-2 px-4 rounded-lg transition-colors text-xs ${isSaved ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'}`}
                                    >
                                        {isSaved ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg>
                                        )}
                                        <span>{isSaved ? 'Saved' : 'Save'}</span>
                                    </button>
                                </div>
                            </div>
                        )}
                        {!loading && !videoUrl && (
                            <div className="text-slate-500 text-center opacity-60">
                                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-20 w-20 mb-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm-3.5 4.04l2.12-.89.89-2.12C11.87 4.01 12.83 4.3 13 5.14l2.29 9.14 6.13.43c.9.06 1.34 1.21.69 1.85l-4.63 4.63c-.45.45-1.2.59-1.81.33l-4.5-1.93-4.5 1.93c-.61.26-1.36.12-1.81-.33l-4.63-4.63c-.65-.64-.21-1.79.69-1.85l6.13-.43L11 5.14c.17-.84 1.13-1.13 1.5-.1z"/></svg>
                                <p className="text-lg">Your generated dance video will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default DanceGenerator;
