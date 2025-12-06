
import React, { useState, useMemo } from 'react';
import { FEATURES, FeatureId, CATEGORY_DETAILS, PricingIcon, AccountIcon } from './constants';
import Pricing from './components/features/Pricing';
import ProfileAndSettings from './components/features/ProfileAndSettings';
import ImageOS from './components/features/ImageOS';
import ScriptOS from './components/features/ScriptOS';
import VideoOS from './components/features/VideoOS';
import AudioOS from './components/features/AudioOS';
import ThreeDBuilder from './components/features/ThreeDBuilder';
import CodeOS from './components/features/CodeOS';
import BrandOS from './components/features/BrandOS';
import AutomationOS from './components/features/AutomationOS';
import AuthScreen from './components/features/AuthScreen';
import { TrafficBoosterModal } from './components/common/TrafficBoosterModal';

const FeatureCard: React.FC<{ feature: typeof FEATURES[number]; onClick: () => void }> = ({ feature, onClick }) => (
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

const Marketplace = () => (
    <div className="h-full flex flex-col items-center justify-center text-slate-500 p-8 text-center bg-slate-900/30 rounded-xl border border-slate-800 border-dashed">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
        <h2 className="text-2xl font-bold text-white mb-2">Marketplace Coming Soon</h2>
        <p className="max-w-md">Browse templates, plugins, models, and assets created by the community.</p>
    </div>
);

const App: React.FC = () => {
    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    const [activeFeature, setActiveFeature] = useState<FeatureId | 'marketplace' | null>(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [trafficBoosterState, setTrafficBoosterState] = useState<{
        show: boolean;
        contentUrl?: string | null;
        contentText?: string | null;
        contentType?: 'image' | 'video' | 'text' | 'audio';
    }>({ show: false });

    // --- Authentication Handlers ---
    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setActiveFeature(null);
    };

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
            case 'image-os': return ImageOS;
            case 'script-os': return ScriptOS;
            case 'video-os': return VideoOS;
            case 'audio-os': return AudioOS;
            case '3d-os': return ThreeDBuilder;
            case 'code-os': return CodeOS;
            case 'brand-os': return BrandOS;
            case 'automation-os': return AutomationOS;
            case 'pricing': return Pricing;
            case 'profile-settings': return ProfileAndSettings;
            case 'marketplace': return Marketplace;
            default: return null;
        }
    }, [activeFeature]);

    const activeFeatureDetails = FEATURES.find(f => f.id === activeFeature);

    const categorizedFeatures = useMemo(() => {
        const categories: { [key: string]: (typeof FEATURES[number])[] } = {
            'Creative Engines': [],
            'Technical Engines': [],
        };
        const order: (keyof typeof categories)[] = ['Creative Engines', 'Technical Engines'];

        for (const feature of FEATURES) {
            if (feature.category in categories) {
                categories[feature.category].push(feature);
            }
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

    // If not authenticated, show the AuthScreen
    if (!isAuthenticated) {
        return <AuthScreen onLogin={handleLogin} />;
    }

    return (
        <div className="h-screen flex flex-col bg-slate-950 font-sans text-slate-100 animate-fadeIn">
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
                     <a href="#" onClick={(e) => { e.preventDefault(); setActiveFeature('marketplace'); }} title="Marketplace" className="p-2 rounded-full text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    </a>
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
                    
                    <div className="relative h-full">
                        {!activeFeature && (
                            <div className="space-y-12">
                                <div>
                                    <h1 className="text-4xl font-extrabold text-white mb-2">Welcome to AI Creative Suite</h1>
                                    <p className="text-lg text-slate-400 mb-8">The most advanced creative AI platform ever built.</p>
                                </div>
                                {categorizedFeatures.order.map(categoryName => (
                                    <div key={categoryName}>
                                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                                            {React.cloneElement(CATEGORY_DETAILS[categoryName].icon as React.ReactElement<any>, {className: "w-6 h-6 text-cyan-400"})}
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
                            <div className="h-full flex flex-col">
                                <div className="flex items-center space-x-4 mb-4 flex-shrink-0">
                                    <button onClick={() => setActiveFeature(null)} className="p-2 rounded-full bg-slate-800/70 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
                                    </button>
                                    <div>
                                        <h1 className="text-2xl font-bold text-white">{activeFeatureDetails.title}</h1>
                                        <p className="text-slate-400 text-sm">{activeFeatureDetails.description}</p>
                                    </div>
                                </div>
                                <div className="flex-grow min-h-0">
                                    <ActiveComponent onShare={openTrafficBooster} />
                                </div>
                            </div>
                        )}
                         {ActiveComponent && !activeFeatureDetails && activeFeature === 'pricing' && (
                             <div>
                                <Pricing />
                            </div>
                        )}
                        {ActiveComponent && !activeFeatureDetails && activeFeature === 'profile-settings' && (
                             <div>
                                <ProfileAndSettings onSignOut={handleLogout} />
                            </div>
                        )}
                        {ActiveComponent && !activeFeatureDetails && activeFeature === 'marketplace' && (
                             <div className="h-full">
                                <Marketplace />
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default App;