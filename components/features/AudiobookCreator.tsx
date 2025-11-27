
import React, { useState, useEffect, useRef } from 'react';
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

            // Ensure at least 2 speakers for multi-speaker config, if only 1, duplicate
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
            setStep('mapping'); // Go back
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <h3 className="text-2xl font-bold text-white">Audiobook Creator</h3>
                <div className="flex space-x-2">
                    {['Input', 'Cast', 'Generate', 'Listen'].map((s, i) => {
                        const steps = ['input', 'mapping', 'generating', 'done'];
                        const isActive = steps.indexOf(step) >= i;
                        return (
                            <div key={s} className={`flex items-center ${isActive ? 'text-cyan-400' : 'text-slate-600'}`}>
                                <span className="text-sm font-bold">{i + 1}. {s}</span>
                                {i < 3 && <span className="mx-2">→</span>}
                            </div>
                        );
                    })}
                </div>
            </div>

            {step === 'input' && (
                <div className="space-y-4">
                    <textarea
                        rows={10}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-4 text-white focus:ring-2 focus:ring-cyan-500"
                        placeholder="Paste your story or chapter text here..."
                    />
                    <button onClick={handleAnalyze} disabled={loading} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition">
                        {loading ? <Loader /> : 'Analyze Characters'}
                    </button>
                </div>
            )}

            {step === 'mapping' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {characters.map(char => (
                            <div key={char} className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex items-center justify-between">
                                <span className="font-bold text-white">{char}</span>
                                <select 
                                    value={characterVoices[char]} 
                                    onChange={(e) => setCharacterVoices({...characterVoices, [char]: e.target.value})}
                                    className="bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm"
                                >
                                    {TTS_VOICES.map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                            </div>
                        ))}
                    </div>
                    <button onClick={handleGenerate} disabled={loading} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg transition">
                        {loading ? <Loader /> : 'Generate Audiobook'}
                    </button>
                </div>
            )}

            {step === 'generating' && (
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader message="Synthesizing voices and mixing audio..." />
                </div>
            )}

            {step === 'done' && audioUrl && (
                <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 text-center space-y-6">
                    <div className="text-6xl">🎧</div>
                    <h4 className="text-xl font-bold text-white">Your Audiobook is Ready!</h4>
                    <audio controls src={audioUrl} className="w-full" />
                    <div className="flex justify-center gap-4">
                        <a href={audioUrl} download="audiobook.wav" className="bg-slate-700 text-white px-6 py-2 rounded-lg font-bold hover:bg-slate-600">Download</a>
                        <button onClick={() => onShare({ contentText: "Check out my AI Audiobook!", contentType: 'audio' })} className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-500">Share</button>
                        <button onClick={() => setStep('input')} className="bg-slate-800 text-slate-400 px-6 py-2 rounded-lg font-bold hover:text-white">Create New</button>
                    </div>
                </div>
            )}
            
            {error && <div className="bg-red-900/30 border border-red-500 text-red-200 p-4 rounded-lg text-center">{error}</div>}
        </div>
    );
};

export default AudiobookCreator;
