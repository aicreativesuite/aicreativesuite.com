


import React, { useState, useEffect } from 'react';
import { generateImage } from '../../services/geminiService';
import { DESIGN_STYLES, ASPECT_RATIOS, ART_TECHNIQUES_BY_DESIGN, ARTISTIC_STYLES } from '../../constants';
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
    const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[0]);
    const [addQr, setAddQr] = useState(true);
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
        try {
            let fullPrompt = `${prompt}, in a ${designStyle} design style${artTechnique ? `, using a ${artTechnique} technique` : ''}${artisticStyle !== 'None' ? `, with a ${artisticStyle} artistic style` : ''}.`;
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
    
    const availableArtTechniques = ART_TECHNIQUES_BY_DESIGN[designStyle] || [];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Controls Area */}
            <div className="lg:col-span-1">
                <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 sticky top-8">
                    <div>
                        <label htmlFor="prompt" className="block text-sm font-medium text-slate-300 mb-2">Your Vision</label>
                        <textarea
                            id="prompt"
                            rows={4}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 transition"
                            placeholder="e.g., A futuristic cityscape at sunset"
                        />
                    </div>
                     <div>
                        <label htmlFor="negative-prompt" className="block text-sm font-medium text-slate-300 mb-2">Negative Prompt (Optional)</label>
                        <textarea
                            id="negative-prompt"
                            rows={2}
                            value={negativePrompt}
                            onChange={(e) => setNegativePrompt(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 transition"
                            placeholder="e.g., text, watermarks, people"
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="design-style" className="block text-sm font-medium text-slate-300 mb-2">Design Style</label>
                            <select id="design-style" value={designStyle} onChange={(e) => setDesignStyle(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 transition">
                                {DESIGN_STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="artistic-style" className="block text-sm font-medium text-slate-300 mb-2">Artistic Style</label>
                            <select id="artistic-style" value={artisticStyle} onChange={(e) => setArtisticStyle(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 transition">
                                {ARTISTIC_STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    {availableArtTechniques.length > 0 && (
                        <div>
                            <label htmlFor="art-technique" className="block text-sm font-medium text-slate-300 mb-2">Art Technique</label>
                            <select id="art-technique" value={artTechnique} onChange={(e) => setArtTechnique(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 transition">
                                {availableArtTechniques.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Aspect Ratio</label>
                        <div className="grid grid-cols-5 gap-2">
                            {ASPECT_RATIOS.map((ratio) => (
                                <button key={ratio} type="button" onClick={() => setAspectRatio(ratio)} className={`py-2 px-1 rounded-lg border text-xs sm:text-sm transition ${aspectRatio === ratio ? 'bg-cyan-500 border-cyan-500 text-white font-bold' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'}`}>
                                    {ratio}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                        {loading ? 'Generating...' : 'Generate Image'}
                    </button>
                    <div className="flex items-center">
                        <input
                            id="add-qr"
                            type="checkbox"
                            checked={addQr}
                            onChange={(e) => setAddQr(e.target.checked)}
                            className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-cyan-600 focus:ring-cyan-500"
                        />
                        <label htmlFor="add-qr" className="ml-2 block text-sm text-slate-400">Add verification QR code</label>
                    </div>
                    {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                </form>
            </div>
             {/* Output Area */}
             <div className="lg:col-span-2 w-full flex items-center justify-center bg-slate-900/50 rounded-2xl border border-slate-800 min-h-[400px] lg:min-h-[calc(100vh-10rem)] p-6">
                {loading && <Loader message="Creating your vision..." />}
                {!loading && image && (
                     <div className="text-center w-full h-full flex flex-col items-center justify-center group">
                        <img src={image} alt="Generated" className="max-w-full max-h-full rounded-lg object-contain shadow-2xl shadow-black/40" />
                        <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => onShare({ contentUrl: image, contentText: prompt, contentType: 'image' })}
                                className="flex items-center justify-center space-x-2 bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-300"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                                </svg>
                                <span>Share & Promote</span>
                            </button>
                        </div>
                    </div>
                )}
                {!loading && !image && (
                     <div className="text-center text-slate-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 opacity-30" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3ZM5 19V5H19V19H5ZM16.5 16L13.5 12L10 16.5L7.5 13L5 17.5H19L16.5 16Z"></path></svg>
                        <p className="mt-4">Your masterpiece awaits</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageGenerator;