
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

    const fullPromptText = `A video of a ${characterDescription} performing a ${danceStyle} dance in ${setting}.`;
    
    return (
        <>
            <ApiKeyDialog show={showApiKeyDialog} onSelectKey={handleSelectKey} />
            <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-2/5 lg:w-1/3">
                    <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                        <div>
                            <label htmlFor="danceStyle" className="block text-sm font-medium text-slate-300 mb-2">Dance Style</label>
                            <select id="danceStyle" value={danceStyle} onChange={(e) => setDanceStyle(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 transition">
                                {DANCE_STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    
                        <div>
                            <label htmlFor="character" className="block text-sm font-medium text-slate-300 mb-2">Character</label>
                            <textarea
                                id="character"
                                rows={3}
                                value={characterDescription}
                                onChange={(e) => setCharacterDescription(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 transition"
                                placeholder={"e.g., a cheerful robot, a knight in shining armor"}
                            />
                        </div>

                         <div>
                            <label htmlFor="setting" className="block text-sm font-medium text-slate-300 mb-2">Setting</label>
                            <textarea
                                id="setting"
                                rows={2}
                                value={setting}
                                onChange={(e) => setSetting(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 transition"
                                placeholder={"e.g., a futuristic city, a medieval castle"}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Aspect Ratio</label>
                            <div className="grid grid-cols-2 gap-2">
                                {VIDEO_ASPECT_RATIOS.map((ratio) => (
                                    <button
                                        key={ratio}
                                        type="button"
                                        onClick={() => setAspectRatio(ratio as '16:9' | '9:16')}
                                        className={`p-2 rounded-lg border text-sm transition ${aspectRatio === ratio ? 'bg-cyan-500 border-cyan-500 text-white font-bold' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'}`}
                                    >
                                        {ratio === '16:9' ? 'Landscape' : 'Portrait'}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-300"
                        >
                            {loading ? 'Generating...' : 'Generate Dance Video'}
                        </button>
                        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                    </form>
                </div>
                <div className="w-full md:w-3/5 lg:w-2/3 flex items-center justify-center bg-slate-900/50 rounded-lg border border-slate-700 min-h-[300px] md:min-h-0 p-4">
                    {loading && <Loader message={loadingMessage} />}
                    {!loading && videoUrl && (
                        <div className="text-center w-full">
                            <video src={videoUrl} controls autoPlay loop className="max-w-full max-h-[75vh] rounded-lg shadow-2xl shadow-black/40" />
                            <div className="mt-6">
                                <button
                                    onClick={() => onShare({ contentUrl: videoUrl, contentText: fullPromptText, contentType: 'video' })}
                                    className="flex items-center justify-center space-x-2 bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-300 mx-auto"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                                    </svg>
                                    <span>Share & Promote</span>
                                </button>
                            </div>
                        </div>
                    )}
                    {!loading && !videoUrl && (
                        <div className="text-slate-500 text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 opacity-30" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm-3.5 4.04l2.12-.89.89-2.12C11.87 4.01 12.83 4.3 13 5.14l2.29 9.14 6.13.43c.9.06 1.34 1.21.69 1.85l-4.63 4.63c-.45.45-1.2.59-1.81.33l-4.5-1.93-4.5 1.93c-.61.26-1.36.12-1.81-.33l-4.63-4.63c-.65-.64-.21-1.79.69-1.85l6.13-.43L11 5.14c.17-.84 1.13-1.13 1.5-.1z"/></svg>
                            <p className="mt-4">Your generated dance video will appear here</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default DanceGenerator;
