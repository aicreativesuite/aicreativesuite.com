
import React, { useState, useRef, useEffect } from 'react';
import { generateSpeech } from '../../services/geminiService';
import Loader from '../common/Loader';
import { pcmToWav, decode } from '../../utils';
import { TTS_CATEGORIES } from '../../constants';

interface TextToSpeechProps {
    onShare: (options: { contentUrl: string; contentText: string; contentType: 'audio' }) => void;
}

const TextToSpeech: React.FC<TextToSpeechProps> = ({ onShare }) => {
    const [text, setText] = useState('');
    const [category, setCategory] = useState(TTS_CATEGORIES[0]);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        // Cleanup blob URL on component unmount
        return () => {
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
        };
    }, [audioUrl]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) {
            setError('Please enter some text to generate speech.');
            return;
        }

        setLoading(true);
        setError(null);
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
        }
        setAudioUrl(null);

        try {
            // Prepend instructions based on category
            const enhancedText = `(Style: ${category}) ${text}`;
            const base64Audio = await generateSpeech(enhancedText);
            if (base64Audio) {
                const bytes = decode(base64Audio);
                const blob = pcmToWav(bytes, 24000, 1, 16);
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);
            } else {
                throw new Error("API did not return audio data.");
            }
        } catch (err) {
            setError('Failed to generate speech. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Voice Category</label>
                    <select 
                        value={category} 
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500"
                    >
                        {TTS_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Script</label>
                    <textarea
                        rows={5}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                        placeholder="Type or paste text here..."
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-300 flex items-center justify-center space-x-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                    </svg>
                    <span>{loading ? 'Generating...' : 'Generate Speech'}</span>
                </button>
                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </form>

            <div className="min-h-[100px] flex items-center justify-center">
                {loading && <Loader message="Converting text to speech..." />}
                {audioUrl && (
                    <div className="w-full space-y-4">
                        <audio ref={audioRef} controls src={audioUrl} className="w-full">
                            Your browser does not support the audio element.
                        </audio>
                        <div className="text-center flex gap-3 justify-center">
                             <button
                                onClick={() => onShare({ contentUrl: audioUrl, contentText: text, contentType: 'audio' })}
                                className="flex items-center justify-center space-x-2 bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-300"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                                </svg>
                                <span>Share</span>
                            </button>
                            <a href={audioUrl} download="generated_speech.wav" className="flex items-center justify-center space-x-2 bg-slate-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-600 transition-colors duration-300">
                                <span>Download</span>
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TextToSpeech;
