
import React, { useState } from 'react';
import SoundStudio from './SoundStudio';
import TextToSpeech from './TextToSpeech';
import VoiceLab from './VoiceLab';
import SongsGenerator from './SongsGenerator';
import AudiobookCreator from './AudiobookCreator';
import PodcastGenerator from './PodcastGenerator';
import VideoDubber from './VideoDubber';

interface AudioOSProps {
    onShare: (options: any) => void;
}

const AudioOS: React.FC<AudioOSProps> = ({ onShare }) => {
    const [activeTab, setActiveTab] = useState<'studio' | 'tts' | 'voice' | 'music' | 'book' | 'cast' | 'dub'>('studio');

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-center mb-6">
                <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex gap-1 overflow-x-auto max-w-full scrollbar-hide">
                    <button onClick={() => setActiveTab('studio')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'studio' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Studio</button>
                    <button onClick={() => setActiveTab('tts')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'tts' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>TTS</button>
                    <button onClick={() => setActiveTab('voice')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'voice' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Voice Cloning</button>
                    <button onClick={() => setActiveTab('music')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'music' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Music</button>
                    <button onClick={() => setActiveTab('book')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'book' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Audiobook</button>
                    <button onClick={() => setActiveTab('cast')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'cast' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Podcast</button>
                    <button onClick={() => setActiveTab('dub')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'dub' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Dubbing</button>
                </div>
            </div>
            
            <div className="flex-grow">
                {activeTab === 'studio' && <SoundStudio onShare={onShare} />}
                {activeTab === 'tts' && <TextToSpeech onShare={onShare} />}
                {activeTab === 'voice' && <VoiceLab onShare={onShare} />}
                {activeTab === 'music' && <SongsGenerator onShare={onShare} />}
                {activeTab === 'book' && <AudiobookCreator onShare={onShare} />}
                {activeTab === 'cast' && <PodcastGenerator onShare={onShare} />}
                {activeTab === 'dub' && <VideoDubber onShare={onShare} />}
            </div>
        </div>
    );
};

export default AudioOS;