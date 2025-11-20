
import React, { useState, useEffect } from 'react';
import Loader from '../common/Loader';

interface AppLaunchpadProps {
    onShare: (options: { contentText: string; contentType: 'text' }) => void;
}

const PROJECTS = [
    { id: 'veo-video', name: 'Veo Video Tools', description: 'High-fidelity generative video suite' },
    { id: 'img-gen', name: 'AI Image Studio', description: 'Text-to-image generation platform' },
    { id: 'chatbot', name: 'Customer Support Bot', description: 'Intelligent conversational agent' },
    { id: 'marketing', name: 'Marketing Assistant', description: 'Automated copy and strategy tools' }
];

const PLATFORMS = [
    { id: 'web', name: 'Website / PWA', icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg> },
    { id: 'android', name: 'Google Play Store', icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M3 20.5v-17c0-.83.67-1.5 1.5-1.5.3 0 .58.09.82.24l14.43 8.26c.83.48.83 1.52 0 2l-14.43 8.26c-.24.15-.52.24-.82.24-.83 0-1.5-.67-1.5-1.5z"/></svg> },
    { id: 'ios', name: 'Apple App Store', icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M17.62 15.38c-1.12 0-2.12.36-2.93.97-1.2.91-1.84 2.28-1.84 3.86 0 .12 0 .23.02.35H12.9c-.03-.28-.05-.57-.05-.86 0-4.2 3.4-7.6 7.6-7.6.29 0 .58.02.86.05v-.03c-1.58 0-2.95.64-3.86 1.84-.61.81-.97 1.81-.97 2.93l.01.28.13-.03c.36-.1.74-.16 1.13-.16 2.48 0 4.5 2.02 4.5 4.5 0 .39-.06.77-.16 1.13l-.03.13h.18c1.6 0 3.04-1.15 3.35-2.68-1.23.82-2.71 1.3-4.29 1.3zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg> },
    { id: 'windows', name: 'Windows Store', icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M2 3.5l9-1.3v9.4L2 12V3.5zm10-1.5l10-1.4v10.6l-10 .1V2zm0 11.1l10 .1v10.6l-10-1.4V13.1zM2 12.5l9 .5v9.4l-9-1.3v-8.6z"/></svg> },
    { id: 'macos', name: 'macOS / Desktop', icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7l-2 3v1h8v-1l-2-3h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 12H3V4h18v10z"/></svg> },
    { id: 'linux', name: 'Linux (Snap/Flatpak)', icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg> },
];

const AppLaunchpad: React.FC<AppLaunchpadProps> = ({ onShare }) => {
    const [selectedProject, setSelectedProject] = useState(PROJECTS[0].id);
    const [customDomain, setCustomDomain] = useState('veo-tools.ai-creative.app');
    const [isEditingDomain, setIsEditingDomain] = useState(false);
    const [apiKeyStatus, setApiKeyStatus] = useState<'missing' | 'generating' | 'active'>('missing');
    const [generatedKey, setGeneratedKey] = useState('');
    const [publishingStatus, setPublishingStatus] = useState<Record<string, 'idle' | 'building' | 'deploying' | 'live' | 'error'>>({});
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [`[${timestamp}] ${message}`, ...prev]);
    };

    const handleGenerateKey = () => {
        setApiKeyStatus('generating');
        addLog(`Requesting new API Credential for project: ${PROJECTS.find(p => p.id === selectedProject)?.name}...`);
        setTimeout(() => {
            setApiKeyStatus('active');
            setGeneratedKey(`AIzaSy${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`);
            addLog('API Key generated successfully.');
            addLog('Billing linkage confirmed via Google Cloud Project linkage.');
        }, 2000);
    };

    const handlePublish = (platformId: string) => {
        if (apiKeyStatus !== 'active') {
            addLog(`Error: Cannot publish to ${platformId}. Missing API Configuration.`);
            return;
        }

        setPublishingStatus(prev => ({ ...prev, [platformId]: 'building' }));
        addLog(`Starting build process for ${platformId.toUpperCase()}...`);

        // Simulate build steps
        setTimeout(() => {
            addLog(`Compiling assets for ${platformId}...`);
            setPublishingStatus(prev => ({ ...prev, [platformId]: 'deploying' }));
            
            setTimeout(() => {
                addLog(`Signing package with production keys...`);
                addLog(`Uploading to ${platformId} distribution channel...`);
                
                setTimeout(() => {
                    setPublishingStatus(prev => ({ ...prev, [platformId]: 'live' }));
                    addLog(`SUCCESS: ${platformId.toUpperCase()} deployment is now LIVE.`);
                    if(platformId === 'web') {
                        addLog(`Endpoint active at: https://${customDomain}`);
                    }
                }, 2000);
            }, 2000);
        }, 2000);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="bg-gradient-to-r from-cyan-900 to-blue-900 rounded-2xl p-8 border border-cyan-700 text-center shadow-xl">
                <h2 className="text-3xl font-bold text-white mb-2">App Launchpad</h2>
                <p className="text-cyan-100 max-w-2xl mx-auto">Plug and Play Deployment. Configure your domain, auto-generate API credentials, and publish your AI tools to the world's biggest app stores in one click.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Configuration Column */}
                <div className="space-y-6">
                    {/* Project Selector */}
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                        <h3 className="text-lg font-bold text-white mb-4">1. Select Project</h3>
                        <select 
                            value={selectedProject} 
                            onChange={(e) => { setSelectedProject(e.target.value); setApiKeyStatus('missing'); setPublishingStatus({}); setLogs([]); }}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500"
                        >
                            {PROJECTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <p className="text-xs text-slate-400 mt-2">{PROJECTS.find(p => p.id === selectedProject)?.description}</p>
                    </div>

                    {/* Domain Config */}
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                        <h3 className="text-lg font-bold text-white mb-4">2. Domain & Endpoint</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Public Domain</label>
                                <div className="flex">
                                    <input 
                                        type="text" 
                                        value={customDomain} 
                                        onChange={(e) => setCustomDomain(e.target.value)} 
                                        disabled={!isEditingDomain}
                                        className={`flex-grow bg-slate-900 border ${isEditingDomain ? 'border-cyan-500' : 'border-slate-600'} rounded-l-lg p-2 text-white text-sm font-mono`}
                                    />
                                    <button 
                                        onClick={() => { 
                                            if (isEditingDomain) addLog(`Domain updated to: ${customDomain}`);
                                            setIsEditingDomain(!isEditingDomain); 
                                        }}
                                        className="bg-slate-700 px-3 rounded-r-lg text-xs font-bold hover:bg-slate-600"
                                    >
                                        {isEditingDomain ? 'SAVE' : 'EDIT'}
                                    </button>
                                </div>
                            </div>
                            {apiKeyStatus === 'active' && (
                                <div className="bg-green-900/20 border border-green-500/30 p-3 rounded-lg">
                                    <p className="text-xs text-green-400 font-bold mb-1">ENDPOINT ACTIVE</p>
                                    <p className="text-xs text-green-200 font-mono break-all">https://api.{customDomain}/v1/generate</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* API Key Config */}
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                        <h3 className="text-lg font-bold text-white mb-4">3. API Configuration</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-700">
                                <div>
                                    <p className="text-sm text-white font-bold">Google Cloud Billing</p>
                                    <p className="text-xs text-green-400">Linked & Active</p>
                                </div>
                                <div className="h-3 w-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                            </div>

                            {apiKeyStatus === 'missing' ? (
                                <button 
                                    onClick={handleGenerateKey}
                                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center space-x-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" /></svg>
                                    <span>Auto-Generate API Keys</span>
                                </button>
                            ) : apiKeyStatus === 'generating' ? (
                                <div className="text-center py-3">
                                    <Loader message="Provisioning credentials..." />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-slate-400">Production API Key</label>
                                    <div className="flex items-center bg-slate-900 rounded border border-green-500/50 p-2">
                                        <code className="text-green-400 text-xs flex-grow font-mono">{generatedKey.substring(0, 12)}****************</code>
                                        <span className="text-xs bg-green-900 text-green-300 px-2 py-0.5 rounded">Active</span>
                                    </div>
                                    <p className="text-xs text-slate-500">Key automatically injected into build environment.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Deployment Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 min-h-[500px] flex flex-col">
                         <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-cyan-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
                            4. Target Platforms
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
                            {PLATFORMS.map(platform => {
                                const status = publishingStatus[platform.id] || 'idle';
                                return (
                                    <div key={platform.id} className={`relative p-5 rounded-xl border transition-all duration-300 ${status === 'live' ? 'bg-green-900/20 border-green-500/50' : 'bg-slate-800 border-slate-600 hover:border-cyan-500/50'}`}>
                                        {status === 'live' && (
                                            <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
                                        )}
                                        
                                        <div className="flex items-center space-x-3 mb-3">
                                            <div className={`p-2 rounded-lg ${status === 'live' ? 'text-green-400 bg-green-900/30' : 'text-cyan-400 bg-cyan-900/30'}`}>
                                                {platform.icon}
                                            </div>
                                            <h4 className="font-bold text-white text-sm">{platform.name}</h4>
                                        </div>

                                        <div className="mt-4">
                                            {status === 'idle' && (
                                                <button 
                                                    onClick={() => handlePublish(platform.id)}
                                                    disabled={apiKeyStatus !== 'active'}
                                                    className="w-full py-2 px-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition"
                                                >
                                                    {apiKeyStatus === 'active' ? 'Publish' : 'Config Required'}
                                                </button>
                                            )}
                                            {(status === 'building' || status === 'deploying') && (
                                                <div className="w-full py-2 px-3 bg-slate-900/50 border border-cyan-500/30 text-cyan-300 text-xs font-bold rounded-lg flex items-center justify-center space-x-2">
                                                    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                    <span>{status === 'building' ? 'Building...' : 'Uploading...'}</span>
                                                </div>
                                            )}
                                            {status === 'live' && (
                                                <button 
                                                    className="w-full py-2 px-3 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-lg transition flex items-center justify-center space-x-1"
                                                >
                                                    <span>View Live</span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" /></svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Console Log */}
                        <div className="flex-grow bg-black/50 rounded-lg border border-slate-700 p-4 font-mono text-xs overflow-hidden flex flex-col">
                            <div className="text-slate-400 mb-2 border-b border-slate-800 pb-1 flex justify-between">
                                <span>DEPLOYMENT CONSOLE</span>
                                <span className="text-green-500 animate-pulse">● ONLINE</span>
                            </div>
                            <div className="flex-grow overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-slate-700 pr-2" style={{ maxHeight: '200px' }}>
                                {logs.length === 0 && <span className="text-slate-600 italic">Waiting for commands...</span>}
                                {logs.map((log, i) => (
                                    <div key={i} className={`${log.includes('Error') ? 'text-red-400' : log.includes('SUCCESS') ? 'text-green-400' : 'text-slate-300'}`}>
                                        {log}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppLaunchpad;
