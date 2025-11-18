
import React, { useState, useEffect, useRef } from 'react';
import { generateVideoFromPrompt, extendVideo, pollVideoOperation } from '../../services/geminiService';
import { VIDEO_ASPECT_RATIOS, VEO_LOADING_MESSAGES, VIDEO_EXTENSION_SUGGESTIONS } from '../../constants';
import Loader from '../common/Loader';
import ApiKeyDialog from '../common/ApiKeyDialog';

interface VideoEditorProps {
    onShare: (options: { contentUrl: string; contentText: string; contentType: 'video' }) => void;
}

const VideoEditor: React.FC<VideoEditorProps> = ({ onShare }) => {
    // State for initial video generation
    const [initialPrompt, setInitialPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    const [initialOperation, setInitialOperation] = useState<any | null>(null);
    const [initialVideoUrl, setInitialVideoUrl] = useState<string | null>(null);
    const [loadingInitial, setLoadingInitial] = useState(false);

    // State for video extension
    const [extensionPrompt, setExtensionPrompt] = useState('');
    const [extendedVideoUrl, setExtendedVideoUrl] = useState<string | null>(null);
    const [loadingExtension, setLoadingExtension] = useState(false);

    // Common state
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
        setLoadingInitial(false);
        setLoadingExtension(false);
        if (messageIntervalRef.current) {
            clearInterval(messageIntervalRef.current);
            messageIntervalRef.current = null;
        }
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
        }
    };

    const handleApiError = (err: any) => {
        stopLoading();
        if (err.message?.includes("Requested entity was not found")) {
            setError("An API Key error occurred. Please select a valid key and ensure your project has billing enabled.");
            setApiKeyReady(false);
            setShowApiKeyDialog(true);
        } else {
            setError('Failed to start video generation. Please check your prompt and try again.');
        }
        console.error(err);
    };
    
    const handlePolling = (operation: any, onComplete: (finalOp: any) => void) => {
        let op = operation;
        pollIntervalRef.current = window.setInterval(async () => {
            try {
                op = await pollVideoOperation(op);
                if (op.done) {
                    onComplete(op);
                }
            } catch (err: any) {
                handleApiError(err);
            }
        }, 10000);
    };

    const handleInitialSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // @ts-ignore
        if (!apiKeyReady && typeof window.aistudio !== 'undefined') {
            setShowApiKeyDialog(true);
            return;
        }

        if (!initialPrompt) {
            setError('Please enter a prompt for the base video.');
            return;
        }

        setLoadingInitial(true);
        setError(null);
        setInitialVideoUrl(null);
        setExtendedVideoUrl(null);
        setInitialOperation(null);
        startLoadingMessages();

        try {
            const operation = await generateVideoFromPrompt(initialPrompt, aspectRatio, true);
            handlePolling(operation, async (finalOp) => {
                stopLoading();
                const uri = finalOp.response?.generatedVideos?.[0]?.video?.uri;
                if (uri) {
                    const response = await fetch(`${uri}&key=${process.env.API_KEY}`);
                    const blob = await response.blob();
                    setInitialVideoUrl(URL.createObjectURL(blob));
                    setInitialOperation(finalOp);
                } else {
                    setError('Base video generation finished, but no video URL was returned.');
                }
            });
        } catch (err: any) {
            handleApiError(err);
        }
    };

    const handleExtensionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // @ts-ignore
        if (!apiKeyReady && typeof window.aistudio !== 'undefined') {
            setShowApiKeyDialog(true);
            return;
        }

        if (!extensionPrompt) {
            setError('Please enter a prompt to extend the video.');
            return;
        }
        if (!initialOperation?.response?.generatedVideos?.[0]?.video) {
            setError('Base video data is not available for extension.');
            return;
        }

        setLoadingExtension(true);
        setError(null);
        setExtendedVideoUrl(null);
        startLoadingMessages();

        try {
            const previousVideo = initialOperation.response.generatedVideos[0].video;
            const operation = await extendVideo(extensionPrompt, previousVideo, aspectRatio);
            handlePolling(operation, async (finalOp) => {
                stopLoading();
                const uri = finalOp.response?.generatedVideos?.[0]?.video?.uri;
                if (uri) {
                    const response = await fetch(`${uri}&key=${process.env.API_KEY}`);
                    const blob = await response.blob();
                    setExtendedVideoUrl(URL.createObjectURL(blob));
                } else {
                    setError('Video extension finished, but no video URL was returned.');
                }
            });
        } catch (err: any) {
            handleApiError(err);
        }
    };
    
    const handleReset = () => {
        stopLoading();
        setInitialPrompt('');
        setExtensionPrompt('');
        setInitialOperation(null);
        setInitialVideoUrl(null);
        setExtendedVideoUrl(null);
        setError(null);
    };

    return (
        <>
            <ApiKeyDialog show={showApiKeyDialog} onSelectKey={handleSelectKey} />
            <div className="flex flex-col xl:flex-row gap-8">
                <div className="w-full xl:w-1/3 space-y-6">
                    <div className="p-4 bg-slate-800 rounded-lg border border-slate-700 space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold">Video Studio</h3>
                            {(initialVideoUrl || loadingInitial) && (
                                <button onClick={handleReset} className="text-sm bg-slate-700 hover:bg-slate-600 text-cyan-400 font-semibold py-2 px-3 rounded-lg transition">Start Over</button>
                            )}
                        </div>
                        <p className="text-sm text-slate-400">Generate a short video, then extend it with new prompts to build a sequence.</p>
                    </div>

                    {/* Step 1: Initial Video Generation Form */}
                    <form onSubmit={handleInitialSubmit} className="space-y-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
                        <fieldset disabled={loadingInitial || !!initialVideoUrl}>
                            <h4 className="font-semibold text-slate-200">Step 1: Create a Base Video</h4>
                            <textarea
                                rows={3}
                                value={initialPrompt}
                                onChange={(e) => setInitialPrompt(e.target.value)}
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 transition disabled:opacity-50"
                                placeholder="e.g., A majestic eagle soaring over a mountain range"
                            />
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Aspect Ratio</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {VIDEO_ASPECT_RATIOS.map((ratio) => (
                                        <button
                                            key={ratio}
                                            type="button"
                                            onClick={() => setAspectRatio(ratio as '16:9' | '9:16')}
                                            className={`p-2 rounded-lg border text-sm transition ${aspectRatio === ratio ? 'bg-cyan-500 border-cyan-500 text-white font-bold' : 'bg-slate-700 border-slate-600 hover:bg-slate-600'}`}
                                        >
                                            {ratio === '16:9' ? 'Landscape' : 'Portrait'} ({ratio})
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button type="submit" className="w-full mt-2 bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-300">
                                {initialVideoUrl ? 'Base Video Created' : (loadingInitial ? 'Creating...' : 'Create Base Video')}
                            </button>
                        </fieldset>
                    </form>

                    {/* Step 2: Extension Form */}
                    <form onSubmit={handleExtensionSubmit} className="space-y-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
                        <fieldset disabled={!initialVideoUrl || loadingExtension || loadingInitial}>
                            <h4 className="font-semibold text-slate-200">Step 2: Extend Your Video (+7s)</h4>
                            <textarea
                                rows={3}
                                value={extensionPrompt}
                                onChange={(e) => setExtensionPrompt(e.target.value)}
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 transition disabled:opacity-50"
                                placeholder="e.g., ...and then a dragon appears in the sky"
                            />
                            <div className="flex flex-wrap gap-2 my-2">
                                {VIDEO_EXTENSION_SUGGESTIONS.map(suggestion => (
                                    <button
                                        key={suggestion}
                                        type="button"
                                        onClick={() => setExtensionPrompt(initialPrompt + ' ' + suggestion)}
                                        className="bg-slate-700 text-xs text-slate-300 px-3 py-1.5 rounded-full hover:bg-slate-600 transition disabled:opacity-50"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                            <button type="submit" className="w-full mt-2 bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-300">
                                {loadingExtension ? 'Extending...' : 'Extend Video'}
                            </button>
                        </fieldset>
                    </form>
                    {error && <p className="text-red-400 text-sm mt-2 p-4 bg-red-900/50 rounded-lg">{error}</p>}
                </div>

                <div className="w-full xl:w-2/3 space-y-6">
                    <div className="bg-slate-800/50 rounded-lg border border-slate-700 min-h-[250px] flex items-center justify-center p-4">
                        {loadingInitial ? <Loader message={loadingMessage} /> : initialVideoUrl ? (
                            <div className="text-center w-full">
                                <h4 className="font-semibold text-slate-200 mb-2">Base Video</h4>
                                <video key={initialVideoUrl} src={initialVideoUrl} controls loop className="max-w-full max-h-[40vh] rounded-lg mx-auto" />
                            </div>
                        ) : (
                            <p className="text-slate-500">Your base video will appear here.</p>
                        )}
                    </div>
                    <div className="bg-slate-800/50 rounded-lg border border-slate-700 min-h-[250px] flex items-center justify-center p-4">
                        {loadingExtension ? <Loader message={loadingMessage} /> : extendedVideoUrl ? (
                            <div className="text-center w-full">
                                <h4 className="font-semibold text-slate-200 mb-2">Extended Video</h4>
                                <video key={extendedVideoUrl} src={extendedVideoUrl} controls autoPlay loop className="max-w-full max-h-[40vh] rounded-lg mx-auto" />
                                <div className="mt-4">
                                    <button
                                        onClick={() => onShare({ contentUrl: extendedVideoUrl, contentText: `${initialPrompt}\n${extensionPrompt}`, contentType: 'video' })}
                                        className="flex items-center justify-center space-x-2 bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-300 mx-auto"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
                                        <span>Share & Promote Final Video</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-slate-500">Your extended video will appear here.</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default VideoEditor;
