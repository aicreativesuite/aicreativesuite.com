
import React, { useState, useRef, useEffect } from 'react';
import { editImage } from '../../services/geminiService';
import ImageUploader from '../common/ImageUploader';
import { fileToBase64 } from '../../utils';
import Loader from '../common/Loader';
import QRCode from 'qrcode';

interface ImageEditorProps {
    onShare: (options: { contentUrl: string; contentText: string; contentType: 'image' }) => void;
}

// --- Tool Definitions ---
type ToolCategory = 'AI Magic' | 'Artistic' | 'Adjust' | 'Geometry' | 'Convert' | 'Elements' | 'Text';

interface PhotoTool {
    id: string;
    name: string;
    category: ToolCategory;
    icon: string;
    prompt?: string; // For AI tools
    action?: string; // For client-side tools
    cssFilter?: string; // For CSS filters
    cssTransform?: string; // For CSS transforms
}

const PHOTO_TOOLS: PhotoTool[] = [
    // --- AI Magic ---
    { id: 'enhancer', name: 'AI Photo Enhancer', category: 'AI Magic', icon: '✨', prompt: 'Enhance this photo, improve clarity, fix lighting, and remove noise to make it high definition.' },
    { id: 'remove-bg', name: 'Background Remover', category: 'AI Magic', icon: '✂️', prompt: 'Remove the background from this image, leaving only the main subject on a transparent background.' },
    { id: 'magic-eraser', name: 'Magic Eraser', category: 'AI Magic', icon: '🧽', prompt: 'Clean up this picture, remove distractions and blemishes.' },
    { id: 'upscaler', name: 'AI Image Upscaler', category: 'AI Magic', icon: '📈', prompt: 'Upscale this image to 4k resolution, adding detail and sharpness.' },
    { id: 'generative-fill', name: 'AI Generative Fill', category: 'AI Magic', icon: '🖌️', prompt: 'Fill in the missing parts of this image naturally.' },
    { id: 'expander', name: 'AI Image Expander', category: 'AI Magic', icon: '↔️', prompt: 'Outpaint and expand the borders of this image seamlessly.' },
    { id: 'colorize', name: 'Colorize B&W', category: 'AI Magic', icon: '🎨', prompt: 'Colorize this black and white photo realistically.' },
    { id: 'remove-text', name: 'AI Text Remover', category: 'AI Magic', icon: '📝', prompt: 'Remove all text from this image while preserving the background.' },
    { id: 'headshot', name: 'AI Headshot Gen', category: 'AI Magic', icon: '👤', prompt: 'Transform this selfie into a professional studio headshot.' },
    { id: 'remove-black-bg', name: 'Remove Black BG', category: 'AI Magic', icon: '⬛', prompt: 'Remove the black background from this image.' },
    { id: 'remove-white-bg', name: 'Remove White BG', category: 'AI Magic', icon: '⬜', prompt: 'Remove the white background from this image.' },
    { id: 'logo-bg-remove', name: 'Logo BG Remover', category: 'AI Magic', icon: '🏢', prompt: 'Isolate this logo on a transparent background.' },
    { id: 'signature-bg', name: 'Signature Extractor', category: 'AI Magic', icon: '✍️', prompt: 'Extract this signature onto a transparent background.' },
    { id: 'faceswap', name: 'Face Swap', category: 'AI Magic', icon: '😊', prompt: 'Swap the face in this image with a generic pleasing face.' },

    // --- Artistic ---
    { id: 'cartoon', name: 'AI Cartoon Gen', category: 'Artistic', icon: '🤡', prompt: 'Convert this photo into a high-quality cartoon style.' },
    { id: 'anime', name: 'Photo to Anime', category: 'Artistic', icon: '🎌', prompt: 'Transform this image into an anime style illustration.' },
    { id: 'sketch', name: 'Photo to Sketch', category: 'Artistic', icon: '✏️', prompt: 'Convert this photo into a detailed pencil sketch.' },
    { id: 'vintage', name: 'Vintage Filter', category: 'Artistic', icon: '🕰️', prompt: 'Apply a nostalgic vintage aesthetic to this photo.' },
    { id: 'pattern', name: 'Pattern Generator', category: 'Artistic', icon: '💠', prompt: 'Create a seamless pattern based on the elements in this image.' },
    { id: 'overlay', name: 'Overlay Images', category: 'Artistic', icon: '🖼️', prompt: 'Create an artistic double exposure overlay effect.' },
    { id: 'textures', name: 'Texture Overlay', category: 'Artistic', icon: '🧱', prompt: 'Apply a homey, lived-in texture to the image.' },
    { id: 'glitch', name: 'Glitch Effect', category: 'Artistic', icon: '👾', prompt: 'Apply a cool digital glitch distortion effect to the image.' },
    
    // --- Text ---
    { id: 'curved-text', name: 'Curved Text', category: 'Text', icon: '↪️', prompt: 'Add the text "Hello World" with a stylish curved arch effect.' },
    { id: '3d-text', name: '3D Text Effects', category: 'Text', icon: '🧊', prompt: 'Add visual depth to text with 3D effects.' },
    
    // --- Elements ---
    { id: 'icons', name: 'Icons', category: 'Elements', icon: '⭐', prompt: 'Add a professional icon to the design.' },
    { id: 'stickers', name: 'Stickers', category: 'Elements', icon: '🦄', prompt: 'Add a fun sticker to the photo.' },
    { id: 'speech-bubble', name: 'Speech Bubble', category: 'Elements', icon: '💬', prompt: 'Add a comic-style speech bubble.' },
    { id: 'clipart', name: 'Clipart', category: 'Elements', icon: '📎', prompt: 'Add stylish clipart to the design.' },
    
    // --- Adjust (CSS/AI Mixed) ---
    { id: 'brighten', name: 'Brighten Image', category: 'Adjust', icon: '☀️', cssFilter: 'brightness(1.2)' },
    { id: 'darken', name: 'Darken Image', category: 'Adjust', icon: '🌙', cssFilter: 'brightness(0.8)' },
    { id: 'sharpen', name: 'Sharpen Image', category: 'Adjust', icon: '🔪', prompt: 'Sharpen this image to enhance edges and details.' }, // AI for better sharpening
    { id: 'blur', name: 'Photo Blur', category: 'Adjust', icon: '💧', cssFilter: 'blur(4px)' },
    { id: 'blur-bg', name: 'Blur Background', category: 'Adjust', icon: '🌫️', prompt: 'Blur the background of this image while keeping the subject sharp (Bokeh effect).' },
    { id: 'bw-filter', name: 'B&W Filter', category: 'Adjust', icon: '📓', cssFilter: 'grayscale(100%)' },
    { id: 'grayscale', name: 'Grayscale', category: 'Adjust', icon: '🗿', cssFilter: 'grayscale(100%) contrast(1.2)' },
    { id: 'invert', name: 'Color Inverter', category: 'Adjust', icon: '🔄', cssFilter: 'invert(100%)' },
    { id: 'change-color', name: 'Change Color', category: 'Adjust', icon: '🌈', prompt: 'Shift the hues of this image to be more vibrant and colorful.' },
    { id: 'vignette', name: 'Vignette', category: 'Adjust', icon: '🌑', prompt: 'Add a cinematic vignette to this photo.' },

    // --- Geometry (CSS) ---
    { id: 'rotate', name: 'Rotate Image', category: 'Geometry', icon: '🔃', cssTransform: 'rotate(90deg)' },
    { id: 'flip', name: 'Flip Image', category: 'Geometry', icon: '↔️', cssTransform: 'scaleX(-1)' },
    { id: 'mirror', name: 'Mirror Images', category: 'Geometry', icon: '🪞', cssTransform: 'scaleX(-1)' }, // Simplified for CSS demo
    { id: 'straighten', name: 'Photo Straightener', category: 'Geometry', icon: '📏', prompt: 'Straighten this image and fix the horizon line.' }, // AI better for straightening
    { id: 'circle-crop', name: 'Circle Crop', category: 'Geometry', icon: '⭕', action: 'setCircle' },
    { id: 'crop', name: 'Crop Image', category: 'Geometry', icon: '✂️', prompt: 'Crop this image to improve composition.' },
    { id: 'frame', name: 'Add Frames', category: 'Geometry', icon: '🖼️', prompt: 'Add an artistic frame around this photo.' },
    { id: 'borders', name: 'Photo Borders', category: 'Geometry', icon: '⬜', prompt: 'Add a clean white border around this photo.' },
    { id: 'grids', name: 'Design Grids', category: 'Geometry', icon: '▦', prompt: 'Overlay a crisp design grid for layout composition.' },

    // --- Convert (Functionality) ---
    { id: 'ascii', name: 'ASCII Art', category: 'Convert', icon: '🔢', prompt: 'Convert this image into ASCII art characters.' },
    { id: 'jpg-png', name: 'JPG to PNG', category: 'Convert', icon: '📄', action: 'convert-png' },
    { id: 'png-jpg', name: 'PNG to JPG', category: 'Convert', icon: '🖼️', action: 'convert-jpg' },
    { id: 'webp-jpg', name: 'WEBP to JPG', category: 'Convert', icon: '🌐', action: 'convert-jpg' },
    { id: 'heic-jpg', name: 'HEIC to JPG', category: 'Convert', icon: '🍏', action: 'convert-jpg' }, // Sim via canvas
    { id: 'svg-png', name: 'SVG to PNG', category: 'Convert', icon: '📐', action: 'convert-png' },
    { id: 'pdf-convert', name: 'Image to PDF', category: 'Convert', icon: '📕', action: 'convert-pdf' },
    { id: 'gif-text', name: 'Add Text to GIF', category: 'Convert', icon: '👾', prompt: 'Add text to this image: "Reaction!"' },
];

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
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [addQr, setAddQr] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSaved, setIsSaved] = useState(false);
    
    // UI State
    const [activeCategory, setActiveCategory] = useState<ToolCategory>('AI Magic');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Live CSS States
    const [activeFilter, setActiveFilter] = useState('');
    const [activeTransform, setActiveTransform] = useState('');
    const [isCircle, setIsCircle] = useState(false);
    const [convertFormat, setConvertFormat] = useState<string | null>(null);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        if (!originalImage) {
            setError('Please upload an image first.');
            return;
        }

        // Check if it's a conversion request
        if (convertFormat) {
            handleDownload(convertFormat);
            return;
        }

        if (!prompt) {
            setError('Please select a tool or enter an instruction.');
            return;
        }

        setLoading(true);
        setError(null);
        setEditedImage(null);
        setIsSaved(false);

        try {
            const imageBase64 = await fileToBase64(originalImage);
            // Append instruction for filters if applied manually but sending to AI
            let finalPrompt = prompt;
            
            const resultBase64 = await editImage(finalPrompt, imageBase64, originalImage.type);
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
            setError('Failed to process image. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (file: File) => {
        setOriginalImage(file);
        setEditedImage(null);
        setPreviewImage(URL.createObjectURL(file));
        setError(null);
        setIsSaved(false);
        // Reset CSS
        setActiveFilter('');
        setActiveTransform('');
        setIsCircle(false);
        setConvertFormat(null);
    };

    const handleImageClear = () => {
        setOriginalImage(null);
        setEditedImage(null);
        setPreviewImage(null);
        setError(null);
        setPrompt('');
        setIsSaved(false);
        setActiveFilter('');
        setActiveTransform('');
        setIsCircle(false);
        setConvertFormat(null);
    };
    
    const handleSave = () => {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    const handleToolClick = (tool: PhotoTool) => {
        setError(null);
        setConvertFormat(null);

        // 1. Handle AI Prompt Tools
        if (tool.prompt) {
            setPrompt(tool.prompt);
            // If it's purely AI, reset CSS previews to avoid confusion, 
            // unless we want to send the CSS-modified image to AI (complex without canvas intermediate)
            // For now, AI works on original.
        }

        // 2. Handle CSS Filters (Live Preview)
        if (tool.cssFilter) {
            setActiveFilter(prev => prev === tool.cssFilter ? '' : tool.cssFilter!); // Toggle
            setPrompt(`Apply filter: ${tool.name}`); // Just for context
        }

        // 3. Handle CSS Transforms
        if (tool.cssTransform) {
            setActiveTransform(prev => prev === tool.cssTransform ? '' : tool.cssTransform!); // Toggle
        }

        // 4. Handle Special Actions
        if (tool.action) {
            if (tool.action === 'setCircle') {
                setIsCircle(!isCircle);
            }
            if (tool.action.startsWith('convert-')) {
                const format = tool.action.split('-')[1];
                setConvertFormat(format);
                setPrompt(`Convert image to ${format.toUpperCase()}`);
            }
        }
    };

    const handleDownload = (formatOverride?: string) => {
        const link = document.createElement('a');
        const imageSrc = editedImage || previewImage;
        if (!imageSrc) return;

        // If we have live CSS filters/transforms/crops, we need to draw to canvas to save them
        if ((activeFilter || activeTransform || isCircle || formatOverride) && !editedImage && previewImage) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.src = previewImage;
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                
                if (ctx) {
                    if (isCircle) {
                        ctx.beginPath();
                        ctx.arc(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 2, 0, Math.PI * 2);
                        ctx.clip();
                    }
                    
                    if (activeFilter) {
                        ctx.filter = activeFilter;
                    }

                    if (activeTransform.includes('scaleX(-1)')) {
                        ctx.translate(canvas.width, 0);
                        ctx.scale(-1, 1);
                    }
                    if (activeTransform.includes('rotate(90deg)')) {
                         // Simple rotation handling requires canvas resizing, skipping complex rotation for simple demo
                         // Just draw normally if rotation is complex without resize
                    }

                    ctx.drawImage(img, 0, 0);
                    
                    let mimeType = 'image/png';
                    let ext = 'png';
                    if (formatOverride === 'jpg') { mimeType = 'image/jpeg'; ext = 'jpg'; }
                    if (formatOverride === 'pdf') { /* PDF logic would go here (requires library usually), fallback to PNG */ }

                    const dataUrl = canvas.toDataURL(mimeType);
                    link.href = dataUrl;
                    link.download = `edited-image.${ext}`;
                    link.click();
                }
            };
        } else {
            // Direct download
            link.href = imageSrc;
            link.download = `image-${Date.now()}.${formatOverride || 'png'}`;
            link.click();
        }
    };

    const filteredTools = PHOTO_TOOLS.filter(t => 
        (t.category === activeCategory) && 
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 h-[calc(100vh-10rem)] flex flex-col">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                
                {/* Left: Canvas & Upload */}
                <div className="lg:col-span-2 flex flex-col gap-4 min-h-0">
                    <div className="flex-shrink-0">
                        <ImageUploader 
                            onImageUpload={handleImageUpload}
                            onImageClear={handleImageClear} 
                        />
                    </div>
                    
                    {/* Main Preview Area */}
                    <div className="flex-grow bg-slate-900/50 border border-slate-700 rounded-2xl p-6 flex items-center justify-center relative overflow-hidden group">
                        {/* Background Grid */}
                        <div className="absolute inset-0 bg-grid-slate-800/20 [mask-image:linear-gradient(to_bottom,white,transparent)] pointer-events-none"></div>

                        {loading && <Loader message="Processing image..." />}
                        
                        {!loading && (editedImage || previewImage) ? (
                            <div className="relative max-w-full max-h-full flex flex-col items-center">
                                <img 
                                    src={editedImage || previewImage!} 
                                    alt="Preview" 
                                    className="max-w-full max-h-[50vh] object-contain transition-all duration-300"
                                    style={{
                                        filter: !editedImage ? activeFilter : 'none',
                                        transform: !editedImage ? activeTransform : 'none',
                                        borderRadius: (!editedImage && isCircle) ? '50%' : '8px'
                                    }}
                                />
                                
                                {/* Quick Actions Overlay */}
                                <div className="absolute bottom-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 p-2 rounded-xl backdrop-blur-sm">
                                    <button onClick={() => handleDownload(convertFormat || undefined)} className="bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-600 transition">
                                        Download {convertFormat ? convertFormat.toUpperCase() : ''}
                                    </button>
                                    <button onClick={handleSave} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${isSaved ? 'bg-green-600 text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`}>
                                        {isSaved ? 'Saved' : 'Save'}
                                    </button>
                                    <button onClick={() => onShare({ contentUrl: editedImage || previewImage!, contentText: prompt, contentType: 'image' })} className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-purple-500 transition">
                                        Share
                                    </button>
                                </div>
                            </div>
                        ) : (
                            !loading && <div className="text-slate-500 flex flex-col items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 opacity-20 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <p>Upload an image to start editing</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Toolkit */}
                <div className="lg:col-span-1 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 flex flex-col overflow-hidden shadow-xl">
                    <div className="p-4 border-b border-slate-800 bg-slate-950">
                        <h3 className="font-bold text-white mb-3">Photo Toolkit</h3>
                        <input 
                            type="text" 
                            placeholder="Search tools (e.g. crop, cartoon)..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:ring-2 focus:ring-cyan-500 mb-3"
                        />
                        <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                            {['AI Magic', 'Artistic', 'Text', 'Elements', 'Adjust', 'Geometry', 'Convert'].map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat as ToolCategory)}
                                    className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${activeCategory === cat ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
                        <div className="grid grid-cols-2 gap-3">
                            {filteredTools.map(tool => (
                                <button
                                    key={tool.id}
                                    onClick={() => handleToolClick(tool)}
                                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800 border border-slate-700 hover:border-cyan-500 hover:bg-slate-700 transition group text-center h-24"
                                >
                                    <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">{tool.icon}</span>
                                    <span className="text-xs font-medium text-slate-300 group-hover:text-white leading-tight">{tool.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 border-t border-slate-800 bg-slate-950 space-y-3">
                        <div>
                            <label htmlFor="edit-prompt" className="block text-xs font-bold text-slate-500 uppercase mb-1">Instruction</label>
                            <textarea
                                id="edit-prompt"
                                rows={2}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm focus:ring-1 focus:ring-cyan-500 resize-none"
                                placeholder="Select a tool or type instruction..."
                            />
                        </div>
                        {convertFormat ? (
                            <button
                                onClick={() => handleDownload(convertFormat)}
                                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg transition shadow-lg"
                            >
                                Download as {convertFormat.toUpperCase()}
                            </button>
                        ) : (
                            <button
                                onClick={() => handleSubmit()}
                                disabled={loading || !originalImage}
                                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 rounded-lg transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Processing...' : 'Apply AI Edit'}
                            </button>
                        )}
                        {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageEditor;
