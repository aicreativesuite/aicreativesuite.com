
import React, { useState, useRef, useEffect } from 'react';
import { generateSpeech, generateMultiSpeakerSpeech, generateText, generatePodcastScript } from '../../services/geminiService';
import Loader from '../common/Loader';
import { SOUND_EFFECT_CATEGORIES, MUSIC_STYLES, TTS_VOICES } from '../../constants';
import { Remarkable } from 'remarkable';
import { pcmToWav, decode, fileToBase64 } from '../../utils';
import AudioUploader from '../common/AudioUploader';

const md = new Remarkable();

type Mode = 'speech' | 'sfx' | 'music';
type SpeechMode = 'single' | 'podcast';

interface TabProps {
    onShare: (options: any) => void;
}

interface ScriptLine {
    speaker: string;
    text: string;
}

const SpeechStudio: React.FC<TabProps> = ({ onShare }) => {
    const [speechMode, setSpeechMode] = useState<SpeechMode>('single');
    const [text, setText] = useState('');
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Single speaker state
    const [voice, setVoice] = useState(TTS_VOICES[0]);
    
    // Podcast state
    const [sourceText, setSourceText] = useState('');
    const [podcastScript, setPodcastScript] = useState<ScriptLine[]>([]);
    const [generatingScript, setGeneratingScript] = useState(false);
    
    // Shared state
    const [referenceAudioFile, setReferenceAudioFile] = useState<File | null>(null);

    useEffect(() => {
        return () => { if (audioUrl) URL.revokeObjectURL(audioUrl); };
    }, [audioUrl]);

    const handleGenerateScript = async () => {
        if (!sourceText.trim()) {
            setError('Please enter a topic or source text for the podcast.');
            return;
        }
        setGeneratingScript(true);
        setError(null);
        try {
            const response = await generatePodcastScript(sourceText);
            const parsedScript = JSON.parse(response.text);
            if (Array.isArray(parsedScript)) {
                setPodcastScript(parsedScript);
            } else {
                throw new Error("Invalid script format.");
            }
        } catch (err) {
            setError('Failed to generate script. Please try again.');
            console.error(err);
        } finally {
            setGeneratingScript(false);
        }
    };

    const handleScriptChange = (index: number, newText: string) => {
        const updated = [...podcastScript];
        updated[index].text = newText;
        setPodcastScript(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (speechMode === 'single' && !text.trim()) {
            setError('Please enter text to speak.');
            return;
        }
        if (speechMode === 'podcast' && podcastScript.length === 0) {
            setError('Please generate a podcast script first.');
            return;
        }

        setLoading(true);
        setError(null);
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);

        try {
            let base64Audio: string | null = null;
            let referenceAudioBase64: string | undefined = undefined;

            if (referenceAudioFile) {
                referenceAudioBase64 = await fileToBase64(referenceAudioFile);
            }

            if (speechMode === 'single') {
                base64Audio = await generateSpeech(text, voice, referenceAudioBase64);
            } else {
                const fullText = podcastScript.map(line => `${line.speaker}: ${line.text}`).join('\n');
                const speakerConfig = [
                    { speaker: "Alex", voiceName: TTS_VOICES[0] }, // Map to first available
                    { speaker: "Jamie", voiceName: TTS_VOICES[1] } // Map to second available
                ];
                base64Audio = await generateMultiSpeakerSpeech(fullText, speakerConfig, referenceAudioBase64);
            }

            if (base64Audio) {
                const bytes = decode(base64Audio);
                const blob = pcmToWav(bytes, 24000, 1, 16);
                setAudioUrl(URL.createObjectURL(blob));
            } else {
                throw new Error("API did not return audio data.");
            }
        } catch (err: any) {
            setError(err.message || 'Failed to generate audio.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Mode Toggle */}
            <div className="flex bg-slate-800 p-1 rounded-lg mb-6 w-full md:w-auto self-start">
                <button
                    onClick={() => setSpeechMode('single')}
                    className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-bold transition ${speechMode === 'single' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    Single Voice
                </button>
                <button
                    onClick={() => setSpeechMode('podcast')}
                    className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-bold transition ${speechMode === 'podcast' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    Podcast / Overview
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Configuration Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-5 bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                        {speechMode === 'single' ? (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Voice</label>
                                    <select value={voice} onChange={(e) => setVoice(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500">
                                        {TTS_VOICES.map(v => <option key={v} value={v}>{v}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Input Text</label>
                                    <textarea 
                                        rows={6} 
                                        value={text} 
                                        onChange={(e) => setText(e.target.value)} 
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 resize-none" 
                                        placeholder="Type text to convert to speech..."
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Podcast Topic / Source</label>
                                    <textarea 
                                        rows={6}
                                        value={sourceText}
                                        onChange={(e) => setSourceText(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 resize-none"
                                        placeholder="Paste an article or describe a topic..."
                                    />
                                </div>
                                <button 
                                    type="button" 
                                    onClick={handleGenerateScript}
                                    disabled={generatingScript}
                                    className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-lg transition disabled:opacity-50"
                                >
                                    {generatingScript ? 'Writing Script...' : 'Generate Script'}
                                </button>
                            </>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">User Reference Audio (Optional)</label>
                            <AudioUploader 
                                onAudioUpload={setReferenceAudioFile} 
                                onAudioClear={() => setReferenceAudioFile(null)} 
                            />
                            <p className="text-[10px] text-slate-500 mt-1">Upload a voice sample to guide style (if supported).</p>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 rounded-xl shadow-lg transition disabled:opacity-50 flex justify-center items-center space-x-2"
                        >
                            {loading ? (
                                <Loader />
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" /></svg>
                                    <span>Generate Audio</span>
                                </>
                            )}
                        </button>
                        {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                    </form>
                </div>

                {/* Output / Script Panel */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Audio Player */}
                    <div className={`bg-slate-900/50 p-6 rounded-xl border border-slate-800 flex flex-col items-center justify-center transition-all ${audioUrl ? 'min-h-[150px]' : 'min-h-[100px] opacity-60'}`}>
                        {audioUrl ? (
                            <div className="w-full space-y-4 animate-fadeIn">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-white">Generated Audio</h3>
                                    <button 
                                        onClick={() => onShare({ contentUrl: audioUrl, contentText: speechMode === 'single' ? text : "Podcast Audio", contentType: 'audio' })}
                                        className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded font-bold transition"
                                    >
                                        Share
                                    </button>
                                </div>
                                <audio controls src={audioUrl} className="w-full" />
                            </div>
                        ) : (
                            <div className="text-center text-slate-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                                <p>Audio output will appear here.</p>
                            </div>
                        )}
                    </div>

                    {/* Script Editor (Podcast Mode Only) */}
                    {speechMode === 'podcast' && podcastScript.length > 0 && (
                        <div className="bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden flex flex-col max-h-[500px]">
                            <div className="p-4 bg-slate-900 border-b border-slate-800">
                                <h3 className="font-bold text-white">Podcast Script</h3>
                            </div>
                            <div className="flex-grow overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                {podcastScript.map((line, idx) => (
                                    <div key={idx} className="flex gap-4 group">
                                        <div className={`w-16 flex-shrink-0 font-bold text-xs pt-3 text-right uppercase tracking-wider ${line.speaker === 'Alex' ? 'text-cyan-400' : 'text-purple-400'}`}>
                                            {line.speaker}
                                        </div>
                                        <div className="flex-grow">
                                            <textarea 
                                                value={line.text}
                                                onChange={(e) => handleScriptChange(idx, e.target.value)}
                                                className="w-full bg-slate-800/50 border border-transparent focus:border-slate-600 rounded p-3 text-slate-300 text-sm resize-none focus:ring-0 transition"
                                                rows={Math.max(2, Math.ceil(line.text.length / 80))}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-slate-900/50 p-6 rounded-xl border border-slate-800 h-fit">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Description</label>
                        <input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500" placeholder="e.g., A laser blast" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Category</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500">
                            {SOUND_EFFECT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl transition shadow-lg disabled:opacity-50">
                        {loading ? 'Generating...' : 'Generate SFX Idea'}
                    </button>
                </form>
            </div>
            <div className="lg:col-span-2 bg-slate-900/50 p-6 rounded-xl border border-slate-800 min-h-[300px]">
                {loading && <Loader />}
                {!loading && !result && <div className="h-full flex items-center justify-center text-slate-500">SFX description will appear here.</div>}
                {result && (
                    <div className="relative">
                         <div className="absolute top-0 right-0">
                             <button
                                onClick={() => onShare({ contentText: result, contentType: 'text' })}
                                className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded font-bold transition"
                            >
                                Share
                            </button>
                        </div>
                        <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: md.render(result) }} />
                    </div>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-slate-900/50 p-6 rounded-xl border border-slate-800 h-fit">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Concept</label>
                        <input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500" placeholder="e.g., Epic hero's journey" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Style</label>
                        <select value={style} onChange={(e) => setStyle(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500">
                            {MUSIC_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl transition shadow-lg disabled:opacity-50">
                        {loading ? 'Composing...' : 'Generate Music Idea'}
                    </button>
                </form>
            </div>
            <div className="lg:col-span-2 bg-slate-900/50 p-6 rounded-xl border border-slate-800 min-h-[300px]">
                {loading && <Loader />}
                {!loading && !result && <div className="h-full flex items-center justify-center text-slate-500">Musical concepts will appear here.</div>}
                {result && (
                    <div className="relative">
                         <div className="absolute top-0 right-0">
                             <button
                                onClick={() => onShare({ contentText: result, contentType: 'text' })}
                                className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded font-bold transition"
                            >
                                Share
                            </button>
                        </div>
                        <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: md.render(result) }} />
                    </div>
                )}
            </div>
        </div>
    );
};


const SoundStudio: React.FC<TabProps> = ({ onShare }) => {
    const [activeTab, setActiveTab] = useState<Mode>('speech');

    return (
        <div className="max-w-6xl mx-auto space-y-8 h-full">
             <div className="flex justify-center border-b border-slate-800 pb-1">
                 <div className="flex space-x-8">
                    <button 
                        onClick={() => setActiveTab('speech')} 
                        className={`pb-3 text-sm font-bold uppercase tracking-wider border-b-2 transition ${activeTab === 'speech' ? 'text-cyan-400 border-cyan-400' : 'text-slate-500 border-transparent hover:text-white'}`}
                    >
                        Speech & Podcast
                    </button>
                    <button 
                        onClick={() => setActiveTab('sfx')} 
                        className={`pb-3 text-sm font-bold uppercase tracking-wider border-b-2 transition ${activeTab === 'sfx' ? 'text-cyan-400 border-cyan-400' : 'text-slate-500 border-transparent hover:text-white'}`}
                    >
                        Sound Effects
                    </button>
                    <button 
                        onClick={() => setActiveTab('music')} 
                        className={`pb-3 text-sm font-bold uppercase tracking-wider border-b-2 transition ${activeTab === 'music' ? 'text-cyan-400 border-cyan-400' : 'text-slate-500 border-transparent hover:text-white'}`}
                    >
                        Music Ideas
                    </button>
                 </div>
             </div>
             
             <div className="animate-fadeIn">
                {activeTab === 'speech' && <SpeechStudio onShare={onShare} />}
                {activeTab === 'sfx' && <SfxTab onShare={onShare} />}
                {activeTab === 'music' && <MusicTab onShare={onShare} />}
             </div>
        </div>
    );
};

export default SoundStudio;
