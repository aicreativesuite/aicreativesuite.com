
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
    name: 'My Brand',
    colors: { primary: '#06b6d4', secondary: '#334155', accent: '#f472b6' },
    fonts: { heading: 'Inter', body: 'Roboto' },
    logo: null
};

const SOCIAL_PLATFORMS = [
    { name: 'Instagram Story', ratio: '9:16' },
    { name: 'Instagram Post', ratio: '1:1' },
    { name: 'LinkedIn Post', ratio: '4:5' },
    { name: 'Twitter Header', ratio: '3:1' },
    { name: 'YouTube Thumbnail', ratio: '16:9' },
    { name: 'TikTok Video', ratio: '9:16' }
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
            // Conceptual prompt since we can't easily upload the logo file to the model as an asset reference in this specific API call structure without more complex setups.
            // We ask the model to conceptually replace "the logo" with a generic placeholder or describe the action.
            // For a real app, you'd use a canvas overlay or a specific inpainting mask.
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

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            {/* Header / Brand Selector */}
            <div className="bg-slate-900/80 p-6 rounded-t-2xl border-b border-slate-800 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">The &lt;Heart&gt; for every brand</h2>
                    <p className="text-sm text-slate-400">Manage assets, maintain consistency, and design at scale.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <span className="text-sm text-slate-400">Active Brand:</span>
                    <select 
                        value={activeBrandId} 
                        onChange={(e) => setActiveBrandId(e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-sm"
                    >
                        {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                    <button 
                        onClick={() => {
                            const newId = Date.now().toString();
                            setBrands([...brands, { ...DEFAULT_BRAND, id: newId, name: 'New Brand' }]);
                            setActiveBrandId(newId);
                        }}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-2 rounded-lg text-xs font-bold"
                    >
                        + New
                    </button>
                </div>
            </div>

            <div className="flex flex-grow bg-slate-950 overflow-hidden rounded-b-2xl border-x border-b border-slate-800">
                {/* Sidebar Navigation */}
                <div className="w-48 bg-slate-900 border-r border-slate-800 flex flex-col pt-4">
                    {[
                        { id: 'identity', label: 'Brand Identity', icon: '🎨' },
                        { id: 'create', label: 'Magic Create', icon: '✨' },
                        { id: 'tools', label: 'Smart Tools', icon: '🔧' },
                        { id: 'workflow', label: 'Workflow', icon: '⚙️' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id as any); setResult(null); setResultImage(null); }}
                            className={`px-6 py-4 text-left text-sm font-medium transition-colors flex items-center space-x-3 ${activeTab === tab.id ? 'bg-slate-800 text-cyan-400 border-l-2 border-cyan-400' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-grow overflow-y-auto p-8">
                    {/* --- IDENTITY TAB --- */}
                    {activeTab === 'identity' && (
                        <div className="max-w-4xl space-y-8 animate-fadeIn">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                                    <h3 className="text-lg font-bold text-white mb-4">Brand Colors</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm text-slate-400">Primary</label>
                                            <div className="flex items-center gap-2">
                                                <input type="text" value={activeBrand.colors.primary} onChange={(e) => updateBrand({ colors: { ...activeBrand.colors, primary: e.target.value } })} className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white w-20" />
                                                <input type="color" value={activeBrand.colors.primary} onChange={(e) => updateBrand({ colors: { ...activeBrand.colors, primary: e.target.value } })} className="h-8 w-8 rounded cursor-pointer bg-transparent border-0" />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm text-slate-400">Secondary</label>
                                            <div className="flex items-center gap-2">
                                                <input type="text" value={activeBrand.colors.secondary} onChange={(e) => updateBrand({ colors: { ...activeBrand.colors, secondary: e.target.value } })} className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white w-20" />
                                                <input type="color" value={activeBrand.colors.secondary} onChange={(e) => updateBrand({ colors: { ...activeBrand.colors, secondary: e.target.value } })} className="h-8 w-8 rounded cursor-pointer bg-transparent border-0" />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm text-slate-400">Accent</label>
                                            <div className="flex items-center gap-2">
                                                <input type="text" value={activeBrand.colors.accent} onChange={(e) => updateBrand({ colors: { ...activeBrand.colors, accent: e.target.value } })} className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white w-20" />
                                                <input type="color" value={activeBrand.colors.accent} onChange={(e) => updateBrand({ colors: { ...activeBrand.colors, accent: e.target.value } })} className="h-8 w-8 rounded cursor-pointer bg-transparent border-0" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                                    <h3 className="text-lg font-bold text-white mb-4">Typography</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Heading Font</label>
                                            <select value={activeBrand.fonts.heading} onChange={(e) => updateBrand({ fonts: { ...activeBrand.fonts, heading: e.target.value } })} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white">
                                                {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Body Font</label>
                                            <select value={activeBrand.fonts.body} onChange={(e) => updateBrand({ fonts: { ...activeBrand.fonts, body: e.target.value } })} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white">
                                                {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                                <h3 className="text-lg font-bold text-white mb-4">Brand Logo</h3>
                                <div className="flex items-center gap-6">
                                    <div className="w-32 h-32 bg-slate-950 rounded-lg flex items-center justify-center border border-slate-700 overflow-hidden">
                                        {activeBrand.logo ? (
                                            <img src={activeBrand.logo} alt="Brand Logo" className="w-full h-full object-contain" />
                                        ) : (
                                            <span className="text-slate-600 text-xs">No Logo</span>
                                        )}
                                    </div>
                                    <div className="flex-grow">
                                        <ImageUploader 
                                            onImageUpload={async (file) => {
                                                const base64 = await fileToBase64(file);
                                                updateBrand({ logo: `data:image/png;base64,${base64}` });
                                            }} 
                                            onImageClear={() => updateBrand({ logo: null })} 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- CREATE TAB --- */}
                    {activeTab === 'create' && (
                        <div className="max-w-5xl space-y-8 animate-fadeIn">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-bold text-white">Magic Switch™</h3>
                                            <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">AI Resizing</span>
                                        </div>
                                        <p className="text-sm text-slate-400 mb-4">Instantly format your design for any platform.</p>
                                        
                                        <div className="space-y-4">
                                            <textarea 
                                                value={magicInput} 
                                                onChange={(e) => setMagicInput(e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm h-24 resize-none"
                                                placeholder="Describe your design (e.g. A promo for summer sale)..."
                                            />
                                            <div>
                                                <p className="text-xs text-slate-500 mb-2">Or upload a reference image:</p>
                                                <ImageUploader onImageUpload={setMagicImage} onImageClear={() => setMagicImage(null)} />
                                            </div>
                                            
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Target Platform</label>
                                                <select 
                                                    value={targetPlatform} 
                                                    onChange={(e) => setTargetPlatform(e.target.value)}
                                                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                                                >
                                                    {SOCIAL_PLATFORMS.map(p => <option key={p.name} value={p.name}>{p.name} ({p.ratio})</option>)}
                                                </select>
                                            </div>

                                            <button 
                                                onClick={handleMagicSwitch}
                                                disabled={loading}
                                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-lg hover:opacity-90 disabled:opacity-50 transition"
                                            >
                                                {loading ? <Loader /> : 'Magic Switch'}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6 flex items-center justify-center min-h-[400px]">
                                    {resultImage ? (
                                        <img src={resultImage} alt="Magic Switch Result" className="max-w-full max-h-[400px] rounded shadow-2xl" />
                                    ) : (
                                        <div className="text-center text-slate-500">
                                            <p>Generated asset will appear here.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Brand Templates Section */}
                            <div>
                                <h3 className="text-xl font-bold text-white mb-4">Brand Templates</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {['Social Post', 'Story', 'Presentation', 'Banner'].map((tmpl, i) => (
                                        <div key={i} className="aspect-[4/5] bg-slate-800 rounded-lg border border-slate-700 p-4 flex flex-col justify-between hover:border-cyan-500 cursor-pointer transition group">
                                            <div className="h-2/3 bg-slate-700/50 rounded flex items-center justify-center text-slate-500 group-hover:text-cyan-400">
                                                Template Preview
                                            </div>
                                            <div>
                                                <p className="font-bold text-white text-sm">{tmpl}</p>
                                                <p className="text-xs text-slate-400">Uses {activeBrand.name} colors</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TOOLS TAB --- */}
                    {activeTab === 'tools' && (
                        <div className="max-w-4xl space-y-8 animate-fadeIn">
                            {/* Logo Replace */}
                            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-blue-900/30 text-blue-400 rounded-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Logo Replace</h3>
                                        <p className="text-xs text-slate-400">Update logos across designs instantly.</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <ImageUploader onImageUpload={setLogoReplaceImage} onImageClear={() => setLogoReplaceImage(null)} />
                                        <button 
                                            onClick={handleLogoReplace}
                                            disabled={loading || !logoReplaceImage}
                                            className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded transition disabled:opacity-50"
                                        >
                                            {loading ? 'Processing...' : 'Replace with Brand Logo'}
                                        </button>
                                    </div>
                                    <div className="bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-center h-48">
                                        {resultImage ? (
                                            <img src={resultImage} className="h-full object-contain" />
                                        ) : (
                                            <span className="text-slate-600 text-sm">Processed result</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Design Import */}
                            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 opacity-75">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-green-900/30 text-green-400 rounded-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Design Import</h3>
                                        <p className="text-xs text-slate-400">Import PDFs or PowerPoints to editable AI designs.</p>
                                    </div>
                                </div>
                                <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center">
                                    <p className="text-slate-500">Drag & Drop PDF, PPTX, or AI files here</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- WORKFLOW TAB --- */}
                    {activeTab === 'workflow' && (
                        <div className="max-w-4xl space-y-6 animate-fadeIn">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Guidelines */}
                                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                                    <h3 className="text-lg font-bold text-white mb-2">Brand Guidelines</h3>
                                    <p className="text-xs text-slate-400 mb-4">Generate written instructions for your team.</p>
                                    <button 
                                        onClick={handleGenerateGuidelines}
                                        disabled={loading}
                                        className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 rounded border border-slate-600 transition"
                                    >
                                        {loading ? 'Generating...' : 'Generate Guidelines'}
                                    </button>
                                </div>

                                {/* Controls */}
                                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                                    <h3 className="text-lg font-bold text-white mb-2">Brand Controls</h3>
                                    <div className="space-y-3 mt-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-slate-300">Lock Fonts</span>
                                            <div className="w-10 h-5 bg-cyan-600 rounded-full relative"><div className="w-3 h-3 bg-white rounded-full absolute top-1 right-1"></div></div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-slate-300">Lock Colors</span>
                                            <div className="w-10 h-5 bg-cyan-600 rounded-full relative"><div className="w-3 h-3 bg-white rounded-full absolute top-1 right-1"></div></div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-slate-300">Require Approval</span>
                                            <div className="w-10 h-5 bg-slate-700 rounded-full relative"><div className="w-3 h-3 bg-white rounded-full absolute top-1 left-1"></div></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Guideline Result */}
                            {result && (
                                <div className="bg-white text-slate-900 p-8 rounded-xl shadow-xl prose prose-sm max-w-none">
                                    <div dangerouslySetInnerHTML={{ __html: md.render(result) }} />
                                    <div className="mt-4 pt-4 border-t border-slate-200 text-right">
                                        <button onClick={() => onShare({ contentText: result, contentType: 'text' })} className="text-blue-600 font-bold hover:underline">Share Guidelines</button>
                                    </div>
                                </div>
                            )}

                            {/* Folders */}
                            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                                <h3 className="text-lg font-bold text-white mb-4">Brand Folders</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    {['Campaigns', 'Logos', 'Social Assets', 'Presentations'].map(folder => (
                                        <div key={folder} className="bg-slate-800 p-4 rounded-lg flex items-center gap-3 hover:bg-slate-700 cursor-pointer">
                                            <span className="text-2xl">📁</span>
                                            <span className="text-sm font-medium text-white">{folder}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BrandKit;
