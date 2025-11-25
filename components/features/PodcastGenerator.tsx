


import React, { useState, useEffect, useRef } from 'react';
import { generatePodcastScript, generateMultiSpeakerSpeech } from '../../services/geminiService';
import Loader from '../common/Loader';
import { pcmToWav, decode } from '../../utils';

interface PodcastGeneratorProps {
    onShare: (options: { contentUrl: string; contentText: string; contentType: 'audio' }) => void;
}

interface ScriptLine {
    speaker: string;
    text: string;
}

const PodcastGenerator: React.FC<PodcastGeneratorProps> = ({ onShare }) => {
    const [sourceText, setSourceText] = useState('');
    const [script, setScript] = useState<ScriptLine[]>([]);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [loadingStep, setLoadingStep] = useState<'' | 'script' | 'audio'>('');
    const [error, setError] = useState<string | null>(null);

    const audioRef = useRef<HTMLAudioElement>(null);

    // Cleanup audio URL
    useEffect(() => {
        return () => {
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
    }, [audioUrl]);

    const handleGenerateScript = async () => {
        if (!sourceText.trim()) {
            setError('Please enter a topic or source text.');
            return;
        }
        setLoadingStep('script');
        setError(null);
        setScript([]);
        setAudioUrl(null);

        try {
            const response = await generatePodcastScript(sourceText);
            const parsedScript = JSON.parse(response.text);
            if (Array.isArray(parsedScript)) {
                setScript(parsedScript);
            } else {
                throw new Error("Invalid script format.");
            }
        } catch (err) {
            setError('Failed to generate script. Please try again.');
            console.error(err);
        } finally {
            setLoadingStep('');
        }
    };

    const handleGenerateAudio = async () => {
        if (script.length === 0) return;
        setLoadingStep('audio');
        setError(null);

        try {
            // Convert script lines to speaker objects for the service
            // Map "Alex" to a male-sounding voice (e.g., 'Kore' or 'Fenrir') and "Jamie" to a female-sounding voice (e.g., 'Puck' or 'Zephyr')
            // Let's randomly assign voices or stick to defaults.
            const speakerMap: Record<string, string> = {
                "Alex": "Fenrir",
                "Jamie": "Puck"
            };

            // Construct the full text with speaker prefixes for the multi-speaker model
            const fullText = script.map(line => `${line.speaker}: ${line.text}`).join('\n');
            
            const speakerConfig = [
                { speaker: "Alex", voiceName: speakerMap["Alex"] },
                { speaker: "Jamie", voiceName: speakerMap["Jamie"] }
            ];

            const base64Audio = await generateMultiSpeakerSpeech(fullText, speakerConfig);

            if (base64Audio) {
                const bytes = decode(base64Audio);
                const blob = pcmToWav(bytes, 24000, 1, 16);
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);
            } else {
                throw new Error("Audio generation failed.");
            }
        } catch (err) {
            setError('Failed to generate audio. Please try again.');
            console.error(err);
        } finally {
            setLoadingStep('');
        }
    };

    const handleScriptChange = (index: number, text: string) => {
        const newScript = [...script];
        newScript[index].text = text;
        setScript(newScript);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-1/3 space-y-6">
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-4">
                    <h3 className="text-xl font-bold text-white">Audio Overview</h3>
                    <p className="text-sm text-slate-400">Generate a deep-dive audio conversation between two AI hosts about any topic.</p>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Source Material</label>
                        <textarea 
                            rows={6}
                            value={sourceText}
                            onChange={(e) => setSourceText(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 transition"
                            placeholder="e.g., The history of coffee, or paste an article here..."
                        />
                    </div>
                    
                    <button 
                        onClick={handleGenerateScript} 
                        disabled={loadingStep !== ''}
                        className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 disabled:bg-slate-600 transition flex justify-center items-center space-x-2"
                    >
                        {loadingStep === 'script' ? 'Writing Script...' : 'Generate Script'}
                    </button>
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                </div>
            </div>

            <div className="w-full lg:w-2/3 space-y-6">
                {/* Script Editor / View */}
                {script.length > 0 && (
                    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 space-y-4 max-h-[500px] overflow-y-auto">
                        <h3 className="font-bold text-lg text-white mb-2">Conversation Script</h3>
                        <div className="space-y-4">
                            {script.map((line, idx) => (
                                <div key={idx} className="flex gap-4">
                                    <div className={`w-16 flex-shrink-0 font-bold text-sm pt-2 ${line.speaker === 'Alex' ? 'text-cyan-400' : 'text-purple-400'}`}>
                                        {line.speaker}
                                    </div>
                                    <div className="flex-grow">
                                        <textarea 
                                            value={line.text}
                                            onChange={(e) => handleScriptChange(idx, e.target.value)}
                                            className="w-full bg-transparent border-b border-slate-700 focus:border-slate-500 text-slate-300 p-2 resize-none focus:ring-0"
                                            rows={Math.max(2, Math.ceil(line.text.length / 80))}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Audio Player Section */}
                {script.length > 0 && (
                    <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-700 flex flex-col items-center justify-center min-h-[150px]">
                        {loadingStep === 'audio' ? (
                            <Loader message="Synthesizing voices... This may take a moment." />
                        ) : audioUrl ? (
                            <div className="w-full space-y-4">
                                <audio ref={audioRef} controls src={audioUrl} className="w-full" />
                                <div className="flex justify-center gap-4">
                                    <button onClick={handleGenerateAudio} className="text-sm text-slate-400 hover:text-white underline">Regenerate Audio</button>
                                    <button 
                                        onClick={() => onShare({ contentUrl: audioUrl, contentText: `Audio Overview: ${sourceText}`, contentType: 'audio' })}
                                        className="flex items-center space-x-2 bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition"
                                    >
                                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
                                         <span>Share Overview</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button 
                                onClick={handleGenerateAudio}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full transition shadow-lg flex items-center space-x-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span>Generate Audio Overview</span>
                            </button>
                        )}
                    </div>
                )}

                {!script.length && loadingStep !== 'script' && (
                    <div className="flex items-center justify-center h-full text-slate-500 min-h-[300px] bg-slate-900/30 rounded-xl border border-slate-800 border-dashed">
                        <div className="text-center">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                             <p>Your script and audio will appear here.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PodcastGenerator;
