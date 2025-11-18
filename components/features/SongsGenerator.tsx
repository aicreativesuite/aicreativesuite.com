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
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Controls */}
            <div className="w-full lg:w-1/3 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4 bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                    <h3 className="text-xl font-bold text-white mb-4">Song Concept</h3>
                    <fieldset disabled={loading} className="space-y-4">
                        <div>
                            <label htmlFor="topic" className="block text-sm font-medium text-slate-300 mb-2">Topic / Theme</label>
                            <textarea id="topic" rows={3} value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white" placeholder="e.g., A robot falling in love with a star" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="genre" className="block text-sm font-medium text-slate-300 mb-2">Genre</label>
                                <select id="genre" value={genre} onChange={(e) => setGenre(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white">
                                    {MUSIC_GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="mood" className="block text-sm font-medium text-slate-300 mb-2">Mood</label>
                                <select id="mood" value={mood} onChange={(e) => setMood(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white">
                                    {MUSIC_MOODS.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-300 flex items-center justify-center space-x-2">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55c-2.21 0-4 1.79-4 4s1.79 4 4 4s4-1.79 4-4V7h4V3h-6z" /></svg>
                            <span>{loading ? 'Writing Song...' : 'Generate Song'}</span>
                        </button>
                        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                    </fieldset>
                </form>
            </div>

            {/* Results */}
            <div className="w-full lg:w-2/3 flex flex-col bg-slate-800/50 rounded-lg border border-slate-700 min-h-[400px]">
                <div className="flex-shrink-0 p-4 border-b border-slate-700 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-white">Your Song</h3>
                     {result && (
                        <button onClick={handleShare} className="flex items-center space-x-2 bg-purple-600 text-white font-bold py-2 px-3 rounded-lg hover:bg-purple-700 transition-colors duration-300 text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
                            <span>Share</span>
                        </button>
                     )}
                </div>
                <div className="flex-grow p-6 overflow-y-auto">
                    {loading && <Loader message="Composing your masterpiece..." />}
                    {!loading && !result && <div className="flex items-center justify-center h-full"><p className="text-slate-500">Your song will appear here.</p></div>}
                    {result && (
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold text-white text-center">{result.title}</h2>
                            
                            <div className="bg-slate-900/50 p-4 rounded-lg">
                                <h4 className="font-bold text-cyan-400 mb-2">Lyrics</h4>
                                <p className="text-slate-300 whitespace-pre-wrap text-sm leading-relaxed">{result.lyrics}</p>
                                <div className="mt-4">
                                    <button onClick={handleGenerateAudio} disabled={loadingAudio} className="text-xs font-semibold py-1 px-3 rounded-full transition bg-purple-600 hover:bg-purple-700 text-white disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center space-x-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>
                                        <span>{loadingAudio ? 'Generating...' : 'Generate Audio Demo'}</span>
                                    </button>
                                    {loadingAudio && <Loader />}
                                    {audioUrl && <audio src={audioUrl} controls className="w-full mt-3 h-8" />}
                                    {audioError && <p className="text-red-400 text-xs mt-2">{audioError}</p>}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-slate-900/50 p-4 rounded-lg">
                                    <h4 className="font-bold text-cyan-400 mb-2">Chord Progression</h4>
                                    <p className="text-slate-300 whitespace-pre-wrap text-sm">{result.chordProgression}</p>
                                </div>
                                <div className="bg-slate-900/50 p-4 rounded-lg">
                                    <h4 className="font-bold text-cyan-400 mb-2">Arrangement Idea</h4>
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