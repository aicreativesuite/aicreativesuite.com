
import React, { useState, useEffect } from 'react';
import { generateImage, enhancePrompt } from '../../services/geminiService';
import { 
    DESIGN_STYLES, 
    DESIGN_TYPES, 
    PACKAGING_TYPES, 
    PACKAGING_MATERIALS, 
    PACKAGING_STYLES, 
    ASPECT_RATIOS, 
    LIGHTING_STYLES,
    VIEW_ANGLES,
    PACKAGING_ENVIRONMENTS,
    INTERIOR_TYPES,
    INTERIOR_STYLES,
    FASHION_ITEMS,
    FASHION_MATERIALS,
    CHARACTER_TYPES,
    LOGO_STYLES,
    UI_TYPES,
    IMAGE_ENGINES
} from '../../constants';
import Loader from '../common/Loader';
import ImageUploader from '../common/ImageUploader';
import ApiKeyDialog from '../common/ApiKeyDialog';
import { fileToBase64, addQrCodeToImage } from '../../utils';

interface ImageGeneratorProps {
    onShare: (options: { contentUrl: string; contentText: string; contentType: 'image' }) => void;
}

const CategoryCard: React.FC<{ 
    title: string; 
    icon: string; 
    selected: boolean; 
    onClick: () => void; 
}> = ({ title, icon, selected, onClick }) => (
    <button 
        onClick={onClick}
        className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 h-24 ${
            selected 
                ? 'bg-cyan-600/20 border-cyan-500 text-white shadow-lg shadow-cyan-900/20' 
                : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-slate-500'
        }`}
    >
        <span className="text-2xl mb-2">{icon}</span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-center leading-tight">{title}</span>
    </button>
);

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ onShare }) => {
    // Core Inputs
    const [designType, setDesignType] = useState('General Art');
    const [prompt, setPrompt] = useState('');
    const [negativePrompt, setNegativePrompt] = useState('');
    
    // Style & Config
    const [designStyle, setDesignStyle] = useState(DESIGN_STYLES[0]);
    const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[0]);
    const [isHighQuality, setIsHighQuality] = useState(false);
    const [selectedEngine, setSelectedEngine] = useState(IMAGE_ENGINES[0]);
    
    // Advanced Design Controls
    const [lighting, setLighting] = useState(LIGHTING_STYLES[0]);
    const [viewAngle, setViewAngle] = useState(VIEW_ANGLES[0]);
    
    // Design Specifics
    const [packagingType, setPackagingType] = useState(PACKAGING_TYPES[0]);
    const [packagingMaterial, setPackagingMaterial] = useState(PACKAGING_MATERIALS[0]);
    const [packagingStyle, setPackagingStyle] = useState(PACKAGING_STYLES[0]);
    const [packagingEnv, setPackagingEnv] = useState(PACKAGING_ENVIRONMENTS[0]);
    
    const [interiorType, setInteriorType] = useState(INTERIOR_TYPES[0]);
    const [interiorStyle, setInteriorStyle] = useState(INTERIOR_STYLES[0]);
    
    const [fashionItem, setFashionItem] = useState(FASHION_ITEMS[0]);
    const [fashionMaterial, setFashionMaterial] = useState(FASHION_MATERIALS[0]);
    
    const [characterType, setCharacterType] = useState(CHARACTER_TYPES[0]);
    const [logoStyle, setLogoStyle] = useState(LOGO_STYLES[0]);
    const [uiType, setUiType] = useState(UI_TYPES[0]);

    // Advanced
    const [referenceImage, setReferenceImage] = useState<File | null>(null);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [addQr, setAddQr] = useState(false);

    // System State
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSaved, setIsSaved] = useState(false);
    const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
    const [apiKeyReady, setApiKeyReady] = useState(false);

    useEffect(() => {
        const checkKey = async () => {
            // @ts-ignore
            if (typeof window.aistudio !== 'undefined') {
                // @ts-ignore
                if (await window.aistudio.hasSelectedApiKey()) {
                    setApiKeyReady(true);
                }
            } else {
                setApiKeyReady(true);
            }
        };
        checkKey();
    }, []);

    const handleSelectKey = async () => {
        // @ts-ignore
        if (window.aistudio) {
            // @ts-ignore
            await window.aistudio.openSelectKey();
            setApiKeyReady(true);
            setShowApiKeyDialog(false);
        }
    };

    const handleEnhancePrompt = async () => {
        if (!prompt) return;
        setIsEnhancing(true);
        try {
            const response = await enhancePrompt(prompt, 'image');
            setPrompt(response.text.replace(/^"|"$/g, '')); 
        } catch (err) {
            console.error(err);
        } finally {
            setIsEnhancing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Auto-select high quality based on engine
        const shouldUseHighQuality = isHighQuality || selectedEngine.includes('Photoreal');

        // Check billing for High Quality model
        // @ts-ignore
        if (shouldUseHighQuality && !apiKeyReady && typeof window.aistudio !== 'undefined') {
            setShowApiKeyDialog(true);
            return;
        }

        if (!prompt) {
            setError('Please enter a prompt.');
            return;
        }
        
        setLoading(true);
        setError(null);
        setImage(null);
        setIsSaved(false);
        
        try {
            // Construct Prompt based on Design Type
            let fullPrompt = "";
            
            switch (designType) {
                case 'Packaging Design':
                    fullPrompt = `Professional product photography of a ${packagingStyle} ${packagingMaterial} ${packagingType} for "${prompt}". Context: ${packagingEnv}. Lighting: ${lighting}. View: ${viewAngle}. 8k resolution, commercial render.`;
                    break;
                case 'Logo Design':
                    fullPrompt = `Professional vector logo design for: ${prompt}. Type: ${logoStyle}. Style: ${designStyle}. Minimalist, scalable, on a clean white background.`;
                    break;
                case 'UI/UX Mockup':
                    fullPrompt = `High fidelity UI/UX design screen for: ${prompt}. Interface Type: ${uiType}. Style: ${designStyle}. Modern interface, clean layout, user-centric, Dribbble trending aesthetic. View: ${viewAngle}.`;
                    break;
                case 'Interior Design':
                    fullPrompt = `Photorealistic interior design of a ${interiorType}. Theme: ${prompt}. Style: ${interiorStyle}, ${designStyle}. Architectural Digest quality, perfect lighting, 8k resolution. Lighting: ${lighting}. View: ${viewAngle}.`;
                    break;
                case 'Fashion Design':
                    fullPrompt = `Avant-garde fashion design concept for: ${fashionItem}. Material: ${fashionMaterial}. Theme: ${prompt}. Style: ${designStyle}. Full body shot, detailed fabric texture, runway photography. Lighting: ${lighting}.`;
                    break;
                case 'Character Design':
                    fullPrompt = `Character design sheet for a ${characterType}. Description: ${prompt}. Style: ${designStyle}. Multiple angles (front, side, back), detailed expression sheet, clean background.`;
                    break;
                case 'Poster/Cover Art':
                    fullPrompt = `High-impact poster art for: ${prompt}. Style: ${designStyle}. Bold typography integration, cinematic composition, high contrast. Lighting: ${lighting}.`;
                    break;
                default:
                    fullPrompt = `${prompt}, in a ${designStyle} style. High quality, detailed, 8k resolution. Lighting: ${lighting}. View: ${viewAngle}.`;
            }

            if (selectedEngine.includes('Typography')) {
                fullPrompt += " Ensure perfect typography, legible text rendering.";
            }

            if (negativePrompt) {
                fullPrompt += ` Excluding: ${negativePrompt}`;
            }

            // Handle Reference Image
            let refBase64 = undefined;
            let refMime = undefined;
            if (referenceImage) {
                refBase64 = await fileToBase64(referenceImage);
                refMime = referenceImage.type;
            }

            const imageBytes = await generateImage(fullPrompt, aspectRatio, refBase64, refMime, shouldUseHighQuality);
            
            if (addQr) {
                const imageWithQrDataUrl = await addQrCodeToImage(imageBytes);
                setImage(imageWithQrDataUrl);
            } else {
                setImage(`data:image/jpeg;base64,${imageBytes}`);
            }
        } catch (err: any) {
            if (err.message?.includes("Requested entity was not found") && shouldUseHighQuality) {
                setError("An API Key error occurred with the High Quality model. Please select a valid key.");
                setApiKeyReady(false);
                setShowApiKeyDialog(true);
            } else {
                setError('Failed to generate image. Please try again.');
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
    const handleSave = () => {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    const getTypeIcon = (type: string) => {
        switch(type) {
            case 'Packaging Design': return '📦';
            case 'Logo Design': return '🎨';
            case 'Interior Design': return '🛋️';
            case 'Fashion Design': return '👗';
            case 'Character Design': return '👾';
            case 'UI/UX Mockup': return '📱';
            case 'Poster/Cover Art': return '🖼️';
            default: return '✨';
        }
    }

    return (
        <>
            <ApiKeyDialog show={showApiKeyDialog} onSelectKey={handleSelectKey} />
            <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)] min-h-[600px]">
                {/* Sidebar Controls */}
                <div className="w-full lg:w-96 flex-shrink-0 bg-slate-900/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-800 overflow-y-auto custom-scrollbar flex flex-col gap-6">
                    
                    {/* Design Category Grid */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Design Studio</h3>
                        <div className="grid grid-cols-3 gap-2">
                            {DESIGN_TYPES.map(t => (
                                <CategoryCard 
                                    key={t} 
                                    title={t.replace(' Design', '').replace(' Mockup', '')} 
                                    icon={getTypeIcon(t)}
                                    selected={designType === t}
                                    onClick={() => setDesignType(t)}
                                />
                            ))}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="contents">
                        
                        {/* Dynamic Configuration Panel */}
                        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-700 space-y-4 animate-fadeIn">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Configuration</h4>
                                <span className="text-[10px] text-slate-500">{designType}</span>
                            </div>

                            {designType === 'Packaging Design' && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="col-span-2">
                                        <label className="block text-[10px] text-slate-400 uppercase mb-1">Type</label>
                                        <select value={packagingType} onChange={(e) => setPackagingType(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-xs text-white">{PACKAGING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-slate-400 uppercase mb-1">Material</label>
                                        <select value={packagingMaterial} onChange={(e) => setPackagingMaterial(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-xs text-white">{PACKAGING_MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}</select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-slate-400 uppercase mb-1">Style</label>
                                        <select value={packagingStyle} onChange={(e) => setPackagingStyle(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-xs text-white">{PACKAGING_STYLES.map(s => <option key={s} value={s}>{s}</option>)}</select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-[10px] text-slate-400 uppercase mb-1">Environment</label>
                                        <select value={packagingEnv} onChange={(e) => setPackagingEnv(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-xs text-white">{PACKAGING_ENVIRONMENTS.map(e => <option key={e} value={e}>{e}</option>)}</select>
                                    </div>
                                </div>
                            )}

                            {designType === 'Interior Design' && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] text-slate-400 uppercase mb-1">Room</label>
                                        <select value={interiorType} onChange={(e) => setInteriorType(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-xs text-white">{INTERIOR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-slate-400 uppercase mb-1">Style</label>
                                        <select value={interiorStyle} onChange={(e) => setInteriorStyle(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-xs text-white">{INTERIOR_STYLES.map(s => <option key={s} value={s}>{s}</option>)}</select>
                                    </div>
                                </div>
                            )}

                            {/* Standard options for others */}
                            {designType !== 'Packaging Design' && designType !== 'Interior Design' && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] text-slate-400 uppercase mb-1">Art Style</label>
                                        <select value={designStyle} onChange={(e) => setDesignStyle(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-xs text-white">{DESIGN_STYLES.map(s => <option key={s} value={s}>{s}</option>)}</select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-slate-400 uppercase mb-1">Lighting</label>
                                        <select value={lighting} onChange={(e) => setLighting(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-xs text-white">{LIGHTING_STYLES.map(l => <option key={l} value={l}>{l}</option>)}</select>
                                    </div>
                                </div>
                            )}
                            
                            {/* Prompt Input */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-[10px] text-slate-400 uppercase">
                                        {designType === 'Packaging Design' ? 'Product Name & Description' : 'Detailed Description'}
                                    </label>
                                    <button type="button" onClick={handleEnhancePrompt} disabled={isEnhancing || !prompt} className="text-[10px] text-cyan-400 hover:text-cyan-300 disabled:opacity-50">
                                        {isEnhancing ? 'Enhancing...' : '✨ Auto-Enhance'}
                                    </button>
                                </div>
                                <textarea
                                    rows={3}
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500 resize-none"
                                    placeholder="Describe your vision..."
                                />
                            </div>
                        </div>

                        {/* Reference Image */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Style Reference (Optional)</label>
                            <ImageUploader onImageUpload={setReferenceImage} onImageClear={() => setReferenceImage(null)} />
                        </div>

                        {/* Settings Bar */}
                        <div className="flex items-center gap-3">
                            <div className="flex-grow">
                                <label className="block text-[10px] text-slate-400 uppercase mb-1">Aspect Ratio</label>
                                <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white">
                                    {ASPECT_RATIOS.map((r) => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div className="flex-grow">
                                <label className="block text-[10px] text-slate-400 uppercase mb-1">Engine</label>
                                <select value={selectedEngine} onChange={(e) => setSelectedEngine(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white">
                                    {IMAGE_ENGINES.map(e => <option key={e} value={e}>{e.split(' ')[0]}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Generate Button */}
                        <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold py-3.5 rounded-xl hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center space-x-2 mt-auto">
                            {loading ? <Loader /> : <span>Generate Design</span>}
                        </button>
                        {error && <p className="text-red-400 text-xs text-center bg-red-900/20 p-2 rounded">{error}</p>}
                    </form>
                </div>

                 {/* Output Area */}
                 <div className="flex-grow bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col overflow-hidden relative">
                    <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                        <h3 className="font-bold text-white text-sm uppercase tracking-wider">Canvas</h3>
                        {image && (
                            <div className="flex space-x-2">
                                 <a href={image} download={`design-${Date.now()}.jpg`} className="p-2 rounded hover:bg-slate-800 text-slate-400 hover:text-white" title="Download">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                </a>
                                <button onClick={handleSave} className={`p-2 rounded hover:bg-slate-800 transition-colors ${isSaved ? 'text-green-400' : 'text-slate-400 hover:text-white'}`} title="Save">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                </button>
                                <button onClick={() => onShare({ contentUrl: image!, contentText: prompt, contentType: 'image' })} className="p-2 rounded hover:bg-slate-800 text-purple-400 hover:text-purple-300" title="Share">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex-grow p-8 flex items-center justify-center relative bg-slate-950/30">
                        <div className="absolute inset-0 bg-grid-slate-800/20 pointer-events-none"></div>
                        {loading && <Loader message="Rendering high-fidelity design..." />}
                        {!loading && image && (
                             <div className="relative group max-w-full max-h-full">
                                <img src={image} alt="Generated" className="max-w-full max-h-[calc(100vh-16rem)] rounded-lg object-contain shadow-2xl shadow-black/50" />
                            </div>
                        )}
                        {!loading && !image && (
                             <div className="text-center text-slate-600 opacity-60">
                                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-20 w-20 mb-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3ZM5 19V5H19V19H5ZM16.5 16L13.5 12L10 16.5L7.5 13L5 17.5H19L16.5 16Z"></path></svg>
                                <p className="text-lg">Select a category to start designing</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ImageGenerator;