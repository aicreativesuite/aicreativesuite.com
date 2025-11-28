
import React, { useState, useRef } from 'react';
import { generateText, generateSmartQuiz } from '../../services/geminiService';
import Loader from '../common/Loader';
import { Remarkable } from 'remarkable';

const md = new Remarkable({ html: true, tables: true });

interface OfficeSuiteProps {
    onShare: (options: { contentText: string; contentType: 'text' }) => void;
}

const TOOLS = [
    // Visual Suite (New)
    { id: 'ai-sheets', name: 'AI Sheets', category: 'Visual Suite', icon: '📊', description: 'Visual, dynamic spreadsheets with Magic Formulas & Insights.' },
    { id: 'ai-docs', name: 'AI Docs', category: 'Visual Suite', icon: '📄', description: 'AI-powered drafts, visualizations, and Magic Write.' },
    { id: 'ai-whiteboard', name: 'AI Whiteboards', category: 'Visual Suite', icon: '🖍️', description: 'Infinite canvas for brainstorming and flowcharts.' },
    { id: 'ai-present', name: 'AI Presentations', category: 'Visual Suite', icon: '📽️', description: 'Generate decks, pitches, and stories in seconds.' },
    { id: 'social-suite', name: 'Social Studio', category: 'Visual Suite', icon: '📱', description: 'Create scroll-stopping posts, videos, and stories.' },
    { id: 'photo-magic', name: 'Photo Editor', category: 'Visual Suite', icon: '🖼️', description: 'Studio-quality edits and background generation.' },
    { id: 'video-magic', name: 'Video Magic', category: 'Visual Suite', icon: '🎥', description: 'Engaging video concepts, transitions, and edits.' },
    { id: 'print-shop', name: 'Print Catalog', category: 'Visual Suite', icon: '🖨️', description: 'Bring designs to life on tees, mugs, and posters.' },

    // PDF & Docs
    { id: 'pdf-convert', name: 'Free PDF Converter', category: 'PDF Tools', icon: '📄', description: 'Convert files to/from PDF freely.' },
    { id: 'pdf-jpg', name: 'PDF to JPG', category: 'PDF Tools', icon: '🖼️', description: 'Convert PDFs to JPGs.' },
    { id: 'pdf-ppt', name: 'PDF to PPT', category: 'PDF Tools', icon: '📊', description: 'Convert PDF to PowerPoint.' },
    { id: 'pdf-png', name: 'PDF to PNG', category: 'PDF Tools', icon: '🖼️', description: 'Convert PDF to PNG.' },
    { id: 'word-pdf', name: 'Word to PDF', category: 'PDF Tools', icon: '📝', description: 'Convert DOCX to PDF.' },
    { id: 'ppt-pdf', name: 'PPT to PDF', category: 'PDF Tools', icon: '📈', description: 'Convert Powerpoint to PDF.' },
    { id: 'del-pages', name: 'Delete Pages', category: 'PDF Tools', icon: '❌', description: 'Remove pages from PDF.' },
    { id: 'ai-pdf', name: 'AI to PDF', category: 'PDF Tools', icon: '🤖', description: 'Generate PDF content with AI.' },
    
    // Content & Productivity
    { id: 'summarizer', name: 'Summarizer', category: 'Content', icon: '📝', description: 'Summarize any text instantly.' },
    { id: 'translator', name: 'Translate', category: 'Content', icon: '🌍', description: 'Fast AI online translator.' },
    { id: 'pdf-trans', name: 'PDF Translator', category: 'Content', icon: '📖', description: 'Translate PDF documents.' },
    { id: 'doc-trans', name: 'Doc Translator', category: 'Content', icon: '📃', description: 'Translate Word documents.' },
    { id: 'content-plan', name: 'Content Planner', category: 'Content', icon: '📅', description: 'Plan social media content.' },
    { id: 'sticky-notes', name: 'Sticky Notes', category: 'Productivity', icon: '🟨', description: 'Collaborate with online notes.' },
    { id: 'ai-live', name: 'AI Live', category: 'Productivity', icon: '🔴', description: 'Real-time collaboration.' },
    
    // Management & Team
    { id: 'brand-kit', name: 'Brand Kit', category: 'Team', icon: '🎨', description: 'Manage fonts, colors, logos.' },
    { id: 'cms', name: 'Content Mgmt', category: 'Team', icon: '🗄️', description: 'Organization CMS.' },
    { id: 'magic-switch', name: 'Magic Switch', category: 'Team', icon: '✨', description: 'Resize designs infinitely.' },
    { id: 'team-tmpl', name: 'Team Templates', category: 'Team', icon: '📋', description: 'Share templates with team.' },
    { id: 'invite', name: 'Invite Team', category: 'Team', icon: '👋', description: 'Add members to workspace.' },
    
    // Utilities & Analysis
    { id: 'url-short', name: 'URL Shortener', category: 'Utilities', icon: '🔗', description: 'Shorten and track links.' },
    { id: 'link-bio', name: 'Link in Bio', category: 'Utilities', icon: '🤳', description: 'Create bio link pages.' },
    { id: 'transcribe', name: 'Audio to Text', category: 'Utilities', icon: '🎙️', description: 'Transcribe audio instantly.' },
    { id: 'ai-convert', name: 'AI Converter', category: 'Utilities', icon: '🔄', description: 'Universal file converter.' },
    { id: 'data-analysis', name: 'AI Data Analysis', category: 'Analysis', icon: '📊', description: 'Find stories in numbers.' },
    { id: 'formula', name: 'Formula Gen', category: 'Analysis', icon: '🧮', description: 'Generate Excel/Google Sheets formulas.' },
    { id: 'quiz', name: 'AI Quiz Gen', category: 'Analysis', icon: '❓', description: 'Turn text into quizzes.' },
];

const OfficeSuite: React.FC<OfficeSuiteProps> = ({ onShare }) => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [activeTool, setActiveTool] = useState<typeof TOOLS[0] | null>(null);
    const [input, setInput] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    
    // Sticky Notes State
    const [notes, setNotes] = useState<{id: number, text: string, x: number, y: number, color: string}[]>([]);

    const categories = ['All', 'Visual Suite', ...Array.from(new Set(TOOLS.filter(t => t.category !== 'Visual Suite').map(t => t.category)))];
    const filteredTools = TOOLS.filter(t => selectedCategory === 'All' || t.category === selectedCategory);

    const handleProcess = async () => {
        if (!activeTool) return;
        setLoading(true);
        setResult(null);

        try {
            // Visual Suite Tools
            if (activeTool.category === 'Visual Suite') {
                if (!input) { setLoading(false); return; }
                let prompt = "";
                
                switch(activeTool.id) {
                    case 'ai-sheets':
                        prompt = `Create a spreadsheet for '${input}'. Include relevant columns, headers, and at least 5 rows of sample data. Return ONLY the data as a Markdown table.`;
                        break;
                    case 'ai-docs':
                        prompt = `Write a comprehensive, professional document draft about '${input}'. Use Magic Write style with clear headings, bullet points, and a professional tone.`;
                        break;
                    case 'ai-whiteboard':
                        prompt = `Act as an AI brainstorming partner for '${input}'. List 5-8 key ideas or flowchart steps, grouping them logically. Format as a bulleted list with emojis for a visual whiteboard feel.`;
                        break;
                    case 'ai-present':
                        prompt = `Create a presentation outline for '${input}'. List 5 slides, each with a Title and 3 bullet points. Suggest a visual theme at the end.`;
                        break;
                    case 'social-suite':
                        prompt = `Create a social media content plan for '${input}'. Provide: 1. Instagram Caption & Image Idea. 2. LinkedIn Professional Post. 3. Twitter/X Thread concept.`;
                        break;
                    case 'photo-magic':
                        prompt = `Suggest 3 creative photo editing concepts or background generation ideas for an image related to '${input}'. Describe lighting, style, and composition for a studio-quality look.`;
                        break;
                    case 'video-magic':
                        prompt = `Outline a short video concept for '${input}'. Include: 1. Hook/Intro. 2. Key Scenes with transition ideas. 3. Call to Action. Suggest an audio vibe.`;
                        break;
                    case 'print-shop':
                        prompt = `Suggest 3 print merchandise designs for '${input}' (e.g., T-Shirt, Mug, Poster). Describe the visual design, typography, and placement for each item.`;
                        break;
                    default:
                        prompt = input;
                }
                const res = await generateText(prompt, 'gemini-2.5-flash');
                setResult(res.text);
            }
            // Text Processing Tools
            else if (['summarizer', 'translator', 'content-plan', 'ai-pdf', 'formula', 'data-analysis'].includes(activeTool.id)) {
                if (!input) { setLoading(false); return; }
                let prompt = input;
                if (activeTool.id === 'summarizer') prompt = `Summarize this text concisely: ${input}`;
                if (activeTool.id === 'translator') prompt = `Translate this text to English (if not) or Spanish (if English): ${input}`;
                if (activeTool.id === 'content-plan') prompt = `Create a weekly content calendar for: ${input}`;
                if (activeTool.id === 'formula') prompt = `Generate an Excel formula to: ${input}`;
                if (activeTool.id === 'data-analysis') prompt = `Analyze this data trend/text and provide insights: ${input}`;
                if (activeTool.id === 'ai-pdf') prompt = `Generate the text content for a PDF document about: ${input}`;

                const res = await generateText(prompt, 'gemini-2.5-flash');
                setResult(res.text);
            } 
            // Quiz
            else if (activeTool.id === 'quiz') {
                 const res = await generateSmartQuiz(input, true);
                 const quiz = JSON.parse(res.text);
                 setResult(quiz.questions.map((q: any, i: number) => `Q${i+1}: ${q.question}\nA: ${q.options.find((o:any)=>o.isCorrect).text}`).join('\n\n'));
            }
            // URL Shortener (Mock)
            else if (activeTool.id === 'url-short') {
                setTimeout(() => {
                    setResult(`https://ai.sho.rt/${Math.random().toString(36).substr(2, 6)}`);
                    setLoading(false);
                }, 1000);
                return;
            }
            // File Tools (Simulation)
            else {
                // Simulate file processing
                setTimeout(() => {
                    setResult("File processed successfully! Ready for download.");
                    setLoading(false);
                }, 2000);
                return;
            }
        } catch (e) {
            setResult("Error processing request.");
        }
        setLoading(false);
    };

    const addNote = () => {
        setNotes([...notes, {
            id: Date.now(),
            text: 'New Note',
            x: Math.random() * 200,
            y: Math.random() * 200,
            color: ['bg-yellow-200', 'bg-blue-200', 'bg-green-200', 'bg-pink-200'][Math.floor(Math.random() * 4)]
        }]);
    };

    return (
        <div className="max-w-7xl mx-auto h-full flex flex-col">
            {!activeTool ? (
                <>
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                        <div>
                            <h2 className="text-3xl font-bold text-white">Office & Visual Suite</h2>
                            <p className="text-slate-400">Productivity, creativity, and business tools for your workflow.</p>
                        </div>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide">
                        {categories.map(c => (
                            <button key={c} onClick={() => setSelectedCategory(c)} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition ${selectedCategory === c ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}>{c}</button>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 overflow-y-auto pb-20 custom-scrollbar">
                        {filteredTools.map(tool => (
                            <button key={tool.id} onClick={() => setActiveTool(tool)} className="bg-slate-900/50 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 p-4 rounded-xl flex flex-col items-center text-center transition group h-48 justify-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20 pointer-events-none"></div>
                                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{tool.icon}</div>
                                <h4 className="font-bold text-white text-sm mb-1">{tool.name}</h4>
                                <p className="text-xs text-slate-500 line-clamp-2">{tool.description}</p>
                                {tool.category === 'Visual Suite' && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-500"></span>}
                            </button>
                        ))}
                    </div>
                </>
            ) : (
                <div className="flex-grow flex flex-col bg-slate-900 rounded-xl border border-slate-800 overflow-hidden h-full">
                    <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
                        <div className="flex items-center space-x-3">
                            <button onClick={() => { setActiveTool(null); setResult(null); setInput(''); }} className="text-slate-400 hover:text-white">← Back</button>
                            <span className="text-2xl mr-2">{activeTool.icon}</span>
                            <div>
                                <h3 className="text-xl font-bold text-white">{activeTool.name}</h3>
                                <p className="text-xs text-slate-500">{activeTool.category}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex-grow p-8 flex flex-col items-center justify-center overflow-y-auto">
                        {activeTool.id === 'sticky-notes' ? (
                            <div className="w-full h-full relative bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-700 overflow-hidden">
                                <button onClick={addNote} className="absolute top-4 right-4 bg-cyan-600 text-white px-4 py-2 rounded shadow z-10">+ Add Note</button>
                                {notes.map(note => (
                                    <div key={note.id} className={`absolute w-40 h-40 p-4 shadow-xl rounded ${note.color} text-slate-900 cursor-move`} style={{top: note.y, left: note.x}} draggable onDragEnd={(e) => {
                                        const newNotes = notes.map(n => n.id === note.id ? {...n, x: e.clientX % 500, y: e.clientY % 400} : n); 
                                        setNotes(newNotes);
                                    }}>
                                        <textarea className="w-full h-full bg-transparent resize-none outline-none font-handwriting" defaultValue={note.text} />
                                    </div>
                                ))}
                                {notes.length === 0 && <div className="absolute inset-0 flex items-center justify-center text-slate-500">Click Add Note to start brainstorming.</div>}
                            </div>
                        ) : (
                            <div className="w-full max-w-3xl space-y-6">
                                {['PDF', 'Word', 'PPT', 'Transcribe'].some(k => activeTool.category.includes(k) || activeTool.description.includes(k)) && (
                                    <div className="border-2 border-dashed border-slate-700 rounded-xl p-10 text-center bg-slate-800/30">
                                        <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="hidden" id="file-upload" />
                                        <label htmlFor="file-upload" className="cursor-pointer">
                                            <div className="text-slate-400 mb-2">{file ? file.name : "Click to upload file"}</div>
                                            <div className="text-cyan-500 text-sm">Supported: PDF, DOCX, PPTX, JPG</div>
                                        </label>
                                    </div>
                                )}
                                
                                {['Visual Suite', 'Summarizer', 'Translate', 'Content', 'Formula', 'Quiz', 'Data', 'URL', 'Bio'].some(k => activeTool.category.includes(k) || activeTool.name.includes(k)) && (
                                    <div>
                                        <label className="block text-sm font-bold text-slate-400 mb-2">
                                            {activeTool.id === 'ai-sheets' ? 'Describe your spreadsheet data' : 
                                             activeTool.id === 'ai-whiteboard' ? 'Brainstorming Topic' : 
                                             activeTool.id === 'print-shop' ? 'Merch Idea' :
                                             'Input Text / Topic'}
                                        </label>
                                        <textarea 
                                            value={input} 
                                            onChange={e => setInput(e.target.value)} 
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-4 text-white min-h-[150px] focus:ring-2 focus:ring-cyan-500" 
                                            placeholder={activeTool.id === 'url-short' ? "Paste URL here..." : "Enter text, data, or topic..."}
                                        />
                                    </div>
                                )}

                                <button onClick={handleProcess} disabled={loading} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 flex justify-center items-center gap-2">
                                    {loading ? <Loader /> : <span>Generate / Process</span>}
                                </button>

                                {result && (
                                    <div className="bg-slate-800 p-6 rounded-lg text-slate-300 border border-slate-700 mt-4 prose prose-invert max-w-none">
                                        <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
                                            <span className="text-xs font-bold text-slate-500 uppercase">Result</span>
                                            <button onClick={() => onShare({ contentText: result, contentType: 'text' })} className="text-cyan-400 text-xs hover:text-cyan-300">Share</button>
                                        </div>
                                        {activeTool.id === 'url-short' ? <a href={result} target="_blank" className="text-cyan-400 text-xl">{result}</a> : <div dangerouslySetInnerHTML={{__html: md.render(result)}} />}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default OfficeSuite;
