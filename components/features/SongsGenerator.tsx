
import React, { useState, useEffect } from 'react';
import { generateSongConcept, generateSpeech } from '../../services/geminiService';
import { MUSIC_GENRES, MUSIC_MOODS } from '../../constants';
import Loader from '../common/Loader';
import { pcmToWav, decode } from '../../utils';

interface SongsGeneratorProps {
    onShare: (options: { contentText: string; contentType: 'text' }) => void;
}

interface SongConcept {
    title: string;
    lyrics: string;
    chordProgression: string;
    arrangementDescription: string;
}

const SongsGenerator: React.FC<SongsGeneratorProps> = ({ onShare }) => {
    // Inputs
    const [genre, setGenre] = useState(MUSIC_GENRES[0]);
    const [mood, setMood] = useState(MUSIC_MOODS[0]);
    const [topic, setTopic] = useState('');

    // Outputs
    const [result, setResult] = useState<SongConcept | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    // State
    const [loading, setLoading] = useState(false);
    const [loadingAudio, setLoadingAudio] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [audioError, setAudioError] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
    }, [audioUrl]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic) {
            setError('Please describe a topic for your song.');
            return;
        }
        setLoading(true);
        setError(null);
        setResult(null);
        setAudioUrl(null);
        setAudioError(null);

        try {
            const response = await generateSongConcept(genre, mood, topic);
            const parsedResult: SongConcept = JSON.parse(response.text);
            setResult(parsedResult);
        } catch (err) {
            setError('Failed to generate song concept. The AI might be having a creative block. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
    const handleGenerateAudio = async () => {
        if (!result?.lyrics) return;

        setLoadingAudio(true);
        setAudioError(null);
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
        
        try {
            // Remove section markers like [Verse 1], [Chorus], etc. for cleaner speech
            const cleanLyrics = result.lyrics.replace(/\[.*?\]\n?/g, '');
            const base64Audio = await generateSpeech(cleanLyrics);

            if (base64Audio) {
                const bytes = decode(base64Audio);
                const blob = pcmToWav(bytes, 24000, 1, 16);
                setAudioUrl(URL.createObjectURL(blob));
            } else {
                throw new Error("TTS API did not return audio data.");
            }
        } catch (err) {
             setAudioError('Failed to generate audio demo.');
             console.error(err);
        } finally {
            setLoadingAudio(false);
        }
    }

    const handleShare = () => {
        if (!result) return;
        const shareText = `
Song Title: ${result.title}
Genre: ${genre}, Mood: ${mood}

[Lyrics]
${result.lyrics}

[Chord Progression]
${result.chordProgression}

[Arrangement Idea]
${result.arrangementDescription}

Generated with AI Creative Suite.
        `.trim();
        onShare({ contentText: shareText, contentType: 'text' });
    }

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)] min-h-[600px]">
            {/* Sidebar Controls */}
            <div className="w-full lg:w-80 flex-shrink-0 bg-slate-900/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-800 overflow-y-auto custom-scrollbar">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="topic" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Topic / Theme</label>
                        <textarea id="topic" rows={4} value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500 placeholder-slate-600 resize-none" placeholder="e.g., A robot falling in love with a star" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label htmlFor="genre" className="block text-xs font-bold text-slate-400 uppercase mb-1">Genre</label>
                            <select id="genre" value={genre} onChange={(e) => setGenre(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white">
                                {MUSIC_GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="mood" className="block text-xs font-bold text-slate-400 uppercase mb-1">Mood</label>
                            <select id="mood" value={mood} onChange={(e) => setMood(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white">
                                {MUSIC_MOODS.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl transition shadow-lg disabled:opacity-50 flex justify-center items-center gap-2">
                         {loading ? <Loader /> : <span>Generate Song</span>}
                    </button>
                    {error && <p className="text-red-400 text-xs text-center bg-red-900/20 p-2 rounded">{error}</p>}
                </form>
            </div>

            {/* Output Area */}
            <div className="flex-grow bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col overflow-hidden relative">
                {/* Header */}
                <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                    <h3 className="font-bold text-white text-sm uppercase tracking-wider">Song Sheet</h3>
                    {result && (
                        <button onClick={handleShare} className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded font-bold transition">
                            Share
                        </button>
                    )}
                </div>

                <div className="flex-grow p-8 relative overflow-y-auto custom-scrollbar">
                    <div className="absolute inset-0 bg-grid-slate-800/20 pointer-events-none"></div>
                    
                    {loading && (
                        <div className="h-full flex flex-col items-center justify-center">
                            <Loader message="Composing your masterpiece..." />
                        </div>
                    )}

                    {!loading && !result && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-60">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                            </svg>
                            <p>Configure and generate to see your song.</p>
                        </div>
                    )}

                    {result && (
                        <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                            <div className="text-center">
                                <h2 className="text-3xl font-bold text-white mb-2">{result.title}</h2>
                                <span className="text-xs text-slate-400 uppercase tracking-widest">{genre} • {mood}</span>
                            </div>
                            
                            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                                <h4 className="text-sm font-bold text-cyan-400 uppercase mb-4 border-b border-slate-700 pb-2">Lyrics</h4>
                                <p className="text-slate-300 whitespace-pre-wrap text-sm leading-relaxed font-serif">{result.lyrics}</p>
                                
                                <div className="mt-6 pt-4 border-t border-slate-700">
                                    <div className="flex items-center justify-between">
                                        <button onClick={handleGenerateAudio} disabled={loadingAudio} className="text-xs font-bold py-2 px-4 rounded-full transition bg-purple-600 hover:bg-purple-500 text-white disabled:bg-slate-700 disabled:cursor-not-allowed flex items-center space-x-2">
                                            <span>{loadingAudio ? 'Generating...' : 'Listen to Lyrics (Demo)'}</span>
                                        </button>
                                    </div>
                                    {loadingAudio && <div className="mt-2"><Loader /></div>}
                                    {audioUrl && <audio src={audioUrl} controls className="w-full mt-4 h-8" />}
                                    {audioError && <p className="text-red-400 text-xs mt-2">{audioError}</p>}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                                    <h4 className="text-xs font-bold text-cyan-400 uppercase mb-3">Chord Progression</h4>
                                    <p className="text-slate-300 whitespace-pre-wrap text-sm font-mono">{result.chordProgression}</p>
                                </div>
                                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                                    <h4 className="text-xs font-bold text-cyan-400 uppercase mb-3">Arrangement Idea</h4>
                                    <p className="text-slate-300 whitespace-pre-wrap text-sm">{result.arrangementDescription}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SongsGenerator;
