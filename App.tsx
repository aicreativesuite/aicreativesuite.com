


import React, { useState, useMemo } from 'react';
import { FEATURES, FeatureId, CATEGORY_DETAILS, PricingIcon, AccountIcon } from './constants';
import ImageGenerator from './components/features/ImageGenerator';
import ImageEditor from './components/features/ImageEditor';
import VideoGenerator from './components/features/VideoGenerator';
import VoiceChat from './components/features/VoiceChat';
import Chatbot from './components/features/Chatbot';
import GroundedSearch from './components/features/GroundedSearch';
import MediaAnalyzer from './components/features/MediaAnalyzer';
import TextToSpeech from './components/features/TextToSpeech';
import AvatarGenerator from './components/features/AvatarGenerator';
import VideoEditor from './components/features/VideoEditor';
import SoundStudio from './components/features/SoundStudio';
import SongsGenerator from './components/features/SongsGenerator';
import MarketingAssistant from './components/features/MarketingAssistant';
import Pricing from './components/features/Pricing';
import ProfileAndSettings from './components/features/ProfileAndSettings';
import MovieGenerator from './components/features/MovieGenerator';
import ContentGenerator from './components/features/ContentGenerator';
import StandupGenerator from './components/features/StandupGenerator';
import StrandsGenerator from './components/features/StrandsGenerator';
import DanceGenerator from './components/features/DanceGenerator';
import TrafficBooster from './components/features/TrafficBooster';
import ViralMemeGenerator from './components/features/ViralMemeGenerator';
import { PLATFORMS, Platform, PlatformCategory } from './constants';


// --- Traffic Booster Modal Component ---
interface TrafficBoosterModalProps {
    show: boolean;
    onClose: () => void;
    contentUrl?: string | null;
    contentText?: string | null;
    contentType?: 'image' | 'video' | 'text' | 'audio';
}

export const TrafficBoosterModal: React.FC<TrafficBoosterModalProps> = ({ show, onClose, contentUrl, contentText, contentType = 'image' }) => {
    type ToastType = 'success' | 'info' | 'error';
    const [activeTab, setActiveTab] = useState<PlatformCategory>('Photo Sharing');
    const [shareText, setShareText] = useState('');
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleTime, setScheduleTime] = useState('');
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    React.useEffect(() => {
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
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-8 max-w-4xl w-full mx-4 border border-slate-700 shadow-2xl shadow-cyan-500/10 modal-content" onClick={e => e.stopPropagation()}>
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
                            {contentType === 'text' && contentText && <p className="text-slate-300 text-sm h-full overflow-y-auto p-2">{String(contentText)}</p>}
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
                             <div className="flex bg-slate-800 rounded-lg p-1 text-sm border border-slate-700 mb-4">
                                {categories.map(cat => (
                                    <button key={cat} onClick={() => setActiveTab(cat)} className={`w-full p-2 rounded-md text-xs font-semibold transition ${activeTab === cat ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                                        {cat}
                                    </button>
                                ))}
                            </div>
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 text-center">
                                {filteredPlatforms.map(platform => (
                                    <button type="button" key={platform.name} onClick={() => handlePlatformShare(platform)} className="flex flex-col items-center p-2 rounded-lg hover:bg-slate-700/50 transition group cursor-pointer focus-ring text-left">
                                        <div className="w-10 h-10 text-slate-300 group-hover:text-white transition transform group-hover:scale-110">{platform.icon}</div>
                                        <span className="text-xs mt-1 text-slate-400">{platform.name}</span>
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


const FeatureCard: React.FC<{ feature: typeof FEATURES[0]; onClick: () => void }> = ({ feature, onClick }) => (
    <div
        className="group relative bg-slate-900/50 backdrop-blur-md rounded-2xl p-6 flex flex-col items-start transition-all duration-300 cursor-pointer overflow-hidden border border-slate-800 hover:border-cyan-500/50"
        onClick={onClick}
    >
        {/* Glow effect */}
        <div className="absolute -inset-px rounded-2xl bg-cyan-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg"></div>
        {/* Spotlight effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <div className="relative z-10">
            <div className="p-3 rounded-xl bg-slate-800/70 mb-4 border border-slate-700 group-hover:bg-cyan-900/50 group-hover:border-cyan-700 transition-all duration-300 shadow-lg text-cyan-400">
                {React.cloneElement(feature.icon, { className: 'w-6 h-6' })}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
        </div>
    </div>
);

const App: React.FC = () => {
    const [activeFeature, setActiveFeature] = useState<FeatureId | null>(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [trafficBoosterState, setTrafficBoosterState] = useState<{
        show: boolean;
        contentUrl?: string | null;
        contentText?: string | null;
        contentType?: 'image' | 'video' | 'text' | 'audio';
    }>({ show: false });

    const openTrafficBooster = (content: {
        contentUrl?: string | null;
        contentText?: string | null;
        contentType?: 'image' | 'video' | 'text' | 'audio';
    }) => {
        setTrafficBoosterState({ ...content, show: true });
    };

    const closeTrafficBooster = () => {
        setTrafficBoosterState({ show: false, contentUrl: undefined, contentText: undefined });
    };

    const ActiveComponent = useMemo(() => {
        if (!activeFeature) return null;
        switch (activeFeature) {
            case 'image-generator': return ImageGenerator;
            case 'image-editor': return ImageEditor;
            case 'video-generator': return VideoGenerator;
            case 'movie-generator': return MovieGenerator;
            case 'voice-chat': return VoiceChat;
            case 'chatbot': return Chatbot;
            case 'grounded-search': return GroundedSearch;
            case 'media-analyzer': return MediaAnalyzer;
            case 'text-to-speech': return TextToSpeech;
            case 'avatar-generator': return AvatarGenerator;
            case 'video-editor': return VideoEditor;
            case 'sound-studio': return SoundStudio;
            case 'songs-generator': return SongsGenerator;
            case 'marketing-assistant': return MarketingAssistant;
            case 'content-generator': return ContentGenerator;
            case 'standup-generator': return StandupGenerator;
            case 'strands-generator': return StrandsGenerator;
            case 'dance-generator': return DanceGenerator;
            case 'traffic-booster': return TrafficBooster;
            case 'viral-meme-generator': return ViralMemeGenerator;
            case 'pricing': return Pricing;
            case 'profile-settings': return ProfileAndSettings;
            default: return null;
        }
    }, [activeFeature]);

    const activeFeatureDetails = FEATURES.find(f => f.id === activeFeature);

    const categorizedFeatures = useMemo(() => {
        const categories: { [key: string]: (typeof FEATURES[0])[] } = {
            'Create & Edit': [],
            'Assist & Analyze': [],
        };
        const order: (keyof typeof categories)[] = ['Create & Edit', 'Assist & Analyze'];

        for (const feature of FEATURES) {
            if (feature.category in categories) {
                categories[feature.category].push(feature);
            }
        }
        
        for (const category in categories) {
            categories[category].sort((a, b) => a.title.localeCompare(b.title));
        }

        return { order, categories };
    }, []);

    const NavLink: React.FC<{
        isActive: boolean;
        onClick: (e: React.MouseEvent) => void;
        title: string;
        icon: React.ReactElement;
    }> = ({ isActive, onClick, title, icon }) => (
        <a
            href="#"
            title={isSidebarCollapsed ? title : ''}
            onClick={onClick}
            className={`flex items-center text-sm font-medium transition-all duration-200 group relative ${isSidebarCollapsed ? 'justify-center w-12 h-12 rounded-xl' : 'px-4 py-2.5 rounded-lg'} ${isActive ? 'bg-cyan-500/10 text-cyan-300' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
            <div className="w-6 h-6 flex-shrink-0">{icon}</div>
            <span
                className={`whitespace-nowrap transition-all duration-200 ease-in-out overflow-hidden ${isSidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100 ml-3'}`}
            >
                {title}
            </span>
            {isActive && !isSidebarCollapsed && (
                 <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-cyan-400 rounded-r-full"></div>
            )}
        </a>
    );


    return (
        <div className="h-screen flex flex-col bg-slate-950 font-sans text-slate-100">
            <TrafficBoosterModal
                show={trafficBoosterState.show}
                onClose={closeTrafficBooster}
                contentUrl={trafficBoosterState.contentUrl}
                contentText={trafficBoosterState.contentText}
                contentType={trafficBoosterState.contentType}
            />

            {/* Header */}
            <header className="h-20 flex-shrink-0 flex items-center justify-between px-6 bg-slate-900/70 backdrop-blur-lg border-b border-slate-800 z-30">
                <div className="flex items-center space-x-4">
                     <svg className="w-8 h-8 text-cyan-400 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.75 2.06733L16.2045 9.42933L22.929 10.3958L17.8395 15.3443L19.0215 22.0403L12.75 18.2143L6.4785 22.0403L7.6605 15.3443L2.571 10.3958L9.2955 9.42933L12.75 2.06733ZM12.75 5.51133L10.6695 9.89733L5.9445 10.6013L9.348 13.9103L8.514 18.6053L12.75 16.1463L16.986 18.6053L16.152 13.9103L19.5555 10.6013L14.8305 9.89733L12.75 5.51133Z"></path>
                    </svg>
                    <h1 className="text-xl font-bold text-white hidden sm:block">AI Creative Suite</h1>
                    <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="p-2 rounded-full text-slate-400 hover:bg-slate-800 hover:text-white transition-colors duration-200" title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
                        {isSidebarCollapsed ? (
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                        ) : (
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                        )}
                    </button>
                </div>
                <div className="flex items-center space-x-2">
                     <a href="#" onClick={(e) => { e.preventDefault(); setActiveFeature('pricing'); }} title="Pricing & Plans" className="p-2 rounded-full text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                        <PricingIcon className="w-6 h-6" />
                    </a>
                    <a href="#" onClick={(e) => { e.preventDefault(); setActiveFeature('profile-settings'); }} title="Profile & Settings" className="p-2 rounded-full text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                        <AccountIcon className="w-6 h-6" />
                    </a>
                </div>
            </header>
            
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className={`flex-shrink-0 bg-slate-900/70 backdrop-blur-lg border-r border-slate-800 flex flex-col transition-all duration-300 ease-in-out z-20 ${isSidebarCollapsed ? 'w-24' : 'w-72'}`}>
                    <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                        <a href="#" onClick={(e) => { e.preventDefault(); setActiveFeature(null); }} className={`flex items-center text-sm font-medium transition-all duration-200 group relative ${isSidebarCollapsed ? 'justify-center w-12 h-12 rounded-xl' : 'px-4 py-2.5 rounded-lg'} ${activeFeature === null ? 'bg-cyan-500/10 text-cyan-300' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M3 13H11V3H3V13ZM3 21H11V15H3V21ZM13 21H21V11H13V21ZM13 3V9H21V3H13Z"></path></svg>
                            <span className={`whitespace-nowrap transition-all duration-200 ease-in-out overflow-hidden ${isSidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100 ml-3'}`}>Dashboard</span>
                            {activeFeature === null && !isSidebarCollapsed && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-cyan-400 rounded-r-full"></div>
                            )}
                        </a>
                        
                        {!isSidebarCollapsed && categorizedFeatures.order.map(categoryName => (
                            <div key={categoryName} className="pt-4">
                                <h2 className="px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center">
                                    {CATEGORY_DETAILS[categoryName].icon}
                                    <span className="ml-2">{categoryName}</span>
                                </h2>
                                <div className="space-y-1">
                                    {categorizedFeatures.categories[categoryName].map(feature => (
                                        <NavLink
                                            key={feature.id}
                                            isActive={activeFeature === feature.id}
                                            onClick={(e) => { e.preventDefault(); setActiveFeature(feature.id); }}
                                            title={feature.title}
                                            icon={feature.icon}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}

                    </nav>
                </aside>
                
                <main className="flex-1 overflow-y-auto p-8 relative">
                    {/* Background pattern */}
                    <div className="absolute inset-0 bg-grid-slate-800/50 [mask-image:linear-gradient(to_bottom,white_4rem,transparent_20rem)]"></div>
                    
                    <div className="relative">
                        {!activeFeature && (
                            <div className="space-y-12">
                                <div>
                                    <h1 className="text-4xl font-extrabold text-white mb-2">Welcome to the AI Creative Suite</h1>
                                    <p className="text-lg text-slate-400 mb-8">Your all-in-one platform for AI-powered content creation. Select a tool to get started.</p>
                                </div>
                                {categorizedFeatures.order.map(categoryName => (
                                    <div key={categoryName}>
                                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                                            {React.cloneElement(CATEGORY_DETAILS[categoryName].icon, {className: "w-6 h-6 text-cyan-400"})}
                                            <span className="ml-3">{categoryName}</span>
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {categorizedFeatures.categories[categoryName].map(feature => (
                                                <FeatureCard key={feature.id} feature={feature} onClick={() => setActiveFeature(feature.id)} />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {ActiveComponent && activeFeatureDetails && (
                            <div>
                                <div className="flex items-center space-x-4 mb-8">
                                    <button onClick={() => setActiveFeature(null)} className="p-2 rounded-full bg-slate-800/70 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
                                    </button>
                                    <div>
                                        <h1 className="text-3xl font-bold text-white">{activeFeatureDetails.title}</h1>
                                        <p className="text-slate-400">{activeFeatureDetails.description}</p>
                                    </div>
                                </div>
                                <ActiveComponent onShare={openTrafficBooster} />
                            </div>
                        )}
                         {ActiveComponent && !activeFeatureDetails && activeFeature === 'pricing' && (
                             <div>
                                <Pricing />
                            </div>
                        )}
                        {ActiveComponent && !activeFeatureDetails && activeFeature === 'profile-settings' && (
                             <div>
                                <ProfileAndSettings />
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

// Fix: Add default export for the App component.
export default App;