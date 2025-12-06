
import React, { useState } from 'react';
import ContentGenerator from './ContentGenerator';
import MovieGenerator from './MovieGenerator';
import Chatbot from './Chatbot';

interface ScriptOSProps {
    onShare: (options: any) => void;
}

const ScriptOS: React.FC<ScriptOSProps> = ({ onShare }) => {
    const [activeTab, setActiveTab] = useState<'writer' | 'screenplay' | 'chat'>('writer');

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-center mb-6">
                <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex gap-1">
                    <button onClick={() => setActiveTab('writer')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'writer' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Auto Writer</button>
                    <button onClick={() => setActiveTab('screenplay')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'screenplay' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Screenplay</button>
                    <button onClick={() => setActiveTab('chat')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'chat' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>AI Chat</button>
                </div>
            </div>
            
            <div className="flex-grow">
                {activeTab === 'writer' && <ContentGenerator onShare={onShare} />}
                {activeTab === 'screenplay' && <MovieGenerator onShare={onShare} />}
                {activeTab === 'chat' && <Chatbot onShare={onShare} />}
            </div>
        </div>
    );
};

export default ScriptOS;