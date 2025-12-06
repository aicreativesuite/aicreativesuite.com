
import React, { useState, useEffect } from 'react';
import { 
    generateSlideDeckStructure, 
    generateReportContent, 
    generateInfographicConcepts, 
    generateFlashcards, 
    generateImage,
    generatePodcastScript,
    generateMultiSpeakerSpeech,
    generateVideoFromPrompt,
    processVideoOperation
} from '../../services/geminiService';
import { 
    SLIDE_DECK_THEMES, 
    SLIDE_DECK_AUDIENCES, 
    SLIDE_DECK_TONES, 
    SLIDE_FORMATS, 
    CONTENT_LENGTHS, 
    REPORT_TYPES, 
    INFOGRAPHIC_STYLES, 
    SUPPORTED_LANGUAGES, 
    ASPECT_RATIOS, 
    DESIGN_STYLES, 
    ARTISTIC_STYLES,
    VEO_LOADING_MESSAGES
} from '../../constants';
import Loader from '../common/Loader';
import ImageUploader from '../common/ImageUploader';
import { fileToBase64, pcmToWav, decode, addQrCodeToImage } from '../../utils';
import { Remarkable } from 'remarkable';
import { GroundingChunk } from '@google/genai';
import ApiKeyDialog from '../common/ApiKeyDialog';

const md = new Remarkable({ html: true });

interface Slide {
    title: string;
    bullets: string[];
    visualDescription: string;
    speakerNotes: string;
    imageUrl?: string;
}

interface Infographic {
    title: string;
    visualLayout: string;
    dataPoints: string[];
    generatedImage?: string;
}

interface Flashcard {
    front: string;
    back: string;
    isFlipped?: boolean;
}

interface ScriptLine {
    speaker: string;
    text: string;
}

interface SlideDeckGeneratorProps {
    onShare: (options: { contentUrl?: string; contentText: string; contentType: 'text' | 'image' | 'audio' | 'video' }) => void;
}

type OutputType = 'slides' | 'report' | 'infographic' | 'quiz' | 'flashcards' | 'audio' | 'video';

const SlideDeckGenerator: React.FC<SlideDeckGeneratorProps> = ({ onShare }) => {
    // General Inputs
    const [activeTab, setActiveTab] = useState<OutputType>('slides');
    const [topic, setTopic] = useState('');
    const [contextFile, setContextFile] = useState<File | null>(null);
    const [language, setLanguage] = useState('English');
    const [length, setLength] = useState('Default');
    const [tone, setTone] = useState(SLIDE_DECK_TONES[0]);
    const [designStyle, setDesignStyle] = useState(DESIGN_STYLES[0]);
    const [artisticStyle, setArtisticStyle] = useState(ARTISTIC_STYLES[0]);
    const [aspectRatio, setAspectRatio] = useState('16:9');
    const [background, setBackground] = useState('');

    // Slide Specific
    const [slideFormat, setSlideFormat] = useState(SLIDE_FORMATS[0]);
    const [slideCount, setSlideCount] = useState(5);
    const [slideTheme, setSlideTheme] = useState(SLIDE_DECK_THEMES[0]);
    const [audience, setAudience] = useState(SLIDE_DECK_AUDIENCES[0]);

    // Report Specific
    const [reportType, setReportType] = useState(REPORT_TYPES[0]);
    const [reportSources, setReportSources] = useState<GroundingChunk[]>([]);

    // Infographic Specific
    const [infographicStyle, setInfographicStyle] = useState(INFOGRAPHIC_STYLES[0]);

    // Outputs
    const [slides, setSlides] = useState<Slide[]>([]);
    const [reportContent, setReportContent] = useState('');
    const [infographicData, setInfographicData] = useState<Infographic | null>(null);
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    
    // Audio Overview State
    const [audioScript, setAudioScript] = useState<ScriptLine[]>([]);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    
    // Video Overview State
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [videoLoadingMessage, setVideoLoadingMessage] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    
    // API Key for Video
    const [apiKeyReady, setApiKeyReady] = useState(false);
    const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);

    useEffect(() => {
        return () => {
            if (audioUrl) URL.revokeObjectURL(audioUrl);
            if (videoUrl) URL.revokeObjectURL(videoUrl);
        };
    }, [audioUrl, videoUrl]);

    // Helpers
    const generateSlideImage = async (index: number) => {
        if (!slides[index]) return;
        try {
            const prompt = `${slides[index].visualDescription}, ${designStyle} style, ${artisticStyle} art style, ${background}. High quality presentation visual.`;
            const imageBytes = await generateImage(prompt, aspectRatio);
            const imageUrl = await addQrCodeToImage(imageBytes);
            
            const newSlides = [...slides];
            newSlides[index].imageUrl = imageUrl;
            setSlides(newSlides);
        } catch (err) {
            console.error("Failed to generate slide image", err);
        }
    };

    const generateInfographicImage = async () => {
        if (!infographicData) return;
        try {
            const prompt = `An infographic titled "${infographicData.title}". Visual layout: ${infographicData.visualLayout}. Style: ${infographicStyle}, ${designStyle}. Include visual representations for: ${infographicData.dataPoints.join(', ')}. High resolution, professional information design.`;
            const imageBytes = await generateImage(prompt, aspectRatio === '16:9' ? '16:9' : '3:4');
            const imageUrl = await addQrCodeToImage(imageBytes);
            setInfographicData(prev => prev ? { ...prev, generatedImage: imageUrl } : null);
        } catch (err) {
            console.error("Failed to generate infographic image", err);
        }
    };
    
    const handleSelectKey = async () => {
        // @ts-ignore
        if (window.aistudio) {
            // @ts-ignore
            await window.aistudio.openSelectKey();
            setApiKeyReady(true);
            setShowApiKeyDialog(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic && !contextFile) {
            setError('Please enter a topic or upload a file.');
            return;
        }
        
        // For Video, check key
        if (activeTab === 'video') {
             // @ts-ignore
            if (!apiKeyReady && typeof window.aistudio !== 'undefined') {
                // Check if key exists first
                // @ts-ignore
                const hasKey = await window.aistudio.hasSelectedApiKey();
                if(!hasKey) {
                    setShowApiKeyDialog(true);
                    return;
                } else {
                    setApiKeyReady(true);
                }
            }
        }

        setLoading(true);
        setError(null);
        
        try {
            let contextData = undefined;
            if (contextFile) {
                const base64 = await fileToBase64(contextFile);
                contextData = { data: base64, mimeType: contextFile.type };
            }

            if (activeTab === 'slides') {
                const response = await generateSlideDeckStructure(topic, audience, slideCount, tone, slideFormat, language, length, contextData);
                setSlides(JSON.parse(response.text));
            } else if (activeTab === 'report') {
                const response = await generateReportContent(topic, reportType, length, language);
                setReportContent(response.text);
                setReportSources(response.candidates?.[0]?.groundingMetadata?.groundingChunks || []);
            } else if (activeTab === 'infographic') {
                const response = await generateInfographicConcepts(topic, infographicStyle, language);
                setInfographicData(JSON.parse(response.text));
            } else if (activeTab === 'flashcards' || activeTab === 'quiz') {
                const response = await generateFlashcards(topic, 10, language);
                setFlashcards(JSON.parse(response.text));
            } else if (activeTab === 'audio') {
                // Audio Overview Logic
                const promptText = contextData ? `Topic: ${topic}\n\n(See attached image context)` : topic;
                const scriptResponse = await generatePodcastScript(promptText);
                const script: ScriptLine[] = JSON.parse(scriptResponse.text);
                setAudioScript(script);
                
                // Generate Audio
                const fullText = script.map(line => `${line.speaker}: ${line.text}`).join('\n');
                const speakerConfig = [
                    { speaker: "Alex", voiceName: "Fenrir" },
                    { speaker: "Jamie", voiceName: "Puck" }
                ];
                const base64Audio = await generateMultiSpeakerSpeech(fullText, speakerConfig);
                if (base64Audio) {
                    const bytes = decode(base64Audio);
                    const blob = pcmToWav(bytes, 24000, 1, 16);
                    setAudioUrl(URL.createObjectURL(blob));
                }
            } else if (activeTab === 'video') {
                // Video Overview Logic
                setVideoUrl(null);
                
                let i = 0;
                const msgInterval = setInterval(() => {
                    i = (i + 1) % VEO_LOADING_MESSAGES.length;
                    setVideoLoadingMessage(VEO_LOADING_MESSAGES[i]);
                }, 3000);
                setVideoLoadingMessage(VEO_LOADING_MESSAGES[0]);

                try {
                    const videoPrompt = `A professional cinematic video presentation about "${topic}". The video should visually summarize the key concepts suitable for an audience of ${audience}. Style: ${designStyle}.`;
                    const operation = await generateVideoFromPrompt(videoPrompt, aspectRatio === '9:16' ? '9:16' : '16:9', false);
                    
                    const blob = await processVideoOperation(operation);
                    setVideoUrl(URL.createObjectURL(blob));
                } finally {
                    clearInterval(msgInterval);
                }
            }

        } catch (err: any) {
            setError(err.message || 'Generation failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (extension: string, content: string) => {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `generated_content.${extension}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <>
        <ApiKeyDialog show={showApiKeyDialog} onSelectKey={handleSelectKey} />
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)] min-h-[600px]">
            {/* Sidebar Controls */}
            <div className="w-full lg:w-80 flex-shrink-0 bg-slate-900/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-800 overflow-y-auto custom-scrollbar">
                <div className="flex flex-wrap gap-2 mb-6">
                    {['slides', 'report', 'infographic', 'flashcards', 'quiz', 'audio', 'video'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => {
                                setActiveTab(tab as OutputType);
                                setError(null);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === tab ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                        >
                            {tab === 'audio' ? 'Audio Overview' : tab === 'video' ? 'Video Overview' : tab}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Topic / Prompt</label>
                        <textarea
                            rows={3}
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500 placeholder-slate-600 resize-none"
                            placeholder="e.g., Evolution of AI, Q3 Financials"
                        />
                    </div>

                    {activeTab !== 'video' && (
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Context Upload (Optional)</label>
                            <ImageUploader onImageUpload={setContextFile} onImageClear={() => setContextFile(null)} />
                            <p className="text-[10px] text-slate-500 mt-1">Upload charts, images, or text screenshots for context.</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Language</label>
                            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-white">
                                {SUPPORTED_LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                        {activeTab !== 'audio' && activeTab !== 'video' && (
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Length</label>
                                <select value={length} onChange={(e) => setLength(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-white">
                                    {CONTENT_LENGTHS.map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>
                        )}
                    </div>

                    {activeTab === 'slides' && (
                        <>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Format</label>
                                    <select value={slideFormat} onChange={(e) => setSlideFormat(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-white">
                                        {SLIDE_FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Slides</label>
                                    <input type="number" min="3" max="20" value={slideCount} onChange={(e) => setSlideCount(parseInt(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-white" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Theme</label>
                                <select value={slideTheme} onChange={(e) => setSlideTheme(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-white">
                                    {SLIDE_DECK_THEMES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </>
                    )}

                    {activeTab === 'report' && (
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Report Type</label>
                            <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-white">
                                {REPORT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    )}

                    {activeTab === 'infographic' && (
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Style</label>
                            <select value={infographicStyle} onChange={(e) => setInfographicStyle(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-white">
                                {INFOGRAPHIC_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    )}

                    {(activeTab === 'slides' || activeTab === 'infographic' || activeTab === 'video') && (
                        <div className="pt-4 border-t border-slate-800">
                            <h4 className="text-xs font-bold text-cyan-500 uppercase mb-3">Visual Settings</h4>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <select value={designStyle} onChange={(e) => setDesignStyle(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-white">
                                    {DESIGN_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <select value={artisticStyle} onChange={(e) => setArtisticStyle(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-white">
                                    {ARTISTIC_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-white">
                                    {ASPECT_RATIOS.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                                <input type="text" placeholder="Background (e.g., office)" value={background} onChange={(e) => setBackground(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-white" />
                            </div>
                        </div>
                    )}

                    <button type="submit" disabled={loading} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition shadow-lg disabled:opacity-50 flex justify-center items-center">
                        {loading ? <Loader /> : `Generate ${activeTab === 'audio' ? 'Podcast' : activeTab === 'video' ? 'Video' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
                    </button>
                    {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                </form>
            </div>

            {/* Output Preview */}
            <div className="flex-grow bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col overflow-hidden relative">
                {/* Toolbar */}
                <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                    <h3 className="font-bold text-white">{topic || 'Untitled Project'}</h3>
                    <div className="flex gap-2">
                        {activeTab === 'slides' && (
                            <button onClick={() => setIsEditing(!isEditing)} className={`p-2 rounded hover:bg-slate-800 ${isEditing ? 'text-cyan-400' : 'text-slate-400'}`} title="Edit">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                            </button>
                        )}
                        <button onClick={() => {
                            let content = '';
                            if(activeTab === 'slides') content = JSON.stringify(slides, null, 2);
                            else if(activeTab === 'report') content = reportContent;
                            else if(activeTab === 'infographic') content = JSON.stringify(infographicData, null, 2);
                            else if(activeTab === 'audio') content = JSON.stringify(audioScript, null, 2);
                            else if(activeTab === 'video') return; // Video download is separate
                            else content = JSON.stringify(flashcards, null, 2);
                            handleDownload(activeTab === 'report' ? 'md' : 'json', content);
                        }} className="p-2 rounded hover:bg-slate-800 text-slate-400" title="Download">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        </button>
                        <button onClick={() => onShare({ 
                            contentText: activeTab === 'report' ? reportContent : JSON.stringify({ slides, infographicData, flashcards, audioScript }), 
                            contentUrl: activeTab === 'audio' ? (audioUrl || undefined) : activeTab === 'video' ? (videoUrl || undefined) : undefined,
                            contentType: activeTab === 'video' ? 'video' : activeTab === 'audio' ? 'audio' : 'text' 
                        })} className="p-2 rounded hover:bg-slate-800 text-purple-400" title="Share">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
                        </button>
                    </div>
                </div>

                {/* Content View */}
                <div className="flex-grow overflow-y-auto p-8 bg-slate-950/50">
                    {loading && <div className="h-full flex flex-col items-center justify-center"><Loader message={activeTab === 'video' ? videoLoadingMessage : "Generating creative content..."} /></div>}
                    
                    {!loading && activeTab === 'slides' && slides.length > 0 && (
                        <div className="flex flex-col items-center space-y-6">
                            {/* Slide Preview */}
                            <div className="w-full max-w-4xl aspect-video bg-white text-slate-900 rounded-xl shadow-2xl overflow-hidden relative flex flex-col">
                                <div className="flex-grow p-8 relative z-10 flex flex-col">
                                    <div className="flex-grow flex flex-row gap-8">
                                        <div className="w-1/2 flex flex-col justify-center">
                                            {isEditing ? (
                                                <input className="text-3xl font-bold mb-4 border-b border-slate-300 outline-none" value={slides[activeSlideIndex].title} onChange={(e) => {const s = [...slides]; s[activeSlideIndex].title = e.target.value; setSlides(s);}} />
                                            ) : (
                                                <h2 className="text-3xl font-bold mb-6">{slides[activeSlideIndex].title}</h2>
                                            )}
                                            <ul className="space-y-3 text-lg">
                                                {slides[activeSlideIndex].bullets.map((b, i) => (
                                                    <li key={i} className="flex items-start"><span className="mr-2 text-cyan-600">•</span>{b}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="w-1/2 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden relative group">
                                            {slides[activeSlideIndex].imageUrl ? (
                                                <img src={slides[activeSlideIndex].imageUrl} alt="Slide Visual" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-center p-4">
                                                    <p className="text-xs text-slate-500 italic mb-2">"{slides[activeSlideIndex].visualDescription}"</p>
                                                    <button onClick={() => generateSlideImage(activeSlideIndex)} className="bg-cyan-600 text-white px-4 py-2 rounded text-sm hover:bg-cyan-700">Generate Image</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-slate-100 p-2 text-xs text-slate-500 text-center border-t">Slide {activeSlideIndex + 1} of {slides.length}</div>
                            </div>

                            {/* Navigation */}
                            <div className="flex gap-2 overflow-x-auto max-w-full pb-2">
                                {slides.map((_, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => setActiveSlideIndex(i)}
                                        className={`w-24 h-16 rounded border-2 flex-shrink-0 transition ${activeSlideIndex === i ? 'border-cyan-500 bg-slate-800' : 'border-slate-700 bg-slate-900 hover:bg-slate-800'}`}
                                    >
                                        <span className="text-xs text-slate-500">{i + 1}</span>
                                    </button>
                                ))}
                            </div>
                            
                            {/* Speaker Notes */}
                            <div className="w-full max-w-4xl bg-slate-800 p-4 rounded-lg border border-slate-700">
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Speaker Notes</h4>
                                <p className="text-sm text-slate-300">{slides[activeSlideIndex].speakerNotes}</p>
                            </div>
                        </div>
                    )}

                    {!loading && activeTab === 'report' && reportContent && (
                        <div className="max-w-4xl mx-auto bg-white text-slate-900 p-10 rounded-xl shadow-2xl min-h-full flex flex-col">
                            <div className="prose prose-slate max-w-none flex-grow" dangerouslySetInnerHTML={{ __html: md.render(reportContent) }} />
                            
                            {reportSources && reportSources.length > 0 && (
                                <div className="mt-8 pt-8 border-t border-slate-200">
                                    <h4 className="text-sm font-bold text-slate-500 uppercase mb-3">Sources</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {reportSources.map((source, idx) => (
                                            source.web ? (
                                                <a key={idx} href={source.web.uri} target="_blank" rel="noreferrer" className="block p-2 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 text-xs text-slate-600 truncate transition">
                                                    <span className="font-bold block text-slate-800 truncate">{source.web.title}</span>
                                                    {source.web.uri}
                                                </a>
                                            ) : null
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {!loading && activeTab === 'infographic' && infographicData && (
                        <div className="max-w-3xl mx-auto flex flex-col items-center">
                            <div className="w-full bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6">
                                <h2 className="text-2xl font-bold text-white mb-2">{infographicData.title}</h2>
                                <p className="text-slate-400 text-sm mb-4">{infographicData.visualLayout}</p>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {infographicData.dataPoints.map((dp, i) => <span key={i} className="bg-slate-700 text-cyan-300 px-3 py-1 rounded-full text-xs">{dp}</span>)}
                                </div>
                                {infographicData.generatedImage ? (
                                    <img src={infographicData.generatedImage} alt="Infographic" className="w-full rounded-lg" />
                                ) : (
                                    <button onClick={generateInfographicImage} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition">Generate Visual</button>
                                )}
                            </div>
                        </div>
                    )}

                    {!loading && (activeTab === 'flashcards' || activeTab === 'quiz') && flashcards.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {flashcards.map((card, i) => (
                                <div key={i} className="aspect-[3/2] perspective cursor-pointer group" onClick={() => {
                                    const newCards = [...flashcards];
                                    newCards[i].isFlipped = !newCards[i].isFlipped;
                                    setFlashcards(newCards);
                                }}>
                                    <div className={`relative preserve-3d w-full h-full transition-transform duration-500 ${card.isFlipped ? 'rotate-y-180' : ''}`}>
                                        <div className="absolute backface-hidden w-full h-full bg-slate-800 border border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-lg hover:border-cyan-500/50 transition-colors">
                                            <span className="text-xs text-cyan-500 uppercase font-bold mb-2">Front</span>
                                            <p className="text-white font-medium">{card.front}</p>
                                        </div>
                                        <div className="absolute backface-hidden w-full h-full bg-cyan-900 border border-cyan-700 rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-lg rotate-y-180">
                                            <span className="text-xs text-cyan-300 uppercase font-bold mb-2">Back</span>
                                            <p className="text-white">{card.back}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && activeTab === 'audio' && (audioScript.length > 0 || audioUrl) && (
                        <div className="flex flex-col items-center justify-center h-full space-y-6">
                            {audioUrl && (
                                <div className="w-full max-w-md p-6 bg-slate-800 rounded-2xl border border-slate-700 shadow-xl">
                                    <div className="flex items-center space-x-4 mb-4">
                                        <div className="p-3 bg-cyan-900 rounded-full text-cyan-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3V4a1 1 0 00-1-1z" /></svg>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white">Audio Overview</h3>
                                            <p className="text-xs text-slate-400">Deep Dive Podcast</p>
                                        </div>
                                    </div>
                                    <audio controls src={audioUrl} className="w-full" />
                                </div>
                            )}
                            {audioScript.length > 0 && (
                                <div className="w-full max-w-2xl bg-slate-900 rounded-xl border border-slate-700 p-6">
                                    <h4 className="text-sm font-bold text-slate-400 uppercase mb-4">Generated Script</h4>
                                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                                        {audioScript.map((line, i) => (
                                            <div key={i} className="flex gap-3 text-sm">
                                                <span className={`font-bold flex-shrink-0 ${line.speaker === 'Alex' ? 'text-cyan-400' : 'text-purple-400'}`}>{line.speaker}:</span>
                                                <span className="text-slate-300">{line.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {!loading && activeTab === 'video' && videoUrl && (
                        <div className="flex flex-col items-center justify-center h-full">
                            <div className="w-full max-w-4xl relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-700">
                                <video src={videoUrl} controls className="w-full h-full" />
                            </div>
                            <div className="mt-6 flex gap-4">
                                <a href={videoUrl} download="video_overview.mp4" className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-lg font-bold transition">Download MP4</a>
                            </div>
                        </div>
                    )}

                    {!loading && !slides.length && !reportContent && !infographicData && !flashcards.length && !audioUrl && !videoUrl && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                            <p className="text-lg">Select a format and generate content.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
        </>
    );
};

export default SlideDeckGenerator;
