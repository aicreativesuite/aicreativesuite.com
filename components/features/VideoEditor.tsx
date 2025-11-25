
import React, { useState, useEffect, useRef } from 'react';
import { generateVideoFromPrompt, extendVideo, pollVideoOperation } from '../../services/geminiService';
import { VIDEO_ASPECT_RATIOS, VEO_LOADING_MESSAGES, VIDEO_EXTENSION_SUGGESTIONS } from '../../constants';
import Loader from '../common/Loader';
import ApiKeyDialog from '../common/ApiKeyDialog';

interface VideoEditorProps {
    onShare: (options: { contentUrl: string; contentText: string; contentType: 'video' }) => void;
}

const VideoEditor: React.FC<VideoEditorProps> = ({ onShare }) => {
    // Mode State
    const [activeMode, setActiveMode] = useState<'create' | 'extend'>('create');

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
                    setActiveMode('extend'); // Auto-switch to extend mode
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
        setActiveMode('create');
    };

    return (
        <>
            <ApiKeyDialog show={showApiKeyDialog} onSelectKey={handleSelectKey} />
            
            <div className="flex flex-col xl:flex-row gap-6 h-[calc(100vh-140px)] min-h-[600px]">
                {/* Controls Column - Fixed width on desktop for better space utilization */}
                <div className="w-full xl:w-80 flex-shrink-0 flex flex-col gap-4">
                    <div className="bg-slate-900/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-800 flex flex-col h-full overflow-y-auto custom-scrollbar shadow-xl">
                         <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                Video Studio
                            </h3>
                             {(initialVideoUrl || loadingInitial) && (
                                <button onClick={handleReset} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 px-2 rounded transition" title="Reset Project">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
                                </button>
                            )}
                        </div>

                        {/* Stepper / Tabs */}
                        <div className="flex flex-col gap-3 mb-6">
                             <button 
                                onClick={() => setActiveMode('create')}
                                className={`text-left px-4 py-3 rounded-xl border transition-all duration-200 flex items-center justify-between group ${activeMode === 'create' ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400 shadow-lg shadow-cyan-900/20' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                            >
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-70 block mb-0.5">Step 1</span>
                                    <span className="font-bold text-sm">Create Base Video</span>
                                </div>
                                {initialVideoUrl && <div className="bg-green-500/20 text-green-400 p-1 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></div>}
                            </button>
                            
                             <button 
                                onClick={() => setActiveMode('extend')}
                                className={`text-left px-4 py-3 rounded-xl border transition-all duration-200 flex items-center justify-between group ${activeMode === 'extend' ? 'bg-purple-500/10 border-purple-500/50 text-purple-400 shadow-lg shadow-purple-900/20' : 'bg-slate-800/50 border-slate-700 text-slate-400'} hover:bg-slate-800 hover:text-slate-200`}
                            >
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-70 block mb-0.5">Step 2</span>
                                    <span className="font-bold text-sm">Extend Video (+7s)</span>
                                </div>
                            </button>
                        </div>

                        {/* Active Form Area */}
                        <div className="flex-grow">
                            {activeMode === 'create' ? (
                                <form onSubmit={handleInitialSubmit} className="space-y-5 animate-fadeIn">
                                     {/* Aspect Ratio Selection */}
                                     <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Aspect Ratio</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {VIDEO_ASPECT_RATIOS.map((ratio) => (
                                                <button
                                                    key={ratio}
                                                    type="button"
                                                    onClick={() => setAspectRatio(ratio as '16:9' | '9:16')}
                                                    className={`py-3 px-2 rounded-lg border text-xs font-medium transition flex flex-col items-center justify-center gap-2 ${aspectRatio === ratio ? 'bg-cyan-600 text-white border-cyan-500' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                                                >
                                                     {ratio === '16:9' ? (
                                                        <div className="w-8 h-5 border-2 border-current rounded-sm opacity-80"></div>
                                                    ) : (
                                                        <div className="w-5 h-8 border-2 border-current rounded-sm opacity-80"></div>
                                                    )}
                                                    {ratio === '16:9' ? 'Landscape' : 'Portrait'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Prompt Input */}
                                    <div>
                                        <label htmlFor="init-prompt" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Prompt</label>
                                        <textarea
                                            id="init-prompt"
                                            rows={6}
                                            value={initialPrompt}
                                            onChange={(e) => setInitialPrompt(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500 placeholder-slate-600 resize-none"
                                            placeholder="Describe your video in detail..."
                                        />
                                    </div>
                                   
                                    <button type="submit" disabled={loadingInitial} className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-900/20 flex items-center justify-center gap-2">
                                        {loadingInitial ? <Loader /> : (initialVideoUrl ? 'Regenerate Base' : 'Create Base Video')}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleExtensionSubmit} className="space-y-5 animate-fadeIn">
                                     {/* Quick Actions */}
                                     <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Quick Actions</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {VIDEO_EXTENSION_SUGGESTIONS.map(suggestion => (
                                                <button
                                                    key={suggestion}
                                                    type="button"
                                                    onClick={() => setExtensionPrompt(suggestion)}
                                                    className={`py-2 px-3 rounded-lg border text-xs font-medium transition text-center ${extensionPrompt === suggestion ? 'bg-purple-600 text-white border-purple-500' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}`}
                                                >
                                                    {suggestion}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                     {/* Prompt Input */}
                                     <div>
                                        <label htmlFor="ext-prompt" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Custom Instruction</label>
                                        <textarea
                                            id="ext-prompt"
                                            rows={4}
                                            value={extensionPrompt}
                                            onChange={(e) => setExtensionPrompt(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-sm focus:ring-2 focus:ring-purple-500 placeholder-slate-600 resize-none"
                                            placeholder="e.g., A dragon flies into view..."
                                        />
                                    </div>

                                    <button type="submit" disabled={loadingExtension} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-4 rounded-xl hover:from-purple-500 hover:to-pink-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2">
                                        {loadingExtension ? <Loader /> : 'Extend Video'}
                                    </button>
                                </form>
                            )}
                        </div>

                         {error && <div className="mt-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-xs">{error}</div>}
                    </div>
                </div>

                {/* Preview Column - Takes remaining space */}
                <div className="flex-grow flex flex-col gap-4 min-h-0">
                    <div className="flex-grow bg-slate-900/50 rounded-2xl border border-slate-800 p-4 overflow-hidden flex flex-col relative">
                         {/* Empty State or Split View */}
                         {(!initialVideoUrl && !loadingInitial) ? (
                             <div className="flex-grow flex flex-col items-center justify-center text-slate-600 opacity-50">
                                 <div className="w-24 h-24 rounded-full bg-slate-800 mb-4 flex items-center justify-center">
                                     <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                 </div>
                                 <p className="text-lg font-medium">Start by creating a base video</p>
                             </div>
                         ) : (
                             <div className={`grid gap-4 h-full min-h-0 ${extendedVideoUrl || loadingExtension ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
                                 
                                 {/* Base Video - Only show if we don't have an extension yet OR if we are on large screens */}
                                 <div className="flex flex-col h-full bg-slate-950/50 rounded-xl border border-slate-800 overflow-hidden">
                                     <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                                         <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Base Clip</span>
                                         {loadingInitial && <span className="text-xs text-cyan-400 animate-pulse">Generating...</span>}
                                     </div>
                                     <div className="flex-grow flex items-center justify-center p-4 relative">
                                         {loadingInitial ? (
                                             <div className="text-center">
                                                 <Loader />
                                                 <p className="text-xs text-slate-400 mt-4">{loadingMessage}</p>
                                             </div>
                                         ) : initialVideoUrl ? (
                                             <video src={initialVideoUrl} controls className="max-h-full w-auto max-w-full rounded-lg shadow-lg" />
                                         ) : null}
                                     </div>
                                 </div>

                                 {/* Extended Video - Show if it exists or is loading, or if we are in extend mode to show placeholder */}
                                 {(extendedVideoUrl || loadingExtension || activeMode === 'extend') && (
                                     <div className="flex flex-col h-full bg-slate-950/50 rounded-xl border border-slate-800 overflow-hidden relative">
                                          <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                                             <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Extended Sequence</span>
                                             {loadingExtension && <span className="text-xs text-purple-400 animate-pulse">Extending...</span>}
                                         </div>
                                         <div className="flex-grow flex items-center justify-center p-4">
                                              {loadingExtension ? (
                                                  <div className="text-center">
                                                     <Loader />
                                                     <p className="text-xs text-slate-400 mt-4">{loadingMessage}</p>
                                                 </div>
                                              ) : extendedVideoUrl ? (
                                                 <video src={extendedVideoUrl} controls autoPlay loop className="max-h-full w-auto max-w-full rounded-lg shadow-lg" />
                                              ) : (
                                                  <div className="text-center text-slate-700">
                                                      <p className="text-sm">Extended result will appear here</p>
                                                  </div>
                                              )}
                                         </div>
                                         {extendedVideoUrl && (
                                             <div className="p-3 border-t border-slate-800 bg-slate-900 flex justify-center">
                                                 <button onClick={() => onShare({ contentUrl: extendedVideoUrl, contentText: 'My extended video', contentType: 'video' })} className="text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 py-2 px-6 rounded-lg transition shadow-lg shadow-purple-900/20">
                                                     Share Final Video
                                                 </button>
                                             </div>
                                         )}
                                     </div>
                                 )}
                             </div>
                         )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default VideoEditor;
