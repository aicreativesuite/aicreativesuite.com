
import React, { useState } from 'react';
import { generateText, generateSmartQuiz } from '../../services/geminiService';
import Loader from '../common/Loader';
import { Remarkable } from 'remarkable';

const md = new Remarkable({ html: true, tables: true });

interface OfficeSuiteProps {
    onShare: (options: { contentText: string; contentType: 'text' }) => void;
}

const TOOLS = [
    // Visual Suite
    { id: 'ai-sheets', name: 'AI Sheets', category: 'Visual Suite', icon: '📊', description: 'Generate spreadsheet data and formulas.' },
    { id: 'ai-docs', name: 'AI Docs', category: 'Visual Suite', icon: '📄', description: 'AI-powered document drafting.' },
    { id: 'ai-whiteboard', name: 'AI Brainstorm', category: 'Visual Suite', icon: '🖍️', description: 'Idea generation and structuring.' },
    { id: 'ai-present', name: 'AI Presentations', category: 'Visual Suite', icon: '📽️', description: 'Generate slide deck outlines.' },
    { id: 'social-suite', name: 'Social Studio', category: 'Visual Suite', icon: '📱', description: 'Create social media content plans.' },
    { id: 'print-shop', name: 'Merch Ideas', category: 'Visual Suite', icon: '🖨️', description: 'Generate print catalog concepts.' },

    // Content & Productivity
    { id: 'summarizer', name: 'Summarizer', category: 'Content', icon: '📝', description: 'Summarize text instantly.' },
    { id: 'translator', name: 'Translate', category: 'Content', icon: '🌍', description: 'AI text translator.' },
    { id: 'content-plan', name: 'Content Planner', category: 'Content', icon: '📅', description: 'Plan content calendars.' },
    
    // Analysis
    { id: 'data-analysis', name: 'Data Insights', category: 'Analysis', icon: '📊', description: 'Analyze text data for insights.' },
    { id: 'formula', name: 'Formula Gen', category: 'Analysis', icon: '🧮', description: 'Generate Excel/Google Sheets formulas.' },
    { id: 'quiz', name: 'AI Quiz Gen', category: 'Analysis', icon: '❓', description: 'Turn text into quizzes.' },
];

const OfficeSuite: React.FC<OfficeSuiteProps> = ({ onShare }) => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [activeTool, setActiveTool] = useState<typeof TOOLS[0] | null>(null);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const categories = ['All', ...Array.from(new Set(TOOLS.map(t => t.category)))];
    const filteredTools = TOOLS.filter(t => selectedCategory === 'All' || t.category === selectedCategory);

    const handleProcess = async () => {
        if (!activeTool) return;
        setLoading(true);
        setResult(null);

        try {
            if (!input) { setLoading(false); return; }
            
            // Quiz
            if (activeTool.id === 'quiz') {
                 const res = await generateSmartQuiz(input, true);
                 const quiz = JSON.parse(res.text);
                 setResult(quiz.questions.map((q: any, i: number) => `**Q${i+1}: ${q.question}**\nA: ${q.options.find((o:any)=>o.isCorrect).text}`).join('\n\n'));
                 setLoading(false);
                 return;
            }

            // Text Generation Tools
            let prompt = "";
            switch(activeTool.id) {
                case 'ai-sheets':
                    prompt = `Create a spreadsheet dataset for '${input}'. Include relevant columns, headers, and at least 5 rows of sample data. Return ONLY the data as a Markdown table.`;
                    break;
                case 'ai-docs':
                    prompt = `Write a comprehensive, professional document draft about '${input}'. Use clear headings, bullet points, and a professional tone.`;
                    break;
                case 'ai-whiteboard':
                    prompt = `Act as an AI brainstorming partner for '${input}'. List 5-8 key ideas or steps, grouping them logically. Format as a bulleted list.`;
                    break;
                case 'ai-present':
                    prompt = `Create a presentation outline for '${input}'. List 5 slides, each with a Title and 3 bullet points.`;
                    break;
                case 'social-suite':
                    prompt = `Create a social media content plan for '${input}'. Provide: 1. Instagram Caption. 2. LinkedIn Professional Post. 3. Twitter/X Thread concept.`;
                    break;
                case 'print-shop':
                    prompt = `Suggest 3 print merchandise design concepts for '${input}' (e.g., T-Shirt, Mug, Poster). Describe the visual design and typography.`;
                    break;
                case 'summarizer': 
                    prompt = `Summarize this text concisely: ${input}`;
                    break;
                case 'translator': 
                    prompt = `Translate this text to English (if not) or Spanish (if English): ${input}`;
                    break;
                case 'content-plan': 
                    prompt = `Create a weekly content calendar for: ${input}`;
                    break;
                case 'formula': 
                    prompt = `Generate an Excel formula to: ${input}`;
                    break;
                case 'data-analysis': 
                    prompt = `Analyze this text/data and provide key insights and trends: ${input}`;
                    break;
                default:
                    prompt = input;
            }
            
            const res = await generateText(prompt, 'gemini-2.5-flash');
            setResult(res.text);

        } catch (e) {
            setResult("Error processing request. Please try again.");
        }
        setLoading(false);
    };

    return (
        <div className="max-w-7xl mx-auto h-full flex flex-col">
            {!activeTool ? (
                <>
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                        <div>
                            <h2 className="text-3xl font-bold text-white">Office AI Suite</h2>
                            <p className="text-slate-400">Boost productivity with AI-powered tools.</p>
                        </div>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide">
                        {categories.map(c => (
                            <button key={c} onClick={() => setSelectedCategory(c)} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition ${selectedCategory === c ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}>{c}</button>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 overflow-y-auto pb-20 custom-scrollbar h-[calc(100vh-16rem)]">
                        {filteredTools.map(tool => (
                            <button key={tool.id} onClick={() => setActiveTool(tool)} className="bg-slate-900/50 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 p-4 rounded-xl flex flex-col items-center text-center transition group h-48 justify-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20 pointer-events-none"></div>
                                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{tool.icon}</div>
                                <h4 className="font-bold text-white text-sm mb-1">{tool.name}</h4>
                                <p className="text-xs text-slate-500 line-clamp-2">{tool.description}</p>
                            </button>
                        ))}
                    </div>
                </>
            ) : (
                <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)] min-h-[600px]">
                    {/* Sidebar Controls */}
                    <div className="w-full lg:w-80 flex-shrink-0 bg-slate-900/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-800 overflow-y-auto custom-scrollbar flex flex-col gap-6">
                        <div className="flex items-center space-x-3 mb-2">
                            <button onClick={() => { setActiveTool(null); setResult(null); setInput(''); }} className="text-slate-400 hover:text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            </button>
                            <span className="text-2xl mr-2">{activeTool.icon}</span>
                            <h3 className="text-xl font-bold text-white">{activeTool.name}</h3>
                        </div>

                        {/* Inputs */}
                        <div className="space-y-5 animate-fadeIn">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    {activeTool.id === 'ai-sheets' ? 'Describe Data Requirements' : 
                                     activeTool.id === 'formula' ? 'Describe Calculation' :
                                     'Input Text / Topic'}
                                </label>
                                <textarea 
                                    value={input} 
                                    onChange={e => setInput(e.target.value)} 
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500 resize-none"
                                    rows={8}
                                    placeholder="Enter your text or prompt here..."
                                />
                            </div>

                            <button 
                                onClick={handleProcess} 
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold py-3 rounded-xl shadow-lg hover:opacity-90 disabled:opacity-50 flex justify-center items-center"
                            >
                                {loading ? <Loader /> : <span>Generate</span>}
                            </button>
                        </div>
                    </div>

                    {/* Main Preview Area */}
                    <div className="flex-grow bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col overflow-hidden relative">
                        <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                            <h3 className="font-bold text-white text-sm uppercase tracking-wider">Workspace</h3>
                            {result && (
                                <button onClick={() => onShare({ contentText: result, contentType: 'text' })} className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded font-bold transition">Share</button>
                            )}
                        </div>

                        <div className="flex-grow p-8 flex items-center justify-center relative bg-slate-950/30 overflow-y-auto custom-scrollbar">
                            <div className="absolute inset-0 bg-grid-slate-800/20 pointer-events-none"></div>
                            
                            {!result ? (
                                <div className="text-center text-slate-600 opacity-60">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    <p className="text-lg">Output will appear here.</p>
                                </div>
                            ) : (
                                <div className="w-full max-w-4xl bg-white text-slate-900 p-8 rounded-xl shadow-2xl z-10 prose prose-sm max-w-none">
                                    <div dangerouslySetInnerHTML={{__html: md.render(result)}} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OfficeSuite;
