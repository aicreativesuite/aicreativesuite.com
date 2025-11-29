
import React, { useState } from 'react';
import ImageUploader from '../common/ImageUploader';
import { generateImage, generateBrandGuidelines, analyzeLayoutForResize, editImage } from '../../services/geminiService';
import Loader from '../common/Loader';
import { Remarkable } from 'remarkable';
import { fileToBase64 } from '../../utils';

const md = new Remarkable({ html: true });

interface BrandKitProps {
    onShare: (options: { contentText: string; contentType: 'text' | 'image' }) => void;
    onBack?: () => void;
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

const BrandKit: React.FC<BrandKitProps> = ({ onShare, onBack }) => {
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
    const [activeTool, setActiveTool] = useState<'replacer' | 'import'>('replacer');
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

    const CompactColorPicker = ({ label, color, onChange }: { label: string, color: string, onChange: (c: string) => void }) => (
        <div className="flex items-center justify-between bg-slate-950 p-2 rounded-lg border border-slate-700">
            <span className="text-xs text-slate-400 font-medium">{label}</span>
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-500 uppercase">{color}</span>
                <div className="relative w-6 h-6 rounded-full border border-slate-600 overflow-hidden" style={{ backgroundColor: color }}>
                    <input 
                        type="color" 
                        value={color} 
                        onChange={(e) => onChange(e.target.value)} 
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                    />
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)] min-h-[600px]">
            {/* Sidebar Controls */}
            <div className="w-full lg:w-80 flex-shrink-0 bg-slate-900/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-800 overflow-y-auto custom-scrollbar flex flex-col gap-6">
                
                {/* Brand Selector */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Brand</label>
                    <div className="flex gap-2">
                        <select 
                            value={activeBrandId} 
                            onChange={(e) => setActiveBrandId(e.target.value)}
                            className="flex-grow bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-sm focus:ring-2 focus:ring-cyan-500"
                        >
                            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                        <button 
                            onClick={() => {
                                const newId = Date.now().toString();
                                setBrands([...brands, { ...DEFAULT_BRAND, id: newId, name: `Brand ${brands.length + 1}` }]);
                                setActiveBrandId(newId);
                            }}
                            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg px-3 transition"
                            title="New Brand"
                        >
                            +
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex flex-wrap gap-2">
                    {['identity', 'create', 'tools', 'workflow'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => {
                                setActiveTab(tab as any);
                                setResult(null);
                                setResultImage(null);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex-grow text-center ${activeTab === tab ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                        >
                            {tab === 'identity' ? 'Identity' : tab === 'create' ? 'Create' : tab === 'tools' ? 'Tools' : 'Docs'}
                        </button>
                    ))}
                </div>

                <div className="h-px bg-slate-800 w-full"></div>

                {/* Tab Specific Controls */}
                <div className="flex-grow space-y-5 animate-fadeIn">
                    
                    {activeTab === 'identity' && (
                        <>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Logo Asset</label>
                                <div className="bg-slate-950 border-2 border-dashed border-slate-800 rounded-xl p-4 text-center hover:border-slate-600 transition relative group">
                                    {activeBrand.logo ? (
                                        <div className="relative">
                                            <img src={activeBrand.logo} className="h-16 mx-auto object-contain" alt="logo" />
                                            <button 
                                                onClick={() => updateBrand({ logo: null })}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                                            >
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-xs text-slate-500 mb-2">Upload Logo (PNG/SVG)</p>
                                            <ImageUploader onImageUpload={async (f) => {
                                                const b64 = await fileToBase64(f);
                                                updateBrand({ logo: `data:image/png;base64,${b64}` });
                                            }} onImageClear={() => {}} />
                                        </>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Color Palette</label>
                                <div className="space-y-2">
                                    <CompactColorPicker label="Primary" color={activeBrand.colors.primary} onChange={c => updateBrand({ colors: { ...activeBrand.colors, primary: c } })} />
                                    <CompactColorPicker label="Secondary" color={activeBrand.colors.secondary} onChange={c => updateBrand({ colors: { ...activeBrand.colors, secondary: c } })} />
                                    <CompactColorPicker label="Accent" color={activeBrand.colors.accent} onChange={c => updateBrand({ colors: { ...activeBrand.colors, accent: c } })} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Typography</label>
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-[10px] text-slate-500 block mb-1">Heading Font</span>
                                        <select 
                                            value={activeBrand.fonts.heading} 
                                            onChange={(e) => updateBrand({ fonts: { ...activeBrand.fonts, heading: e.target.value } })} 
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
                                        >
                                            {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-500 block mb-1">Body Font</span>
                                        <select 
                                            value={activeBrand.fonts.body} 
                                            onChange={(e) => updateBrand({ fonts: { ...activeBrand.fonts, body: e.target.value } })} 
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
                                        >
                                            {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'create' && (
                        <>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Description</label>
                                <textarea 
                                    rows={4}
                                    value={magicInput}
                                    onChange={(e) => setMagicInput(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500 resize-none"
                                    placeholder="e.g. A summer sale banner"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Or Upload Reference</label>
                                <ImageUploader onImageUpload={setMagicImage} onImageClear={() => setMagicImage(null)} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Format</label>
                                <select 
                                    value={targetPlatform}
                                    onChange={(e) => setTargetPlatform(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-sm"
                                >
                                    {SOCIAL_PLATFORMS.map(p => <option key={p.name} value={p.name}>{p.icon} {p.name}</option>)}
                                </select>
                            </div>
                            <button 
                                onClick={handleMagicSwitch}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-50 transition shadow-lg flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader /> : 'Generate Asset'}
                            </button>
                        </>
                    )}

                    {activeTab === 'tools' && (
                        <>
                            <div className="flex bg-slate-800 rounded-lg p-1 mb-4">
                                <button onClick={() => setActiveTool('replacer')} className={`flex-1 py-2 text-xs font-bold rounded-md transition ${activeTool === 'replacer' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Logo Replacer</button>
                                <button onClick={() => setActiveTool('import')} className={`flex-1 py-2 text-xs font-bold rounded-md transition ${activeTool === 'import' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Design Import</button>
                            </div>

                            {activeTool === 'replacer' && (
                                <div className="space-y-4">
                                    <p className="text-xs text-slate-400">Upload an image to replace its logo with your active brand logo.</p>
                                    <ImageUploader onImageUpload={setLogoReplaceImage} onImageClear={() => setLogoReplaceImage(null)} />
                                    <button 
                                        onClick={handleLogoReplace}
                                        disabled={loading || !logoReplaceImage}
                                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 flex justify-center"
                                    >
                                        {loading ? <Loader /> : 'Process Image'}
                                    </button>
                                </div>
                            )}
                            
                            {activeTool === 'import' && (
                                <div className="text-center text-slate-500 py-8 border-2 border-dashed border-slate-800 rounded-xl">
                                    <p className="text-xs">Drag PDF or PPTX files here to extract brand assets.</p>
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === 'workflow' && (
                        <>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                                    <span className="text-xs font-bold text-slate-300">Lock Colors</span>
                                    <div className="w-8 h-4 bg-cyan-600 rounded-full relative"><div className="absolute right-1 top-1 w-2 h-2 bg-white rounded-full"></div></div>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                                    <span className="text-xs font-bold text-slate-300">Restrict Fonts</span>
                                    <div className="w-8 h-4 bg-slate-600 rounded-full relative"><div className="absolute left-1 top-1 w-2 h-2 bg-white rounded-full"></div></div>
                                </div>
                            </div>
                            <button 
                                onClick={handleGenerateGuidelines}
                                disabled={loading}
                                className="w-full bg-white text-slate-900 font-bold py-3 rounded-xl hover:bg-slate-200 transition shadow-lg flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader /> : 'Generate Guidelines PDF'}
                            </button>
                        </>
                    )}

                </div>
            </div>

            {/* Main Preview Pane */}
            <div className="flex-grow bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col overflow-hidden relative">
                
                {/* Header for Preview */}
                <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                    <h3 className="font-bold text-white text-sm uppercase tracking-wider">
                        {activeTab === 'identity' ? 'Brand Board' : activeTab === 'create' ? 'Generated Asset' : activeTab === 'tools' ? 'Tool Output' : 'Documentation'}
                    </h3>
                    <div className="flex gap-2">
                        {(result || resultImage) && (
                            <button onClick={() => onShare({ contentText: result || 'Brand Asset', contentUrl: resultImage || undefined, contentType: resultImage ? 'image' : 'text' })} className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded font-bold transition">Share</button>
                        )}
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto p-8 relative">
                    <div className="absolute inset-0 bg-grid-slate-800/20 pointer-events-none"></div>
                    
                    {activeTab === 'identity' && (
                        <div className="relative z-10 bg-white rounded-xl shadow-2xl p-8 max-w-3xl mx-auto min-h-[500px] text-slate-900">
                            <div className="flex items-center gap-6 mb-12 border-b border-slate-100 pb-8">
                                <div className="w-24 h-24 bg-slate-100 rounded-xl flex items-center justify-center p-2 border border-slate-200">
                                    {activeBrand.logo ? <img src={activeBrand.logo} className="max-w-full max-h-full" /> : <span className="text-4xl">💎</span>}
                                </div>
                                <div>
                                    <h1 className="text-4xl font-extrabold tracking-tight" style={{ fontFamily: activeBrand.fonts.heading }}>{activeBrand.name}</h1>
                                    <p className="text-slate-500 font-medium mt-1">Brand Identity System 1.0</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-12 mb-12">
                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Color Palette</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full shadow-sm" style={{ backgroundColor: activeBrand.colors.primary }}></div>
                                            <div><p className="font-bold text-sm">Primary</p><p className="text-xs font-mono text-slate-500">{activeBrand.colors.primary}</p></div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full shadow-sm" style={{ backgroundColor: activeBrand.colors.secondary }}></div>
                                            <div><p className="font-bold text-sm">Secondary</p><p className="text-xs font-mono text-slate-500">{activeBrand.colors.secondary}</p></div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full shadow-sm" style={{ backgroundColor: activeBrand.colors.accent }}></div>
                                            <div><p className="font-bold text-sm">Accent</p><p className="text-xs font-mono text-slate-500">{activeBrand.colors.accent}</p></div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Typography</h4>
                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-3xl font-bold mb-1" style={{ fontFamily: activeBrand.fonts.heading }}>Heading Aa</p>
                                            <p className="text-xs text-slate-500 font-mono">{activeBrand.fonts.heading} / Bold</p>
                                        </div>
                                        <div>
                                            <p className="text-base leading-relaxed" style={{ fontFamily: activeBrand.fonts.body }}>
                                                Body text sample. The quick brown fox jumps over the lazy dog. Efficient branding requires consistency.
                                            </p>
                                            <p className="text-xs text-slate-500 font-mono mt-1">{activeBrand.fonts.body} / Regular</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {(activeTab === 'create' || activeTab === 'tools') && (
                        <div className="h-full flex items-center justify-center">
                            {resultImage ? (
                                <img src={resultImage} alt="Result" className="max-w-full max-h-full rounded-lg shadow-2xl animate-scaleIn relative z-10" />
                            ) : (
                                <div className="text-center text-slate-600 relative z-10 opacity-50">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    <p>Visual output will appear here</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'workflow' && (
                        <div className="h-full">
                            {result ? (
                                <div className="bg-white text-slate-900 p-8 rounded-xl shadow-2xl max-w-3xl mx-auto min-h-full relative z-10">
                                    <div className="prose prose-slate max-w-none">
                                        <div dangerouslySetInnerHTML={{ __html: md.render(result) }} />
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-600 relative z-10 opacity-50">
                                    <div className="text-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        <p>Generated documents will appear here</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BrandKit;
