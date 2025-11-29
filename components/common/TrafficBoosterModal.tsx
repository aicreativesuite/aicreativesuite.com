
import React, { useState, useEffect } from 'react';
import { PLATFORMS, Platform, PlatformCategory } from '../../constants';

interface TrafficBoosterModalProps {
    show: boolean;
    onClose: () => void;
    contentUrl?: string | null;
    contentText?: string | null;
    contentType?: 'image' | 'video' | 'text' | 'audio';
}

export const TrafficBoosterModal: React.FC<TrafficBoosterModalProps> = ({ show, onClose, contentUrl, contentText, contentType = 'image' }) => {
    type ToastType = 'success' | 'info' | 'error';
    const [activeTab, setActiveTab] = useState<PlatformCategory>('Social & Micro');
    const [shareText, setShareText] = useState('');
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleTime, setScheduleTime] = useState('');
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    useEffect(() => {
        setShareText(contentText || 'Check out this content I created with the AI Creative Suite!');
    }, [contentText, show]);

    if (!show) return null;

    const displayToast = (message: string, type: ToastType = 'success', duration: number = 3000) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), duration);
    };

    const handleSchedule = () => {
        if (!scheduleDate || !scheduleTime) {
            displayToast('Please select a date and time.', 'error');
            return;
        }
        displayToast(`Scheduled for ${scheduleDate} at ${scheduleTime}! (Demo)`);
    };
    
    const handlePlatformShare = (platform: Platform) => {
        const url = platform.shareUrl ? platform.shareUrl(contentUrl || window.location.href, shareText, contentType as 'image' | 'video' | 'text' | 'audio') : '#';
        if (url === '#') {
            const toastMessage = `Direct sharing to ${platform.name} isn't supported on web. Please download and share via their mobile app.`;
            displayToast(toastMessage, 'info', 5000);
        } else {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    }

    const getFileName = () => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        if (contentType === 'video') return `ai-video-${timestamp}.mp4`;
        if (contentType === 'image') return `ai-image-${timestamp}.jpg`;
        if (contentType === 'audio') return `ai-audio-${timestamp}.mp3`;
        return `ai-content-${timestamp}.txt`;
    }

    const categories: PlatformCategory[] = Array.from(new Set(PLATFORMS.map(p => p.category)));
    const filteredPlatforms = PLATFORMS.filter(p => p.category === activeTab);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 modal-overlay" onClick={onClose}>
            {toast && (
                <div className={`absolute top-5 py-2 px-4 rounded-lg animate-pulse z-50 ${
                    toast.type === 'success' ? 'bg-green-500 text-white' :
                    toast.type === 'info' ? 'bg-amber-500 text-black' :
                    'bg-red-500 text-white'
                }`}>
                    {toast.message}
                </div>
            )}
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-8 max-w-5xl w-full mx-4 border border-slate-700 shadow-2xl shadow-cyan-500/10 modal-content max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-6">
                    <h2 className="text-2xl font-bold text-white">Share & Promote</h2>
                    <button onClick={onClose} className=" text-slate-400 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: Preview & Actions */}
                    <div className="space-y-6">
                        <div className="bg-slate-950/50 rounded-lg p-3 aspect-square flex items-center justify-center border border-slate-700">
                            {contentType === 'image' && contentUrl && <img src={contentUrl} alt="Content preview" className="max-h-full w-auto rounded" />}
                            {contentType === 'video' && contentUrl && <video src={contentUrl} controls className="max-h-full w-auto rounded" />}
                            {contentType === 'audio' && contentUrl && <audio src={contentUrl} controls className="w-full" />}
                            {contentType === 'text' && contentText && <p className="text-slate-300 text-sm h-full overflow-y-auto p-2 whitespace-pre-wrap">{String(contentText)}</p>}
                        </div>
                         <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-700">
                            <h3 className="font-semibold text-slate-200 mb-3">Other Actions</h3>
                            <div className={`grid ${contentUrl ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
                                {contentUrl && <a href={contentUrl} download={getFileName()} className="text-center w-full bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-600 transition">Download</a>}
                                <button onClick={() => { navigator.clipboard.writeText(contentUrl || contentText || ''); displayToast('Copied to clipboard!'); }} className="w-full bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-600 transition">Copy Link/Text</button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Share & Schedule */}
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="share-text" className="block text-sm font-medium text-slate-300 mb-2">Share Text</label>
                            <textarea
                                id="share-text"
                                rows={4}
                                value={shareText}
                                onChange={(e) => setShareText(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 transition"
                                placeholder="Add a caption..."
                            />
                        </div>

                        <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-700">
                             <h3 className="font-semibold text-slate-200 mb-4">Share to Platform</h3>
                             <div className="flex overflow-x-auto pb-2 mb-4 gap-2 scrollbar-hide bg-slate-800/50 p-2 rounded-lg">
                                {categories.map(cat => (
                                    <button key={cat} onClick={() => setActiveTab(cat)} className={`whitespace-nowrap px-3 py-2 rounded-md text-xs font-semibold transition flex-shrink-0 ${activeTab === cat ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                                        {cat}
                                    </button>
                                ))}
                            </div>
                            <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-2 text-center max-h-[250px] overflow-y-auto pr-1">
                                {filteredPlatforms.map(platform => (
                                    <button type="button" key={platform.name} onClick={() => handlePlatformShare(platform)} className="flex flex-col items-center p-2 rounded-lg hover:bg-slate-700/50 transition group cursor-pointer focus-ring">
                                        <div className="w-10 h-10 flex items-center justify-center text-slate-300 group-hover:text-white transition transform group-hover:scale-110">
                                            {platform.icon}
                                        </div>
                                        <span className="text-[10px] mt-1 text-slate-400 leading-tight">{platform.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                         <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-700">
                            <h3 className="font-semibold text-slate-200 mb-3">Schedule Post (Demo)</h3>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-sm" />
                                <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-sm" />
                            </div>
                            <button onClick={handleSchedule} className="w-full bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition">Schedule Send</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
