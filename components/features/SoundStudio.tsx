import React, { useState, useRef, useEffect } from 'react';
import { generateSpeech, generateMultiSpeakerSpeech, generateText } from '../../services/geminiService';
import Loader from '../common/Loader';
import { SOUND_EFFECT_CATEGORIES, MUSIC_STYLES, TTS_VOICES } from '../../constants';
import { Remarkable } from 'remarkable';
import { pcmToWav, decode } from '../../utils';

const md = new Remarkable();

type Mode = 'tts' | 'sfx' | 'music';

interface TabProps {
    onShare: (options: any) => void;
}

const TextToSpeechTab: React.FC<TabProps> = ({ onShare }) => {
    const [ttsMode, setTtsMode] = useState<'single' | 'multi'>('single');
    const [text, setText] = useState('');
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Single speaker state
    const [voice, setVoice] = useState(TTS_VOICES[0]);

    // Multi-speaker state
    const [speakers, setSpeakers] = useState([
        { id: 1, name: 'Joe', voice: TTS_VOICES[0] },
        { id: 2, name: 'Jane', voice: TTS_VOICES[1] },
    ]);

    useEffect(() => {
        return () => { if (audioUrl) URL.revokeObjectURL(audioUrl); };
    }, [audioUrl]);
    
    const handleSpeakerChange = (index: number, field: 'name' | 'voice', value: string) => {
        const newSpeakers = [...speakers];
        newSpeakers[index] = { ...newSpeakers[index], [field]: value };
        setSpeakers(newSpeakers);
    };

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
            let base64Audio: string | null = null;
            if (ttsMode === 'single') {
                base64Audio = await generateSpeech(text, voice);
            } else {
                const speakerNames = speakers.map(s => s.name.trim()).filter(Boolean);
                if (speakerNames.length !== 2 || new Set(speakerNames).size !== 2) {
                    setError('Please define two unique speaker names.');
                    setLoading(false);
                    return;
                }
                const speakerRegex = new RegExp(`^(${speakerNames.join('|')}):`, 'gm');
                if (!speakerRegex.test(text)) {
                    setError(`Script lines must start with a defined speaker name followed by a colon (e.g., "${speakers[0].name}: Hello.").`);
                    setLoading(false);
                    return;
                }
                const speakerPayload = speakers.map(s => ({ speaker: s.name, voiceName: s.voice }));
                base64Audio = await generateMultiSpeakerSpeech(text, speakerPayload);
            }

            if (base64Audio) {
                const bytes = decode(base64Audio);
                const blob = pcmToWav(bytes, 24000, 1, 16);
                setAudioUrl(URL.createObjectURL(blob));
            } else {
                throw new Error("API did not return audio data.");
            }
        } catch (err: any) {
            setError(err.message || 'Failed to generate speech.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
             <div className="flex bg-slate-800/50 rounded-lg p-1">
                <button onClick={() => setTtsMode('single')} className={`w-1/2 p-2 rounded-md text-sm font-semibold transition ${ttsMode === 'single' ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>Single Speaker</button>
                <button onClick={() => setTtsMode('multi')} className={`w-1/2 p-2 rounded-md text-sm font-semibold transition ${ttsMode === 'multi' ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>Multi-Speaker</button>
            </div>
            
            <p className="text-sm text-slate-400">
                {ttsMode === 'single' ? 'Generate speech from text using a single voice.' : 'Generate a conversation from a script with two distinct voices.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                {ttsMode === 'multi' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                        {speakers.map((s, index) => (
                            <div key={s.id} className="space-y-2">
                                <label htmlFor={`speaker${index}_name`} className="text-sm font-medium text-slate-300">Speaker {index + 1} Name</label>
                                <input id={`speaker${index}_name`} type="text" value={s.name} onChange={(e) => handleSpeakerChange(index, 'name', e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-white" />
                                <label htmlFor={`speaker${index}_voice`} className="text-sm font-medium text-slate-300">Speaker {index + 1} Voice</label>
                                <select id={`speaker${index}_voice`} value={s.voice} onChange={(e) => handleSpeakerChange(index, 'voice', e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-white">
                                    {TTS_VOICES.map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                            </div>
                        ))}
                    </div>
                )}
                <textarea 
                    rows={5} 
                    value={text} 
                    onChange={(e) => setText(e.target.value)} 
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500" 
                    placeholder={ttsMode === 'single' ? 'Type text here...' : `${speakers[0].name}: Hello, how are you?\n${speakers[1].name}: I'm doing great, thanks!`}
                />
                {ttsMode === 'single' && (
                    <div>
                        <label htmlFor="voice-select" className="block text-sm font-medium text-slate-300 mb-2">Voice</label>
                        <select id="voice-select" value={voice} onChange={(e) => setVoice(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500">
                            {TTS_VOICES.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                    </div>
                )}
                <button type="submit" disabled={loading} className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 disabled:bg-slate-600 transition-colors flex items-center justify-center space-x-2">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>
                     <span>{loading ? 'Generating...' : 'Generate Speech'}</span>
                </button>
                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </form>
            {loading && <Loader />}
            {audioUrl && (
                 <div className="w-full space-y-4 pt-4 border-t border-slate-700">
                    <audio controls src={audioUrl} className="w-full" />
                    <div className="text-center">
                        <button
                            onClick={() => onShare({ contentUrl: audioUrl, contentText: text, contentType: 'audio' })}
                            className="flex items-center justify-center space-x-2 bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-300"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
                            <span>Share & Promote</span>
                        </button>
                    </div>
                 </div>
            )}
        </div>
    );
};

const SfxTab: React.FC<TabProps> = ({ onShare }) => {
    const [prompt, setPrompt] = useState('');
    const [category, setCategory] = useState(SOUND_EFFECT_CATEGORIES[0]);
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);
        try {
            const fullPrompt = `As a professional sound designer, describe the sound of "${prompt}" in the style of the "${category}" category. Provide details on layers, transients, and tail.`;
            const response = await generateText(fullPrompt, 'gemini-2.5-flash');
            setResult(response.text);
        } catch (err) {
            setResult("Error generating description.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <p className="text-sm text-slate-400">Describe a sound effect for a designer to create.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white" placeholder="e.g., A laser blast" />
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white">
                    {SOUND_EFFECT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <button type="submit" disabled={loading} className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 disabled:bg-slate-600">
                    {loading ? 'Generating...' : 'Generate Description'}
                </button>
            </form>
            <div className="min-h-[150px] bg-slate-800 rounded-lg p-4 prose prose-invert max-w-none relative border border-slate-700">
                {loading && <Loader />}
                {result && (
                    <>
                        <div className="absolute top-4 right-4 not-prose">
                             <button
                                onClick={() => onShare({ contentText: result, contentType: 'text' })}
                                className="flex items-center justify-center space-x-2 bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-300"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
                                <span>Share</span>
                            </button>
                        </div>
                        <div dangerouslySetInnerHTML={{ __html: md.render(result) }} />
                    </>
                )}
            </div>
        </div>
    );
};

const MusicTab: React.FC<TabProps> = ({ onShare }) => {
    const [prompt, setPrompt] = useState('');
    const [style, setStyle] = useState(MUSIC_STYLES[0]);
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);
        try {
            const fullPrompt = `Generate musical ideas or lyrics for a song about "${prompt}" in a "${style}" style. Provide chord progression suggestions and instrumentation ideas.`;
            const response = await generateText(fullPrompt, 'gemini-2.5-pro');
            setResult(response.text);
        } catch (err) {
            setResult("Error generating ideas.");
        } finally {
            setLoading(false);
        }
    };

     return (
        <div className="space-y-4">
            <p className="text-sm text-slate-400">Generate musical concepts, lyrics, or instrumentation ideas.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white" placeholder="e.g., A hero's journey" />
                <select value={style} onChange={(e) => setStyle(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white">
                    {MUSIC_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button type="submit" disabled={loading} className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 disabled:bg-slate-600">
                    {loading ? 'Generating...' : 'Generate Idea'}
                </button>
            </form>
            <div className="min-h-[150px] bg-slate-800 rounded-lg p-4 prose prose-invert max-w-none relative border border-slate-700">
                {loading && <Loader />}
                {result && (
                    <>
                         <div className="absolute top-4 right-4 not-prose">
                             <button
                                onClick={() => onShare({ contentText: result, contentType: 'text' })}
                                className="flex items-center justify-center space-x-2 bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-300"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
                                <span>Share</span>
                            </button>
                        </div>
                        <div dangerouslySetInnerHTML={{ __html: md.render(result) }} />
                    </>
                )}
            </div>
        </div>
    );
};


const SoundStudio: React.FC<TabProps> = ({ onShare }) => {
    const [mode, setMode] = useState<Mode>('tts');

    const renderContent = () => {
        switch(mode) {
            case 'tts': return <TextToSpeechTab onShare={onShare} />;
            case 'sfx': return <SfxTab onShare={onShare} />;
            case 'music': return <MusicTab onShare={onShare} />;
            default: return null;
        }
    }

    return (
        <div className="max-w-3xl mx-auto">
             <div className="flex bg-slate-700 rounded-lg p-1 mb-6">
                 <button onClick={() => setMode('tts')} className={`w-1/3 p-2 rounded-md text-sm font-semibold transition ${mode === 'tts' ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:bg-slate-600'}`}>Text-to-Speech</button>
                 <button onClick={() => setMode('sfx')} className={`w-1/3 p-2 rounded-md text-sm font-semibold transition ${mode === 'sfx' ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:bg-slate-600'}`}>Sound Effects</button>
                 <button onClick={() => setMode('music')} className={`w-1/3 p-2 rounded-md text-sm font-semibold transition ${mode === 'music' ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:bg-slate-600'}`}>Music Ideas</button>
             </div>
             {renderContent()}
        </div>
    );
};

export default SoundStudio;