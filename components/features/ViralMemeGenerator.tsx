
import React, { useState, useEffect, useRef } from 'react';
import {
    generateMemeConcept,
    generateMemeConceptFromImage,
    generateImage,
    generateSpeech,
    generateVideoFromImage,
    pollVideoOperation
} from '../../services/geminiService';
import { MEME_STYLES, VEO_LOADING_MESSAGES, TTS_VOICES } from '../../constants';
import Loader from '../common/Loader';
import ImageUploader from '../common/ImageUploader';
import { fileToBase64, pcmToWav, decode } from '../../utils';
import QRCode from 'qrcode';
import ApiKeyDialog from '../common/ApiKeyDialog';


interface ViralMemeGeneratorProps {
    onShare: (options: { contentUrl: string; contentText: string; contentType: 'video' }) => void;
}

type LoadingStep = '' | 'concept' | 'image' | 'audio' | 'video' | 'processing';
type GenerationMode = 'generate' | 'upload' | 'video';

const ViralMemeGenerator: React.FC<ViralMemeGeneratorProps> = ({ onShare }) => {
    // Inputs
    const [topic, setTopic] = useState('');
    const [style, setStyle] = useState(MEME_STYLES[0]);
    const [mode, setMode] = useState<GenerationMode>('generate');
    const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
    const [uploadedVideoFile, setUploadedVideoFile] = useState<File | null>(null);
    const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);

    // Outputs & Assets
    const [memeConcept, setMemeConcept] = useState<{ imageDescription: string; topText: string; bottomText: string; } | null>(null);
    const [topText, setTopText] = useState('');
    const [bottomText, setBottomText] = useState('');
    const [memeImage, setMemeImage] = useState<{ base64: string, mimeType: string } | null>(null);
    const [memeScript, setMemeScript] = useState<string>('');
    const [selectedVoice, setSelectedVoice] = useState(TTS_VOICES[0]);
    const [memeAudioUrl, setMemeAudioUrl] = useState<string | null>(null);
    const [memeVideoUrl, setMemeVideoUrl] = useState<string | null>(null);
    const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(null);
    const [uniqueId, setUniqueId] = useState<string | null>(null);

    // State Management
    const [loadingStep, setLoadingStep] = useState<LoadingStep>('');
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [apiKeyReady, setApiKeyReady] = useState(false);
    const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    
    // Refs
    const pollIntervalRef = useRef<number | null>(null);
    const messageIntervalRef = useRef<number | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    
    useEffect(() => {
        return () => {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
            if (memeVideoUrl) URL.revokeObjectURL(memeVideoUrl);
            if (finalVideoUrl) URL.revokeObjectURL(finalVideoUrl);
            if (memeAudioUrl) URL.revokeObjectURL(memeAudioUrl);
        }
    }, [memeVideoUrl, finalVideoUrl, memeAudioUrl]);

    // This function is for client-side video processing
    const handleProcessVideo = async (videoSrcUrl: string) => {
        if (!memeAudioUrl || !uniqueId) return;

        setLoadingStep('processing');
        setLoadingMessage('Adding audio and overlays to video...');

        try {
            const qrUrl = await QRCode.toDataURL(`https://aicreativesuite.dev/verify?id=${uniqueId}`, { errorCorrectionLevel: 'H', margin: 1, width: 128 });
            const qrImage = await new Promise<HTMLImageElement>((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = qrUrl;
            });

            const videoEl = document.createElement('video');
            videoEl.muted = true;
            videoEl.src = videoSrcUrl;
            videoEl.crossOrigin = "anonymous";
            videoEl.loop = true;
            
            const audioEl = document.createElement('audio');
            audioEl.src = memeAudioUrl;

            await Promise.all([
                new Promise<void>(res => videoEl.onloadedmetadata = () => res()),
                new Promise<void>(res => audioEl.onloadedmetadata = () => res())
            ]);

            const canvas = document.createElement('canvas');
            canvas.width = videoEl.videoWidth;
            canvas.height = videoEl.videoHeight;
            const ctx = canvas.getContext('2d', { alpha: false });
            if (!ctx) throw new Error('Could not get canvas context');

            const audioCtx = new AudioContext();
            const sourceNode = audioCtx.createMediaElementSource(audioEl);
            const destNode = audioCtx.createMediaStreamDestination();
            sourceNode.connect(destNode);
            const audioTrack = destNode.stream.getAudioTracks()[0];
            const videoTrack = canvas.captureStream(30).getVideoTracks()[0];

            const combinedStream = new MediaStream([videoTrack, audioTrack]);
            const recorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm' });
            const recordedChunks: Blob[] = [];
            recorder.ondataavailable = e => { if(e.data.size > 0) recordedChunks.push(e.data) };
            
            const recordingPromise = new Promise<void>(resolve => {
                recorder.onstop = () => resolve();
            });
            
            recorder.start();
            videoEl.play();
            audioEl.play();
            
            const drawFrame = () => {
                if (audioEl.paused || audioEl.ended) {
                    if (recorder.state === 'recording') recorder.stop();
                    return;
                }
                ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
                
                const fontSize = Math.max(30, canvas.width / 12);
                ctx.font = `bold ${fontSize}px Impact, sans-serif`;
                ctx.fillStyle = 'white';
                ctx.strokeStyle = 'black';
                ctx.lineWidth = fontSize / 20;
                ctx.textAlign = 'center';

                ctx.strokeText(topText, canvas.width / 2, fontSize * 1.2);
                ctx.fillText(topText, canvas.width / 2, fontSize * 1.2);

                ctx.strokeText(bottomText, canvas.width / 2, canvas.height - (fontSize * 0.5));
                ctx.fillText(bottomText, canvas.width / 2, canvas.height - (fontSize * 0.5));

                const qrSize = Math.max(48, Math.floor(canvas.width * 0.1));
                ctx.drawImage(qrImage, canvas.width - qrSize - 10, canvas.height - qrSize - 10, qrSize, qrSize);
                
                requestAnimationFrame(drawFrame);
            };
            
            drawFrame();
            
            await recordingPromise;
            
            const finalBlob = new Blob(recordedChunks, { type: 'video/webm' });
            setFinalVideoUrl(URL.createObjectURL(finalBlob));
            
        } catch (e: any) {
            setError('Video processing failed: ' + e.message);
        } finally {
            setLoadingStep('');
        }
    };

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
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
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
                        setMemeVideoUrl(URL.createObjectURL(blob));
                    } else {
                        setError('Video generation finished, but no video was returned.');
                    }
                }
            } catch (err: any) {
                stopLoading();
                if (err.message?.includes("Requested entity was not found")) {
                    setError("An API Key error occurred. Please select a valid key and ensure your project has billing enabled.");
                    setApiKeyReady(false);
                    setShowApiKeyDialog(true);
                } else {
                    setError('An error occurred while checking video status.');
                }
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

        if (!topic && mode === 'generate') {
            setError('Please enter a topic.');
            return;
        }

        setError(null);
        setMemeConcept(null);
        setMemeImage(null);
        setMemeAudioUrl(null);
        setMemeVideoUrl(null);
        setFinalVideoUrl(null);
        setUniqueId(Date.now().toString()); // For QR

        try {
            // 1. Concept
            setLoadingStep('concept');
            setLoadingMessage('Brainstorming meme concepts...');
            let conceptResult;
            
            if (mode === 'upload' && uploadedImageFile) {
                const base64 = await fileToBase64(uploadedImageFile);
                const res = await generateMemeConceptFromImage(base64, uploadedImageFile.type, style);
                conceptResult = JSON.parse(res.text);
            } else {
                const res = await generateMemeConcept(topic, style);
                conceptResult = JSON.parse(res.text);
            }
            
            setMemeConcept(conceptResult);
            setTopText(conceptResult.topText);
            setBottomText(conceptResult.bottomText);
            setMemeScript(conceptResult.topText + " " + conceptResult.bottomText); // Simple script

            // 2. Image (if generating)
            let imageBytes = '';
            if (mode === 'generate') {
                setLoadingStep('image');
                setLoadingMessage('Generating meme visual...');
                imageBytes = await generateImage(conceptResult.imageDescription, '9:16');
                setMemeImage({ base64: imageBytes, mimeType: 'image/jpeg' });
            } else if (mode === 'upload' && uploadedImageFile) {
                const base64 = await fileToBase64(uploadedImageFile);
                setMemeImage({ base64, mimeType: uploadedImageFile.type });
                imageBytes = base64; // Need base64 for video gen if used
            }

            // 3. Audio
            setLoadingStep('audio');
            setLoadingMessage('Generating voiceover...');
            const audioBase64 = await generateSpeech(conceptResult.topText + " " + conceptResult.bottomText, selectedVoice);
            if (audioBase64) {
                const bytes = decode(audioBase64);
                const blob = pcmToWav(bytes, 24000, 1, 16);
                const url = URL.createObjectURL(blob);
                setMemeAudioUrl(url);
            }

            // 4. Video (Veo)
            if (mode !== 'video') { // If not using uploaded video
                setLoadingStep('video');
                let i = 0;
                setLoadingMessage(VEO_LOADING_MESSAGES[i]);
                messageIntervalRef.current = window.setInterval(() => {
                    i = (i + 1) % VEO_LOADING_MESSAGES.length;
                    setLoadingMessage(VEO_LOADING_MESSAGES[i]);
                }, 3000);

                // Use image-to-video if we have an image (generated or uploaded)
                if (imageBytes) {
                     const operation = await generateVideoFromImage(
                        `Animate this meme image. ${conceptResult.imageDescription}`, 
                        imageBytes, 
                        'image/jpeg', 
                        '9:16', 
                        false
                    );
                    handlePolling(operation);
                }
            }

        } catch (err: any) {
            stopLoading();
            setError(err.message || 'Generation failed.');
        }
    };

    const handleSave = () => {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    return (
        <>
            <ApiKeyDialog show={showApiKeyDialog} onSelectKey={handleSelectKey} />
            <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)] min-h-[600px]">
                {/* Sidebar */}
                <div className="w-full lg:w-80 flex-shrink-0 bg-slate-900/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-800 overflow-y-auto custom-scrollbar">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Mode Selection */}
                        <div className="flex bg-slate-800 p-1 rounded-lg">
                            <button type="button" onClick={() => setMode('generate')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${mode === 'generate' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}>AI Gen</button>
                            <button type="button" onClick={() => setMode('upload')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${mode === 'upload' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}>Image</button>
                            <button type="button" onClick={() => setMode('video')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${mode === 'video' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}>Video</button>
                        </div>

                        {mode === 'generate' && (
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Topic</label>
                                <textarea value={topic} onChange={e => setTopic(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm" placeholder="e.g. Trying to fix a bug in production..." />
                            </div>
                        )}

                        {(mode === 'upload' || mode === 'video') && (
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Upload {mode === 'upload' ? 'Image' : 'Video'}</label>
                                <ImageUploader 
                                    onImageUpload={(f) => mode === 'upload' ? setUploadedImageFile(f) : setUploadedVideoFile(f)} 
                                    onImageClear={() => mode === 'upload' ? setUploadedImageFile(null) : setUploadedVideoFile(null)} 
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Meme Style</label>
                            <select value={style} onChange={e => setStyle(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white">
                                {MEME_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Voice</label>
                            <select value={selectedVoice} onChange={e => setSelectedVoice(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white">
                                {TTS_VOICES.map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                        </div>

                        <button type="submit" disabled={loadingStep !== ''} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-xl transition shadow-lg disabled:opacity-50 flex justify-center">
                            {loadingStep ? <Loader /> : 'Generate Viral Meme'}
                        </button>
                        {error && <p className="text-red-400 text-xs text-center bg-red-900/20 p-2 rounded">{error}</p>}
                    </form>
                </div>

                {/* Preview */}
                <div className="flex-grow bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col overflow-hidden relative">
                    <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                        <h3 className="font-bold text-white text-sm uppercase tracking-wider">Meme Preview</h3>
                        {(finalVideoUrl || memeVideoUrl) && (
                            <div className="flex gap-2">
                                <a href={finalVideoUrl || memeVideoUrl!} download="viral_meme.mp4" className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 px-3 rounded font-bold transition">Download</a>
                                <button onClick={() => onShare({ contentUrl: finalVideoUrl || memeVideoUrl!, contentText: memeScript, contentType: 'video' })} className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded font-bold transition">Share</button>
                            </div>
                        )}
                    </div>

                    <div className="flex-grow flex items-center justify-center p-6 relative overflow-hidden bg-slate-950/30">
                        <div className="absolute inset-0 bg-grid-slate-800/20 pointer-events-none"></div>
                        
                        {loadingStep && (
                            <div className="text-center z-10">
                                <Loader message={loadingMessage} />
                            </div>
                        )}

                        {!loadingStep && (finalVideoUrl || memeVideoUrl) && (
                            <div className="w-full max-w-sm space-y-4 z-10">
                                <div className="relative aspect-[9/16] bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-700">
                                    <video 
                                        src={finalVideoUrl || memeVideoUrl!} 
                                        className="w-full h-full object-cover" 
                                        controls 
                                        autoPlay 
                                        loop 
                                    />
                                    {(!finalVideoUrl && memeVideoUrl && memeAudioUrl) && (
                                        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                                            <button 
                                                onClick={() => handleProcessVideo(memeVideoUrl!)}
                                                className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-full font-bold text-xs shadow-lg flex items-center gap-2"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                                                Burn In Captions & Audio
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {!loadingStep && !memeVideoUrl && (
                            <div className="text-center text-slate-500 opacity-60">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <p className="text-lg">Generate a meme to see preview.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ViralMemeGenerator;
