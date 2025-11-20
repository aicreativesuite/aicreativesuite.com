
import React, { useState, useEffect, useRef } from 'react';
import { generateText, generateImage, generateSpeech, generateVideoFromImage, pollVideoOperation } from '../../services/geminiService';
import { COMEDIAN_STYLES, AUDIENCE_TYPES, VEO_LOADING_MESSAGES, TTS_VOICES } from '../../constants';
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
    const pollIntervalRef = useRef<number | null>(null);
    const messageIntervalRef = useRef<number | null>(null);
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

    const stopLoading = () => {
        setLoadingStep('');
        if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
    };

    const cleanupPolling = () => {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };

    const handlePolling = (initialOperation: any) => {
        let op = initialOperation;
        pollIntervalRef.current = window.setInterval(async () => {
            try {
                op = await pollVideoOperation(op);
                if (op.done) {
                    cleanupPolling();
                    const uri = op.response?.generatedVideos?.[0]?.video?.uri;
                    if (uri) {
                        const response = await fetch(`${uri}&key=${process.env.API_KEY}`);
                        const blob = await response.blob();
                        setComedianVideoUrl(URL.createObjectURL(blob));
                        stopLoading();
                    } else {
                        setError('Video generation finished, but no video was returned.');
                        stopLoading();
                    }
                }
            } catch (err: any) {
                if (err.message?.includes("Requested entity was not found")) {
                    setError("An API Key error occurred. Please select a valid key and ensure your project has billing enabled.");
                    setApiKeyReady(false);
                    setShowApiKeyDialog(true);
                } else {
                    setError('An error occurred while checking video status.');
                }
                cleanupPolling();
                stopLoading();
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

        if (!topic || !comedianAppearance) {
            setError('Please fill out the topic and comedian appearance.');
            return;
        }
        
        // Reset previous results
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
            const jokeResponse = await generateText(jokePrompt, 'gemini-2.5-pro');
            const script = jokeResponse.text;
            setJokeScript(script);

            // Step 2: Generate Comedian Avatar
            setLoadingStep('avatar');
            setLoadingMessage('Casting the perfect comedian...');
            const avatarPrompt = `A high-quality, photorealistic portrait of a standup comedian on a stage in a ${audienceType}. Their appearance is: "${comedianAppearance}". The comedian is looking towards the camera.`;
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
            let i = 0;
            setLoadingMessage(VEO_LOADING_MESSAGES[i]);
            messageIntervalRef.current = window.setInterval(() => {
                i = (i + 1) % VEO_LOADING_MESSAGES.length;
                setLoadingMessage(VEO_LOADING_MESSAGES[i]);
            }, 3000);
            const videoPrompt = `A medium shot of the standup comedian in the image performing on stage at a ${audienceType}. They are gesturing and moving as if telling a joke. There should be no audible speech.`;
            const operation = await generateVideoFromImage(videoPrompt, imageBytes, 'image/jpeg', '9:16', false);
            handlePolling(operation);

        } catch (err: any) {
            if (err.message?.includes("Requested entity was not found")) {
                setError("An API Key error occurred. Please select a valid key and ensure your project has billing enabled.");
                setApiKeyReady(false);
                setShowApiKeyDialog(true);
            } else {
                setError(err.message || 'An error occurred during generation.');
            }
            stopLoading();
            console.error(err);
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
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Controls Column */}
                <div className="w-full lg:w-1/3 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-4 bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                        <h3 className="text-xl font-bold text-white mb-4">Comedy Set Setup</h3>
                        <fieldset disabled={isLoading} className="space-y-6">
                            <div>
                                <label htmlFor="topic" className="block text-sm font-medium text-slate-300 mb-2">Topic</label>
                                <input id="topic" type="text" value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white" placeholder="e.g., Dating Apps" />
                            </div>
                            <div>
                                <label htmlFor="comedianStyle" className="block text-sm font-medium text-slate-300 mb-2">Comedian Style</label>
                                <select id="comedianStyle" value={comedianStyle} onChange={(e) => setComedianStyle(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white">
                                    {COMEDIAN_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="audienceType" className="block text-sm font-medium text-slate-300 mb-2">Venue / Audience</label>
                                <select id="audienceType" value={audienceType} onChange={(e) => setAudienceType(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white">
                                    {AUDIENCE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="comedianAppearance" className="block text-sm font-medium text-slate-300 mb-2">Comedian's Appearance</label>
                                <textarea id="comedianAppearance" rows={3} value={comedianAppearance} onChange={(e) => setComedianAppearance(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white" placeholder="e.g., A woman in her 30s with vibrant pink hair, wearing a leather jacket." />
                            </div>
                            <button type="submit" className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-300">
                                {isLoading ? 'Generating...' : 'Generate Comedy Set'}
                            </button>
                        </fieldset>
                        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                    </form>
                </div>

                {/* Output Column */}
                <div className="w-full lg:w-2/3 flex items-center justify-center bg-slate-900/50 rounded-2xl border border-slate-800 min-h-[400px] lg:min-h-0 p-6">
                    {isLoading && <Loader message={loadingMessage} />}
                    
                    {!isLoading && comedianVideoUrl && jokeAudioUrl && jokeScript && (
                        <div className="w-full max-w-sm mx-auto text-center space-y-4">
                            <div className="relative aspect-[9/16] w-full bg-black rounded-lg overflow-hidden shadow-2xl shadow-cyan-900/20">
                                <video ref={videoRef} src={comedianVideoUrl} muted loop playsInline className="w-full h-full object-cover" />
                            </div>
                            <audio ref={audioRef} src={jokeAudioUrl} controls className="w-full" />
                            <div className="p-4 bg-slate-800 rounded-lg text-left text-sm text-slate-300 max-h-40 overflow-y-auto">
                                <h4 className="font-bold text-slate-100 mb-2">Script:</h4>
                                <p className="whitespace-pre-wrap">{jokeScript}</p>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={handlePlay} className="flex-1 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors">Play Set</button>
                                <button
                                    onClick={() => onShare({ contentUrl: comedianVideoUrl, contentText: jokeScript, contentType: 'video' })}
                                    className="flex-1 bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    Share
                                </button>
                            </div>
                        </div>
                    )}

                    {!isLoading && !comedianVideoUrl && (
                        <div className="text-center text-slate-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 opacity-30" viewBox="0 0 24 24" fill="currentColor"><path d="M9.5 7.5c1.38 0 2.5 1.12 2.5 2.5S10.88 12.5 9.5 12.5 7 11.38 7 10s1.12-2.5 2.5-2.5m4.5 2.5c1.38 0 2.5-1.12 2.5-2.5S15.38 7.5 14 7.5s-2.5 1.12-2.5 2.5 1.12 2.5 2.5 2.5M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2M12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8m0-4c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5" /></svg>
                            <p className="mt-4">Your AI comedy special will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default StandupGenerator;
