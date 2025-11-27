
import React, { useState } from 'react';
import ImageUploader from '../common/ImageUploader';
import { generateImage, generateBrandGuidelines, analyzeLayoutForResize, editImage } from '../../services/geminiService';
import Loader from '../common/Loader';
import { Remarkable } from 'remarkable';
import { fileToBase64 } from '../../utils';

const md = new Remarkable({ html: true });

interface BrandKitProps {
    onShare: (options: { contentText: string; contentType: 'text' }) => void;
}

interface BrandProfile {
    id: string;
    name: string;
    colors: { primary: string; secondary: string; accent: string };
    fonts: { heading: string; body: string };
    logo: string | null;
}

const DEFAULT_BRAND: BrandProfile = {
    id: 'default',
    name: 'Acme Corp',
    colors: { primary: '#06b6d4', secondary: '#334155', accent: '#f472b6' },
    fonts: { heading: 'Inter', body: 'Roboto' },
    logo: null
};

const SOCIAL_PLATFORMS = [
    { name: 'Instagram Story', ratio: '9:16', icon: '📸' },
    { name: 'Instagram Post', ratio: '1:1', icon: '🖼️' },
    { name: 'LinkedIn Post', ratio: '4:5', icon: '💼' },
    { name: 'Twitter Header', ratio: '3:1', icon: '🐦' },
    { name: 'YouTube Thumbnail', ratio: '16:9', icon: '▶️' },
    { name: 'TikTok Video', ratio: '9:16', icon: '🎵' }
];

const FONTS = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Playfair Display', 'Merriweather'];

const BrandKit: React.FC<BrandKitProps> = ({ onShare }) => {
    const [activeTab, setActiveTab] = useState<'identity' | 'create' | 'tools' | 'workflow'>('identity');
    const [brands, setBrands] = useState<BrandProfile[]>([DEFAULT_BRAND]);
    const [activeBrandId, setActiveBrandId] = useState<string>('default');
    
    // Feature States
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);
    
    // Magic Switch Inputs
    const [magicInput, setMagicInput] = useState('');
    const [magicImage, setMagicImage] = useState<File | null>(null);
    const [targetPlatform, setTargetPlatform] = useState(SOCIAL_PLATFORMS[0].name);

    // Tools Inputs
    const [logoReplaceImage, setLogoReplaceImage] = useState<File | null>(null);

    const activeBrand = brands.find(b => b.id === activeBrandId) || DEFAULT_BRAND;

    const updateBrand = (updates: Partial<BrandProfile>) => {
        setBrands(prev => prev.map(b => b.id === activeBrandId ? { ...b, ...updates } : b));
    };

    const handleGenerateGuidelines = async () => {
        setLoading(true);
        setResult(null);
        try {
            const response = await generateBrandGuidelines(activeBrand);
            setResult(response.text);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleMagicSwitch = async () => {
        if (!magicInput && !magicImage) return;
        setLoading(true);
        setResultImage(null);
        try {
            let imageBase64 = undefined;
            if (magicImage) {
                imageBase64 = await fileToBase64(magicImage);
            }
            
            // 1. Analyze and get prompt
            const analysisRes = await analyzeLayoutForResize(targetPlatform, magicInput, imageBase64);
            const prompt = analysisRes.text;
            
            // 2. Generate new image
            const platform = SOCIAL_PLATFORMS.find(p => p.name === targetPlatform);
            const imageBytes = await generateImage(`${prompt} using brand colors ${activeBrand.colors.primary}, ${activeBrand.colors.secondary}.`, platform?.ratio || '1:1');
            setResultImage(`data:image/jpeg;base64,${imageBytes}`);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleLogoReplace = async () => {
        if (!logoReplaceImage) return;
        setLoading(true);
        setResultImage(null);
        try {
            const base64 = await fileToBase64(logoReplaceImage);
            const prompt = "Replace existing logo in this image with a generic modern logo placeholder that matches the new brand aesthetic.";
            const editedBase64 = await editImage(prompt, base64, logoReplaceImage.type);
            
            if (editedBase64) {
                setResultImage(`data:image/png;base64,${editedBase64}`);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // Helper components for local use
    const ColorSwatch = ({ label, color, onChange }: { label: string, color: string, onChange: (c: string) => void }) => (
        <div className="flex flex-col items-center gap-2 group">
            <div className="relative w-16 h-16 rounded-full shadow-lg border-4 border-slate-800 transition-transform group-hover:scale-105" style={{ backgroundColor: color }}>
                <input 
                    type="color" 
                    value={color} 
                    onChange={(e) => onChange(e.target.value)} 
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                />
            </div>
            <div className="text-center">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
                <span className="block text-xs text-slate-500 font-mono mt-1 bg-slate-900 px-2 py-0.5 rounded">{color}</span>
            </div>
        </div>
    );

    const NavButton = ({ id, label, icon }: { id: typeof activeTab, label: string, icon: any }) => (
        <button
            onClick={() => { setActiveTab(id); setResult(null); setResultImage(null); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === id ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
        >
            <span className="text-xl">{icon}</span>
            <span className="font-medium text-sm">{label}</span>
        </button>
    );

    return (
        <div className="flex h-[calc(100vh-8rem)] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0">
                <div className="p-6 border-b border-slate-800">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Active Brand</label>
                    <div className="relative">
                        <select 
                            value={activeBrandId} 
                            onChange={(e) => setActiveBrandId(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:ring-2 focus:ring-cyan-500 appearance-none"
                        >
                            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                        <div className="absolute right-3 top-3 pointer-events-none text-slate-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                    <button 
                        onClick={() => {
                            const newId = Date.now().toString();
                            setBrands([...brands, { ...DEFAULT_BRAND, id: newId, name: `Brand ${brands.length + 1}` }]);
                            setActiveBrandId(newId);
                        }}
                        className="mt-3 w-full py-2 text-xs font-bold text-cyan-400 border border-dashed border-cyan-900 rounded hover:bg-cyan-900/20 transition"
                    >
                        + Create New Brand
                    </button>
                </div>
                
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <NavButton id="identity" label="Brand Identity" icon="🎨" />
                    <NavButton id="create" label="Magic Create" icon="✨" />
                    <NavButton id="tools" label="Smart Tools" icon="🔧" />
                    <NavButton id="workflow" label="Workflow" icon="⚙️" />
                </nav>

                <div className="p-4 bg-slate-900 border-t border-slate-800">
                    <div className="bg-slate-800 rounded-lg p-3">
                        <p className="text-xs text-slate-400 mb-1">Storage Used</p>
                        <div className="w-full bg-slate-700 rounded-full h-1.5 mb-2">
                            <div className="bg-cyan-500 h-1.5 rounded-full w-3/4"></div>
                        </div>
                        <p className="text-[10px] text-slate-500 text-right">750MB / 1GB</p>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-slate-950 p-8 relative">
                {/* Background Decoration */}
                <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-slate-900 to-transparent pointer-events-none"></div>

                {activeTab === 'identity' && (
                    <div className="max-w-5xl mx-auto space-y-8 relative z-10 animate-fadeIn">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-2">Brand Identity</h2>
                                <p className="text-slate-400">Define the visual DNA of <span className="text-white font-semibold">{activeBrand.name}</span>.</p>
                            </div>
                            <div className="flex -space-x-2">
                                {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-950 bg-slate-700 flex items-center justify-center text-xs">User</div>)}
                                <div className="w-8 h-8 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center text-xs text-slate-400">+2</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Logo Section */}
                            <div className="lg:col-span-1 bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center">
                                    <span className="w-2 h-2 rounded-full bg-cyan-500 mr-2"></span> Logo Asset
                                </h3>
                                <div className="flex-grow flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-950 rounded-xl border-2 border-dashed border-slate-800 mb-4 min-h-[200px] relative group overflow-hidden">
                                    {activeBrand.logo ? (
                                        <>
                                            <img src={activeBrand.logo} alt="Brand Logo" className="max-w-[80%] max-h-[80%] object-contain drop-shadow-2xl" />
                                            <button 
                                                onClick={() => updateBrand({ logo: null })}
                                                className="absolute top-2 right-2 p-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500 hover:text-white transition opacity-0 group-hover:opacity-100"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </>
                                    ) : (
                                        <div className="text-center p-4">
                                            <div className="mb-2 text-4xl opacity-50">💎</div>
                                            <p className="text-xs text-slate-500">Drag logo here or upload</p>
                                        </div>
                                    )}
                                    {!activeBrand.logo && (
                                        <div className="absolute inset-0 opacity-0 cursor-pointer">
                                            <ImageUploader 
                                                onImageUpload={async (file) => {
                                                    const base64 = await fileToBase64(file);
                                                    updateBrand({ logo: `data:image/png;base64,${base64}` });
                                                }} 
                                                onImageClear={() => updateBrand({ logo: null })} 
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-between items-center text-xs text-slate-500 px-1">
                                    <span>Recommended: PNG, SVG</span>
                                    <span>Max 5MB</span>
                                </div>
                            </div>

                            {/* Typography & Colors */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Colors */}
                                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center">
                                        <span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span> Color Palette
                                    </h3>
                                    <div className="flex flex-wrap gap-8 justify-center sm:justify-start">
                                        <ColorSwatch 
                                            label="Primary" 
                                            color={activeBrand.colors.primary} 
                                            onChange={(c) => updateBrand({ colors: { ...activeBrand.colors, primary: c } })} 
                                        />
                                        <ColorSwatch 
                                            label="Secondary" 
                                            color={activeBrand.colors.secondary} 
                                            onChange={(c) => updateBrand({ colors: { ...activeBrand.colors, secondary: c } })} 
                                        />
                                        <ColorSwatch 
                                            label="Accent" 
                                            color={activeBrand.colors.accent} 
                                            onChange={(c) => updateBrand({ colors: { ...activeBrand.colors, accent: c } })} 
                                        />
                                        <div className="flex items-center justify-center w-16 h-16 rounded-full border-2 border-dashed border-slate-700 text-slate-500 hover:text-white hover:border-slate-500 cursor-pointer transition">
                                            <span className="text-2xl">+</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Typography */}
                                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center">
                                        <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span> Typography
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-xs text-slate-500 block mb-2">Heading Font</label>
                                            <select 
                                                value={activeBrand.fonts.heading} 
                                                onChange={(e) => updateBrand({ fonts: { ...activeBrand.fonts, heading: e.target.value } })} 
                                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-sm"
                                            >
                                                {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                                            </select>
                                            <div className="mt-4 p-4 bg-slate-950/50 rounded border border-slate-800 h-24 flex items-center justify-center">
                                                <span className="text-2xl" style={{ fontFamily: activeBrand.fonts.heading }}>The quick brown fox</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 block mb-2">Body Font</label>
                                            <select 
                                                value={activeBrand.fonts.body} 
                                                onChange={(e) => updateBrand({ fonts: { ...activeBrand.fonts, body: e.target.value } })} 
                                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-sm"
                                            >
                                                {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                                            </select>
                                            <div className="mt-4 p-4 bg-slate-950/50 rounded border border-slate-800 h-24 flex items-center justify-center">
                                                <span className="text-sm text-slate-400" style={{ fontFamily: activeBrand.fonts.body }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'create' && (
                    <div className="max-w-6xl mx-auto h-full flex flex-col animate-fadeIn">
                        <div className="mb-6">
                            <h2 className="text-3xl font-bold text-white mb-2">Magic Create</h2>
                            <p className="text-slate-400">Generate on-brand assets for any platform in seconds.</p>
                        </div>

                        <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
                            {/* Controls Left */}
                            <div className="lg:col-span-4 flex flex-col gap-6">
                                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">1. Your Idea</label>
                                        <textarea 
                                            value={magicInput} 
                                            onChange={(e) => setMagicInput(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm h-32 resize-none focus:ring-2 focus:ring-cyan-500"
                                            placeholder="e.g. A vibrant summer sale banner featuring sunglasses..."
                                        />
                                    </div>
                                    
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                            <div className="w-full border-t border-slate-800"></div>
                                        </div>
                                        <div className="relative flex justify-center">
                                            <span className="px-2 bg-slate-900 text-xs text-slate-500">OR</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Upload Reference</label>
                                        <ImageUploader onImageUpload={setMagicImage} onImageClear={() => setMagicImage(null)} />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">2. Target Platform</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {SOCIAL_PLATFORMS.map(p => (
                                                <button
                                                    key={p.name}
                                                    onClick={() => setTargetPlatform(p.name)}
                                                    className={`p-2 rounded-lg border text-xs text-left transition flex items-center space-x-2 ${targetPlatform === p.name ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-slate-950 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                                                >
                                                    <span>{p.icon}</span>
                                                    <span className="truncate">{p.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button 
                                        onClick={handleMagicSwitch}
                                        disabled={loading}
                                        className="mt-2 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3.5 rounded-xl hover:opacity-90 disabled:opacity-50 transition shadow-lg shadow-purple-900/20"
                                    >
                                        {loading ? <Loader /> : '✨ Generate Asset'}
                                    </button>
                                </div>
                            </div>

                            {/* Preview Right */}
                            <div className="lg:col-span-8 flex flex-col gap-6">
                                <div className="flex-grow bg-slate-900 rounded-2xl border border-slate-800 p-8 flex items-center justify-center relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-grid-slate-800/20 pointer-events-none"></div>
                                    
                                    {resultImage ? (
                                        <div className="relative z-10 animate-scaleIn">
                                            <img src={resultImage} alt="Result" className="max-h-[500px] max-w-full rounded-lg shadow-2xl" />
                                            <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="bg-white text-slate-900 px-4 py-2 rounded-lg font-bold text-xs shadow-lg hover:bg-slate-100">Download</button>
                                                <button onClick={() => onShare({ contentText: 'Check out this design!', contentUrl: resultImage, contentType: 'image' })} className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold text-xs shadow-lg hover:bg-purple-500">Share</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center text-slate-600 z-10">
                                            <div className="text-6xl mb-4 opacity-20">🎨</div>
                                            <p className="text-lg font-medium">Ready to create magic</p>
                                            <p className="text-sm opacity-60">Select inputs on the left to start</p>
                                        </div>
                                    )}
                                </div>

                                {/* Templates Row */}
                                <div className="h-32">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Quick Templates</h4>
                                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                        {['Launch Day', 'Quote', 'Hiring', 'Event', 'Promo'].map((t, i) => (
                                            <div key={i} className="flex-shrink-0 w-24 h-24 bg-slate-800 rounded-lg border border-slate-700 hover:border-cyan-500 cursor-pointer flex flex-col items-center justify-center p-2 text-center transition group">
                                                <div className={`w-8 h-8 rounded mb-2 ${i % 2 === 0 ? 'bg-cyan-900/50' : 'bg-purple-900/50'}`}></div>
                                                <span className="text-[10px] text-slate-400 group-hover:text-white">{t}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'tools' && (
                    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
                        <h2 className="text-3xl font-bold text-white mb-6">Smart Tools</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Logo Replacer */}
                            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 hover:border-blue-500/50 transition duration-300">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-2xl">🔄</div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Smart Logo Replacer</h3>
                                        <p className="text-sm text-slate-400">Update legacy assets with your new brand identity.</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 min-h-[200px] flex items-center justify-center">
                                        {resultImage ? (
                                            <img src={resultImage} className="max-h-48 rounded object-contain" />
                                        ) : (
                                            <ImageUploader onImageUpload={setLogoReplaceImage} onImageClear={() => setLogoReplaceImage(null)} />
                                        )}
                                    </div>
                                    <button 
                                        onClick={handleLogoReplace}
                                        disabled={loading || !logoReplaceImage}
                                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
                                    >
                                        {loading ? <Loader /> : 'Apply Brand Logo'}
                                    </button>
                                </div>
                            </div>

                            {/* File Converter Mock */}
                            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 hover:border-green-500/50 transition duration-300 relative overflow-hidden">
                                <div className="flex items-center gap-4 mb-6 relative z-10">
                                    <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-2xl">📂</div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Design Import</h3>
                                        <p className="text-sm text-slate-400">Convert PDFs & Slides to editable brand assets.</p>
                                    </div>
                                </div>
                                
                                <div className="border-2 border-dashed border-slate-700 rounded-xl bg-slate-950/50 h-[200px] flex flex-col items-center justify-center text-center relative z-10 group cursor-pointer hover:border-green-500/50 transition">
                                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                                        <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                    </div>
                                    <p className="text-sm text-slate-300 font-medium">Drop files here</p>
                                    <p className="text-xs text-slate-500 mt-1">Supports PDF, PPTX, AI</p>
                                </div>
                                {/* Decorative blob */}
                                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-green-500/5 rounded-full blur-3xl pointer-events-none"></div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'workflow' && (
                    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
                        {/* Guidelines Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-1">Brand Guidelines</h2>
                                <p className="text-slate-400">Automated documentation for your team.</p>
                            </div>
                            <button 
                                onClick={handleGenerateGuidelines}
                                disabled={loading}
                                className="bg-white text-slate-900 px-6 py-3 rounded-lg font-bold hover:bg-slate-200 transition shadow-lg flex items-center space-x-2"
                            >
                                {loading ? <Loader /> : <><span>Generate Docs</span><span className="text-lg">📄</span></>}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Document Preview */}
                            <div className="lg:col-span-2 bg-white rounded-xl shadow-2xl overflow-hidden min-h-[600px] flex flex-col">
                                <div className="h-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"></div>
                                <div className="p-8 text-slate-900 flex-grow">
                                    {result ? (
                                        <div className="prose prose-slate max-w-none">
                                            <div dangerouslySetInnerHTML={{ __html: md.render(result) }} />
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                                            <div className="w-24 h-32 border-2 border-slate-300 rounded mb-4 flex flex-col p-2 space-y-2">
                                                <div className="h-2 bg-slate-300 rounded w-3/4"></div>
                                                <div className="h-2 bg-slate-300 rounded w-full"></div>
                                                <div className="h-2 bg-slate-300 rounded w-5/6"></div>
                                            </div>
                                            <p className="text-sm font-medium">Click generate to build guidelines</p>
                                        </div>
                                    )}
                                </div>
                                {result && (
                                    <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end space-x-3">
                                        <button className="text-slate-600 font-bold text-sm px-4 py-2 hover:bg-slate-200 rounded transition">Download PDF</button>
                                        <button onClick={() => onShare({ contentText: result, contentType: 'text' })} className="bg-slate-900 text-white font-bold text-sm px-4 py-2 rounded hover:bg-slate-800 transition">Share</button>
                                    </div>
                                )}
                            </div>

                            {/* Sidebar Settings */}
                            <div className="space-y-6">
                                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                                    <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Governance</h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-slate-300">Lock Brand Colors</span>
                                            <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                                <input type="checkbox" name="toggle" id="toggle1" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-cyan-500"/>
                                                <label htmlFor="toggle1" className="toggle-label block overflow-hidden h-5 rounded-full bg-slate-700 cursor-pointer"></label>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-slate-300">Restrict Fonts</span>
                                            <div className="w-10 h-5 bg-cyan-600 rounded-full relative cursor-pointer"><div className="w-3 h-3 bg-white rounded-full absolute top-1 right-1"></div></div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-slate-300">Approval Workflow</span>
                                            <div className="w-10 h-5 bg-slate-700 rounded-full relative cursor-pointer"><div className="w-3 h-3 bg-white rounded-full absolute top-1 left-1"></div></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                                    <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Asset Library</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['Logos', 'Images', 'Icons', 'Video', 'Fonts', 'Docs'].map(folder => (
                                            <div key={folder} className="bg-slate-800 p-3 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-700 transition aspect-square">
                                                <span className="text-2xl mb-1">📁</span>
                                                <span className="text-xs text-slate-300">{folder}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default BrandKit;
