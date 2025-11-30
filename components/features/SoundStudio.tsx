
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

const SoundStudio: React.FC<TabProps> = ({ onShare }) => {
    // Top Level Tabs
    const [activeTab, setActiveTab] = useState<Mode>('speech');
    
    // -- SPEECH STATE --
    const [speechMode, setSpeechMode] = useState<SpeechMode>('single');
    const [text, setText] = useState('');
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [voice, setVoice] = useState(TTS_VOICES[0]);
    const [sourceText, setSourceText] = useState('');
    const [podcastScript, setPodcastScript] = useState<ScriptLine[]>([]);
    const [generatingScript, setGeneratingScript] = useState(false);
    const [referenceAudioFile, setReferenceAudioFile] = useState<File | null>(null);

    // -- SFX STATE --
    const [sfxPrompt, setSfxPrompt] = useState('');
    const [sfxCategory, setSfxCategory] = useState(SOUND_EFFECT_CATEGORIES[0]);
    const [sfxResult, setSfxResult] = useState<string | null>(null);

    // -- MUSIC STATE --
    const [musicPrompt, setMusicPrompt] = useState('');
    const [musicStyle, setMusicStyle] = useState(MUSIC_STYLES[0]);
    const [musicResult, setMusicResult] = useState<string | null>(null);

    useEffect(() => {
        return () => { if (audioUrl) URL.revokeObjectURL(audioUrl); };
    }, [audioUrl]);

    // -- SPEECH HANDLERS --
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

    const handleSpeechSubmit = async (e: React.FormEvent) => {
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

    // -- SFX HANDLER --
    const handleSfxSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSfxResult(null);
        try {
            const fullPrompt = `As a professional sound designer, describe the sound of "${sfxPrompt}" in the style of the "${sfxCategory}" category. Provide details on layers, transients, and tail.`;
            const response = await generateText(fullPrompt, 'gemini-2.5-flash');
            setSfxResult(response.text);
        } catch (err) {
            setSfxResult("Error generating description.");
        } finally {
            setLoading(false);
        }
    };

    // -- MUSIC HANDLER --
    const handleMusicSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMusicResult(null);
        try {
            const fullPrompt = `Generate musical ideas or lyrics for a song about "${musicPrompt}" in a "${musicStyle}" style. Provide chord progression suggestions and instrumentation ideas.`;
            const response = await generateText(fullPrompt, 'gemini-3-pro-preview');
            setMusicResult(response.text);
        } catch (err) {
            setMusicResult("Error generating ideas.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)] min-h-[600px]">
            {/* Sidebar Controls */}
            <div className="w-full lg:w-80 flex-shrink-0 bg-slate-900/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-800 overflow-y-auto custom-scrollbar">
                
                {/* Tab Navigation */}
                <div className="flex bg-slate-800 rounded-lg p-1 mb-6">
                    {['speech', 'sfx', 'music'].map(t => (
                        <button
                            key={t}
                            onClick={() => { setActiveTab(t as Mode); setError(null); }}
                            className={`flex-1 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition ${activeTab === t ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {activeTab === 'speech' && (
                    <form onSubmit={handleSpeechSubmit} className="space-y-5 animate-fadeIn">
                        <div className="flex bg-slate-800/50 rounded-lg p-1 mb-4">
                            <button
                                type="button"
                                onClick={() => setSpeechMode('single')}
                                className={`flex-1 py-1.5 rounded-md text-xs font-bold transition ${speechMode === 'single' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                            >
                                Single Voice
                            </button>
                            <button
                                type="button"
                                onClick={() => setSpeechMode('podcast')}
                                className={`flex-1 py-1.5 rounded-md text-xs font-bold transition ${speechMode === 'podcast' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                            >
                                Podcast
                            </button>
                        </div>

                        {speechMode === 'single' ? (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Voice</label>
                                    <select value={voice} onChange={(e) => setVoice(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-xs focus:ring-2 focus:ring-cyan-500">
                                        {TTS_VOICES.map(v => <option key={v} value={v}>{v}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Input Text</label>
                                    <textarea 
                                        rows={6} 
                                        value={text} 
                                        onChange={(e) => setText(e.target.value)} 
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500 resize-none" 
                                        placeholder="Type text to convert to speech..."
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Topic</label>
                                    <textarea 
                                        rows={6}
                                        value={sourceText}
                                        onChange={(e) => setSourceText(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500 resize-none"
                                        placeholder="Describe podcast topic..."
                                    />
                                </div>
                                <button 
                                    type="button" 
                                    onClick={handleGenerateScript}
                                    disabled={generatingScript}
                                    className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-lg transition disabled:opacity-50 text-xs"
                                >
                                    {generatingScript ? 'Writing Script...' : 'Generate Script'}
                                </button>
                            </>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Reference Audio</label>
                            <AudioUploader 
                                onAudioUpload={setReferenceAudioFile} 
                                onAudioClear={() => setReferenceAudioFile(null)} 
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition shadow-lg disabled:opacity-50 flex justify-center items-center gap-2"
                        >
                            {loading ? <Loader /> : 'Generate Audio'}
                        </button>
                    </form>
                )}

                {activeTab === 'sfx' && (
                    <form onSubmit={handleSfxSubmit} className="space-y-5 animate-fadeIn">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Description</label>
                            <input type="text" value={sfxPrompt} onChange={(e) => setSfxPrompt(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500" placeholder="e.g., A laser blast" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Category</label>
                            <select value={sfxCategory} onChange={(e) => setSfxCategory(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-xs focus:ring-2 focus:ring-cyan-500">
                                {SOUND_EFFECT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <button type="submit" disabled={loading} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition shadow-lg disabled:opacity-50 flex justify-center">
                            {loading ? <Loader /> : 'Generate Idea'}
                        </button>
                    </form>
                )}

                {activeTab === 'music' && (
                    <form onSubmit={handleMusicSubmit} className="space-y-5 animate-fadeIn">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Concept</label>
                            <input type="text" value={musicPrompt} onChange={(e) => setMusicPrompt(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500" placeholder="e.g., Epic journey" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Style</label>
                            <select value={musicStyle} onChange={(e) => setMusicStyle(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-xs focus:ring-2 focus:ring-cyan-500">
                                {MUSIC_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <button type="submit" disabled={loading} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition shadow-lg disabled:opacity-50 flex justify-center">
                            {loading ? <Loader /> : 'Compose Idea'}
                        </button>
                    </form>
                )}
                
                {error && <p className="text-red-400 text-xs text-center">{error}</p>}
            </div>

            {/* Output Area */}
            <div className="flex-grow bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col overflow-hidden relative">
                <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                    <h3 className="font-bold text-white text-sm uppercase tracking-wider">Output</h3>
                    {(audioUrl || sfxResult || musicResult) && (
                        <button 
                            onClick={() => onShare({ 
                                contentUrl: audioUrl || undefined, 
                                contentText: sfxResult || musicResult || text, 
                                contentType: audioUrl ? 'audio' : 'text' 
                            })}
                            className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded font-bold transition"
                        >
                            Share
                        </button>
                    )}
                </div>

                <div className="flex-grow p-8 relative overflow-y-auto custom-scrollbar">
                    <div className="absolute inset-0 bg-grid-slate-800/20 pointer-events-none"></div>
                    
                    {loading && (
                        <div className="h-full flex flex-col items-center justify-center">
                            <Loader message="Processing audio request..." />
                        </div>
                    )}

                    {!loading && activeTab === 'speech' && (
                        audioUrl ? (
                            <div className="max-w-md mx-auto space-y-6 relative z-10">
                                <div className="w-24 h-24 bg-slate-800 rounded-full mx-auto flex items-center justify-center shadow-lg border border-slate-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-cyan-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" /></svg>
                                </div>
                                <audio controls src={audioUrl} className="w-full" />
                                {podcastScript.length > 0 && speechMode === 'podcast' && (
                                    <div className="mt-6 bg-slate-800 p-4 rounded-xl border border-slate-700 max-h-60 overflow-y-auto custom-scrollbar">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Script</h4>
                                        {podcastScript.map((line, idx) => (
                                            <div key={idx} className="flex gap-2 mb-2">
                                                <span className={`text-xs font-bold ${line.speaker === 'Alex' ? 'text-cyan-400' : 'text-purple-400'}`}>{line.speaker}:</span>
                                                <input 
                                                    className="bg-transparent border-none text-slate-300 text-xs w-full focus:ring-0 p-0"
                                                    value={line.text}
                                                    onChange={(e) => handleScriptChange(idx, e.target.value)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-60">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                                <p>Configure speech settings to generate audio.</p>
                            </div>
                        )
                    )}

                    {!loading && (activeTab === 'sfx' || activeTab === 'music') && (
                        (sfxResult || musicResult) ? (
                            <div className="relative z-10 bg-white text-slate-900 p-8 rounded-xl shadow-lg prose prose-sm max-w-none">
                                <div dangerouslySetInnerHTML={{ __html: md.render(sfxResult || musicResult || '') }} />
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-60">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                                <p>Describe your audio idea to generate concepts.</p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default SoundStudio;
