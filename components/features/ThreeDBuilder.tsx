
import React, { useState } from 'react';
import { generateImage, generateText } from '../../services/geminiService';
import Loader from '../common/Loader';
import { Remarkable } from 'remarkable';

const md = new Remarkable({ html: true });

interface ThreeDBuilderProps {
    onShare: (options: { contentUrl?: string; contentText: string; contentType: 'image' | 'text' }) => void;
}

const ThreeDBuilder: React.FC<ThreeDBuilderProps> = ({ onShare }) => {
    const [mode, setMode] = useState<'asset' | 'world' | 'texture'>('asset');
    const [prompt, setPrompt] = useState('');
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [resultText, setResultText] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        if (!prompt) return;
        setLoading(true);
        setResultImage(null);
        setResultText(null);

        try {
            if (mode === 'asset') {
                // Generate Concept Art
                const imageBytes = await generateImage(
                    `3D asset concept art of ${prompt}. Isometric view, neutral studio background, high detail, physically based rendering style.`, 
                    '1:1', 
                    undefined, 
                    undefined, 
                    true
                );
                setResultImage(`data:image/jpeg;base64,${imageBytes}`);
                
                // Generate Description
                const textRes = await generateText(
                    `Generate a technical 3D asset description for: ${prompt}. Include: Polygon count estimate, Texture requirements (Diffuse, Normal, Roughness), and Topology flow advice.`, 
                    'gemini-2.5-flash'
                );
                setResultText(textRes.text);
            } else if (mode === 'world') {
                // Generate Environment Concept
                const imageBytes = await generateImage(
                    `VR Environment concept: ${prompt}. 360-degree style, immersive, panoramic, high resolution, unreal engine 5 render style.`, 
                    '16:9',
                    undefined, 
                    undefined, 
                    true
                );
                setResultImage(`data:image/jpeg;base64,${imageBytes}`);
            } else if (mode === 'texture') {
                // Generate Texture
                const imageBytes = await generateImage(
                    `Seamless texture pattern of ${prompt}. Top-down view, flat lighting, tileable, 4k texture quality.`, 
                    '1:1',
                    undefined, 
                    undefined, 
                    true
                );
                setResultImage(`data:image/jpeg;base64,${imageBytes}`);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)] min-h-[600px]">
            {/* Controls */}
            <div className="w-full lg:w-80 flex-shrink-0 bg-slate-900/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-800 overflow-y-auto custom-scrollbar flex flex-col gap-6">
                <div>
                    <h3 className="text-xl font-bold text-white mb-2">3D/VR/AR World Builder</h3>
                    <p className="text-xs text-slate-400">Generate assets, environments, and textures.</p>
                </div>

                <div className="flex bg-slate-800 p-1 rounded-lg">
                    <button onClick={() => setMode('asset')} className={`flex-1 py-1.5 text-xs font-bold rounded transition ${mode === 'asset' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}>Asset</button>
                    <button onClick={() => setMode('world')} className={`flex-1 py-1.5 text-xs font-bold rounded transition ${mode === 'world' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}>World</button>
                    <button onClick={() => setMode('texture')} className={`flex-1 py-1.5 text-xs font-bold rounded transition ${mode === 'texture' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}>Texture</button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Prompt</label>
                        <textarea 
                            value={prompt} 
                            onChange={e => setPrompt(e.target.value)} 
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500 resize-none"
                            rows={5}
                            placeholder={mode === 'asset' ? "Sci-fi crate..." : mode === 'world' ? "Cyberpunk city street..." : "Rust metal..."}
                        />
                    </div>
                    
                    <button onClick={handleGenerate} disabled={loading} className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold py-3 rounded-xl transition shadow-lg disabled:opacity-50 flex justify-center">
                        {loading ? <Loader /> : 'Generate'}
                    </button>
                </div>
            </div>

            {/* Preview */}
            <div className="flex-grow bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col overflow-hidden relative">
                <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                    <h3 className="font-bold text-white text-sm uppercase tracking-wider">Preview</h3>
                    {(resultImage || resultText) && (
                        <button 
                            onClick={() => onShare({ contentUrl: resultImage || undefined, contentText: resultText || prompt, contentType: resultImage ? 'image' : 'text' })}
                            className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded font-bold transition"
                        >
                            Share
                        </button>
                    )}
                </div>

                <div className="flex-grow overflow-y-auto p-8 relative flex flex-col items-center">
                    <div className="absolute inset-0 bg-grid-slate-800/20 pointer-events-none"></div>
                    
                    {!loading && !resultImage && !resultText && (
                        <div className="flex-grow flex flex-col items-center justify-center text-slate-600 opacity-60">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" /></svg>
                            <p className="text-lg">Describe your 3D concept.</p>
                        </div>
                    )}

                    {loading && (
                        <div className="flex-grow flex items-center justify-center">
                            <Loader message="Rendering 3D concepts..." />
                        </div>
                    )}

                    {resultImage && (
                        <div className="w-full max-w-4xl mb-6 relative z-10">
                            <img src={resultImage} alt="Generated 3D Concept" className="w-full rounded-xl shadow-2xl border border-slate-700" />
                        </div>
                    )}

                    {resultText && (
                        <div className="w-full max-w-4xl bg-slate-900/90 p-6 rounded-xl border border-slate-700 relative z-10 prose prose-invert prose-sm">
                            <div dangerouslySetInnerHTML={{ __html: md.render(resultText) }} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ThreeDBuilder;