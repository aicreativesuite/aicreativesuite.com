
import React, { useState, useEffect, useRef } from 'react';
import { generateText, generateImage, generateSpeech, generateVideoFromImage, processVideoOperation } from '../../services/geminiService';
import { COMEDIAN_STYLES, AUDIENCE_TYPES, VEO_LOADING_MESSAGES, TTS_VOICES, AVATAR_EXPRESSIONS } from '../../constants';
import Loader from '../common/Loader';
import ApiKeyDialog from '../common/ApiKeyDialog';
import { pcmToWav, decode } from '../../utils';

interface StandupGeneratorProps {
    onShare: (options: { contentUrl: string; contentText: string; contentType: 'video' }) => void;
}

type LoadingStep = '' | 'joke' | 'avatar' | 'audio' | 'video';

const StandupGenerator: React.FC<StandupGeneratorProps> = ({ onShare }) => {
    // Inputs
    const [topic, setTopic] = useState('');
    const [comedianStyle, setComedianStyle] = useState(COMEDIAN_STYLES[0]);
    const [audienceType, setAudienceType] = useState(AUDIENCE_TYPES[0]);
    const [comedianAppearance, setComedianAppearance] = useState('');
    const [expression, setExpression] = useState(AVATAR_EXPRESSIONS[0]);

    // Outputs
    const [jokeScript, setJokeScript] = useState<string | null>(null);
    const [comedianImage, setComedianImage] = useState<{ base64: string, mimeType: string} | null>(null);
    const [jokeAudioUrl, setJokeAudioUrl] = useState<string | null>(null);
    const [comedianVideoUrl, setComedianVideoUrl] = useState<string | null>(null);

    // State Management
    const [loadingStep, setLoadingStep] = useState<LoadingStep>('');
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [apiKeyReady, setApiKeyReady] = useState(false);
    const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
    
    // Refs
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // @ts-ignore
        if (!apiKeyReady && typeof window.aistudio !== 'undefined') {
            setShowApiKeyDialog(true);
            return;
        }

        if (!topic || !comedianAppearance) {
            setError('Please fill out the topic and comedian appearance.');
            return;
        }
        
        setError(null);
        setJokeScript(null);
        setComedianImage(null);
        setJokeAudioUrl(null);
        setComedianVideoUrl(null);

        try {
            // Step 1: Generate Joke
            setLoadingStep('joke');
            setLoadingMessage('Writing some hilarious jokes...');
            const jokePrompt = `Write a short, viral-style standup comedy routine about "${topic}". The comedian's style is ${comedianStyle}, performing for an audience at a ${audienceType}. The routine should be about 3-5 sentences long.`;
            const jokeResponse = await generateText(jokePrompt, 'gemini-3-pro-preview');
            const script = jokeResponse.text;
            setJokeScript(script);

            // Step 2: Generate Comedian Avatar
            setLoadingStep('avatar');
            setLoadingMessage('Casting the perfect comedian...');
            const avatarPrompt = `A high-quality, photorealistic portrait of a standup comedian on a stage in a ${audienceType}. Their appearance is: "${comedianAppearance}". The comedian has a ${expression} expression and is looking towards the camera.`;
            const imageBytes = await generateImage(avatarPrompt, '1:1');
            setComedianImage({ base64: imageBytes, mimeType: 'image/jpeg' });

            // Step 3: Generate Speech
            setLoadingStep('audio');
            setLoadingMessage('Warming up the vocal cords...');
            const voice = TTS_VOICES[Math.floor(Math.random() * TTS_VOICES.length)];
            const audioBase64 = await generateSpeech(script, voice);
            if (audioBase64) {
                const bytes = decode(audioBase64);
                const blob = pcmToWav(bytes, 24000, 1, 16);
                setJokeAudioUrl(URL.createObjectURL(blob));
            } else {
                throw new Error("TTS API did not return audio.");
            }

            // Step 4: Generate Video
            setLoadingStep('video');
            let msgIdx = 0;
            const msgInterval = setInterval(() => {
                msgIdx = (msgIdx + 1) % VEO_LOADING_MESSAGES.length;
                setLoadingMessage(VEO_LOADING_MESSAGES[msgIdx]);
            }, 3000);
            
            try {
                const videoPrompt = `A medium shot of the standup comedian in the image performing on stage at a ${audienceType}. They are gesturing and moving as if telling a joke. There should be no audible speech.`;
                const operation = await generateVideoFromImage(videoPrompt, imageBytes, 'image/jpeg', '9:16', false);
                
                const blob = await processVideoOperation(operation);
                setComedianVideoUrl(URL.createObjectURL(blob));
            } finally {
                clearInterval(msgInterval);
            }

        } catch (err: any) {
            if (err.message?.includes("Requested entity was not found")) {
                setError("An API Key error occurred. Please select a valid key and ensure your project has billing enabled.");
                setApiKeyReady(false);
                setShowApiKeyDialog(true);
            } else {
                setError(err.message || 'An error occurred during generation.');
            }
            console.error(err);
        } finally {
            setLoadingStep('');
        }
    };
    
    const handlePlay = () => {
        if (videoRef.current && audioRef.current) {
            videoRef.current.currentTime = 0;
            audioRef.current.currentTime = 0;
            videoRef.current.play();
            audioRef.current.play();
        }
    };

    const isLoading = loadingStep !== '';

    return (
        <>
            <ApiKeyDialog show={showApiKeyDialog} onSelectKey={handleSelectKey} />
            <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)] min-h-[600px]">
                {/* Sidebar Controls */}
                <div className="w-full lg:w-80 flex-shrink-0 bg-slate-900/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-800 overflow-y-auto custom-scrollbar">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <fieldset disabled={isLoading} className="space-y-5">
                            <div>
                                <label htmlFor="topic" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Topic</label>
                                <input id="topic" type="text" value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500" placeholder="e.g., Dating Apps" />
                            </div>
                            
                            <div>
                                <label htmlFor="comedianAppearance" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Comedian</label>
                                <textarea id="comedianAppearance" rows={3} value={comedianAppearance} onChange={(e) => setComedianAppearance(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500 resize-none" placeholder="e.g., A woman in her 30s with vibrant pink hair, wearing a leather jacket." />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label htmlFor="comedianStyle" className="block text-xs font-bold text-slate-400 uppercase mb-1">Style</label>
                                    <select id="comedianStyle" value={comedianStyle} onChange={(e) => setComedianStyle(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white">
                                        {COMEDIAN_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="expression" className="block text-xs font-bold text-slate-400 uppercase mb-1">Expression</label>
                                    <select id="expression" value={expression} onChange={(e) => setExpression(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white">
                                        {AVATAR_EXPRESSIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="audienceType" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Venue</label>
                                <select id="audienceType" value={audienceType} onChange={(e) => setAudienceType(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white">
                                    {AUDIENCE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            
                            <button type="submit" className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-bold py-3 rounded-xl transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center">
                                {isLoading ? <Loader /> : 'Create Comedy Set'}
                            </button>
                        </fieldset>
                        {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                    </form>
                </div>

                {/* Main Preview Area */}
                <div className="flex-grow bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col overflow-hidden relative">
                    <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                        <h3 className="font-bold text-white text-sm uppercase tracking-wider">Live Performance</h3>
                        {comedianVideoUrl && (
                            <button
                                onClick={() => onShare({ contentUrl: comedianVideoUrl, contentText: jokeScript || '', contentType: 'video' })}
                                className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded font-bold transition"
                            >
                                Share
                            </button>
                        )}
                    </div>

                    <div className="flex-grow p-8 flex items-center justify-center relative bg-slate-950/30">
                        <div className="absolute inset-0 bg-grid-slate-800/20 pointer-events-none"></div>
                        
                        {isLoading && (
                            <div className="text-center z-10">
                                <Loader message={loadingMessage} />
                                {loadingStep === 'video' && <p className="text-xs text-slate-500 mt-4">Generating video takes about a minute...</p>}
                            </div>
                        )}
                        
                        {!isLoading && comedianVideoUrl && jokeAudioUrl && jokeScript && (
                            <div className="w-full max-w-sm mx-auto text-center space-y-4 relative z-10">
                                <div className="relative aspect-[9/16] w-full bg-black rounded-xl overflow-hidden shadow-2xl shadow-purple-900/30 border border-slate-700">
                                    <video ref={videoRef} src={comedianVideoUrl} muted loop playsInline className="w-full h-full object-cover" />
                                </div>
                                <audio ref={audioRef} src={jokeAudioUrl} controls className="w-full" />
                                
                                <div className="flex gap-2 justify-center">
                                    <button onClick={handlePlay} className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded-lg transition text-xs flex items-center justify-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                                        Sync Play
                                    </button>
                                    <a href={comedianVideoUrl} download={`standup-video-${Date.now()}.mp4`} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 rounded-lg transition text-xs flex items-center justify-center">Download</a>
                                </div>

                                <div className="p-4 bg-slate-800/80 rounded-xl text-left text-xs text-slate-300 max-h-32 overflow-y-auto border border-slate-700/50">
                                    <h4 className="font-bold text-slate-100 mb-2 uppercase tracking-wide">Script</h4>
                                    <p className="whitespace-pre-wrap leading-relaxed">{jokeScript}</p>
                                </div>
                            </div>
                        )}

                        {!isLoading && !comedianVideoUrl && (
                            <div className="text-center text-slate-600 opacity-60">
                                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-20 w-20 mb-4" viewBox="0 0 24 24" fill="currentColor"><path d="M9.5 7.5c1.38 0 2.5 1.12 2.5 2.5S10.88 12.5 9.5 12.5 7 11.38 7 10s1.12-2.5 2.5-2.5m4.5 2.5c1.38 0 2.5-1.12 2.5-2.5S15.38 7.5 14 7.5s-2.5 1.12-2.5 2.5 1.12 2.5 2.5 2.5M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2M12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8m0-4c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5" /></svg>
                                <p className="text-lg">Your AI comedy special will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default StandupGenerator;
