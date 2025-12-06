
import React, { useState } from 'react';
import VideoGenerator from './VideoGenerator';
import VideoStudio from './VideoStudio';
import VideoEditor from './VideoEditor';
import GlobalAvatarCreator from './GlobalAvatarCreator';
import VideoToolkit from './VideoToolkit';
import ViralMemeGenerator from './ViralMemeGenerator';
import DanceGenerator from './DanceGenerator';

interface VideoOSProps {
    onShare: (options: any) => void;
}

const VideoOS: React.FC<VideoOSProps> = ({ onShare }) => {
    const [activeTab, setActiveTab] = useState<'gen' | 'studio' | 'edit' | 'avatar' | 'meme' | 'dance' | 'tools'>('gen');

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-center mb-6">
                <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex gap-1 overflow-x-auto max-w-full scrollbar-hide">
                    <button onClick={() => setActiveTab('gen')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'gen' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Generator</button>
                    <button onClick={() => setActiveTab('studio')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'studio' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Studio Pro</button>
                    <button onClick={() => setActiveTab('edit')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'edit' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Editor</button>
                    <button onClick={() => setActiveTab('avatar')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'avatar' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Avatars</button>
                    <button onClick={() => setActiveTab('meme')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'meme' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Memes</button>
                    <button onClick={() => setActiveTab('dance')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'dance' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Dance</button>
                    <button onClick={() => setActiveTab('tools')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'tools' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Toolkit</button>
                </div>
            </div>
            
            <div className="flex-grow">
                {activeTab === 'gen' && <VideoGenerator onShare={onShare} />}
                {activeTab === 'studio' && <VideoStudio onShare={onShare} />}
                {activeTab === 'edit' && <VideoEditor onShare={onShare} />}
                {activeTab === 'avatar' && <GlobalAvatarCreator onShare={onShare} />}
                {activeTab === 'meme' && <ViralMemeGenerator onShare={onShare} />}
                {activeTab === 'dance' && <DanceGenerator onShare={onShare} />}
                {activeTab === 'tools' && <VideoToolkit onShare={onShare} />}
            </div>
        </div>
    );
};

export default VideoOS;