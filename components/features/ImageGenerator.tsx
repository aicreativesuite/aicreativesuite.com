
import React, { useState, useEffect } from 'react';
import { generateImage } from '../../services/geminiService';
import { DESIGN_STYLES, ASPECT_RATIOS, ART_TECHNIQUES_BY_DESIGN, ARTISTIC_STYLES, VISUAL_EFFECTS, BACKGROUND_OPTIONS } from '../../constants';
import Loader from '../common/Loader';
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
    const [prompt, setPrompt] = useState('');
    const [negativePrompt, setNegativePrompt] = useState('');
    const [designStyle, setDesignStyle] = useState(DESIGN_STYLES[0]);
    const [artTechnique, setArtTechnique] = useState('');
    const [artisticStyle, setArtisticStyle] = useState(ARTISTIC_STYLES[0]);
    const [visualEffect, setVisualEffect] = useState(VISUAL_EFFECTS[0]);
    const [background, setBackground] = useState(BACKGROUND_OPTIONS[0].value);
    const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[0]);
    const [addQr, setAddQr] = useState(false);
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        const availableArtTechniques = ART_TECHNIQUES_BY_DESIGN[designStyle] || [];
        setArtTechnique(availableArtTechniques.length > 0 ? availableArtTechniques[0] : '');
    }, [designStyle]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt) {
            setError('Please enter a prompt.');
            return;
        }
        setLoading(true);
        setError(null);
        setImage(null);
        setIsSaved(false);
        try {
            let fullPrompt = `${prompt}, in a ${designStyle} design style${artTechnique ? `, using a ${artTechnique} technique` : ''}${artisticStyle !== 'None' ? `, with a ${artisticStyle} artistic style` : ''}${visualEffect !== 'None' ? `, featuring ${visualEffect} visual effects` : ''}`;
            
            if (background) {
                fullPrompt += `, ${background}`;
            }
            
            fullPrompt += '.';

            if (negativePrompt) {
                fullPrompt += `, avoiding ${negativePrompt}`;
            }
            const imageBytes = await generateImage(fullPrompt, aspectRatio);
            if (addQr) {
                const imageWithQrDataUrl = await addQrCodeToImage(imageBytes);
                setImage(imageWithQrDataUrl);
            } else {
                setImage(`data:image/jpeg;base64,${imageBytes}`);
            }
        } catch (err) {
            setError('Failed to generate image. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
    const handleSave = () => {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };
    
    const availableArtTechniques = ART_TECHNIQUES_BY_DESIGN[designStyle] || [];

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)] min-h-[600px]">
            {/* Sidebar Controls */}
            <div className="w-full lg:w-80 flex-shrink-0 bg-slate-900/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-800 overflow-y-auto custom-scrollbar">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="prompt" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Your Vision</label>
                        <textarea
                            id="prompt"
                            rows={4}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500 placeholder-slate-600 resize-none transition"
                            placeholder="e.g., A futuristic cityscape at sunset"
                        />
                    </div>
                     <div>
                        <label htmlFor="negative-prompt" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Negative Prompt</label>
                        <textarea
                            id="negative-prompt"
                            rows={2}
                            value={negativePrompt}
                            onChange={(e) => setNegativePrompt(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500 placeholder-slate-600 resize-none transition"
                            placeholder="e.g., text, watermarks, people"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Style</label>
                            <select id="design-style" value={designStyle} onChange={(e) => setDesignStyle(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white">
                                {DESIGN_STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Artistry</label>
                            <select id="artistic-style" value={artisticStyle} onChange={(e) => setArtisticStyle(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white">
                                {ARTISTIC_STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        {availableArtTechniques.length > 0 && (
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Technique</label>
                                <select id="art-technique" value={artTechnique} onChange={(e) => setArtTechnique(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white">
                                    {availableArtTechniques.map((s) => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        )}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Effect</label>
                            <select id="visual-effect" value={visualEffect} onChange={(e) => setVisualEffect(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white">
                                {VISUAL_EFFECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="background" className="block text-xs font-bold text-slate-400 uppercase mb-2">Background</label>
                        <select id="background" value={background} onChange={(e) => setBackground(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white">
                            {BACKGROUND_OPTIONS.map((bg) => <option key={bg.label} value={bg.value}>{bg.label}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Aspect Ratio</label>
                        <div className="grid grid-cols-3 gap-2">
                            {ASPECT_RATIOS.map((ratio) => (
                                <button key={ratio} type="button" onClick={() => setAspectRatio(ratio)} className={`py-2 px-1 rounded-lg border text-xs font-medium transition ${aspectRatio === ratio ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-400'}`}>
                                    {ratio}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
                        <input
                            id="add-qr"
                            type="checkbox"
                            checked={addQr}
                            onChange={(e) => setAddQr(e.target.checked)}
                            className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-cyan-600 focus:ring-cyan-500"
                        />
                        <label htmlFor="add-qr" className="block text-xs text-slate-300">Add verification QR (Watermark)</label>
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center space-x-2">
                        {loading ? <Loader /> : <span>Generate Image</span>}
                    </button>
                    {error && <p className="text-red-400 text-xs text-center bg-red-900/20 p-2 rounded">{error}</p>}
                </form>
            </div>

             {/* Output Area */}
             <div className="flex-grow bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col overflow-hidden relative">
                {/* Header */}
                <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                    <h3 className="font-bold text-white text-sm uppercase tracking-wider">Result</h3>
                    {image && (
                        <div className="flex space-x-2">
                             <a href={image} download={`generated-image-${Date.now()}.jpg`} className="p-2 rounded hover:bg-slate-800 text-slate-400 hover:text-white" title="Download">
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
                    {loading && <Loader message="Creating your vision..." />}
                    {!loading && image && (
                         <div className="relative group max-w-full max-h-full">
                            <img src={image} alt="Generated" className="max-w-full max-h-[calc(100vh-16rem)] rounded-lg object-contain shadow-2xl shadow-black/50" />
                        </div>
                    )}
                    {!loading && !image && (
                         <div className="text-center text-slate-600 opacity-60">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-20 w-20 mb-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3ZM5 19V5H19V19H5ZM16.5 16L13.5 12L10 16.5L7.5 13L5 17.5H19L16.5 16Z"></path></svg>
                            <p className="text-lg">Enter a prompt to create an image</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageGenerator;
