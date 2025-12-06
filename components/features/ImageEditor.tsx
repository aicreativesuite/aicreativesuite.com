
import React, { useState } from 'react';
import { editImage } from '../../services/geminiService';
import ImageUploader from '../common/ImageUploader';
import { fileToBase64, addQrCodeToImage } from '../../utils';
import Loader from '../common/Loader';

interface ImageEditorProps {
    onShare: (options: { contentUrl: string; contentText: string; contentType: 'image' }) => void;
}

// --- Tool Definitions ---
type ToolCategory = 'AI Magic' | 'Design' | 'Product' | 'Adjust' | 'Geometry';

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
    { id: 'object-edit', name: 'Object Replace', category: 'AI Magic', icon: '🪄', prompt: 'Change the [Object] to [New Object]. Maintain perspective and lighting.' },
    { id: 'remove-bg', name: 'Remove BG', category: 'AI Magic', icon: '✂️', prompt: 'Remove the background from this image, leaving only the main subject on a transparent background.' },
    { id: 'generative-fill', name: 'Magic Fill', category: 'AI Magic', icon: '🖌️', prompt: 'Fill in the missing parts of this image naturally.' },
    { id: 'style-transfer', name: 'Style Transfer', category: 'AI Magic', icon: '🎨', prompt: 'Transform this image into the style of [Style].' },
    
    // --- Adjust (CSS) ---
    { id: 'brighten', name: 'Brighten', category: 'Adjust', icon: '☀️', cssFilter: 'brightness(1.2)' },
    { id: 'darken', name: 'Darken', category: 'Adjust', icon: '🌙', cssFilter: 'brightness(0.8)' },
    { id: 'contrast', name: 'Contrast', category: 'Adjust', icon: '🌗', cssFilter: 'contrast(1.2)' },
    { id: 'grayscale', name: 'B&W', category: 'Adjust', icon: '🗿', cssFilter: 'grayscale(100%)' },

    // --- Geometry (CSS) ---
    { id: 'rotate', name: 'Rotate 90°', category: 'Geometry', icon: '🔃', cssTransform: 'rotate(90deg)' },
    { id: 'flip', name: 'Flip H', category: 'Geometry', icon: '↔️', cssTransform: 'scaleX(-1)' },
];

const LayerItem: React.FC<{ name: string; active?: boolean; visible?: boolean }> = ({ name, active, visible = true }) => (
    <div className={`flex items-center justify-between p-2 rounded-lg mb-1 cursor-pointer ${active ? 'bg-cyan-900/30 border border-cyan-500/30' : 'hover:bg-slate-800'}`}>
        <div className="flex items-center gap-2">
            <div className="w-4 h-4 border border-slate-600 rounded bg-slate-700"></div>
            <span className={`text-xs ${active ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}>{name}</span>
        </div>
        <button className="text-slate-500 hover:text-white">
            {visible ? '👁️' : '🚫'}
        </button>
    </div>
);

const ImageEditor: React.FC<ImageEditorProps> = ({ onShare }) => {
    const [prompt, setPrompt] = useState('');
    const [originalImage, setOriginalImage] = useState<File | null>(null);
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeToolId, setActiveToolId] = useState<string | null>(null);
    
    // Visual State
    const [cssFilters, setCssFilters] = useState<string>('');
    const [rotation, setRotation] = useState(0);
    const [flipH, setFlipH] = useState(false);
    
    // For Object Editor
    const [targetObject, setTargetObject] = useState('');
    const [replacementObject, setReplacementObject] = useState('');

    const handleToolClick = async (tool: PhotoTool) => {
        setActiveToolId(tool.id);
        
        if (tool.cssFilter) {
            setCssFilters(prev => prev.includes(tool.cssFilter!) ? prev.replace(tool.cssFilter!, '') : prev + ' ' + tool.cssFilter);
            return;
        }
        if (tool.id === 'rotate') { setRotation(prev => prev + 90); return; }
        if (tool.id === 'flip') { setFlipH(prev => !prev); return; }

        if (tool.prompt) {
            setPrompt(tool.prompt);
        }
    };

    const handleProcess = async () => {
        if (!originalImage) { setError('Please upload an image first.'); return; }
        if (!prompt) { setError('Please describe the edit.'); return; }

        setLoading(true);
        setError(null);
        setEditedImage(null);

        try {
            const base64 = await fileToBase64(originalImage);
            
            let finalPrompt = prompt;
            if (activeToolId === 'object-edit') {
                if (!targetObject || !replacementObject) throw new Error("Please specify objects.");
                finalPrompt = prompt.replace('[Object]', targetObject).replace('[New Object]', replacementObject);
            } else if (activeToolId === 'style-transfer') {
                 if (!replacementObject) throw new Error("Please specify a style.");
                 finalPrompt = prompt.replace('[Style]', replacementObject);
            }

            const resultBase64 = await editImage(finalPrompt, base64, originalImage.type);
            
            if (resultBase64) {
                const resultWithQr = await addQrCodeToImage(resultBase64);
                setEditedImage(resultWithQr);
            } else {
                throw new Error("No image returned from API.");
            }
        } catch (err: any) {
            setError(err.message || 'Failed to edit image.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-10rem)] min-h-[600px] overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
            
            {/* LEFT TOOLBAR */}
            <div className="w-16 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-4 gap-4 z-20">
                {PHOTO_TOOLS.map(tool => (
                    <button
                        key={tool.id}
                        onClick={() => handleToolClick(tool)}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${activeToolId === tool.id ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        title={tool.name}
                    >
                        {tool.icon}
                    </button>
                ))}
            </div>

            {/* CENTER CANVAS */}
            <div className="flex-grow relative bg-grid-slate-900/50 flex items-center justify-center overflow-hidden p-8">
                {loading && (
                    <div className="absolute inset-0 bg-black/70 z-50 flex items-center justify-center backdrop-blur-sm">
                        <Loader message="AI Magic in progress..." />
                    </div>
                )}
                
                <div 
                    className="relative max-w-full max-h-full transition-all duration-300 shadow-2xl"
                    style={{ 
                        filter: cssFilters, 
                        transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1})` 
                    }}
                >
                    {editedImage ? (
                        <img src={editedImage} alt="Edited" className="max-w-full max-h-[calc(100vh-12rem)] object-contain" />
                    ) : originalImage ? (
                        <img src={URL.createObjectURL(originalImage)} alt="Original" className="max-w-full max-h-[calc(100vh-12rem)] object-contain" />
                    ) : (
                        <div className="text-center text-slate-600 opacity-50 border-2 border-dashed border-slate-700 rounded-xl p-12">
                            <p>Upload an image to start editing</p>
                        </div>
                    )}
                </div>
                
                {/* Floating Bottom Bar for Zoom/Undo (Simulated) */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-800/90 backdrop-blur rounded-full px-4 py-2 flex gap-4 text-slate-300 text-sm border border-slate-700">
                    <button className="hover:text-white">-</button>
                    <span>100%</span>
                    <button className="hover:text-white">+</button>
                    <div className="w-px bg-slate-600 h-4 my-auto"></div>
                    <button className="hover:text-white">Undo</button>
                    <button className="hover:text-white">Redo</button>
                </div>
            </div>

            {/* RIGHT PROPERTIES PANEL */}
            <div className="w-80 flex-shrink-0 bg-slate-900 border-l border-slate-800 flex flex-col z-20">
                <div className="p-4 border-b border-slate-800">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Properties</h3>
                </div>
                
                <div className="p-4 overflow-y-auto custom-scrollbar flex-grow space-y-6">
                    {/* Upload Section */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Source Asset</label>
                        <ImageUploader onImageUpload={setOriginalImage} onImageClear={() => { setOriginalImage(null); setEditedImage(null); }} />
                    </div>

                    {/* Dynamic Tool Settings */}
                    {activeToolId && (
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 animate-fadeIn">
                            <h4 className="text-xs font-bold text-cyan-400 uppercase mb-3 flex items-center gap-2">
                                {PHOTO_TOOLS.find(t => t.id === activeToolId)?.icon}
                                {PHOTO_TOOLS.find(t => t.id === activeToolId)?.name} Settings
                            </h4>
                            
                            {activeToolId === 'object-edit' && (
                                <div className="space-y-3 mb-3">
                                    <input type="text" placeholder="Select Object (e.g. Cat)" value={targetObject} onChange={e => setTargetObject(e.target.value)} className="w-full bg-slate-950 border border-slate-600 rounded p-2 text-xs text-white" />
                                    <input type="text" placeholder="Replace With (e.g. Dog)" value={replacementObject} onChange={e => setReplacementObject(e.target.value)} className="w-full bg-slate-950 border border-slate-600 rounded p-2 text-xs text-white" />
                                </div>
                            )}

                            {activeToolId === 'style-transfer' && (
                                <div className="mb-3">
                                    <input type="text" placeholder="Enter Style (e.g. Van Gogh)" value={replacementObject} onChange={e => setReplacementObject(e.target.value)} className="w-full bg-slate-950 border border-slate-600 rounded p-2 text-xs text-white" />
                                </div>
                            )}

                            <div className="mb-3">
                                <label className="block text-xs font-bold text-slate-500 mb-1">Instruction</label>
                                <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={3} className="w-full bg-slate-950 border border-slate-600 rounded p-2 text-xs text-white resize-none" />
                            </div>

                            <button onClick={handleProcess} disabled={loading} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 rounded-lg text-xs transition shadow-lg">Apply Effect</button>
                            {error && <p className="text-red-400 text-[10px] mt-2 text-center">{error}</p>}
                        </div>
                    )}

                    {/* Layers Panel */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Layers</label>
                            <button className="text-[10px] text-cyan-400 hover:text-white">+ New</button>
                        </div>
                        <div className="bg-slate-950/50 p-2 rounded-xl border border-slate-800 h-32 overflow-y-auto">
                            {editedImage && <LayerItem name="AI Generated Layer" active />}
                            {originalImage && <LayerItem name="Background Image" />}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-slate-800 bg-slate-900 flex gap-2">
                    <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2 rounded-lg border border-slate-700">Export</button>
                    <button onClick={() => editedImage && onShare({ contentUrl: editedImage, contentText: prompt, contentType: 'image' })} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold py-2 rounded-lg">Share</button>
                </div>
            </div>
        </div>
    );
};

export default ImageEditor;