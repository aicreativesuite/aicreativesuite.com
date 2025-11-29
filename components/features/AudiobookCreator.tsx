
import React, { useState, useEffect } from 'react';
import { generateAudiobookScript, generateMultiSpeakerSpeech } from '../../services/geminiService';
import { TTS_VOICES } from '../../constants';
import Loader from '../common/Loader';
import { pcmToWav, decode } from '../../utils';

interface AudiobookCreatorProps {
    onShare: (options: { contentText: string; contentType: 'audio' }) => void;
}

interface ScriptLine {
    speaker: string;
    text: string;
}

const AudiobookCreator: React.FC<AudiobookCreatorProps> = ({ onShare }) => {
    const [text, setText] = useState('');
    const [script, setScript] = useState<ScriptLine[]>([]);
    const [characters, setCharacters] = useState<string[]>([]);
    const [characterVoices, setCharacterVoices] = useState<Record<string, string>>({});
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<'input' | 'mapping' | 'generating' | 'done'>('input');

    useEffect(() => {
        return () => { if (audioUrl) URL.revokeObjectURL(audioUrl); };
    }, [audioUrl]);

    const handleAnalyze = async () => {
        if (!text.trim()) {
            setError('Please enter text to analyze.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await generateAudiobookScript(text);
            const parsedScript: ScriptLine[] = JSON.parse(response.text);
            setScript(parsedScript);
            
            const chars = Array.from(new Set(parsedScript.map(s => s.speaker)));
            setCharacters(chars);
            
            // Assign default voices
            const voiceMap: Record<string, string> = {};
            chars.forEach((char, index) => {
                voiceMap[char] = TTS_VOICES[index % TTS_VOICES.length];
            });
            setCharacterVoices(voiceMap);
            setStep('mapping');
        } catch (err) {
            setError('Failed to analyze text. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        setStep('generating');
        try {
            const fullText = script.map(line => `${line.speaker}: ${line.text}`).join('\n');
            const speakerConfig = characters.map(char => ({
                speaker: char,
                voiceName: characterVoices[char]
            }));

            if (speakerConfig.length === 1) {
                speakerConfig.push({ speaker: 'Narrator', voiceName: TTS_VOICES[0] });
            }

            const base64Audio = await generateMultiSpeakerSpeech(fullText, speakerConfig);
            if (base64Audio) {
                const bytes = decode(base64Audio);
                const blob = pcmToWav(bytes, 24000, 1, 16);
                setAudioUrl(URL.createObjectURL(blob));
                setStep('done');
            } else {
                throw new Error("Failed to generate audio.");
            }
        } catch (err) {
            setError('Failed to generate audiobook.');
            console.error(err);
            setStep('mapping'); 
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)] min-h-[600px]">
            {/* Sidebar Controls */}
            <div className="w-full lg:w-80 flex-shrink-0 bg-slate-900/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-800 overflow-y-auto custom-scrollbar">
                
                {/* Steps Indicator */}
                <div className="flex justify-between mb-6 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    {['Input', 'Cast', 'Audio'].map((s, i) => {
                        const stepIdx = ['input', 'mapping', 'done'].indexOf(step === 'generating' ? 'mapping' : step);
                        return <span key={s} className={stepIdx >= i ? 'text-cyan-400' : ''}>{i+1}. {s}</span>
                    })}
                </div>

                {step === 'input' && (
                    <div className="space-y-4 animate-fadeIn">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Story Text</label>
                            <textarea
                                rows={15}
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500 resize-none"
                                placeholder="Paste story chapter..."
                            />
                        </div>
                        <button onClick={handleAnalyze} disabled={loading} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl transition shadow-lg disabled:opacity-50 flex justify-center">
                            {loading ? <Loader /> : 'Analyze Characters'}
                        </button>
                    </div>
                )}

                {(step === 'mapping' || step === 'generating') && (
                    <div className="space-y-4 animate-fadeIn">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Cast Voices</h4>
                        <div className="space-y-2">
                            {characters.map(char => (
                                <div key={char} className="bg-slate-950 border border-slate-700 rounded-lg p-2 flex flex-col">
                                    <span className="text-xs font-bold text-white mb-1">{char}</span>
                                    <select 
                                        value={characterVoices[char]} 
                                        onChange={(e) => setCharacterVoices({...characterVoices, [char]: e.target.value})}
                                        className="bg-slate-800 border border-slate-600 rounded p-1 text-white text-xs"
                                    >
                                        {TTS_VOICES.map(v => <option key={v} value={v}>{v}</option>)}
                                    </select>
                                </div>
                            ))}
                        </div>
                        <button onClick={handleGenerate} disabled={loading} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition shadow-lg disabled:opacity-50 flex justify-center">
                            {loading ? <Loader /> : 'Generate Audiobook'}
                        </button>
                    </div>
                )}

                {step === 'done' && (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="bg-green-900/20 border border-green-500/50 p-4 rounded-lg text-center">
                            <p className="text-green-400 font-bold text-sm">Generation Complete!</p>
                        </div>
                        <button onClick={() => { setStep('input'); setAudioUrl(null); }} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition">
                            Create New
                        </button>
                    </div>
                )}
                
                {error && <p className="text-red-400 text-xs text-center bg-red-900/20 p-2 rounded">{error}</p>}
            </div>

            {/* Main Preview Area */}
            <div className="flex-grow bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col overflow-hidden relative">
                <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                    <h3 className="font-bold text-white text-sm uppercase tracking-wider">Studio Player</h3>
                    {audioUrl && (
                        <button onClick={() => onShare({ contentText: "My AI Audiobook", contentType: 'audio' })} className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded font-bold transition">Share</button>
                    )}
                </div>

                <div className="flex-grow p-8 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-grid-slate-800/20 pointer-events-none"></div>
                    
                    {step === 'generating' && (
                        <div className="text-center z-10">
                            <Loader message="Synthesizing multi-voice audio..." />
                        </div>
                    )}

                    {!loading && !audioUrl && (
                        <div className="text-center text-slate-600 opacity-60 z-10">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                            <p className="text-lg">Paste text to create an audiobook.</p>
                        </div>
                    )}

                    {audioUrl && (
                        <div className="w-full max-w-md p-8 bg-slate-900 rounded-xl border border-slate-700 shadow-2xl z-10 text-center space-y-6">
                            <div className="w-24 h-24 bg-slate-800 rounded-full mx-auto flex items-center justify-center shadow-lg border border-slate-600">
                                <span className="text-4xl">🎧</span>
                            </div>
                            <audio controls src={audioUrl} className="w-full" />
                            <div className="flex gap-2 justify-center">
                                <a href={audioUrl} download="audiobook.wav" className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition">Download WAV</a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AudiobookCreator;
