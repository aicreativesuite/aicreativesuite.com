
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { encode, decode } from '../../utils';

// --- Audio Helper Functions ---
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

interface VoiceChatProps {
    onShare: (options: { contentText: string; contentType: 'text' }) => void;
}

// --- Module-level variables for session persistence ---
let nextStartTime = 0;
const sources = new Set<AudioBufferSourceNode>();

// --- Component ---
const VoiceChat: React.FC<VoiceChatProps> = ({ onShare }) => {
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [status, setStatus] = useState('Ready to connect');
    const [transcripts, setTranscripts] = useState<{user: string, model: string}[]>([]);
    const [currentInterim, setCurrentInterim] = useState('');
    
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const streamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

    const currentInputTranscription = useRef('');
    const currentOutputTranscription = useRef('');

    const stopSession = useCallback(() => {
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session.close());
            sessionPromiseRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (streamSourceRef.current) {
            streamSourceRef.current.disconnect();
            streamSourceRef.current = null;
        }
        if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
            inputAudioContextRef.current.close();
            inputAudioContextRef.current = null;
        }
        if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
            outputAudioContextRef.current.close();
            outputAudioContextRef.current = null;
        }
        
        for (const source of sources.values()) {
            source.stop();
        }
        sources.clear();
        nextStartTime = 0;

        setIsSessionActive(false);
        setStatus('Session ended');
    }, []);

    const startSession = useCallback(async () => {
        setIsSessionActive(true);
        setStatus('Requesting permissions...');
        setTranscripts([]);
        setCurrentInterim('');
        currentInputTranscription.current = '';
        currentOutputTranscription.current = '';
        nextStartTime = 0;
        sources.clear();

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            const outputNode = outputAudioContextRef.current.createGain();
            outputNode.connect(outputAudioContextRef.current.destination);

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                },
                callbacks: {
                    onopen: () => {
                        setStatus('Connected (Listening)');
                        const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
                        streamSourceRef.current = source;
                        const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;

                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob: Blob = {
                                data: encode(new Uint8Array(new Int16Array(inputData.map(x => x * 32768)).buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContextRef.current!.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            const text = message.serverContent.inputTranscription.text;
                            currentInputTranscription.current += text;
                            setCurrentInterim(currentInputTranscription.current);
                        }
                        if (message.serverContent?.outputTranscription) {
                            const text = message.serverContent.outputTranscription.text;
                            currentOutputTranscription.current += text;
                        }

                        if (message.serverContent?.turnComplete) {
                            const fullInput = currentInputTranscription.current;
                            const fullOutput = currentOutputTranscription.current;
                             if(fullInput.trim() || fullOutput.trim()) {
                                setTranscripts(prev => [...prev, { user: fullInput, model: fullOutput }]);
                            }
                            currentInputTranscription.current = '';
                            currentOutputTranscription.current = '';
                            setCurrentInterim('');
                        }

                        const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                        if (base64EncodedAudioString && outputAudioContextRef.current) {
                            nextStartTime = Math.max(nextStartTime, outputAudioContextRef.current.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64EncodedAudioString), outputAudioContextRef.current, 24000, 1);
                            const source = outputAudioContextRef.current.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputNode);
                            source.addEventListener('ended', () => { sources.delete(source); });
                            source.start(nextStartTime);
                            nextStartTime = nextStartTime + audioBuffer.duration;
                            sources.add(source);
                        }
                        
                        const interrupted = message.serverContent?.interrupted;
                        if (interrupted) {
                            for (const source of sources.values()) {
                                source.stop();
                                sources.delete(source);
                            }
                            nextStartTime = 0;
                        }
                    },
                    onclose: () => {
                        setStatus('Connection closed');
                        stopSession();
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Live session error:', e);
                        setStatus('Error occurred');
                        stopSession();
                    },
                },
            });

        } catch (error) {
            console.error('Failed to start session:', error);
            setStatus('Start failed. Check permissions.');
            setIsSessionActive(false);
        }
    }, [stopSession]);

    useEffect(() => {
        return () => {
            stopSession();
        };
    }, [stopSession]);
    
    const handleShare = () => {
        const fullTranscript = transcripts.map(t => `You: ${t.user}\nAI: ${t.model}`).join('\n\n');
        onShare({ contentText: fullTranscript, contentType: 'text' });
    }

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)] min-h-[600px]">
            {/* Sidebar Controls */}
            <div className="w-full lg:w-80 flex-shrink-0 bg-slate-900/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-800 flex flex-col items-center">
                <h3 className="text-xl font-bold text-white mb-6">Voice Control</h3>
                
                <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 mb-6 ${isSessionActive ? 'bg-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'bg-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.3)]'}`}>
                    <button
                        onClick={isSessionActive ? stopSession : startSession}
                        className={`w-24 h-24 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-xl ${isSessionActive ? 'bg-gradient-to-r from-red-600 to-red-500 hover:scale-105' : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:scale-105'}`}
                    >
                        {isSessionActive ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" /></svg>
                        )}
                    </button>
                </div>

                <div className="text-center mb-8">
                    <p className={`text-sm font-bold uppercase tracking-wider ${isSessionActive ? 'text-red-400 animate-pulse' : 'text-slate-400'}`}>
                        {isSessionActive ? 'Live Session Active' : 'Session Inactive'}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">{status}</p>
                </div>

                <div className="w-full bg-slate-950/50 p-4 rounded-xl border border-slate-800 text-xs text-slate-400">
                    <p className="mb-2 font-bold text-slate-300">Instructions:</p>
                    <ul className="list-disc pl-4 space-y-1">
                        <li>Press the microphone button to start.</li>
                        <li>Speak naturally to the AI.</li>
                        <li>Listen for the response.</li>
                        <li>Press stop to end the session.</li>
                    </ul>
                </div>
            </div>

            {/* Main Transcript Area */}
            <div className="flex-grow bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col overflow-hidden relative">
                <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                    <h3 className="font-bold text-white text-sm uppercase tracking-wider">Live Transcript</h3>
                    <button onClick={handleShare} disabled={transcripts.length === 0} className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded font-bold transition disabled:opacity-50 disabled:cursor-not-allowed">Share Transcript</button>
                </div>

                <div className="flex-grow p-6 overflow-y-auto space-y-6 relative custom-scrollbar">
                    {transcripts.length === 0 && !currentInterim && (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-600 opacity-60">
                            <div className="text-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                                <p>Conversation history will appear here.</p>
                            </div>
                        </div>
                    )}
                    
                    {transcripts.map((t, i) => (
                        <div key={i} className="space-y-2">
                            {t.user.trim() && (
                                <div className="flex justify-end">
                                    <div className="max-w-[80%]">
                                        <p className="text-[10px] text-slate-400 text-right mb-1">You</p>
                                        <div className="bg-cyan-600 text-white px-4 py-2 rounded-2xl rounded-tr-sm shadow-md">
                                            {t.user}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {t.model.trim() && (
                                <div className="flex justify-start">
                                    <div className="max-w-[80%]">
                                        <p className="text-[10px] text-slate-400 mb-1">AI Assistant</p>
                                        <div className="bg-slate-800 text-slate-200 px-4 py-2 rounded-2xl rounded-tl-sm border border-slate-700 shadow-md">
                                            {t.model}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    
                    {currentInterim.trim() && (
                        <div className="flex justify-end animate-pulse">
                            <div className="max-w-[80%]">
                                <p className="text-[10px] text-slate-400 text-right mb-1">Listening...</p>
                                <div className="bg-cyan-900/50 text-cyan-200 px-4 py-2 rounded-2xl rounded-tr-sm border border-cyan-800/50 italic">
                                    {currentInterim}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VoiceChat;
