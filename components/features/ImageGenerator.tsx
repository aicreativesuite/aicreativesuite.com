
import React, { useState, useEffect } from 'react';
import { generateImage, enhancePrompt } from '../../services/geminiService';
import { DESIGN_STYLES, DESIGN_TYPES, PACKAGING_TYPES, PACKAGING_MATERIALS, ASPECT_RATIOS, ART_TECHNIQUES_BY_DESIGN, ARTISTIC_STYLES, VISUAL_EFFECTS, BACKGROUND_OPTIONS } from '../../constants';
import Loader from '../common/Loader';
import ImageUploader from '../common/ImageUploader';
import ApiKeyDialog from '../common/ApiKeyDialog';
import { fileToBase64 } from '../../utils';
import QRCode from 'qrcode';

interface ImageGeneratorProps {
    onShare: (options: { contentUrl: string; contentText: string; contentType: 'image' }) => void;
}

const addQrCodeToImage = (imageBase64: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const uniqueId = Date.now().toString(36) + Math.random().toString(36).substring(2);
        const verificationUrl = `https://aicreativesuite.dev/verify?id=${uniqueId}`;

        const baseImage = new Image();
        baseImage.crossOrigin = 'anonymous';
        baseImage.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = baseImage.width;
            canvas.height = baseImage.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject('Could not get canvas context');

            ctx.drawImage(baseImage, 0, 0);

            QRCode.toDataURL(verificationUrl, { errorCorrectionLevel: 'H', margin: 1, width: 128 }, (err, qrUrl) => {
                if (err) return reject(err);

                const qrImage = new Image();
                qrImage.crossOrigin = 'anonymous';
                qrImage.onload = () => {
                    const qrSize = Math.max(64, Math.floor(baseImage.width * 0.1));
                    const padding = qrSize * 0.1;
                    const x = canvas.width - qrSize - padding;
                    const y = canvas.height - qrSize - padding;
                    
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                    ctx.fillRect(x - (padding / 2), y - (padding / 2), qrSize + padding, qrSize + padding);
                    ctx.drawImage(qrImage, x, y, qrSize, qrSize);
                    resolve(canvas.toDataURL('image/jpeg'));
                };
                qrImage.onerror = reject;
                qrImage.src = qrUrl;
            });
        };
        baseImage.onerror = reject;
        baseImage.src = `data:image/jpeg;base64,${imageBase64}`;
    });
};


const ImageGenerator: React.FC<ImageGeneratorProps> = ({ onShare }) => {
    // Core Inputs
    const [designType, setDesignType] = useState('General Art');
    const [prompt, setPrompt] = useState('');
    const [negativePrompt, setNegativePrompt] = useState('');
    
    // Style & Config
    const [designStyle, setDesignStyle] = useState(DESIGN_STYLES[0]);
    const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[0]);
    const [isHighQuality, setIsHighQuality] = useState(false);
    
    // Packaging Specifics
    const [packagingType, setPackagingType] = useState(PACKAGING_TYPES[0]);
    const [packagingMaterial, setPackagingMaterial] = useState(PACKAGING_MATERIALS[0]);
    
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
        
        // Check billing for High Quality model
        // @ts-ignore
        if (isHighQuality && !apiKeyReady && typeof window.aistudio !== 'undefined') {
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
            
            if (designType === 'Packaging Design') {
                fullPrompt = `Professional packaging design for a ${packagingType} made of ${packagingMaterial}. Product description: ${prompt}. Style: ${designStyle}. High resolution 8k render, studio lighting.`;
            } else if (designType === 'Logo Design') {
                fullPrompt = `Minimalist vector logo design for: ${prompt}. Style: ${designStyle}. Clean background, scalable vector aesthetics.`;
            } else if (designType === 'UI/UX Mockup') {
                fullPrompt = `High fidelity UI/UX design mockup for: ${prompt}. Style: ${designStyle}. Modern interface, clean layout, user-centric design.`;
            } else {
                fullPrompt = `${prompt}, in a ${designStyle} style. High quality, detailed.`;
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

            const imageBytes = await generateImage(fullPrompt, aspectRatio, refBase64, refMime, isHighQuality);
            
            if (addQr) {
                const imageWithQrDataUrl = await addQrCodeToImage(imageBytes);
                setImage(imageWithQrDataUrl);
            } else {
                setImage(`data:image/jpeg;base64,${imageBytes}`);
            }
        } catch (err: any) {
            if (err.message?.includes("Requested entity was not found") && isHighQuality) {
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

    return (
        <>
            <ApiKeyDialog show={showApiKeyDialog} onSelectKey={handleSelectKey} />
            <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)] min-h-[600px]">
                {/* Sidebar Controls */}
                <div className="w-full lg:w-80 flex-shrink-0 bg-slate-900/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-800 overflow-y-auto custom-scrollbar">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        
                        {/* Design Type Selector */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Design Mode</label>
                            <select 
                                value={designType} 
                                onChange={(e) => setDesignType(e.target.value)} 
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500"
                            >
                                {DESIGN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>

                        {/* Packaging Specifics */}
                        {designType === 'Packaging Design' && (
                            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 animate-fadeIn">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Type</label>
                                    <select value={packagingType} onChange={(e) => setPackagingType(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-xs text-white">
                                        {PACKAGING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Material</label>
                                    <select value={packagingMaterial} onChange={(e) => setPackagingMaterial(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-xs text-white">
                                        {PACKAGING_MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Prompt Input */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    {designType === 'Packaging Design' ? 'Product Description' : 'Prompt'}
                                </label>
                                <button 
                                    type="button" 
                                    onClick={handleEnhancePrompt} 
                                    disabled={isEnhancing || !prompt}
                                    className="text-[10px] bg-purple-600 hover:bg-purple-500 text-white px-2 py-1 rounded flex items-center space-x-1 transition disabled:opacity-50"
                                >
                                    {isEnhancing ? <span className="animate-spin">✨</span> : <span>✨ Enhance</span>}
                                </button>
                            </div>
                            <textarea
                                rows={4}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500 resize-none placeholder-slate-600"
                                placeholder={designType === 'Packaging Design' ? "e.g., Organic orange juice brand called 'Sunrise'" : "e.g., A futuristic cityscape"}
                            />
                        </div>
                        
                        {/* Reference Image (Style DNA) */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Style Reference (Optional)</label>
                            <ImageUploader onImageUpload={setReferenceImage} onImageClear={() => setReferenceImage(null)} />
                        </div>

                        {/* Style & Aspect Ratio */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Style</label>
                                <select value={designStyle} onChange={(e) => setDesignStyle(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white">
                                    {DESIGN_STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Ratio</label>
                                <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white">
                                    {ASPECT_RATIOS.map((r) => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Quality Toggle */}
                        <div className="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-700">
                            <span className="text-xs font-bold text-white">High Quality (HD)</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={isHighQuality} onChange={() => setIsHighQuality(!isHighQuality)} className="sr-only peer" />
                                <div className="w-9 h-5 bg-slate-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
                            </label>
                        </div>

                        {/* Advanced Toggle */}
                        <div>
                            <button 
                                type="button" 
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                            >
                                <span>{showAdvanced ? 'Hide' : 'Show'} Advanced</span>
                                <svg className={`w-3 h-3 transform transition ${showAdvanced ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </button>
                            {showAdvanced && (
                                <div className="mt-3 space-y-3 p-3 bg-slate-950/50 rounded-lg border border-slate-800 animate-fadeIn">
                                    <div>
                                        <label className="block text-[10px] text-slate-500 mb-1">Negative Prompt</label>
                                        <input type="text" value={negativePrompt} onChange={e => setNegativePrompt(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white" placeholder="blur, bad quality" />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input id="add-qr" type="checkbox" checked={addQr} onChange={(e) => setAddQr(e.target.checked)} className="h-3 w-3 rounded bg-slate-800 text-cyan-600" />
                                        <label htmlFor="add-qr" className="text-xs text-slate-400">Add QR Code</label>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center space-x-2">
                            {loading ? <Loader /> : <span>Generate Design</span>}
                        </button>
                        {error && <p className="text-red-400 text-xs text-center bg-red-900/20 p-2 rounded">{error}</p>}
                    </form>
                </div>

                 {/* Output Area */}
                 <div className="flex-grow bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col overflow-hidden relative">
                    <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                        <h3 className="font-bold text-white text-sm uppercase tracking-wider">Result</h3>
                        {image && (
                            <div className="flex space-x-2">
                                 <a href={image} download={`design-${Date.now()}.jpg`} className="p-2 rounded hover:bg-slate-800 text-slate-400 hover:text-white" title="Download">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                </a>
                                <button onClick={handleSave} className={`p-2 rounded hover:bg-slate-800 transition-colors ${isSaved ? 'text-green-400' : 'text-slate-400 hover:text-white'}`} title="Save">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                </button>
                                <button onClick={() => onShare({ contentUrl: image, contentText: prompt, contentType: 'image' })} className="p-2 rounded hover:bg-slate-800 text-purple-400 hover:text-purple-300" title="Share">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex-grow p-8 flex items-center justify-center relative bg-slate-950/30">
                        <div className="absolute inset-0 bg-grid-slate-800/20 pointer-events-none"></div>
                        {loading && <Loader message="Rendering design..." />}
                        {!loading && image && (
                             <div className="relative group max-w-full max-h-full">
                                <img src={image} alt="Generated" className="max-w-full max-h-[calc(100vh-16rem)] rounded-lg object-contain shadow-2xl shadow-black/50" />
                            </div>
                        )}
                        {!loading && !image && (
                             <div className="text-center text-slate-600 opacity-60">
                                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-20 w-20 mb-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3ZM5 19V5H19V19H5ZM16.5 16L13.5 12L10 16.5L7.5 13L5 17.5H19L16.5 16Z"></path></svg>
                                <p className="text-lg">Configure settings to generate designs</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ImageGenerator;
