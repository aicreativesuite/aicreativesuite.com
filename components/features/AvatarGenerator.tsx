
import React, { useState } from 'react';
import { generateImage } from '../../services/geminiService';
import { ASPECT_RATIOS, AVATAR_HAIR_COLORS, AVATAR_EYE_COLORS, AVATAR_CLOTHING_STYLES, AVATAR_EXPRESSIONS, BACKGROUND_OPTIONS } from '../../constants';
import Loader from '../common/Loader';
import QRCode from 'qrcode';

interface AvatarGeneratorProps {
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

const AvatarGenerator: React.FC<AvatarGeneratorProps> = ({ onShare }) => {
    const [prompt, setPrompt] = useState('');
    const [hairColor, setHairColor] = useState(AVATAR_HAIR_COLORS[0]);
    const [eyeColor, setEyeColor] = useState(AVATAR_EYE_COLORS[0]);
    const [clothingStyle, setClothingStyle] = useState(AVATAR_CLOTHING_STYLES[0]);
    const [expression, setExpression] = useState(AVATAR_EXPRESSIONS[0]);
    const [background, setBackground] = useState(BACKGROUND_OPTIONS[0].value);
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [addQr, setAddQr] = useState(false);
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSaved, setIsSaved] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt) {
            setError('Please describe the character you want to create.');
            return;
        }
        setLoading(true);
        setError(null);
        setImage(null);
        setIsSaved(false);
        try {
            let fullPrompt = `A high-quality, digital art headshot avatar of ${prompt}.`;
            
            const attributes = [
                hairColor !== 'any color' && `${hairColor} hair`,
                eyeColor !== 'any color' && `${eyeColor} eyes`,
                clothingStyle !== 'any style' && `wearing ${clothingStyle}`,
                expression !== 'neutral' && `with a ${expression} expression`,
            ].filter(Boolean).join(', ');

            if (attributes) {
                fullPrompt += ` The character has ${attributes}.`;
            }
            
            if (background) {
                fullPrompt += ` ${background}.`;
            }
            
            const imageBytes = await generateImage(fullPrompt, aspectRatio);
            
            if (addQr) {
                const imageWithQr = await addQrCodeToImage(imageBytes);
                setImage(imageWithQr);
            } else {
                setImage(`data:image/jpeg;base64,${imageBytes}`);
            }
        } catch (err) {
            setError('Failed to generate avatar. Please try again.');
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
        <div className="flex flex-col md:flex-row gap-8">
            <form onSubmit={handleSubmit} className="w-full md:w-1/3 space-y-6">
                <div>
                    <label htmlFor="prompt" className="block text-sm font-medium text-slate-300 mb-2">Character Description</label>
                    <textarea
                        id="prompt"
                        rows={3}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                        placeholder="e.g., a wise owl wizard, a female cyberpunk hacker"
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="hairColor" className="block text-sm font-medium text-slate-300 mb-2">Hair Color</label>
                        <select
                            id="hairColor"
                            value={hairColor}
                            onChange={(e) => setHairColor(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500"
                        >
                            {AVATAR_HAIR_COLORS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="eyeColor" className="block text-sm font-medium text-slate-300 mb-2">Eye Color</label>
                        <select
                            id="eyeColor"
                            value={eyeColor}
                            onChange={(e) => setEyeColor(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500"
                        >
                            {AVATAR_EYE_COLORS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                        </select>
                    </div>
                </div>

                <div>
                    <label htmlFor="clothingStyle" className="block text-sm font-medium text-slate-300 mb-2">Clothing Style</label>
                    <select
                        id="clothingStyle"
                        value={clothingStyle}
                        onChange={(e) => setClothingStyle(e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500"
                    >
                        {AVATAR_CLOTHING_STYLES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="expression" className="block text-sm font-medium text-slate-300 mb-2">Expression</label>
                        <select
                            id="expression"
                            value={expression}
                            onChange={(e) => setExpression(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500"
                        >
                            {AVATAR_EXPRESSIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="background" className="block text-sm font-medium text-slate-300 mb-2">Background</label>
                        <select
                            id="background"
                            value={background}
                            onChange={(e) => setBackground(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500"
                        >
                            {BACKGROUND_OPTIONS.map((bg) => <option key={bg.label} value={bg.value}>{bg.label}</option>)}
                        </select>
                    </div>
                </div>

                 <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Aspect Ratio</label>
                    <div className="grid grid-cols-5 gap-2">
                        {ASPECT_RATIOS.map((ratio) => (
                            <button
                                key={ratio}
                                type="button"
                                onClick={() => setAspectRatio(ratio)}
                                className={`p-2 rounded-lg border text-sm transition ${aspectRatio === ratio ? 'bg-cyan-500 border-cyan-500 text-white font-bold' : 'bg-slate-700 border-slate-600 hover:bg-slate-600'}`}
                            >
                                {ratio}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="flex items-center">
                    <input
                        id="add-qr"
                        type="checkbox"
                        checked={addQr}
                        onChange={(e) => setAddQr(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-cyan-600 focus:ring-cyan-500"
                    />
                    <label htmlFor="add-qr" className="ml-2 block text-sm text-slate-300">Add verification QR code (Watermark)</label>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-300 flex items-center justify-center"
                >
                    {loading ? 'Generating...' : 'Generate Avatar'}
                </button>
                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </form>

            <div className="w-full md:w-2/3 flex items-center justify-center bg-slate-800/50 rounded-lg border border-slate-700 min-h-[300px] md:min-h-0 p-4">
                {loading && <Loader message="Creating your avatar..." />}
                {!loading && image && (
                    <div className="text-center group">
                        <img src={image} alt="Generated Avatar" className="max-w-full max-h-[60vh] rounded-lg object-contain mb-4" />
                        <div className="flex flex-wrap gap-3 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <a href={image} download={`avatar-${Date.now()}.jpg`} className="flex items-center justify-center space-x-2 bg-slate-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-600 transition-colors duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                <span>Download</span>
                            </a>
                            <button
                                onClick={handleSave}
                                className={`flex items-center justify-center space-x-2 font-bold py-2 px-4 rounded-lg transition-colors duration-300 ${isSaved ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
                            >
                                {isSaved ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg>
                                )}
                                <span>{isSaved ? 'Saved' : 'Save'}</span>
                            </button>
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
                {!loading && !image && <p className="text-slate-500">Your generated avatar will appear here</p>}
            </div>
        </div>
    );
};

export default AvatarGenerator;
