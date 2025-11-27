
import React, { useState, useRef, useEffect, useCallback } from 'react';
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
        <div className="max-w-2xl mx-auto bg-slate-900 rounded-xl border border-slate-800 p-8">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Realtime Transcriber</h3>
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isRecording ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
                    {status}
                </div>
            </div>
            
            <div className="bg-black rounded-lg border border-slate-700 p-4 h-64 overflow-y-auto font-mono text-sm text-green-400 mb-6 shadow-inner">
                {transcript || <span className="text-slate-600">Transcript will appear here...</span>}
            </div>

            <div className="flex gap-4">
                <button onClick={isRecording ? stop : start} className={`flex-1 py-4 rounded-lg font-bold text-white transition ${isRecording ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'}`}>
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                </button>
                <button onClick={() => onShare({ contentText: transcript, contentType: 'text' })} className="px-6 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold">Share</button>
                <button onClick={() => setTranscript('')} className="px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold">Clear</button>
            </div>
        </div>
    );
};

export default RealtimeTranscriber;
