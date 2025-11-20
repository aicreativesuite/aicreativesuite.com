
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
            stopLoading();

        } catch (err: any) {
            setError("Failed to process video: " + err.message);
            stopLoading();
        }
    };
    
    useEffect(() => {
        const videoToProcess = mode === 'video' ? uploadedVideoUrl : memeVideoUrl;
        if (videoToProcess && memeAudioUrl && uniqueId && loadingStep !== 'processing' && !finalVideoUrl) {
            handleProcessVideo(videoToProcess);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uploadedVideoUrl, memeVideoUrl, memeAudioUrl, uniqueId, mode, finalVideoUrl]);


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
                    // We don't automatically show the dialog here anymore to avoid annoyance.
                    // It will be triggered when the user attempts to generate.
                    setShowApiKeyDialog(false);
                }
            } else {
                setApiKeyReady(true);
                setShowApiKeyDialog(false);
            }
        };
        checkKey();

        return () => {
            if (memeAudioUrl) URL.revokeObjectURL(memeAudioUrl);
            if (memeVideoUrl) URL.revokeObjectURL(memeVideoUrl);
            if (uploadedVideoUrl) URL.revokeObjectURL(uploadedVideoUrl);
            if (finalVideoUrl) URL.revokeObjectURL(finalVideoUrl);
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
        };
    }, [mode, memeAudioUrl, memeVideoUrl, uploadedVideoUrl, finalVideoUrl]);

    const handleSelectKey = async () => {
        // @ts-ignore
        if (window.aistudio) {
            // @ts-ignore
            await window.aistudio.openSelectKey();
            setApiKeyReady(true);
            setShowApiKeyDialog(false);
        }
    };

    // This effect derives the script from the generated concept
    useEffect(() => {
        if (memeConcept) {
            setMemeScript(memeConcept.imageDescription || `${memeConcept.topText}. ${memeConcept.bottomText}`);
            setTopText(memeConcept.topText);
            setBottomText(memeConcept.bottomText);
        }
    }, [memeConcept]);

    const resetState = () => {
        setTopic('');
        setUploadedImageFile(null);
        setUploadedVideoFile(null);
        setMemeConcept(null);
        setTopText('');
        setBottomText('');
        setMemeImage(null);
        setMemeScript('');
        setMemeAudioUrl(null);
        setMemeVideoUrl(null);
        setFinalVideoUrl(null);
        setError(null);
        setLoadingStep('');
        setIsSaved(false);
    };

    const handleModeChange = (newMode: GenerationMode) => {
        resetState();
        setMode(newMode);
    };
    
    const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadedVideoFile(file);
            if(uploadedVideoUrl) URL.revokeObjectURL(uploadedVideoUrl);
            setUploadedVideoUrl(URL.createObjectURL(file));
            setError(null);
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
                    const uri = op.response?.generatedVideos?.[0]?.video?.uri;
                    if (uri) {
                        const response = await fetch(`${uri}&key=${process.env.API_KEY}`);
                        const blob = await response.blob();
                        if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
                        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                        setMemeVideoUrl(URL.createObjectURL(blob));
                        // Let the useEffect trigger processing, don't stop loading here.
                    } else { throw new Error('Video generation finished, but no video was returned.'); }
                }
            } catch (err: any) {
                if(err.message?.includes("Requested entity was not found")) {
                    setError("An API Key error occurred. Please select a valid key and ensure your project has billing enabled.");
                    setApiKeyReady(false);
                    setShowApiKeyDialog(true);
                } else {
                    setError('An error occurred while checking video status.');
                }
                stopLoading();
            }
        }, 10000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // @ts-ignore
        if (mode !== 'video' && !apiKeyReady && typeof window.aistudio !== 'undefined') {
            setShowApiKeyDialog(true);
            return;
        }
        
        resetState();
        setIsSaved(false);

        const newId = Date.now().toString(36) + Math.random().toString(36).substring(2);
        setUniqueId(newId);

        try {
            // Step 1: Generate Concept
            setLoadingStep('concept');
            setLoadingMessage('Thinking of a viral idea...');
            let conceptResponse;
            let currentMemeImage = null;

            if (mode === 'generate') {
                if (!topic) { setError('Please enter a topic.'); stopLoading(); return; }
                conceptResponse = await generateMemeConcept(topic, style);
            } else { // 'upload' or 'video'
                 if (mode === 'video') {
                    if (!uploadedVideoFile || !uploadedVideoUrl) { setError('Please upload a video.'); stopLoading(); return; }
                    currentMemeImage = await new Promise((resolve, reject) => {
                        const video = document.createElement('video');
                        video.src = uploadedVideoUrl;
                        video.onloadeddata = () => {
                            const canvas = document.createElement('canvas');
                            canvas.width = video.videoWidth;
                            canvas.height = video.videoHeight;
                            canvas.getContext('2d')?.drawImage(video, 0, 0);
                            resolve({ base64: canvas.toDataURL('image/jpeg').split(',')[1], mimeType: 'image/jpeg' });
                        };
                        video.onerror = reject;
                    });
                     if (!currentMemeImage) throw new Error("Could not capture video frame.");
                } else { // image upload
                    if (!uploadedImageFile) { setError('Please upload an image.'); stopLoading(); return; }
                    const base64 = await fileToBase64(uploadedImageFile);
                    currentMemeImage = { base64, mimeType: uploadedImageFile.type };
                }
                setMemeImage(currentMemeImage);
                conceptResponse = await generateMemeConceptFromImage(currentMemeImage.base64, currentMemeImage.mimeType, style);
            }
            const concept = JSON.parse(conceptResponse.text);
            setMemeConcept(concept);

            // Step 2: Generate Image (only for 'generate' mode)
            if (mode === 'generate') {
                setLoadingStep('image');
                setLoadingMessage('Creating the perfect image...');
                const imageBytes = await generateImage(concept.imageDescription, '1:1');
                currentMemeImage = { base64: imageBytes, mimeType: 'image/jpeg' };
                setMemeImage(currentMemeImage);
            }

            // Step 3: Generate Audio (common for all modes)
            setLoadingStep('audio');
            setLoadingMessage('Recording the voiceover...');
            const script = concept.imageDescription || `${concept.topText}. ${concept.bottomText}`;
            const audioBase64 = await generateSpeech(script, selectedVoice);
            if (!audioBase64) throw new Error("TTS API did not return audio.");
            const audioBytes = decode(audioBase64);
            const blob = pcmToWav(audioBytes, 24000, 1, 16);
            setMemeAudioUrl(URL.createObjectURL(blob));

            // Step 4: Generate Video (for 'generate' and 'upload' modes)
            if (mode === 'generate' || mode === 'upload') {
                setLoadingStep('video');
                let i = 0;
                setLoadingMessage(VEO_LOADING_MESSAGES[i]);
                messageIntervalRef.current = window.setInterval(() => {
                    i = (i + 1) % VEO_LOADING_MESSAGES.length;
                    setLoadingMessage(VEO_LOADING_MESSAGES[i]);
                }, 3000);
                
                if (!currentMemeImage) throw new Error("Meme image is not available for animation.");

                const videoPrompt = `A short, looping video animating this image. The image shows ${concept.imageDescription}. The character in the image should appear to be speaking or reacting.`;
                const operation = await generateVideoFromImage(videoPrompt, currentMemeImage.base64, currentMemeImage.mimeType, '9:16', false);
                handlePolling(operation);
            } else {
                stopLoading();
            }
        } catch (err: any) {
            if(err.message?.includes("Requested entity was not found")) {
                setError("An API Key error occurred. Please select a valid key and ensure your project has billing enabled.");
                setApiKeyReady(false);
                setShowApiKeyDialog(true);
            } else {
                setError(err.message || 'An error occurred during generation.');
            }
            stopLoading();
        }
    };
    
    const handleSave = () => {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };
    
    const isLoading = loadingStep !== '';

    return (
        <>
            <ApiKeyDialog show={showApiKeyDialog} onSelectKey={handleSelectKey} />
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="w-full lg:w-1/3 space-y-4">
                    <div className="flex bg-slate-800 rounded-lg p-1">
                        <button onClick={() => handleModeChange('generate')} className={`w-1/3 p-2 rounded-md text-sm font-semibold transition ${mode === 'generate' ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>From Topic</button>
                        <button onClick={() => handleModeChange('upload')} className={`w-1/3 p-2 rounded-md text-sm font-semibold transition ${mode === 'upload' ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>From Image</button>
                        <button onClick={() => handleModeChange('video')} className={`w-1/3 p-2 rounded-md text-sm font-semibold transition ${mode === 'video' ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>From Video</button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                        <fieldset disabled={isLoading} className="space-y-6">
                            {mode === 'generate' && (
                                <div>
                                    <label htmlFor="topic" className="block text-sm font-medium text-slate-300 mb-2">Meme Topic</label>
                                    <input id="topic" type="text" value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500" placeholder="e.g., Programmers trying to fix bugs" />
                                </div>
                            )}
                            {mode === 'upload' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Upload Image</label>
                                    <ImageUploader onImageUpload={setUploadedImageFile} onImageClear={() => setUploadedImageFile(null)} />
                                </div>
                            )}
                            {mode === 'video' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Upload Video</label>
                                    <input type="file" accept="video/*" onChange={handleVideoFileChange} className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100" />
                                    {uploadedVideoUrl && <video src={uploadedVideoUrl} controls className="mt-2 rounded-lg w-full max-h-48 object-contain bg-black" />}
                                </div>
                            )}
                            <div>
                                <label htmlFor="style" className="block text-sm font-medium text-slate-300 mb-2">Meme Style</label>
                                <select id="style" value={style} onChange={(e) => setStyle(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white">
                                    {MEME_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <button type="submit" disabled={isLoading} className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20 transition-all">
                                {isLoading ? 'Generating...' : 'Generate Meme'}
                            </button>
                        </fieldset>
                        {error && <p className="text-red-400 text-sm mt-4 text-center bg-red-900/20 p-2 rounded">{error}</p>}
                    </form>
                </div>

                <div className="w-full lg:w-2/3 flex items-center justify-center bg-slate-900/50 rounded-2xl border border-slate-800 min-h-[400px] lg:min-h-0 p-6">
                    {isLoading && <Loader message={loadingMessage} />}
                    
                    {!isLoading && finalVideoUrl && (
                        <div className="w-full max-w-sm mx-auto text-center space-y-4">
                            <div className="relative aspect-[9/16] w-full bg-black rounded-lg overflow-hidden shadow-2xl shadow-cyan-900/20">
                                <video ref={videoRef} src={finalVideoUrl} controls loop playsInline className="w-full h-full object-cover" />
                            </div>
                            <div className="flex space-x-2 justify-center">
                                <a href={finalVideoUrl} download={`viral-meme-${Date.now()}.mp4`} className="flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                    <span>Download</span>
                                </a>
                                <button
                                    onClick={handleSave}
                                    className={`flex items-center justify-center space-x-2 font-bold py-3 px-4 rounded-lg transition-colors duration-300 ${isSaved ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
                                >
                                    {isSaved ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg>
                                    )}
                                    <span>{isSaved ? 'Saved' : 'Save'}</span>
                                </button>
                                <button
                                    onClick={() => onShare({ contentUrl: finalVideoUrl, contentText: memeScript, contentType: 'video' })}
                                    className="flex-1 bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 shadow-lg shadow-purple-500/20 transition-all"
                                >
                                    Share Meme
                                </button>
                            </div>
                        </div>
                    )}

                    {!isLoading && !finalVideoUrl && (
                        <div className="text-center text-slate-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 opacity-30" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM9.5 15.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm5 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm.36-4.13c-.63.85-1.6 1.38-2.73 1.38s-2.1-.53-2.73-1.38C9.37 11.23 9 10.95 9 10.61c0-.51.64-.81.97-.42.33.39.73.71 1.25.89.33.12.71.12.98 0 .52-.18.92-.5 1.25-.89.33-.39.97-.09.97.42-.01.34-.37.62-.64.76z"/></svg>
                            <p className="mt-4">Your viral meme video will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ViralMemeGenerator;
