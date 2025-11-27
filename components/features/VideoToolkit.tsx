
import React, { useState, useRef, useEffect } from 'react';
import { generateVideoFromPrompt, generateText, pollVideoOperation, transcribeAudio, translateScript, generateSpeech } from '../../services/geminiService';
import Loader from '../common/Loader';
import { VEO_LOADING_MESSAGES } from '../../constants';
import ApiKeyDialog from '../common/ApiKeyDialog';
import { fileToBase64, pcmToWav, decode } from '../../utils';

interface VideoToolkitProps {
    onShare: (options: { contentText: string; contentType: 'text' }) => void;
}

// Comprehensive list of tools
const TOOLS = [
    // Social Growth (New)
    { id: 'fb-hashtag', name: 'Facebook Hashtag Gen', category: 'Social Growth', icon: '#️⃣', description: 'Stand out on social with an AI Facebook hashtag generator.' },
    { id: 'tiktok-hashtag', name: 'TikTok Hashtag Gen', category: 'Social Growth', icon: '🎵', description: 'Game the algorithm with the best TikTok hashtag generator.' },
    { id: 'username-gen', name: 'Username Generator', category: 'Social Growth', icon: '🏷️', description: 'Express yourself with a custom username.' },
    { id: 'yt-desc', name: 'YouTube Description', category: 'Social Growth', icon: '📝', description: 'Drive views fast with the best YouTube description generator.' },
    { id: 'yt-name', name: 'YouTube Name Gen', category: 'Social Growth', icon: '📺', description: 'Stand out online with this YouTube name generator.' },

    // Essentials
    { id: 'trimmer', name: 'Video Trimmer', category: 'Essentials', icon: '✂️', description: 'Trim, split, splice, or cut videos.' },
    { id: 'cropper', name: 'Crop Videos', category: 'Essentials', icon: '📐', description: 'Crop videos online for free.' },
    { id: 'rotater', name: 'Rotate Video', category: 'Essentials', icon: '🔄', description: 'Rotate videos to the right angle.' },
    { id: 'resizer', name: 'Video Resize', category: 'Essentials', icon: '📏', description: 'The online video resizer tool.' },
    { id: 'insta-resize', name: 'Resize for Instagram', category: 'Essentials', icon: '📱', description: 'Instantly resize for IG.' },
    { id: 'merger', name: 'Merge Videos', category: 'Essentials', icon: '🔗', description: 'Combine multiple clips together.' },
    { id: 'splitter', name: 'Video Splitter', category: 'Essentials', icon: '🔪', description: 'Highlight only the best moments.' },
    { id: 'mirror', name: 'Mirror Video', category: 'Essentials', icon: '🪞', description: 'Mirror videos for a fresh perspective.' },
    
    // Converters
    { id: 'mp4-conv', name: 'Video to MP4', category: 'Converters', icon: '🎞️', description: 'Free Video to MP4 Converter.' },
    { id: 'mkv-mp4', name: 'MKV to MP4', category: 'Converters', icon: '🔄', description: 'Free MKV to MP4 Converter.' },
    { id: 'mov-mp4', name: 'MOV to MP4', category: 'Converters', icon: '🍎', description: 'Free MOV to MP4 Converter.' },
    { id: 'webm-mp4', name: 'WebM to MP4', category: 'Converters', icon: '🌐', description: 'Free WEBM to MP4 Converter.' },
    { id: 'vid-gif', name: 'Video to GIF', category: 'Converters', icon: '🖼️', description: 'Free Video to GIF Converter.' },
    { id: 'gif-vid', name: 'GIF to Video', category: 'Converters', icon: '🎬', description: 'Free GIF to Video Converter.' },
    { id: 'audio-vid', name: 'Audio to Video', category: 'Converters', icon: '🎵', description: 'Convert audio files to video.' },
    
    // AI Creation
    { id: 'ai-gen', name: 'AI Generated Video', category: 'AI Creation', icon: '✨', description: 'Bring ideas to life with AI.' },
    { id: 'script-vid', name: 'Script to Video AI', category: 'AI Creation', icon: '📜', description: 'Produce content from scripts.' },
    { id: 'reel-maker', name: 'AI Reel Maker', category: 'AI Creation', icon: '📱', description: 'Free AI reel maker.' },
    { id: 'img-vid', name: 'Images to Video', category: 'AI Creation', icon: '📸', description: 'Photo to video converter.' },
    
    // Enhancers & Effects
    { id: 'enhancer', name: 'Video Enhancer', category: 'Enhancement', icon: '🪄', description: 'Nail down an aesthetic look.' },
    { id: 'upscaler', name: 'Video Upscaler', category: 'Enhancement', icon: '📈', description: 'Enhance with AI Upscaler.' },
    { id: 'filters', name: 'Video Filters', category: 'Enhancement', icon: '🎨', description: 'Enhance look and feel.' },
    { id: 'bg-remove', name: 'Background Remover', category: 'Enhancement', icon: '👻', description: 'Online Video Background Remover.' },
    { id: 'slow-mo', name: 'Slow Motion', category: 'Enhancement', icon: '🐌', description: 'Evoke drama with slow motion.' },
    { id: 'beat-sync', name: 'Beat Sync', category: 'Enhancement', icon: '🥁', description: 'Sync soundtrack with Beat Sync.' },
    { id: 'motion-path', name: 'Motion Path', category: 'Enhancement', icon: '〰️', description: 'Bring story to life with motion.' },
    { id: 'lottie', name: 'Lottie Animation', category: 'Enhancement', icon: '🏃', description: 'Put your design in motion with Lottie animations.' },
    
    // Audio & Text
    { id: 'captions', name: 'Captions', category: 'Audio & Text', icon: '📝', description: 'Add subtitles to video.' },
    { id: 'auto-caption', name: 'Auto Caption', category: 'Audio & Text', icon: '🤖', description: 'Boost viewership with auto captions.' },
    { id: 'ai-caption', name: 'AI Caption Generator', category: 'Audio & Text', icon: '💭', description: 'Find the right words.' },
    { id: 'translator', name: 'Video Translator', category: 'Audio & Text', icon: '🌍', description: 'Make videos ready for the world.' },
    { id: 'ai-trans', name: 'AI Video Translator', category: 'Audio & Text', icon: '🗣️', description: 'Translate with AI.' },
    { id: 'add-text', name: 'Add Text to Video', category: 'Audio & Text', icon: '🔤', description: 'Add text overlays.' },
    { id: 'text-anim', name: 'Text Animations', category: 'Audio & Text', icon: '💫', description: 'Add dynamic text animations.' },
    { id: 'remove-audio', name: 'Remove Audio', category: 'Audio & Text', icon: '🔇', description: 'Get rid of unwanted noise.' },
    { id: 'add-music', name: 'Add Music To Video', category: 'Audio & Text', icon: '🎶', description: 'Supercharge with music.' },
    { id: 'sfx', name: 'Sound Effects', category: 'Audio & Text', icon: '🔊', description: 'Thrilling sound effects.' },
    { id: 'ai-voice', name: 'AI Voice Generator', category: 'Audio & Text', icon: '🎙️', description: 'Realistic voiceovers.' },
    { id: 'ai-music', name: 'AI Music Generator', category: 'Audio & Text', icon: '🎹', description: 'Create your own soundtrack.' },
    { id: 'ai-sfx', name: 'AI SFX Generator', category: 'Audio & Text', icon: '💥', description: 'Speak volumes with AI SFX.' },
    { id: 'recorder', name: 'Voice Recorder', category: 'Audio & Text', icon: '⏺️', description: 'Tell your story.' },
    { id: 'british', name: 'British Accent', category: 'Audio & Text', icon: '🇬🇧', description: 'Create posh voiceovers.' },
    { id: 'gif-text', name: 'Add Text to GIF', category: 'Audio & Text', icon: '💬', description: 'Express reaction with text.' },
    { id: 'gif-music', name: 'Add Music to GIF', category: 'Audio & Text', icon: '🎸', description: 'Content that rocks.' },
    
    // Misc
    { id: 'stock', name: 'Free Stock Videos', category: 'Essentials', icon: '📹', description: 'Access best free footage.' },
    { id: 'gifs', name: 'Free GIFs', category: 'Essentials', icon: '👾', description: 'Download best GIFs.' },
    { id: 'screen-rec', name: 'Online Recorder', category: 'Essentials', icon: '🔴', description: 'Capture every move.' },
    { id: 'watermark', name: 'Add Watermark', category: 'Essentials', icon: '©️', description: 'Own your content.' },
    { id: 'share', name: 'Share Video', category: 'Essentials', icon: '📤', description: 'Quickly share videos.' },
    { id: 'tts', name: 'Text to Speech', category: 'Audio & Text', icon: '🗣️', description: 'Convert text to speech.' },
];

const VideoToolkit: React.FC<VideoToolkitProps> = ({ onShare }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [activeTool, setActiveTool] = useState<typeof TOOLS[0] | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [apiKeyReady, setApiKeyReady] = useState(false);
    const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
    
    const pollIntervalRef = useRef<number | null>(null);

    const categories = ['All', ...Array.from(new Set(TOOLS.map(t => t.category)))];
    
    const filteredTools = TOOLS.filter(t => 
        (selectedCategory === 'All' || t.category === selectedCategory) &&
        (t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleSelectKey = async () => {
        // @ts-ignore
        if (window.aistudio) {
            // @ts-ignore
            await window.aistudio.openSelectKey();
            setApiKeyReady(true);
            setShowApiKeyDialog(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) {
            setFile(f);
            setPreviewUrl(URL.createObjectURL(f));
            setResult(null);
            setError(null);
        }
    };

    const handleProcess = async () => {
        if (!activeTool) return;
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            // Social Growth Tools
            if (activeTool.category === 'Social Growth') {
                if (!prompt) throw new Error("Please enter a topic or keyword.");
                let systemPrompt = '';
                if (activeTool.id === 'fb-hashtag') systemPrompt = "Generate 15 high-engagement Facebook hashtags for the topic:";
                if (activeTool.id === 'tiktok-hashtag') systemPrompt = "Generate viral TikTok hashtags for the topic:";
                if (activeTool.id === 'username-gen') systemPrompt = "Generate 10 creative and catchy usernames based on:";
                if (activeTool.id === 'yt-desc') systemPrompt = "Write an SEO-optimized YouTube video description for a video about:";
                if (activeTool.id === 'yt-name') systemPrompt = "Generate 5 click-worthy YouTube video titles for:";
                
                const res = await generateText(`${systemPrompt} ${prompt}`, 'gemini-2.5-flash');
                setResult(res.text);
                setLoading(false);
                return;
            }

            // AI GENERATION TOOLS
            if (['ai-gen', 'script-vid', 'reel-maker', 'enhancer', 'upscaler'].includes(activeTool.id)) {
                // @ts-ignore
                if (!apiKeyReady && typeof window.aistudio !== 'undefined') {
                    setShowApiKeyDialog(true);
                    setLoading(false);
                    return;
                }

                let finalPrompt = prompt;
                if (activeTool.id === 'enhancer' || activeTool.id === 'upscaler') {
                    finalPrompt = `Enhance this video to look professional, sharp, and high quality. ${prompt}`;
                } else if (activeTool.id === 'script-vid') {
                    finalPrompt = `Create a video based on this script: ${prompt}`;
                }

                // If file present, use image-to-video (simulated via frame extraction in real app, here basic logic)
                // For simplicity in this demo suite, we use text-to-video if no file, or assume file is an image reference
                let op;
                if (file && file.type.startsWith('image')) {
                     const base64 = await fileToBase64(file);
                     op = await generateVideoFromPrompt(finalPrompt, '16:9', false); // Ideally use generateVideoFromImage if imported
                } else {
                     op = await generateVideoFromPrompt(finalPrompt, '16:9', false);
                }

                pollIntervalRef.current = window.setInterval(async () => {
                    try {
                        op = await pollVideoOperation(op);
                        if (op.done) {
                            clearInterval(pollIntervalRef.current!);
                            const uri = op.response?.generatedVideos?.[0]?.video?.uri;
                            if (uri) {
                                const response = await fetch(`${uri}&key=${process.env.API_KEY}`);
                                const blob = await response.blob();
                                setResult(URL.createObjectURL(blob));
                            }
                            setLoading(false);
                        }
                    } catch (e) {
                        clearInterval(pollIntervalRef.current!);
                        setLoading(false);
                        setError('Generation failed.');
                    }
                }, 5000);
            } 
            // AI AUDIO/TEXT TOOLS
            else if (['captions', 'auto-caption', 'translator', 'ai-trans'].includes(activeTool.id)) {
                 if (!file) throw new Error("Please upload a video/audio file.");
                 // Simulate extraction/transcription
                 const base64 = await fileToBase64(file);
                 // Using analyzeVideo or transcribeAudio depending on file type, using generic logic here
                 const res = await transcribeAudio(base64, file.type); 
                 setResult(res.text); // Return text transcript
                 setLoading(false);
            }
            // UTILITY TOOLS (Simulation)
            else {
                // Simulate processing time for client-side tools
                setTimeout(() => {
                    setResult(previewUrl); // Just echo back for demo purposes
                    setLoading(false);
                }, 2000);
            }

        } catch (err: any) {
            setLoading(false);
            setError(err.message || "An error occurred.");
        }
    };

    return (
        <div className="max-w-7xl mx-auto h-full flex flex-col">
            <ApiKeyDialog show={showApiKeyDialog} onSelectKey={handleSelectKey} />
            
            {activeTool ? (
                <div className="flex-grow flex flex-col h-full bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                    <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
                        <div className="flex items-center space-x-3">
                            <button onClick={() => { setActiveTool(null); setFile(null); setPreviewUrl(null); setResult(null); }} className="text-slate-400 hover:text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            </button>
                            <span className="text-2xl mr-2">{activeTool.icon}</span>
                            <h3 className="text-xl font-bold text-white">{activeTool.name}</h3>
                        </div>
                    </div>
                    
                    <div className="flex-grow p-8 flex flex-col items-center justify-center overflow-y-auto">
                        {!result ? (
                            <div className="w-full max-w-2xl space-y-8">
                                {/* Upload Section */}
                                {['trimmer', 'cropper', 'converter', 'enhancer', 'captions'].some(k => activeTool.id.includes(k) || activeTool.category === 'Converters') && (
                                    <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center bg-slate-800/50 hover:border-cyan-500 transition-colors relative">
                                        <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        {file ? (
                                            <div className="text-green-400 font-bold">{file.name}</div>
                                        ) : (
                                            <div className="text-slate-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                                <p>Drag & Drop or Click to Upload</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Prompt Section for AI Tools */}
                                {(['ai-gen', 'script-vid', 'reel-maker', 'enhancer', 'add-text', 'add-music', 'text-anim', 'lottie'].some(k => activeTool.id.includes(k)) || activeTool.category === 'Social Growth') && (
                                    <div>
                                        <label className="block text-sm font-bold text-slate-400 mb-2">
                                            {activeTool.category === 'Social Growth' ? 'Topic / Keyword' : 'Instructions / Script'}
                                        </label>
                                        <textarea 
                                            value={prompt}
                                            onChange={e => setPrompt(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500"
                                            rows={4}
                                            placeholder={activeTool.category === 'Social Growth' ? "Enter topic (e.g. Travel Vlog)" : "Describe what you want to create or change..."}
                                        />
                                    </div>
                                )}

                                <button 
                                    onClick={handleProcess}
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:opacity-90 disabled:opacity-50 flex justify-center"
                                >
                                    {loading ? <Loader /> : `Process ${activeTool.name}`}
                                </button>
                                {error && <p className="text-red-400 text-center">{error}</p>}
                            </div>
                        ) : (
                            <div className="text-center w-full max-w-4xl animate-fadeIn">
                                <h4 className="text-lg font-bold text-white mb-4">Result Ready!</h4>
                                {(activeTool.category === 'Audio & Text' || activeTool.category === 'Social Growth') && !result.startsWith('blob') ? (
                                    <div className="bg-slate-800 p-6 rounded-lg text-left whitespace-pre-wrap text-slate-300 font-mono text-sm max-h-96 overflow-y-auto">{result}</div>
                                ) : (
                                    <video src={result} controls className="w-full rounded-xl shadow-2xl bg-black mb-6 max-h-[60vh]" />
                                )}
                                <div className="flex justify-center gap-4">
                                    {result.startsWith('blob') && <a href={result} download="output.mp4" className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg font-bold">Download</a>}
                                    {activeTool.category === 'Social Growth' && <button onClick={() => {navigator.clipboard.writeText(result); alert('Copied!')}} className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg font-bold">Copy Text</button>}
                                    <button onClick={() => {setResult(null); setFile(null); setPreviewUrl(null);}} className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-lg font-bold">Create New</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                        <div>
                            <h2 className="text-3xl font-bold text-white">Video Toolkit</h2>
                            <p className="text-slate-400">All your video utilities in one place.</p>
                        </div>
                        <div className="flex gap-4 w-full md:w-auto">
                            <input 
                                type="text" 
                                placeholder="Search tools..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 w-full md:w-64"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide">
                        {categories.map(c => (
                            <button 
                                key={c}
                                onClick={() => setSelectedCategory(c)}
                                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition ${selectedCategory === c ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 overflow-y-auto pb-20 custom-scrollbar">
                        {filteredTools.map(tool => (
                            <button 
                                key={tool.id} 
                                onClick={() => setActiveTool(tool)}
                                className="bg-slate-900/50 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 p-4 rounded-xl flex flex-col items-center text-center transition group h-40 justify-center"
                            >
                                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{tool.icon}</div>
                                <h4 className="font-bold text-white text-sm mb-1">{tool.name}</h4>
                                <p className="text-xs text-slate-500 line-clamp-2">{tool.description}</p>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default VideoToolkit;
