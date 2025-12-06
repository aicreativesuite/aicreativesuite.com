
import React, { useState, useEffect, useRef } from 'react';
import { generateText, generateImage, generateSpeech, generateVideoFromImage, processVideoOperation } from '../../services/geminiService';
import { TTS_VOICES, VEO_LOADING_MESSAGES, BACKGROUND_OPTIONS, AVATAR_EXPRESSIONS, SUPPORTED_LANGUAGES } from '../../constants';
import Loader from '../common/Loader';
import ApiKeyDialog from '../common/ApiKeyDialog';
import { pcmToWav, decode } from '../../utils';

interface GlobalAvatarCreatorProps {
    onShare: (options: { contentUrl: string; contentText: string; contentType: 'video' }) => void;
}

const MOVEMENT_OPTIONS = [
    { value: 'minimal', label: 'Minimal (News Anchor)' },
    { value: 'gestures', label: 'Hand Gestures (Presenter)' },
    { value: 'walking', label: 'Walking (Vlog)' },
    { value: 'dynamic', label: 'Dynamic Action' }
];

const LIP_SYNC_OPTIONS = [
    { value: 'standard', label: 'Standard Sync' },
    { value: 'enhanced', label: 'Enhanced (Close-up)' }
];

const GlobalAvatarCreator: React.FC<GlobalAvatarCreatorProps> = ({ onShare }) => {
    // Inputs
    const [avatarDescription, setAvatarDescription] = useState('');
    const [expression, setExpression] = useState(AVATAR_EXPRESSIONS[0]);
    const [script, setScript] = useState('');
    const [targetLanguage, setTargetLanguage] = useState('Spanish');
    const [isCustomLanguage, setIsCustomLanguage] = useState(false);
    const [customLanguage, setCustomLanguage] = useState('');
    const [background, setBackground] = useState(BACKGROUND_OPTIONS[0].value);
    
    // New Features
    const [movementType, setMovementType] = useState('minimal');
    const [lipSyncMode, setLipSyncMode] = useState('standard');
    const [removeWatermark, setRemoveWatermark] = useState(true);
    
    // Bilingual Settings
    const [isBilingual, setIsBilingual] = useState(false);
    const [translatedTextPreview, setTranslatedTextPreview] = useState<string>('');

    // Outputs
    const [avatarImage, setAvatarImage] = useState<{ base64: string, mimeType: string } | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);

    // State Management
    const [loadingStep, setLoadingStep] = useState<'' | 'avatar' | 'translating' | 'audio' | 'video'>('');
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

        return () => {
            if (audioUrl) URL.revokeObjectURL(audioUrl);
            if (videoUrl) URL.revokeObjectURL(videoUrl);
        };
    }, [audioUrl, videoUrl]);

    // Reset translation preview when script or language changes
    useEffect(() => {
        setTranslatedTextPreview('');
    }, [script, targetLanguage, customLanguage]);

    const handleSelectKey = async () => {
        // @ts-ignore
        if (window.aistudio) {
            // @ts-ignore
            await window.aistudio.openSelectKey();
            setApiKeyReady(true);
            setShowApiKeyDialog(false);
        }
    };

    const handleTranslatePreview = async () => {
        if (!script) return;
        
        setLoadingStep('translating');
        setError(null);
        try {
            const effectiveLanguage = isCustomLanguage ? customLanguage : targetLanguage;
            const response = await generateText(
                `Translate the following text into ${effectiveLanguage}. Return ONLY the translated text without quotes or explanations:\n\n${script}`, 
                'gemini-2.5-flash'
            );
            setTranslatedTextPreview(response.text.trim());
        } catch(err) {
            setError('Translation failed. Please try again.');
        } finally {
            setLoadingStep('');
        }
    };

    // Helper to construct prompts for display and usage
    const getGeneratedPrompts = () => {
        let imgPrompt = `A high-quality, photorealistic portrait of ${avatarDescription || 'a character'}`;
        if (expression && expression !== 'neutral') {
            imgPrompt += `, displaying a ${expression} expression`;
        }
        if (background) {
            imgPrompt += `, ${background}`;
        }
        imgPrompt += `, facing the camera, neutral lighting, 8k resolution.`;

        let vidPrompt = `A video of this person speaking naturally.`;
        if (movementType === 'minimal') {
            vidPrompt += ` Minimal head movement, professional posture.`;
        } else if (movementType === 'gestures') {
            vidPrompt += ` Using expressive hand gestures to emphasize speech, upper body movement.`;
        } else if (movementType === 'walking') {
            vidPrompt += ` Walking towards the camera, steady cam, dynamic background.`;
        } else if (movementType === 'dynamic') {
            vidPrompt += ` Energetic body language, moving around the frame.`;
        }

        if (lipSyncMode === 'enhanced') {
            vidPrompt += ` Focus on mouth, precise lip articulation matching speech patterns, high fidelity facial capture.`;
        } else {
            vidPrompt += ` Realistic facial expressions matching speech.`;
        }

        if (removeWatermark) {
            vidPrompt += ` Clean footage, no text, no watermarks, high production value.`;
        }

        vidPrompt += ` Looking directly at the camera. High quality, 8k.`;

        return { imgPrompt, vidPrompt };
    };

    const { imgPrompt: finalImagePrompt, vidPrompt: finalVideoPrompt } = getGeneratedPrompts();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // @ts-ignore
        if (!apiKeyReady && typeof window.aistudio !== 'undefined') {
            setShowApiKeyDialog(true);
            return;
        }

        if (!avatarDescription || !script) {
            setError('Please provide both an avatar description and a script.');
            return;
        }

        setError(null);
        setAvatarImage(null);
        setAudioUrl(null);
        setVideoUrl(null);

        try {
            const effectiveLanguage = isCustomLanguage ? customLanguage : targetLanguage;
            let finalScript = script;

            // Prepare the final script based on translation settings
            let translatedText = translatedTextPreview;
            
            // If we haven't translated yet but need to
            if (effectiveLanguage !== 'English' && !translatedText) {
                setLoadingStep('translating');
                setLoadingMessage(`Translating script to ${effectiveLanguage}...`);
                const translationResponse = await generateText(`Translate the following text to ${effectiveLanguage}. Return only the translated text:\n\n${script}`, 'gemini-2.5-flash');
                translatedText = translationResponse.text.trim();
                setTranslatedTextPreview(translatedText);
            }

            if (isBilingual && translatedText) {
                // Combine Original + Pause + Translation
                finalScript = `${script} ... ... ${translatedText}`;
            } else if (translatedText) {
                finalScript = translatedText;
            }

            // Step 1: Generate Avatar
            setLoadingStep('avatar');
            setLoadingMessage('Generating digital human...');
            
            const imageBytes = await generateImage(finalImagePrompt, '9:16');
            setAvatarImage({ base64: imageBytes, mimeType: 'image/jpeg' });

            // Step 2: Generate Audio
            setLoadingStep('audio');
            setLoadingMessage('Generating multilingual voiceover...');
            const voice = TTS_VOICES[Math.floor(Math.random() * TTS_VOICES.length)]; // Pick a random voice
            const audioBase64 = await generateSpeech(finalScript, voice);
            if (!audioBase64) throw new Error("TTS API did not return audio.");
            
            const bytes = decode(audioBase64);
            const blob = pcmToWav(bytes, 24000, 1, 16);
            setAudioUrl(URL.createObjectURL(blob));

            // Step 3: Generate Video
            setLoadingStep('video');
            let msgIdx = 0;
            const msgInterval = setInterval(() => {
                msgIdx = (msgIdx + 1) % VEO_LOADING_MESSAGES.length;
                setLoadingMessage(VEO_LOADING_MESSAGES[msgIdx]);
            }, 3000);
            setLoadingMessage(VEO_LOADING_MESSAGES[0]);

            try {
                const operation = await generateVideoFromImage(finalVideoPrompt, imageBytes, 'image/jpeg', '9:16', false);
                const videoBlob = await processVideoOperation(operation);
                setVideoUrl(URL.createObjectURL(videoBlob));
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

    return (
        <>
            <ApiKeyDialog show={showApiKeyDialog} onSelectKey={handleSelectKey} />
            <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-120px)] min-h-[600px]">
                {/* Input Section */}
                <div className="w-full lg:w-1/3 flex flex-col gap-4 h-full overflow-y-auto custom-scrollbar">
                    <form onSubmit={handleSubmit} className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-5">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-1">Global Digital Humans</h3>
                            <p className="text-xs text-slate-400">Create multilingual presenters in over 200+ languages.</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">1. Describe Avatar</label>
                            <textarea 
                                rows={3}
                                value={avatarDescription}
                                onChange={(e) => setAvatarDescription(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500 placeholder-slate-600 resize-none"
                                placeholder="e.g., A professional news anchor, Japanese female, wearing a suit."
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Expression</label>
                                <select
                                    value={expression}
                                    onChange={(e) => setExpression(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:ring-2 focus:ring-cyan-500 transition"
                                >
                                    {AVATAR_EXPRESSIONS.map((exp) => <option key={exp} value={exp}>{exp.charAt(0).toUpperCase() + exp.slice(1)}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Setting</label>
                                <select 
                                    value={background} 
                                    onChange={(e) => setBackground(e.target.value)} 
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:ring-2 focus:ring-cyan-500 transition"
                                >
                                    {BACKGROUND_OPTIONS.map((bg) => <option key={bg.label} value={bg.value}>{bg.label}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* New Controls for Movement, Lip Sync, Watermark */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Movement Style</label>
                                <select 
                                    value={movementType} 
                                    onChange={(e) => setMovementType(e.target.value)} 
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:ring-2 focus:ring-cyan-500 transition"
                                >
                                    {MOVEMENT_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Lip Sync Priority</label>
                                <select 
                                    value={lipSyncMode} 
                                    onChange={(e) => setLipSyncMode(e.target.value)} 
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:ring-2 focus:ring-cyan-500 transition"
                                >
                                    {LIP_SYNC_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input 
                                id="remove-watermark"
                                type="checkbox" 
                                checked={removeWatermark} 
                                onChange={(e) => setRemoveWatermark(e.target.checked)}
                                className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-600 focus:ring-cyan-500"
                            />
                            <label htmlFor="remove-watermark" className="text-sm text-slate-300 cursor-pointer select-none">Remove Watermarks (Clean Output)</label>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">2. Script (Source Language)</label>
                            <textarea 
                                rows={4}
                                value={script}
                                onChange={(e) => setScript(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500 placeholder-slate-600 resize-none"
                                placeholder="Enter the text you want the avatar to speak..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">3. Target Language</label>
                            <div className="flex gap-2">
                                <select 
                                    value={isCustomLanguage ? 'custom' : targetLanguage}
                                    onChange={(e) => {
                                        if (e.target.value === 'custom') {
                                            setIsCustomLanguage(true);
                                        } else {
                                            setIsCustomLanguage(false);
                                            setTargetLanguage(e.target.value);
                                        }
                                    }}
                                    className="flex-grow bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:ring-2 focus:ring-cyan-500 custom-scrollbar"
                                >
                                    {SUPPORTED_LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                                    <option value="custom">Other (Type manually)</option>
                                </select>
                                {isCustomLanguage && (
                                    <input 
                                        type="text"
                                        value={customLanguage}
                                        onChange={(e) => setCustomLanguage(e.target.value)}
                                        placeholder="Language"
                                        className="w-1/3 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-sm"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                            <div className="flex items-center justify-between mb-2">
                                <label className="flex items-center cursor-pointer">
                                    <div className="relative">
                                        <input type="checkbox" checked={isBilingual} onChange={() => setIsBilingual(!isBilingual)} className="sr-only" />
                                        <div className={`block w-10 h-6 rounded-full transition ${isBilingual ? 'bg-cyan-600' : 'bg-slate-600'}`}></div>
                                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${isBilingual ? 'translate-x-4' : ''}`}></div>
                                    </div>
                                    <div className="ml-3 text-sm font-medium text-slate-300">
                                        Bilingual Mode
                                        <p className="text-[10px] text-slate-500 font-normal">Speak Original + Translation</p>
                                    </div>
                                </label>
                                <button 
                                    type="button"
                                    onClick={handleTranslatePreview}
                                    disabled={loadingStep !== '' || !script}
                                    className="text-xs bg-slate-700 hover:bg-slate-600 text-cyan-400 px-2 py-1 rounded transition disabled:opacity-50"
                                >
                                    Translate Preview
                                </button>
                            </div>
                            
                            {translatedTextPreview && (
                                <div className="mt-2 p-2 bg-slate-900 rounded border border-slate-700/50">
                                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Translation ({isCustomLanguage ? customLanguage : targetLanguage}):</p>
                                    <textarea 
                                        value={translatedTextPreview} 
                                        onChange={(e) => setTranslatedTextPreview(e.target.value)}
                                        className="w-full bg-transparent border-none text-white text-sm p-0 focus:ring-0 resize-none"
                                        rows={3}
                                    />
                                </div>
                            )}
                        </div>

                        <button 
                            type="submit" 
                            disabled={loadingStep !== ''}
                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold py-3 px-4 rounded-xl hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex justify-center items-center space-x-2"
                        >
                            {loadingStep !== '' ? (
                                <Loader /> 
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.093-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.497-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" /></svg>
                                    <span>Generate Global Human</span>
                                </>
                            )}
                        </button>
                        {error && <p className="text-red-400 text-xs text-center bg-red-900/20 p-2 rounded">{error}</p>}
                    </form>
                </div>

                {/* Preview Section */}
                <div className="w-full lg:w-2/3 bg-slate-900/50 rounded-2xl border border-slate-800 flex items-center justify-center p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid-slate-800/20 [mask-image:linear-gradient(to_bottom,white,transparent)] pointer-events-none"></div>
                    
                    {loadingStep !== '' && (
                        <div className="z-10 text-center">
                            <Loader message={loadingMessage} />
                            {loadingStep === 'video' && <p className="text-xs text-slate-500 mt-4">This step takes about 1-2 minutes. Please wait.</p>}
                        </div>
                    )}

                    {!videoUrl && !loadingStep && (
                        <div className="text-center text-slate-500 opacity-60">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <p className="text-lg">Enter details to generate a multilingual avatar.</p>
                        </div>
                    )}

                    {videoUrl && audioUrl && !loadingStep && (
                        <div className="z-10 w-full max-w-md space-y-4">
                            <div className="relative aspect-[9/16] w-full bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-700">
                                <video ref={videoRef} src={videoUrl} muted loop playsInline className="w-full h-full object-cover" />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                    <p className="text-white text-sm font-medium line-clamp-2 italic">
                                        {isBilingual ? 
                                            `"${script}" → "${translatedTextPreview}"` : 
                                            `"${translatedTextPreview || script}"`
                                        }
                                    </p>
                                </div>
                            </div>
                            
                            <audio ref={audioRef} src={audioUrl} controls className="w-full" />

                            <div className="flex gap-2 justify-center">
                                <button onClick={handlePlay} className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition flex items-center space-x-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                                    <span>Sync & Play</span>
                                </button>
                                <a href={videoUrl} download="avatar_video.mp4" className="bg-slate-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-600 transition">Download</a>
                                <button 
                                    onClick={() => onShare({ contentUrl: videoUrl, contentText: translatedTextPreview || script, contentType: 'video' })}
                                    className="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition"
                                >
                                    Share
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default GlobalAvatarCreator;
