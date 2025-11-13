
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import React, { useState, useRef, useCallback, useEffect } from 'react';

// --- Audio Helper Functions ---
function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

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
    let nextStartTime = 0;
    const sources = new Set<AudioBufferSourceNode>();

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
                        setStatus('Connected. Start speaking...');
                        if (!inputAudioContextRef.current || !mediaStreamRef.current) return;
                        
                        streamSourceRef.current = inputAudioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
                        scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                        
                        scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const l = inputData.length;
                            const int16 = new Int16Array(l);
                            for (let i = 0; i < l; i++) {
                                int16[i] = inputData[i] * 32768;
                            }
                            const pcmBlob: Blob = {
                                data: encode(new Uint8Array(int16.buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };
                            
                            if (sessionPromiseRef.current) {
                                sessionPromiseRef.current.then((session) => {
                                    session.sendRealtimeInput({ media: pcmBlob });
                                });
                            }
                        };
                        streamSourceRef.current.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            const text = message.serverContent.inputTranscription.text;
                             currentInputTranscription.current += text;
                             setCurrentInterim(currentInputTranscription.current);
                        } else if (message.serverContent?.outputTranscription) {
                            const text = message.serverContent.outputTranscription.text;
                            currentOutputTranscription.current += text;
                        }

                        if (message.serverContent?.turnComplete) {
                            const finalInput = currentInputTranscription.current;
                            const finalOutput = currentOutputTranscription.current;
                            if (finalInput || finalOutput) {
                                setTranscripts(prev => [...prev, {user: finalInput, model: finalOutput}]);
                            }
                            currentInputTranscription.current = '';
                            currentOutputTranscription.current = '';
                            setCurrentInterim('');
                        }

                        const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData.data;
                        if (base64Audio && outputAudioContextRef.current) {
                             nextStartTime = Math.max(nextStartTime, outputAudioContextRef.current.currentTime);
                             const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, 24000, 1);
                             const source = outputAudioContextRef.current.createBufferSource();
                             source.buffer = audioBuffer;
                             source.connect(outputNode);
                             source.addEventListener('ended', () => sources.delete(source));
                             source.start(nextStartTime);
                             nextStartTime = nextStartTime + audioBuffer.duration;
                             sources.add(source);
                        }

                         if (message.serverContent?.interrupted) {
                            for (const source of sources.values()) {
                                source.stop();
                                sources.delete(source);
                            }
                            nextStartTime = 0;
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('API Error:', e);
                        setStatus(`Error: ${e.message}. Please try again.`);
                        stopSession();
                    },
                    onclose: () => {
                         // This is handled by stopSession() being called
                    },
                },
            });

        } catch (err) {
            console.error('Failed to start session:', err);
            setStatus('Could not start session. Please check microphone permissions.');
            setIsSessionActive(false);
        }
    }, [stopSession]);

     useEffect(() => {
        return () => stopSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleShare = () => {
        const transcriptText = transcripts.map(t => `User: ${t.user || '(...)'}\n\nAI: ${t.model || '(...)'}`).join('\n\n');
        onShare({ contentText: transcriptText, contentType: 'text' });
    };

    return (
        <div className="flex flex-col h-[60vh]">
            <div className="flex-grow bg-slate-900/50 rounded-t-lg p-4 overflow-y-auto space-y-4">
                {transcripts.map((t, i) => (
                    <div key={i}>
                        {t.user && <p className="text-right"><span className="bg-cyan-800 text-white rounded-lg px-3 py-2 inline-block">{t.user}</span></p>}
                        {t.model && <p className="text-left"><span className="bg-slate-700 text-slate-200 rounded-lg px-3 py-2 inline-block">{t.model}</span></p>}
                    </div>
                ))}
                 {currentInterim && <p className="text-right text-slate-400 italic"><span className="bg-cyan-900/50 text-slate-300 rounded-lg px-3 py-2 inline-block">{currentInterim}</span></p>}

            </div>
            <div className="flex-shrink-0 bg-slate-800 rounded-b-lg p-4 flex items-center justify-between border-t border-slate-700">
                <p className="text-sm text-slate-400">{status}</p>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleShare}
                        disabled={transcripts.length === 0}
                        className="flex items-center justify-center space-x-2 bg-purple-600 text-white font-bold py-3 px-4 rounded-full hover:bg-purple-700 transition-colors duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                        </svg>
                    </button>
                    <button
                        onClick={isSessionActive ? stopSession : startSession}
                        className={`px-6 py-3 font-bold rounded-full text-white transition-all duration-300 flex items-center space-x-2 ${isSessionActive ? 'bg-red-600 hover:bg-red-700' : 'bg-cyan-500 hover:bg-cyan-600'}`}
                    >
                        {isSessionActive ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" /><path d="M5.5 8.5a.5.5 0 01.5.5v1a4 4 0 004 4h0a4 4 0 004-4v-1a.5.5 0 011 0v1a5 5 0 01-4.5 4.975V17h3a.5.5 0 010 1h-7a.5.5 0 010-1h3v-1.525A5 5 0 014.5 13v-1a.5.5 0 01.5-.5z" /></svg>
                        )}
                        <span>{isSessionActive ? 'Stop Session' : 'Start Session'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VoiceChat;
