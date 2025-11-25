
import React, { useState, useRef } from 'react';
import { analyzeVideo } from '../../services/geminiService';
import Loader from '../common/Loader';
import { Remarkable } from 'remarkable';
import { fileToBase64 } from '../../utils';

const md = new Remarkable({ html: true });

interface VideoOverviewProps {
    onShare: (options: { contentText: string; contentType: 'text' }) => void;
}

const VideoOverview: React.FC<VideoOverviewProps> = ({ onShare }) => {
    const [file, setFile] = useState<File | null>(null);
    const [videoPreview, setVideoPreview] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            // Limit file size for client-side processing (approx 20MB)
            if (selectedFile.size > 20 * 1024 * 1024) {
                setError("File too large. Please select a video under 20MB for inline analysis.");
                return;
            }
            setFile(selectedFile);
            setVideoPreview(URL.createObjectURL(selectedFile));
            setError(null);
            setResult(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setError('Please upload a video file.');
            return;
        }
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const base64 = await fileToBase64(file);
            const userPrompt = prompt.trim() || "Provide a detailed overview of this video, including key events and visual details.";
            
            const response = await analyzeVideo(userPrompt, base64, file.type);
            setResult(response.text);
        } catch (err: any) {
            setError('Failed to analyze video. Please try again. ' + (err.message || ''));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-1/3 space-y-6">
                <form onSubmit={handleSubmit} className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-4">
                    <h3 className="text-xl font-bold text-white mb-4">Video Analysis</h3>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Upload Video (Max 20MB)</label>
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="video/*"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-900 file:text-cyan-400 hover:file:bg-cyan-800 cursor-pointer"
                        />
                    </div>

                    {videoPreview && (
                        <div className="rounded-lg overflow-hidden bg-black">
                            <video src={videoPreview} controls className="w-full max-h-48 object-contain" />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Prompt (Optional)</label>
                        <textarea
                            rows={3}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 transition resize-none"
                            placeholder="e.g., Summarize the main points, or Describe the setting."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !file}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center space-x-2"
                    >
                        {loading ? <Loader /> : 'Analyze Video'}
                    </button>
                    {error && <p className="text-red-400 text-sm mt-2 text-center bg-red-900/20 p-2 rounded">{error}</p>}
                </form>
            </div>

            <div className="w-full lg:w-2/3 bg-slate-900/50 rounded-2xl border border-slate-800 p-6 flex flex-col min-h-[400px]">
                <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-4">
                    <h3 className="text-xl font-bold text-white">Analysis Result</h3>
                    {result && (
                        <button
                            onClick={() => onShare({ contentText: result, contentType: 'text' })}
                            className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
                            <span>Share</span>
                        </button>
                    )}
                </div>

                {loading && (
                    <div className="flex-grow flex flex-col items-center justify-center">
                        <Loader message="Analyzing video content..." />
                    </div>
                )}

                {!loading && !result && (
                    <div className="flex-grow flex flex-col items-center justify-center text-slate-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 opacity-30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <p>Upload a video to see the AI analysis here.</p>
                    </div>
                )}

                {result && (
                    <div className="prose prose-invert max-w-none flex-grow overflow-y-auto custom-scrollbar">
                        <div dangerouslySetInnerHTML={{ __html: md.render(result) }} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoOverview;
