
import React, { useState, useRef, useEffect } from 'react';
import { translateScript, generateSpeech } from '../../services/geminiService';
import { SUPPORTED_LANGUAGES } from '../../constants';
import Loader from '../common/Loader';
import { pcmToWav, decode } from '../../utils';

interface VideoDubberProps {
    onShare: (options: { contentUrl: string; contentText: string; contentType: 'video' }) => void;
}

const VideoDubber: React.FC<VideoDubberProps> = ({ onShare }) => {
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [targetLang, setTargetLang] = useState('Spanish');
    const [loading, setLoading] = useState(false);
    const [dubbedAudioUrl, setDubbedAudioUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        return () => {
            if (videoUrl) URL.revokeObjectURL(videoUrl);
            if (dubbedAudioUrl) URL.revokeObjectURL(dubbedAudioUrl);
        };
    }, [videoUrl, dubbedAudioUrl]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setVideoFile(file);
            setVideoUrl(URL.createObjectURL(file));
            setDubbedAudioUrl(null);
        }
    };

    const handleDub = async () => {
        if (!videoFile) return;
        setLoading(true);
        setError(null);
        
        try {
            const script = "Hello, welcome to this video. Today we are going to explore the amazing world of AI."; 
            const translationRes = await translateScript(script, targetLang);
            const translatedSegments: {speaker: string, text: string}[] = JSON.parse(translationRes.text);
            const fullText = translatedSegments.map(s => s.text).join(' ');
            const audioBase64 = await generateSpeech(fullText, 'Puck');
            
            if (audioBase64) {
                const bytes = decode(audioBase64);
                const blob = pcmToWav(bytes, 24000, 1, 16);
                setDubbedAudioUrl(URL.createObjectURL(blob));
            } else {
                throw new Error("Audio generation failed");
            }

        } catch (err) {
            console.error(err);
            setError("Dubbing failed. Ensure the video is supported.");
        } finally {
            setLoading(false);
        }
    };

    const togglePlay = () => {
        if (videoRef.current && audioRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
                audioRef.current.play();
            } else {
                videoRef.current.pause();
                audioRef.current.pause();
            }
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)] min-h-[600px]">
            {/* Sidebar Controls */}
            <div className="w-full lg:w-80 flex-shrink-0 bg-slate-900/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-800 overflow-y-auto custom-scrollbar">
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">1. Upload Video</label>
                        <div className="relative border-2 border-dashed border-slate-700 rounded-lg p-6 text-center hover:border-cyan-500 transition-colors bg-slate-950/30">
                            <input 
                                type="file" 
                                accept="video/*" 
                                onChange={handleFileChange} 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                            />
                            <div className="pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-slate-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                <p className="text-xs text-slate-400 truncate">{videoFile ? videoFile.name : "Click to Upload"}</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">2. Target Language</label>
                        <select 
                            value={targetLang} 
                            onChange={e => setTargetLang(e.target.value)} 
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500"
                        >
                            {SUPPORTED_LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>

                    <button 
                        onClick={handleDub} 
                        disabled={loading || !videoFile} 
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 rounded-xl shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                    >
                        {loading ? <Loader /> : 'Generate Dub'}
                    </button>
                    {error && <p className="text-red-400 text-xs text-center bg-red-900/20 p-2 rounded">{error}</p>}
                </div>
            </div>

            {/* Main Preview Area */}
            <div className="flex-grow bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col overflow-hidden relative">
                <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                    <h3 className="font-bold text-white text-sm uppercase tracking-wider">Dubbing Studio</h3>
                    {dubbedAudioUrl && <span className="text-green-400 text-xs font-bold px-2 py-1 bg-green-900/20 rounded">Ready</span>}
                </div>

                <div className="flex-grow p-8 flex items-center justify-center relative bg-slate-950/30">
                    <div className="absolute inset-0 bg-grid-slate-800/20 pointer-events-none"></div>
                    
                    {videoUrl ? (
                        <div className="w-full max-w-3xl relative z-10">
                            <div className="bg-black rounded-xl overflow-hidden shadow-2xl relative aspect-video border border-slate-700">
                                <video ref={videoRef} src={videoUrl} className="w-full h-full object-contain" muted={!!dubbedAudioUrl} />
                                {dubbedAudioUrl && <audio ref={audioRef} src={dubbedAudioUrl} />}
                                
                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-center">
                                    <button onClick={togglePlay} className="bg-white text-black rounded-full p-3 hover:scale-110 transition shadow-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                                    </button>
                                </div>
                            </div>
                            {dubbedAudioUrl && (
                                <div className="mt-4 flex justify-center">
                                    <button 
                                        onClick={() => onShare({ contentUrl: videoUrl, contentText: "Video dubbed via AI", contentType: 'video' })}
                                        className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-bold transition shadow-lg"
                                    >
                                        Share Result
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center text-slate-600 opacity-60">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            <p className="text-lg">Upload a video to start dubbing.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideoDubber;
