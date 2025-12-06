
import React, { useState } from 'react';
import ImageGenerator from './ImageGenerator';
import ImageEditor from './ImageEditor';

interface ImageOSProps {
    onShare: (options: any) => void;
}

const ImageOS: React.FC<ImageOSProps> = ({ onShare }) => {
    const [activeTab, setActiveTab] = useState<'generate' | 'edit'>('generate');

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-center mb-6">
                <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex gap-1">
                    <button 
                        onClick={() => setActiveTab('generate')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'generate' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        Generation Engine
                    </button>
                    <button 
                        onClick={() => setActiveTab('edit')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'edit' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        Editor & Tools
                    </button>
                </div>
            </div>
            
            <div className="flex-grow">
                {activeTab === 'generate' && <ImageGenerator onShare={onShare} />}
                {activeTab === 'edit' && <ImageEditor onShare={onShare} />}
            </div>
        </div>
    );
};

export default ImageOS;
