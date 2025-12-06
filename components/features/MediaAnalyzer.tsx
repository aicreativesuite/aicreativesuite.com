
import React, { useState, useRef } from 'react';
import { analyzeImage, analyzeVideoFrame, transcribeAudio } from '../../services/geminiService';
import { fileToBase64 } from '../../utils';
import Loader from '../common/Loader';
import { GenerateContentResponse } from '@google/genai';
import { Remarkable } from 'remarkable';

const md = new Remarkable({ html: false });

type Mode = 'image' | 'video' | 'audio';

interface MediaAnalyzerProps {
    onShare: (options: { contentText: string; contentType: 'text' }) => void;
}

const MediaAnalyzer: React.FC<MediaAnalyzerProps> = ({ onShare }) => {
    const [mode, setMode] = useState<Mode>('image');
    const [prompt, setPrompt] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [response, setResponse] = useState<GenerateContentResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetState = () => {
        setPrompt('');
        setFile(null);
        setPreview(null);
        setResponse(null);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleModeChange = (newMode: Mode) => {
        setMode(newMode);
        resetState();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        
        if (selectedFile.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(selectedFile);
        } else if (selectedFile.type.startsWith('video/')) {
            const videoUrl = URL.createObjectURL(selectedFile);
            setPreview(videoUrl);
        } else if (selectedFile.type.startsWith('audio/')) {
             const audioUrl = URL.createObjectURL(selectedFile);
            setPreview(audioUrl);
        }
    };
    
    const captureVideoFrame = (): Promise<{ base64: string, mimeType: string }> => {
        return new Promise((resolve, reject) => {
            if (!preview || mode !== 'video') return reject(new Error("No video preview available"));
            
            const video = document.createElement('video');
            const canvas = document.createElement('canvas');
            video.src = preview;
            video.onloadeddata = () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas.getContext('2d')?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                const dataUrl = canvas.toDataURL('image/jpeg');
                const base64 = dataUrl.split(',')[1];
                resolve({ base64, mimeType: 'image/jpeg' });
            };
            video.onerror = reject;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || (mode !== 'audio' && !prompt)) {
            setError(`Please upload a${mode === 'audio' ? 'n audio file' : ' file and enter a prompt'}.`);
            return;
        }

        setLoading(true);
        setError(null);
        setResponse(null);
        
        try {
            let result: GenerateContentResponse;
            if (mode === 'image') {
                const base64 = await fileToBase64(file);
                result = await analyzeImage(prompt, base64, file.type);
            } else if (mode === 'video') {
                const { base64, mimeType } = await captureVideoFrame();
                result = await analyzeVideoFrame(prompt, base64, mimeType);
            } else { // audio
                 const base64 = await fileToBase64(file);
                 result = await transcribeAudio(base64, file.type);
            }
            setResponse(result);
        } catch (err) {
            setError(`Failed to analyze ${mode}. Please try again.`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getAcceptType = () => {
        if (mode === 'image') return 'image/*';
        if (mode === 'video') return 'video/*';
        return 'audio/*';
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)] min-h-[600px]">
            {/* Sidebar Controls */}
            <div className="w-full lg:w-80 flex-shrink-0 bg-slate-900/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-800 overflow-y-auto custom-scrollbar">
                
                {/* Mode Selector */}
                <div className="flex gap-2 mb-6">
                    {(['image', 'video', 'audio'] as Mode[]).map((m) => (
                        <button
                            key={m}
                            onClick={() => handleModeChange(m)}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${mode === m ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                        >
                            {m}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Upload {mode}</label>
                        <div className="w-full relative border-2 border-dashed border-slate-700 rounded-lg p-6 text-center hover:border-cyan-500 transition-colors duration-300 bg-slate-950/30">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept={getAcceptType()}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="flex flex-col items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <p className="text-xs text-slate-400">
                                    {file ? <span className="text-green-400 font-semibold">{file.name}</span> : <span>Click to upload or drag & drop</span>}
                                </p>
                            </div>
                        </div>
                    </div>

                    {mode !== 'audio' && (
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Prompt</label>
                            <textarea
                                rows={4}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500 placeholder-slate-600 resize-none"
                                placeholder={mode === 'image' ? "What's in this image?" : "What's happening in this video?"}
                            />
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition shadow-lg disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                        {loading ? <Loader /> : <span>Analyze {mode.charAt(0).toUpperCase() + mode.slice(1)}</span>}
                    </button>
                    
                    {error && <p className="text-red-400 text-xs text-center bg-red-900/20 p-2 rounded">{error}</p>}
                </form>
            </div>

            {/* Main Preview/Output Area */}
            <div className="flex-grow bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col overflow-hidden relative">
                {/* Header */}
                <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                    <h3 className="font-bold text-white text-sm uppercase tracking-wider">Analysis Result</h3>
                    {response && (
                        <button 
                            onClick={() => onShare({ contentText: response.text, contentType: 'text' })} 
                            className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded font-bold transition flex items-center gap-1"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
                            Share
                        </button>
                    )}
                </div>

                <div className="flex-grow overflow-y-auto p-8 relative custom-scrollbar">
                    <div className="absolute inset-0 bg-grid-slate-800/20 pointer-events-none"></div>
                    
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 z-20 backdrop-blur-sm">
                            <Loader message={`Analyzing ${mode}...`} />
                        </div>
                    )}

                    {!preview && !loading && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-60">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p>Upload media to get started.</p>
                        </div>
                    )}

                    {preview && (
                        <div className="flex flex-col gap-6 relative z-10 max-w-4xl mx-auto">
                            {/* Media Preview */}
                            <div className="w-full bg-black/40 rounded-xl overflow-hidden border border-slate-700 shadow-lg flex items-center justify-center max-h-[400px]">
                                {mode === 'image' && <img src={preview} alt="Preview" className="max-h-[400px] w-auto object-contain" />}
                                {mode === 'video' && <video src={preview} controls className="max-h-[400px] w-auto" />}
                                {mode === 'audio' && (
                                    <div className="p-8 w-full flex flex-col items-center">
                                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <audio src={preview} controls className="w-full max-w-md" />
                                    </div>
                                )}
                            </div>

                            {/* Analysis Result */}
                            {response && (
                                <div className="bg-white text-slate-900 p-8 rounded-xl shadow-lg prose prose-sm max-w-none">
                                    <div dangerouslySetInnerHTML={{ __html: md.render(response.text) }} />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MediaAnalyzer;
