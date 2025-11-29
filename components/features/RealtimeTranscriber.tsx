
import React, { useState, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage } from '@google/genai';
import { encode } from '../../utils';

const RealtimeTranscriber: React.FC<{onShare: any}> = ({ onShare }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [status, setStatus] = useState('Ready');
    
    const sessionRef = useRef<Promise<any> | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const start = useCallback(async () => {
        setIsRecording(true);
        setStatus('Connecting...');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            
            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: { inputAudioTranscription: {} },
                callbacks: {
                    onopen: () => {
                        setStatus('Listening...');
                        const source = audioContextRef.current!.createMediaStreamSource(stream);
                        const processor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
                        processor.onaudioprocess = (e) => {
                            const inputData = e.inputBuffer.getChannelData(0);
                            const pcmData = new Int16Array(inputData.map(x => x * 32768));
                            const base64 = encode(new Uint8Array(pcmData.buffer));
                            sessionPromise.then(session => session.sendRealtimeInput({ media: { mimeType: 'audio/pcm;rate=16000', data: base64 } }));
                        };
                        source.connect(processor);
                        processor.connect(audioContextRef.current!.destination);
                    },
                    onmessage: (msg: LiveServerMessage) => {
                        if (msg.serverContent?.inputTranscription?.text) {
                            setTranscript(prev => prev + msg.serverContent!.inputTranscription!.text);
                        }
                    },
                    onclose: () => setStatus('Disconnected'),
                    onerror: () => setStatus('Error')
                }
            });
            sessionRef.current = sessionPromise;
        } catch (e) {
            console.error(e);
            setIsRecording(false);
            setStatus('Failed to start');
        }
    }, []);

    const stop = useCallback(() => {
        setIsRecording(false);
        setStatus('Ready');
        if(sessionRef.current) sessionRef.current.then(s => s.close());
        if(streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        if(audioContextRef.current) audioContextRef.current.close();
    }, []);

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)] min-h-[600px]">
            {/* Sidebar Controls */}
            <div className="w-full lg:w-80 flex-shrink-0 bg-slate-900/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-800 overflow-y-auto custom-scrollbar flex flex-col gap-6">
                
                <div className="bg-slate-950 border border-slate-700 p-4 rounded-xl text-center">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Status</h3>
                    <div className={`text-xs font-bold px-3 py-1.5 rounded-full inline-block ${isRecording ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
                        {status}
                    </div>
                </div>

                <div className="flex-grow flex flex-col justify-center space-y-4">
                    <button 
                        onClick={isRecording ? stop : start} 
                        className={`w-full py-4 rounded-xl font-bold text-white transition shadow-lg ${isRecording ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'}`}
                    >
                        {isRecording ? 'Stop Recording' : 'Start Recording'}
                    </button>
                    <button 
                        onClick={() => setTranscript('')} 
                        className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition"
                    >
                        Clear Transcript
                    </button>
                </div>
            </div>

            {/* Main Transcript Area */}
            <div className="flex-grow bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col overflow-hidden relative">
                <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                    <h3 className="font-bold text-white text-sm uppercase tracking-wider">Live Transcript</h3>
                    {transcript && (
                        <button onClick={() => onShare({ contentText: transcript, contentType: 'text' })} className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded font-bold transition">Share</button>
                    )}
                </div>

                <div className="flex-grow p-8 overflow-y-auto custom-scrollbar relative">
                    <div className="absolute inset-0 bg-grid-slate-800/20 pointer-events-none"></div>
                    
                    {!transcript && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-60">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                            <p className="text-lg">Start recording to see live transcription.</p>
                        </div>
                    )}

                    <div className="font-mono text-sm text-green-400 whitespace-pre-wrap leading-relaxed relative z-10">
                        {transcript}
                        {isRecording && <span className="animate-pulse inline-block w-2 h-4 bg-green-400 ml-1 align-middle"></span>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RealtimeTranscriber;
