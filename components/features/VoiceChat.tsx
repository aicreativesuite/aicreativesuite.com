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
    const [status, setStatus] = useState('Not connected. Press Start to begin.');
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
        setStatus('Session ended. Press Start to begin again.');
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
                        setStatus('Connected! Speak now.');
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
                        setStatus('Connection closed.');
                        stopSession();
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Live session error:', e);
                        setStatus('An error occurred. Connection closed.');
                        stopSession();
                    },
                },
            });

        } catch (error) {
            console.error('Failed to start session:', error);
            setStatus('Could not start session. Please check permissions.');
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
        <div className="flex flex-col h-[calc(100vh-10rem)] max-h-[800px] bg-slate-900/50 rounded-lg border border-slate-700">
            <div className="flex-shrink-0 p-4 border-b border-slate-700 flex justify-between items-center">
                <h3 className="font-bold text-lg text-white">Voice Chat</h3>
                <button onClick={handleShare} disabled={transcripts.length === 0} className="flex items-center space-x-2 bg-purple-600 text-white font-bold py-2 px-3 rounded-lg hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
                    <span>Share Transcript</span>
                </button>
            </div>
            <div className="flex-grow p-6 overflow-y-auto space-y-4 min-h-0">
                {transcripts.map((t, i) => (
                    <React.Fragment key={i}>
                        {t.user.trim() && <div className="flex justify-end"><div className="px-4 py-3 rounded-2xl rounded-br-lg max-w-md bg-cyan-600 text-white">{t.user}</div></div>}
                        {t.model.trim() && <div className="flex justify-start"><div className="px-4 py-3 rounded-2xl rounded-bl-lg max-w-md bg-slate-700 text-slate-200">{t.model}</div></div>}
                    </React.Fragment>
                ))}
                {currentInterim.trim() && <div className="flex justify-end"><div className="px-4 py-3 rounded-2xl rounded-br-lg max-w-md bg-cyan-600/70 text-white/80 italic">{currentInterim}</div></div>}
            </div>
            <div className="flex-shrink-0 p-4 border-t border-slate-700 text-center">
                <p className="text-sm text-slate-400 h-5 mb-4">{status}</p>
                <button
                    onClick={isSessionActive ? stopSession : startSession}
                    className={`w-20 h-20 rounded-full flex items-center justify-center text-white transition-all duration-300 mx-auto ${isSessionActive ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/30' : 'bg-cyan-500 hover:bg-cyan-600 shadow-lg shadow-cyan-500/30'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" />
                        <path d="M5.5 8.5a.5.5 0 01.5.5v1a4 4 0 004 4h0a4 4 0 004-4v-1a.5.5 0 011 0v1a5 5 0 01-4.5 4.975V17h3a.5.5 0 010 1h-7a.5.5 0 010-1h3v-1.525A5 5 0 014.5 13v-1a.5.5 0 01.5-.5z" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default VoiceChat;
