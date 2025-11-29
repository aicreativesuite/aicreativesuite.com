
import React, { useState, useRef, useEffect } from 'react';
import { generateSpeech } from '../../services/geminiService';
import Loader from '../common/Loader';
import { pcmToWav, decode } from '../../utils';
import { TTS_CATEGORIES, TTS_VOICES } from '../../constants';

interface TextToSpeechProps {
    onShare: (options: { contentUrl: string; contentText: string; contentType: 'audio' }) => void;
}

const TextToSpeech: React.FC<TextToSpeechProps> = ({ onShare }) => {
    const [text, setText] = useState('');
    const [category, setCategory] = useState(TTS_CATEGORIES[0]);
    const [voice, setVoice] = useState(TTS_VOICES[0]);
    const [speed, setSpeed] = useState(1.0);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        return () => { if (audioUrl) URL.revokeObjectURL(audioUrl); };
    }, [audioUrl]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) {
            setError('Please enter some text.');
            return;
        }

        setLoading(true);
        setError(null);
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);

        try {
            // Incorporate speed into the instruction if API doesn't support specific parameter
            // Gemini TTS currently works best with descriptive instructions
            let speedInstruction = "";
            if (speed < 0.8) speedInstruction = "Speak slowly and clearly.";
            else if (speed > 1.2) speedInstruction = "Speak at a fast pace.";
            
            const enhancedText = `(Style: ${category}. ${speedInstruction}) ${text}`;
            const base64Audio = await generateSpeech(enhancedText, voice);
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
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)] min-h-[600px]">
            {/* Sidebar Controls */}
            <div className="w-full lg:w-80 flex-shrink-0 bg-slate-900/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-800 overflow-y-auto custom-scrollbar">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Text Input</label>
                        <textarea
                            rows={6}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500 resize-none"
                            placeholder="Type text here..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Style</label>
                            <select 
                                value={category} 
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs"
                            >
                                {TTS_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Voice</label>
                            <select 
                                value={voice} 
                                onChange={(e) => setVoice(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs"
                            >
                                {TTS_VOICES.map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-2 font-bold uppercase tracking-wider">
                            <label>Speaking Rate</label>
                            <span>{speed}x</span>
                        </div>
                        <input 
                            type="range" 
                            min="0.5" 
                            max="2.0" 
                            step="0.1" 
                            value={speed} 
                            onChange={(e) => setSpeed(parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                            <span>Slow</span>
                            <span>Normal</span>
                            <span>Fast</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl transition shadow-lg disabled:opacity-50 flex justify-center"
                    >
                        {loading ? <Loader /> : 'Generate Speech'}
                    </button>
                    {error && <p className="text-red-400 text-xs text-center bg-red-900/20 p-2 rounded">{error}</p>}
                </form>
            </div>

            {/* Main Preview Area */}
            <div className="flex-grow bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col overflow-hidden relative">
                <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                    <h3 className="font-bold text-white text-sm uppercase tracking-wider">Audio Player</h3>
                    {audioUrl && (
                        <button onClick={() => onShare({ contentUrl: audioUrl, contentText: text, contentType: 'audio' })} className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded font-bold transition">Share</button>
                    )}
                </div>

                <div className="flex-grow p-8 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-grid-slate-800/20 pointer-events-none"></div>
                    
                    {loading && (
                        <div className="text-center z-10">
                            <Loader message="Synthesizing..." />
                        </div>
                    )}

                    {!loading && !audioUrl && (
                        <div className="text-center text-slate-600 opacity-60 z-10">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                            <p className="text-lg">Enter text to generate speech.</p>
                        </div>
                    )}

                    {audioUrl && (
                        <div className="w-full max-w-md p-8 bg-slate-900 rounded-xl border border-slate-700 shadow-2xl z-10 text-center space-y-6">
                            <div className="w-20 h-20 bg-slate-800 rounded-full mx-auto flex items-center justify-center shadow-lg border border-slate-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" /></svg>
                            </div>
                            <audio ref={audioRef} controls src={audioUrl} className="w-full" />
                            <div className="flex gap-2 justify-center">
                                <a href={audioUrl} download="speech.wav" className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition">Download</a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TextToSpeech;
