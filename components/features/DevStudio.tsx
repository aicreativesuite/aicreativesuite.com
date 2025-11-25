
import React, { useState, useRef, useEffect } from 'react';
import { generateVibeApp, reviewCode } from '../../services/geminiService';
import Loader from '../common/Loader';
import { Remarkable } from 'remarkable';

const md = new Remarkable({ html: true, breaks: true });

interface DevStudioProps {
    onShare: (options: { contentUrl?: string; contentText: string; contentType: 'text' }) => void;
}

// --- Sub-components Types ---
interface ReviewResult {
    summary: string;
    bugScore: number;
    securityScore: number;
    issues: any[];
    fixedCode: string;
}

const PROJECTS = [
    { id: 'current', name: 'Current Session Project', description: 'The app currently in the Vibe Editor' },
    { id: 'veo-video', name: 'Veo Video Tools', description: 'High-fidelity generative video suite' },
    { id: 'img-gen', name: 'AI Image Studio', description: 'Text-to-image generation platform' },
    { id: 'chatbot', name: 'Customer Support Bot', description: 'Intelligent conversational agent' },
];

const PLATFORMS = [
    { id: 'web', name: 'Website / PWA', icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg> },
    { id: 'android', name: 'Google Play Store', icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M3 20.5v-17c0-.83.67-1.5 1.5-1.5.3 0 .58.09.82.24l14.43 8.26c.83.48.83 1.52 0 2l-14.43 8.26c-.24.15-.52.24-.82.24-.83 0-1.5-.67-1.5-1.5z"/></svg> },
    { id: 'ios', name: 'Apple App Store', icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M17.62 15.38c-1.12 0-2.12.36-2.93.97-1.2.91-1.84 2.28-1.84 3.86 0 .12 0 .23.02.35H12.9c-.03-.28-.05-.57-.05-.86 0-4.2 3.4-7.6 7.6-7.6.29 0 .58.02.86.05v-.03c-1.58 0-2.95.64-3.86 1.84-.61.81-.97 1.81-.97 2.93l.01.28.13-.03c.36-.1.74-.16 1.13-.16 2.48 0 4.5 2.02 4.5 4.5 0 .39-.06.77-.16 1.13l-.03.13h.18c1.6 0 3.04-1.15 3.35-2.68-1.23.82-2.71 1.3-4.29 1.3zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg> },
    { id: 'windows', name: 'Microsoft Store', icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M2 3.5l9-1.3v9.4L2 12V3.5zm10-1.5l10-1.4v10.6l-10 .1V2zm0 11.1l10 .1v10.6l-10-1.4V13.1zM2 12.5l9 .5v9.4l-9-1.3v-8.6z"/></svg> },
    { id: 'macos', name: 'MacOS / Desktop', icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z"/></svg> },
    { id: 'linux', name: 'Linux (Snap/Flatpak)', icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M20 12c0-4.42-3.58-8-8-8S4 7.58 4 12s3.58 8 8 8 8-3.58 8-8zM8 12c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4-4-1.79-4-4z"/></svg> },
];

const DevStudio: React.FC<DevStudioProps> = ({ onShare }) => {
    const [activeTab, setActiveTab] = useState<'build' | 'audit' | 'deploy'>('build');
    
    // Shared State
    const [code, setCode] = useState('');
    
    // Build State (Vibe Coding)
    const [prompt, setPrompt] = useState('');
    const [isBuilding, setIsBuilding] = useState(false);
    const [buildError, setBuildError] = useState<string | null>(null);
    
    // Audit State (Terminal Architect)
    const [auditResult, setAuditResult] = useState<ReviewResult | null>(null);
    const [isAuditing, setIsAuditing] = useState(false);
    const [auditLogs, setAuditLogs] = useState<string[]>([]);
    const [auditTab, setAuditTab] = useState<'report' | 'fixed'>('report');
    const logIntervalRef = useRef<number | null>(null);
    const terminalBodyRef = useRef<HTMLDivElement>(null);

    // Deploy State (Launchpad)
    const [selectedProject, setSelectedProject] = useState(PROJECTS[0].id);
    const [customDomain, setCustomDomain] = useState('my-vibe-app.ai-creative.app');
    const [isEditingDomain, setIsEditingDomain] = useState(false);
    const [apiKeyStatus, setApiKeyStatus] = useState<'missing' | 'generating' | 'active'>('missing');
    const [generatedKey, setGeneratedKey] = useState('');
    const [publishingStatus, setPublishingStatus] = useState<Record<string, string>>({});
    const [deployLogs, setDeployLogs] = useState<string[]>([]);
    
    // Store Config States
    const [androidConfig, setAndroidConfig] = useState({ appId: 'com.vibe.app', version: '1.0.0', track: 'Internal Testing' });
    const [iosConfig, setIosConfig] = useState({ bundleId: 'com.vibe.app', version: '1.0.0', sku: 'SKU-001' });
    const [windowsConfig, setWindowsConfig] = useState({ publisherId: 'CN=MyPublisher', packageIdentity: 'MyVibeApp', version: '1.0.0.0' });
    const [macConfig, setMacConfig] = useState({ category: 'Productivity', bundleId: 'com.vibe.app.macos', version: '1.0.0' });
    const [linuxConfig, setLinuxConfig] = useState({ snapName: 'my-vibe-app', grade: 'devel', version: '1.0.0' });
    
    const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);

    // --- Build Handlers ---
    const handleBuild = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;
        setIsBuilding(true);
        setBuildError(null);
        setCode(''); // Clear previous code to show loading state clearly
        
        try {
            const response = await generateVibeApp(prompt);
            let generatedCode = response.text;
            generatedCode = generatedCode.replace(/^```html\s*/, '').replace(/```$/, '');
            setCode(generatedCode);
        } catch (err) {
            setBuildError('Failed to generate app code.');
            console.error(err);
        } finally {
            setIsBuilding(false);
        }
    };

    // --- Audit Handlers ---
    const startAuditLogs = () => {
        setAuditLogs(["Initializing static analysis..."]);
        const messages = [
            "Parsing Abstract Syntax Tree (AST)...",
            "Checking for OWASP Top 10...",
            "Scanning for memory leaks...",
            "Verifying type safety...",
            "Optimizing runtime performance...",
        ];
        let i = 0;
        logIntervalRef.current = window.setInterval(() => {
            if (i < messages.length) {
                setAuditLogs(prev => [...prev, `> ${messages[i]}`]);
                i++;
            }
        }, 800);
    };

    const handleAudit = async () => {
        if (!code.trim()) return;
        setIsAuditing(true);
        setAuditResult(null);
        startAuditLogs();

        try {
            const response = await reviewCode(code);
            const data = JSON.parse(response.text);
            setAuditResult(data);
        } catch (error) {
            setAuditLogs(prev => [...prev, "> ERROR: Analysis failed."]);
        } finally {
            if (logIntervalRef.current) clearInterval(logIntervalRef.current);
            setAuditLogs(prev => [...prev, "> Analysis Complete."]);
            setIsAuditing(false);
        }
    };

    // --- Deploy Handlers ---
    const addDeployLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setDeployLogs(prev => [`[${timestamp}] ${message}`, ...prev]);
    };

    const handleGenerateKey = () => {
        setApiKeyStatus('generating');
        addDeployLog(`Requesting new API Credential for project: ${PROJECTS.find(p => p.id === selectedProject)?.name}...`);
        setTimeout(() => {
            setApiKeyStatus('active');
            setGeneratedKey(`AIzaSy${Math.random().toString(36).substring(2, 15)}`);
            addDeployLog('API Key generated successfully.');
            addDeployLog('Billing linkage confirmed via Payment Gateway.');
        }, 2000);
    };

    const handlePublish = (platformId: string) => {
        if (apiKeyStatus !== 'active') {
            addDeployLog(`Error: Cannot publish to ${platformId}. Missing API Configuration.`);
            return;
        }
        
        // Validation for Configurable Platforms
        if (platformId === 'android' && (!androidConfig.appId || !androidConfig.version)) {
             addDeployLog(`Error: Android configuration missing.`);
             setExpandedPlatform('android');
             return;
        }
        if (platformId === 'ios' && (!iosConfig.bundleId || !iosConfig.version)) {
             addDeployLog(`Error: iOS configuration missing.`);
             setExpandedPlatform('ios');
             return;
        }
        if (platformId === 'windows' && (!windowsConfig.publisherId || !windowsConfig.packageIdentity)) {
             addDeployLog(`Error: Microsoft Store configuration missing.`);
             setExpandedPlatform('windows');
             return;
        }
        if (platformId === 'macos' && (!macConfig.bundleId)) {
             addDeployLog(`Error: MacOS configuration missing.`);
             setExpandedPlatform('macos');
             return;
        }
        if (platformId === 'linux' && (!linuxConfig.snapName)) {
             addDeployLog(`Error: Linux configuration missing.`);
             setExpandedPlatform('linux');
             return;
        }

        setPublishingStatus(prev => ({ ...prev, [platformId]: 'building' }));
        addDeployLog(`Starting build process for ${platformId.toUpperCase()}...`);
        
        setTimeout(() => {
            setPublishingStatus(prev => ({ ...prev, [platformId]: 'live' }));
            addDeployLog(`SUCCESS: ${platformId.toUpperCase()} deployment is LIVE.`);
        }, 3000);
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-900/50 px-6">
                {[
                    { id: 'build', label: '1. Vibe Coding', icon: '⚡' },
                    { id: 'audit', label: '2. Terminal Architect', icon: '🛡️' },
                    { id: 'deploy', label: '3. App Launchpad', icon: '🚀' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-6 py-4 text-sm font-bold flex items-center space-x-2 border-b-2 transition-colors ${
                            activeTab === tab.id 
                                ? 'border-cyan-500 text-cyan-400' 
                                : 'border-transparent text-slate-400 hover:text-white'
                        }`}
                    >
                        <span>{tab.icon}</span>
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className="flex-grow overflow-hidden bg-slate-950 p-6">
                {/* --- BUILD TAB --- */}
                {activeTab === 'build' && (
                    <div className="flex flex-col lg:flex-row gap-6 h-full">
                        <div className="w-full lg:w-1/3 flex flex-col gap-4">
                            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                                <h3 className="text-lg font-bold text-white mb-4">Generate App</h3>
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-yellow-500 min-h-[150px] resize-none mb-4"
                                    placeholder="Describe your app (e.g. A retro snake game with neon aesthetics)"
                                />
                                <button 
                                    onClick={handleBuild} 
                                    disabled={isBuilding}
                                    className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-bold py-3 rounded-lg hover:opacity-90 disabled:opacity-50 flex justify-center items-center"
                                >
                                    {isBuilding ? <Loader /> : 'Generate Code'}
                                </button>
                                {buildError && <p className="text-red-400 text-xs mt-2">{buildError}</p>}
                            </div>
                            {code && (
                                <div className="flex-grow bg-slate-900 rounded-xl border border-slate-800 flex flex-col overflow-hidden">
                                    <div className="p-2 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                                        <span className="text-xs text-slate-500 font-mono">source.html</span>
                                        <button onClick={() => {navigator.clipboard.writeText(code); alert('Copied!')}} className="text-xs text-cyan-400 hover:underline">Copy</button>
                                    </div>
                                    <textarea readOnly value={code} className="flex-grow bg-transparent p-3 text-xs font-mono text-slate-400 resize-none focus:outline-none" />
                                </div>
                            )}
                        </div>
                        <div className="w-full lg:w-2/3 bg-white rounded-xl border border-slate-700 overflow-hidden relative">
                            {!code ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                                    <p className="mb-2 text-4xl opacity-20">⚡</p>
                                    <p>App preview will appear here</p>
                                </div>
                            ) : (
                                <iframe srcDoc={code} className="w-full h-full" title="Preview" sandbox="allow-scripts allow-modals" />
                            )}
                            {isBuilding && (
                                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10">
                                    <Loader message="Coding your vibe..." />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* --- AUDIT TAB --- */}
                {activeTab === 'audit' && (
                    <div className="flex flex-col h-full gap-6">
                        <div className="flex-shrink-0 bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-white">Security & Logic Audit</h3>
                                <p className="text-xs text-slate-400">Reviewing code from Build tab.</p>
                            </div>
                            <button 
                                onClick={handleAudit} 
                                disabled={isAuditing || !code}
                                className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50 disabled:bg-slate-700"
                            >
                                {isAuditing ? 'Scanning...' : 'Run Audit'}
                            </button>
                        </div>

                        <div className="flex-grow flex gap-6 overflow-hidden">
                            {/* Code View */}
                            <div className="w-1/2 bg-slate-900 rounded-xl border border-slate-800 flex flex-col">
                                <div className="p-2 border-b border-slate-800 bg-slate-950 text-xs text-slate-500">Current Code Context</div>
                                <textarea 
                                    value={code} 
                                    onChange={(e) => setCode(e.target.value)} 
                                    className="flex-grow bg-transparent p-4 font-mono text-xs text-slate-300 resize-none focus:outline-none" 
                                    placeholder="// No code loaded. Go to Build tab or paste code here."
                                />
                            </div>

                            {/* Output View */}
                            <div className="w-1/2 bg-black rounded-xl border border-green-900/30 flex flex-col overflow-hidden relative">
                                {isAuditing ? (
                                    <div className="p-4 font-mono text-green-500 text-xs h-full overflow-y-auto" ref={terminalBodyRef}>
                                        {auditLogs.map((log, i) => <div key={i} className="mb-1">{log}</div>)}
                                        <div className="animate-pulse">_</div>
                                    </div>
                                ) : auditResult ? (
                                    <div className="flex flex-col h-full bg-slate-900">
                                        <div className="flex border-b border-slate-800">
                                            <button onClick={() => setAuditTab('report')} className={`flex-1 py-2 text-xs font-bold ${auditTab === 'report' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500'}`}>Report</button>
                                            <button onClick={() => setAuditTab('fixed')} className={`flex-1 py-2 text-xs font-bold ${auditTab === 'fixed' ? 'text-green-400 border-b-2 border-green-400' : 'text-slate-500'}`}>Fixed Code</button>
                                        </div>
                                        <div className="flex-grow overflow-y-auto p-4">
                                            {auditTab === 'report' ? (
                                                <div className="space-y-4">
                                                    <div className="flex gap-4">
                                                        <div className="flex-1 bg-slate-800 p-3 rounded border border-slate-700">
                                                            <div className="text-xs text-slate-400 uppercase">Bug Score</div>
                                                            <div className={`text-xl font-bold ${auditResult.bugScore > 80 ? 'text-green-400' : 'text-yellow-400'}`}>{auditResult.bugScore}/100</div>
                                                        </div>
                                                        <div className="flex-1 bg-slate-800 p-3 rounded border border-slate-700">
                                                            <div className="text-xs text-slate-400 uppercase">Sec Score</div>
                                                            <div className={`text-xl font-bold ${auditResult.securityScore > 80 ? 'text-green-400' : 'text-yellow-400'}`}>{auditResult.securityScore}/100</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-sm text-slate-300">{auditResult.summary}</div>
                                                    <div className="space-y-2">
                                                        {auditResult.issues.map((issue, i) => (
                                                            <div key={i} className="p-3 bg-slate-800/50 rounded border border-slate-700">
                                                                <div className="flex justify-between mb-1">
                                                                    <span className="text-xs font-bold text-red-400">{issue.severity}</span>
                                                                    <span className="text-xs text-slate-500">{issue.type}</span>
                                                                </div>
                                                                <p className="text-xs text-white">{issue.description}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <pre className="text-xs font-mono text-green-300 whitespace-pre-wrap">{auditResult.fixedCode}</pre>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-slate-600 text-xs">Ready to audit</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- DEPLOY TAB --- */}
                {activeTab === 'deploy' && (
                    <div className="flex flex-col lg:flex-row gap-8 h-full">
                        {/* Config */}
                        <div className="w-full lg:w-1/3 space-y-6 overflow-y-auto custom-scrollbar">
                            <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
                                <h4 className="text-sm font-bold text-slate-300 uppercase mb-4">Select Project</h4>
                                <select 
                                    value={selectedProject} 
                                    onChange={(e) => setSelectedProject(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white mb-2"
                                >
                                    {PROJECTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                                <p className="text-xs text-slate-500">{PROJECTS.find(p => p.id === selectedProject)?.description}</p>
                            </div>

                            <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
                                <h4 className="text-sm font-bold text-slate-300 uppercase mb-4">Domain & Endpoint</h4>
                                <div className="flex">
                                    <input 
                                        type="text" 
                                        value={customDomain} 
                                        onChange={(e) => setCustomDomain(e.target.value)}
                                        disabled={!isEditingDomain}
                                        className="flex-grow bg-slate-800 border border-slate-600 rounded-l-lg p-2 text-white text-sm font-mono"
                                    />
                                    <button onClick={() => setIsEditingDomain(!isEditingDomain)} className="bg-slate-700 px-3 rounded-r-lg text-xs font-bold hover:bg-slate-600">
                                        {isEditingDomain ? 'SAVE' : 'EDIT'}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
                                <h4 className="text-sm font-bold text-slate-300 uppercase mb-4">API Configuration</h4>
                                <div className="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-700 mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-slate-700 rounded text-cyan-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                                                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm text-white font-bold">Payment Gateway</p>
                                            <p className="text-xs text-green-400 flex items-center">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span>
                                                Credit & Debit Cards Linked
                                            </p>
                                        </div>
                                    </div>
                                    <button className="text-xs text-slate-400 hover:text-white underline">Manage</button>
                                </div>
                                
                                {apiKeyStatus === 'missing' ? (
                                    <button onClick={handleGenerateKey} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-lg transition">
                                        Auto-Generate API Keys
                                    </button>
                                ) : apiKeyStatus === 'generating' ? (
                                    <div className="text-center"><Loader /></div>
                                ) : (
                                    <div className="bg-slate-800 p-2 rounded border border-green-500/30 flex items-center">
                                        <code className="text-green-400 text-xs flex-grow font-mono">{generatedKey.substring(0, 12)}****************</code>
                                        <span className="text-xs bg-green-900 text-green-300 px-2 rounded">Active</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Platforms & Console */}
                        <div className="w-full lg:w-2/3 flex flex-col gap-6">
                            <div className="grid grid-cols-1 gap-4">
                                <h4 className="text-sm font-bold text-slate-300 uppercase">Target Platforms</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {PLATFORMS.map(platform => {
                                        const status = publishingStatus[platform.id] || 'idle';
                                        const isExpanded = expandedPlatform === platform.id;
                                        const isConfigurable = platform.id !== 'web';

                                        return (
                                            <div key={platform.id} className={`p-4 rounded-xl border transition-all duration-300 ${status === 'live' ? 'bg-green-900/20 border-green-500/50' : 'bg-slate-900 border-slate-700'} ${isExpanded ? 'md:col-span-3 bg-slate-800' : ''}`}>
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="text-cyan-400">{platform.icon}</div>
                                                        <h4 className="font-bold text-white text-sm">{platform.name}</h4>
                                                    </div>
                                                    {isConfigurable && (
                                                        <button 
                                                            onClick={() => setExpandedPlatform(isExpanded ? null : platform.id)}
                                                            className="text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded"
                                                        >
                                                            {isExpanded ? 'Close Config' : 'Configure'}
                                                        </button>
                                                    )}
                                                </div>

                                                {isExpanded && platform.id === 'android' && (
                                                    <div className="mb-4 p-4 bg-slate-900 rounded-lg border border-slate-700 space-y-3 animate-fadeIn">
                                                        <h5 className="text-xs font-bold text-slate-400 uppercase">Android Configuration</h5>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                            <div>
                                                                <label className="block text-[10px] text-slate-500 mb-1">Application ID</label>
                                                                <input type="text" value={androidConfig.appId} onChange={e => setAndroidConfig({...androidConfig, appId: e.target.value})} className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-xs text-white" />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] text-slate-500 mb-1">Version Name</label>
                                                                <input type="text" value={androidConfig.version} onChange={e => setAndroidConfig({...androidConfig, version: e.target.value})} className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-xs text-white" />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] text-slate-500 mb-1">Release Track</label>
                                                                <select value={androidConfig.track} onChange={e => setAndroidConfig({...androidConfig, track: e.target.value})} className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-xs text-white">
                                                                    <option>Internal Testing</option>
                                                                    <option>Closed Alpha</option>
                                                                    <option>Open Beta</option>
                                                                    <option>Production</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-between items-center pt-2">
                                                            <span className="text-xs text-green-400">Keystore: Auto-Signed (Managed)</span>
                                                            <button onClick={() => setExpandedPlatform(null)} className="text-xs bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded">Save Config</button>
                                                        </div>
                                                    </div>
                                                )}

                                                {isExpanded && platform.id === 'ios' && (
                                                    <div className="mb-4 p-4 bg-slate-900 rounded-lg border border-slate-700 space-y-3 animate-fadeIn">
                                                        <h5 className="text-xs font-bold text-slate-400 uppercase">iOS Configuration</h5>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                            <div>
                                                                <label className="block text-[10px] text-slate-500 mb-1">Bundle Identifier</label>
                                                                <input type="text" value={iosConfig.bundleId} onChange={e => setIosConfig({...iosConfig, bundleId: e.target.value})} className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-xs text-white" />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] text-slate-500 mb-1">Version String</label>
                                                                <input type="text" value={iosConfig.version} onChange={e => setIosConfig({...iosConfig, version: e.target.value})} className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-xs text-white" />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] text-slate-500 mb-1">SKU / Product ID</label>
                                                                <input type="text" value={iosConfig.sku} onChange={e => setIosConfig({...iosConfig, sku: e.target.value})} className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-xs text-white" />
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-between items-center pt-2">
                                                            <span className="text-xs text-green-400">Profile: Distribution (Managed)</span>
                                                            <button onClick={() => setExpandedPlatform(null)} className="text-xs bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded">Save Config</button>
                                                        </div>
                                                    </div>
                                                )}

                                                {isExpanded && platform.id === 'windows' && (
                                                    <div className="mb-4 p-4 bg-slate-900 rounded-lg border border-slate-700 space-y-3 animate-fadeIn">
                                                        <h5 className="text-xs font-bold text-slate-400 uppercase">Windows Store Configuration</h5>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                            <div>
                                                                <label className="block text-[10px] text-slate-500 mb-1">Publisher ID</label>
                                                                <input type="text" value={windowsConfig.publisherId} onChange={e => setWindowsConfig({...windowsConfig, publisherId: e.target.value})} className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-xs text-white" />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] text-slate-500 mb-1">Package Identity</label>
                                                                <input type="text" value={windowsConfig.packageIdentity} onChange={e => setWindowsConfig({...windowsConfig, packageIdentity: e.target.value})} className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-xs text-white" />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] text-slate-500 mb-1">Version</label>
                                                                <input type="text" value={windowsConfig.version} onChange={e => setWindowsConfig({...windowsConfig, version: e.target.value})} className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-xs text-white" />
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-between items-center pt-2">
                                                            <span className="text-xs text-green-400">Certificate: Auto-Generated (PFX)</span>
                                                            <button onClick={() => setExpandedPlatform(null)} className="text-xs bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded">Save Config</button>
                                                        </div>
                                                    </div>
                                                )}

                                                {isExpanded && platform.id === 'macos' && (
                                                    <div className="mb-4 p-4 bg-slate-900 rounded-lg border border-slate-700 space-y-3 animate-fadeIn">
                                                        <h5 className="text-xs font-bold text-slate-400 uppercase">MacOS Configuration</h5>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                            <div>
                                                                <label className="block text-[10px] text-slate-500 mb-1">App Category</label>
                                                                <input type="text" value={macConfig.category} onChange={e => setMacConfig({...macConfig, category: e.target.value})} className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-xs text-white" />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] text-slate-500 mb-1">Bundle ID</label>
                                                                <input type="text" value={macConfig.bundleId} onChange={e => setMacConfig({...macConfig, bundleId: e.target.value})} className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-xs text-white" />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] text-slate-500 mb-1">Version</label>
                                                                <input type="text" value={macConfig.version} onChange={e => setMacConfig({...macConfig, version: e.target.value})} className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-xs text-white" />
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-between items-center pt-2">
                                                            <span className="text-xs text-green-400">Notarization: Enabled</span>
                                                            <button onClick={() => setExpandedPlatform(null)} className="text-xs bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded">Save Config</button>
                                                        </div>
                                                    </div>
                                                )}

                                                {isExpanded && platform.id === 'linux' && (
                                                    <div className="mb-4 p-4 bg-slate-900 rounded-lg border border-slate-700 space-y-3 animate-fadeIn">
                                                        <h5 className="text-xs font-bold text-slate-400 uppercase">Linux Snap/Flatpak Config</h5>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                            <div>
                                                                <label className="block text-[10px] text-slate-500 mb-1">Snap Name</label>
                                                                <input type="text" value={linuxConfig.snapName} onChange={e => setLinuxConfig({...linuxConfig, snapName: e.target.value})} className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-xs text-white" />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] text-slate-500 mb-1">Grade</label>
                                                                <select value={linuxConfig.grade} onChange={e => setLinuxConfig({...linuxConfig, grade: e.target.value})} className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-xs text-white">
                                                                    <option value="stable">Stable</option>
                                                                    <option value="devel">Development</option>
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] text-slate-500 mb-1">Version</label>
                                                                <input type="text" value={linuxConfig.version} onChange={e => setLinuxConfig({...linuxConfig, version: e.target.value})} className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-xs text-white" />
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-between items-center pt-2">
                                                            <span className="text-xs text-green-400">Channel: Edge/Beta/Stable</span>
                                                            <button onClick={() => setExpandedPlatform(null)} className="text-xs bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded">Save Config</button>
                                                        </div>
                                                    </div>
                                                )}

                                                {status === 'idle' && (
                                                    <button 
                                                        onClick={() => handlePublish(platform.id)}
                                                        disabled={apiKeyStatus !== 'active'}
                                                        className="w-full py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition"
                                                    >
                                                        {apiKeyStatus === 'active' ? 'Publish' : 'Config Required'}
                                                    </button>
                                                )}
                                                {status === 'live' && (
                                                    <div className="w-full py-2 bg-green-600/20 text-green-400 text-xs font-bold rounded text-center border border-green-500/30">Live</div>
                                                )}
                                                {status === 'building' && <div className="text-xs text-center text-slate-400 animate-pulse">Deploying...</div>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex-grow bg-black/50 rounded-xl border border-slate-800 p-4 font-mono text-xs overflow-hidden flex flex-col h-48">
                                <div className="text-slate-500 mb-2 border-b border-slate-800 pb-1">DEPLOYMENT CONSOLE</div>
                                <div className="flex-grow overflow-y-auto custom-scrollbar">
                                    {deployLogs.length === 0 && <span className="text-slate-600 italic">Ready to deploy...</span>}
                                    {deployLogs.map((log, i) => <div key={i} className="text-slate-300 mb-1">{log}</div>)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DevStudio;
