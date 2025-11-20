
import React, { useState } from 'react';
import { editImage } from '../../services/geminiService';
import ImageUploader from '../common/ImageUploader';
import { fileToBase64 } from '../../utils';
import Loader from '../common/Loader';
import { IMAGE_EDIT_SUGGESTIONS } from '../../constants';
import QRCode from 'qrcode';

interface ImageEditorProps {
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
                    resolve(canvas.toDataURL('image/png'));
                };
                qrImage.onerror = reject;
                qrImage.src = qrUrl;
            });
        };
        baseImage.onerror = reject;
        baseImage.src = `data:image/png;base64,${imageBase64}`;
    });
};

const ImageEditor: React.FC<ImageEditorProps> = ({ onShare }) => {
    const [prompt, setPrompt] = useState('');
    const [originalImage, setOriginalImage] = useState<File | null>(null);
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [addQr, setAddQr] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSaved, setIsSaved] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt || !originalImage) {
            setError('Please upload an image and provide an editing instruction.');
            return;
        }
        setLoading(true);
        setError(null);
        setEditedImage(null);
        setIsSaved(false);

        try {
            const imageBase64 = await fileToBase64(originalImage);
            const resultBase64 = await editImage(prompt, imageBase64, originalImage.type);
            if (resultBase64) {
                if (addQr) {
                    const imageWithQr = await addQrCodeToImage(resultBase64);
                    setEditedImage(imageWithQr);
                } else {
                    setEditedImage(`data:image/png;base64,${resultBase64}`);
                }
            } else {
                throw new Error("The model did not return an image.");
            }
        } catch (err) {
            setError('Failed to edit image. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (file: File) => {
        setOriginalImage(file);
        setEditedImage(null); // Clear previous edit
        setError(null);
        setIsSaved(false);
    };

    const handleImageClear = () => {
        setOriginalImage(null);
        setEditedImage(null);
        setError(null);
        setPrompt('');
        setIsSaved(false);
    };
    
    const handleSave = () => {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Original Image */}
                <div className="space-y-3">
                    <h3 className="text-lg font-bold text-center text-slate-300">Original</h3>
                    <ImageUploader 
                        onImageUpload={handleImageUpload}
                        onImageClear={handleImageClear} 
                    />
                </div>
                
                {/* Edited Image */}
                <div className="space-y-3">
                    <h3 className="text-lg font-bold text-center text-slate-300">Edited</h3>
                    <div className="w-full h-full relative bg-slate-900/50 border border-slate-700 rounded-lg p-6 text-center flex items-center justify-center min-h-[300px] aspect-square">
                        {loading && <Loader message="The AI is working its magic..." />}
                        {!loading && editedImage && (
                            <div className="text-center group w-full flex flex-col items-center">
                                <img src={editedImage} alt="Edited" className="max-w-full max-h-[50vh] rounded-lg object-contain mb-4" />
                                <div className="flex flex-wrap gap-3 justify-center opacity-0 group-hover:opacity-100 transition-opacity w-full">
                                    <a href={editedImage} download={`edited-image-${Date.now()}.png`} className="flex items-center justify-center space-x-2 bg-slate-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-600 transition-colors duration-300">
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
                                        onClick={() => onShare({ contentUrl: editedImage, contentText: prompt, contentType: 'image' })}
                                        className="flex items-center justify-center space-x-2 bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-300"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                                        </svg>
                                        <span>Share</span>
                                    </button>
                                </div>
                            </div>
                        )}
                        {!loading && !editedImage && <p className="text-slate-500">Your edited image will appear here</p>}
                    </div>
                </div>
            </div>
            
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                <form onSubmit={handleSubmit} className="space-y-6">
                     <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                        <div>
                            <label htmlFor="edit-prompt" className="block text-sm font-medium text-slate-300 mb-2">Editing Instructions</label>
                            <textarea
                                id="edit-prompt"
                                rows={5}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 transition"
                                placeholder="e.g., Add a retro filter, or remove the person in the background"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Suggestions</label>
                            <div className="flex flex-wrap gap-2">
                                {IMAGE_EDIT_SUGGESTIONS.map(suggestion => (
                                    <button
                                        key={suggestion}
                                        type="button"
                                        onClick={() => setPrompt(suggestion)}
                                        className="bg-slate-700 text-xs text-slate-300 px-3 py-1.5 rounded-full hover:bg-slate-600 transition"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-6 flex items-center">
                                <input
                                    id="add-qr-edit"
                                    type="checkbox"
                                    checked={addQr}
                                    onChange={(e) => setAddQr(e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-cyan-600 focus:ring-cyan-500"
                                />
                                <label htmlFor="add-qr-edit" className="ml-2 block text-sm text-slate-300">Add verification QR code</label>
                            </div>
                        </div>
                     </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-300"
                    >
                        {loading ? 'Applying Edits...' : 'Edit Image'}
                    </button>
                    {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
                </form>
            </div>
        </div>
    );
};

export default ImageEditor;
