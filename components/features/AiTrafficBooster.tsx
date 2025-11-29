
import React, { useState } from 'react';
import { generateTrafficStrategy } from '../../services/geminiService';
import Loader from '../common/Loader';

interface AiTrafficBoosterProps {
    onShare: (options: { contentText: string; contentType: 'text' }) => void;
}

interface StrategySection {
    title: string;
    [key: string]: any;
}

interface StrategyResult {
    geoStrategy: StrategySection & { tactics: string[], citationContent: string[] };
    socialStrategy: StrategySection & { repurposingTactics: string[], viralHooks: string[] };
    technicalStrategy: StrategySection & { schemaMarkup: string[], analyticsTips: string[] };
    growthStrategy: StrategySection & { adTargeting: string[], uxPersonalization: string[] };
}

// --- Roadmap Data ---
const ENGINEERING_PLAN = [
    {
        id: 'epic-1',
        title: 'EPIC 1 — Core Data Infrastructure & Google Places API Integration',
        duration: 'Week 1–2',
        goal: 'Build the foundational pipeline for pulling & storing business data.',
        stories: [
            {
                id: '1.1',
                title: 'Set up Google Cloud Project & Places API',
                description: 'Configure cloud environment, API keys, quotas, billing alerts.',
                criteria: [
                    'Google Cloud project created',
                    'Places API enabled',
                    'API keys (server-only) created and restricted by IP/domain',
                    'Billing alerts configured (threshold alerts at 25%, 50%, 75%)',
                    'ENV variables documented'
                ],
                deliverables: ['GCP project', 'API keys + JSON config file', 'Documentation in repo']
            },
            {
                id: '1.2',
                title: 'Build Places API Fetcher (Text Search + Place Details)',
                description: 'Serverless script that fetches business data by keyword + location.',
                criteria: [
                    'API call returns structured business data',
                    'For each place: id, name, geo, website, phone, categories, hours, ratings',
                    'Pagination handled',
                    'Rate limiting respected',
                    'Only required fields fetched to reduce cost',
                    'Errors handled + retries implemented'
                ],
                deliverables: ['Node.js or Python fetcher', 'JSON output stored in DB']
            },
            {
                id: '1.3',
                title: 'Normalize & Store Business Data',
                description: 'Standardize business data for downstream content generation.',
                criteria: [
                    'Business table created (place_id, name, category, website, phone, hours, coordinates, rating, status)',
                    'Dedupe rules implemented (use place_id or phone)',
                    'All fetched places stored in DB successfully',
                    'Logs stored in Cloud Storage'
                ],
                deliverables: ['DB schema + migration', 'Normalization scripts', 'Test dataset']
            }
        ]
    },
    {
        id: 'epic-2',
        title: 'EPIC 2 — AI Content Engine (SEO Pages, Schema, Metadata)',
        duration: 'Week 2–4',
        goal: 'Generate SEO pages automatically for each business.',
        stories: [
            {
                id: '2.1',
                title: 'Build AI Content Generator Service',
                description: 'AI service that turns business data → SEO content.',
                criteria: [
                    'Generates: SEO title, Meta description, Landing page content, FAQs, Schema JSON-LD',
                    'Uses templating + AI hybrid approach',
                    'Can regenerate on demand',
                    'Errors logged & retried'
                ],
                deliverables: ['AI microservice', 'Prompt templates', 'Version control for content']
            },
            {
                id: '2.2',
                title: 'Build SEO Page Generator (Next.js)',
                description: 'System to generate pages for each business.',
                criteria: [
                    'Dynamic route: /business/[place_id]',
                    'ISR (Incremental Static Regeneration) enabled',
                    'JSON-LD rendered server-side',
                    'Page loads in <300ms from edge CDN',
                    'Page includes: Hero, Map, Details, AI Content'
                ],
                deliverables: ['Next.js pages', 'Deployment configuration', 'Sitemap template']
            },
            {
                id: '2.3',
                title: 'Auto-Generate Sitemaps at Scale',
                description: 'Produce geo-sitemaps for thousands of pages.',
                criteria: [
                    'Sitemap index created',
                    'Partition sitemaps (1k URLs per file)',
                    'Regeneration scheduled daily',
                    'Verified in Google Search Console'
                ],
                deliverables: ['Sitemap generation script', 'Cron schedule']
            }
        ]
    },
    {
        id: 'epic-3',
        title: 'EPIC 3 — Chrome Extension (CSV Export + Data Collection)',
        duration: 'Week 3–5',
        goal: 'Create extension for data exporting and user lead acquisition.',
        stories: [
            {
                id: '3.1',
                title: 'Build Chrome Extension Manifest (v3)',
                description: 'Basic extension structure.',
                criteria: ['manifest.json created', 'Permissions minimized', 'Popup UI included', 'Icon set prepared'],
                deliverables: ['Extension codebase']
            },
            {
                id: '3.2',
                title: 'Build “Extract & Download CSV” Feature',
                description: 'Export business data from user-selected pages.',
                criteria: ['Button to extract structured data', 'CSV auto-download', 'Success/failure notifications'],
                deliverables: ['Content script for scraping', 'CSV formatter']
            },
            {
                id: '3.3',
                title: 'Add “AI Traffic Booster Sync” Button',
                description: 'Send CSV data to API (user opt-in required).',
                criteria: ['OAuth / email opt-in implemented', 'User can send data to backend', 'Data stored securely', 'Passes Chrome Web Store checks'],
                deliverables: ['API integration in extension']
            },
            {
                id: '3.4',
                title: 'Publish Extension Beta',
                description: 'Release to store.',
                criteria: ['Extension uploaded to Chrome Web Store', 'Unlisted mode enabled', 'Tested on OS environments', 'Approval received'],
                deliverables: ['Store listing', 'Beta link']
            }
        ]
    },
    {
        id: 'epic-4',
        title: 'EPIC 4 — Email & SMS Automation Layer',
        duration: 'Week 4–6',
        goal: 'Automate outreach using compliant, opt-in marketing sequences.',
        stories: [
            {
                id: '4.1',
                title: 'Build Email Marketing API Integration',
                description: 'Integrate with SendGrid or similar.',
                criteria: ['Verified domain sender configured', 'Templates created using AI content', 'Send email from backend API', 'Log success/failure'],
                deliverables: ['Email service module']
            },
            {
                id: '4.2',
                title: 'Build SMS Marketing Integration',
                description: 'Use Twilio or approved provider.',
                criteria: ['SMS API key configured', 'Opt-in required before sending', 'Delivery status tracked', 'Bounce handling'],
                deliverables: ['SMS service module']
            },
            {
                id: '4.3',
                title: 'Build Automated Campaign Workflows',
                description: 'Orchestrate the drip sequence.',
                criteria: ['Create drip sequence: Welcome -> SEO Audit -> Boosters', 'JSON config for campaigns', 'Scheduler triggers correctly'],
                deliverables: ['Workflow engine', 'Campaign configs']
            }
        ]
    },
    {
        id: 'epic-5',
        title: 'EPIC 5 — AI Traffic Booster Dashboard',
        duration: 'Week 5–7',
        goal: 'Provide a full UI for controlling all automations.',
        stories: [
            {
                id: '5.1',
                title: 'Build Dashboard UI',
                description: 'Main control center.',
                criteria: ['Sidebar navigation', 'Summaries: pages published, clicks, leads', 'Table of businesses', 'Ability to trigger regeneration'],
                deliverables: ['Dashboard frontend components']
            },
            {
                id: '5.2',
                title: 'Add “Grounded Search” AI Tool',
                description: 'Search across the business database.',
                criteria: ['Search across the business database', 'AI answers using RAG', 'Returns citations + suggestions'],
                deliverables: ['Search interface', 'RAG pipeline']
            },
            {
                id: '5.3',
                title: 'Integrate AI Creative Suite',
                description: 'Connect Image/Video generators.',
                criteria: ['Each tool loads as a module', 'Allows uploading -> AI output', 'Saves result to asset storage'],
                deliverables: ['Integration logic']
            }
        ]
    },
    {
        id: 'epic-6',
        title: 'EPIC 6 — OS-Level Distribution & Globalization',
        duration: 'Week 6–8',
        goal: 'Ship integrations into your OS + app ecosystem.',
        stories: [
            {
                id: '6.1',
                title: 'Build OS API Bridge',
                description: 'Enable external apps to call the API.',
                criteria: ['OS apps can call shared API', 'Authentication layer (JWT) added', 'Global environment config'],
                deliverables: ['Public API endpoints']
            },
            {
                id: '6.2',
                title: 'Multi-country Deployment',
                description: 'Localization and regional settings.',
                criteria: ['Add region selector', 'Add currency formatting', 'Add language templates (EN, IN, PH, ID, ES)', 'Translate AI outputs'],
                deliverables: ['i18n configuration', 'Locale files']
            },
            {
                id: '6.3',
                title: 'Deploy AI Traffic Booster to OS Apps',
                description: 'Final integration.',
                criteria: ['App UI shows Traffic Booster module', 'Chrome extension link visible', 'API usage tracked per device', 'Logs accessible'],
                deliverables: ['Production release']
            }
        ]
    },
    {
        id: 'epic-7',
        title: 'EPIC 7 — Monitoring, Logging, and Observability',
        duration: 'Week 7–8',
        goal: 'Make sure the entire system is stable at scale.',
        stories: [
            {
                id: '7.1',
                title: 'Add API Logging Layer',
                description: 'Track performance and errors.',
                criteria: ['All backend routes log request + response time', 'Errors go to Slack/email alerts', 'Logs stored for 30-90 days'],
                deliverables: ['Logging middleware']
            },
            {
                id: '7.2',
                title: 'Build Metrics Dashboard',
                description: 'Visualize system health.',
                criteria: ['Displays API usage, Places API cost, Page gen volume, Email/SMS sends', 'Runs daily'],
                deliverables: ['Metrics UI / Grafana dashboard']
            },
            {
                id: '7.3',
                title: 'Implement Rate Limiting',
                description: 'Abuse protection.',
                criteria: ['Token bucket rate limiter', 'Per-user and per-IP thresholds', 'Auto-ban suspicious activity'],
                deliverables: ['Rate limiting configuration']
            }
        ]
    }
];

const AiTrafficBooster: React.FC<AiTrafficBoosterProps> = ({ onShare }) => {
    const [activeTab, setActiveTab] = useState<'strategy' | 'roadmap'>('strategy');
    
    // Strategy State
    const [niche, setNiche] = useState('');
    const [audience, setAudience] = useState('');
    const [websiteUrl, setWebsiteUrl] = useState('');
    const [result, setResult] = useState<StrategyResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Roadmap State
    const [expandedStories, setExpandedStories] = useState<Set<string>>(new Set());

    const toggleStory = (id: string) => {
        const newSet = new Set(expandedStories);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setExpandedStories(newSet);
    };

    const handleCopyPlan = () => {
        const textPlan = ENGINEERING_PLAN.map(epic => 
            `## ${epic.title} (${epic.duration})\n${epic.stories.map(s => 
                `  - [ ] ${s.title}: ${s.description}`
            ).join('\n')}`
        ).join('\n\n');
        navigator.clipboard.writeText(textPlan);
        alert('Full Engineering Plan copied to clipboard!');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!niche || !audience) {
            setError('Please enter your Niche and Target Audience.');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await generateTrafficStrategy(niche, audience, websiteUrl);
            const parsedResult = JSON.parse(response.text);
            setResult(parsedResult);
        } catch (err) {
            setError('Failed to generate strategy. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };
    
    const formatShareText = (res: StrategyResult) => {
        return `
**AI Traffic Booster Strategy: The 10 Billion Visit Shortcut**
Target: ${niche} | ${audience}

**1. Content & GEO (Generative Engine Optimization)**
${res.geoStrategy.tactics.map(t => `- ${t}`).join('\n')}
*Citation Assets:* ${res.geoStrategy.citationContent.join(', ')}

**2. Social Dominance**
${res.socialStrategy.repurposingTactics.map(t => `- ${t}`).join('\n')}
*Hooks:* ${res.socialStrategy.viralHooks.join(', ')}

**3. Technical Foundation**
${res.technicalStrategy.schemaMarkup.map(t => `- ${t}`).join('\n')}
*Tracking:* ${res.technicalStrategy.analyticsTips.join(', ')}

**4. Paid Growth & UX**
${res.growthStrategy.adTargeting.map(t => `- ${t}`).join('\n')}
*Personalization:* ${res.growthStrategy.uxPersonalization.join(', ')}
        `.trim();
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)] min-h-[600px]">
            {/* Sidebar Controls */}
            <div className="w-full lg:w-80 flex-shrink-0 bg-slate-900/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-800 overflow-y-auto custom-scrollbar flex flex-col gap-6">
                
                {/* Navigation Tabs */}
                <div className="flex bg-slate-800 p-1 rounded-lg">
                    <button 
                        onClick={() => setActiveTab('strategy')} 
                        className={`flex-1 py-2 text-xs font-bold rounded-md transition ${activeTab === 'strategy' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        Generator
                    </button>
                    <button 
                        onClick={() => setActiveTab('roadmap')} 
                        className={`flex-1 py-2 text-xs font-bold rounded-md transition ${activeTab === 'roadmap' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        Engineering Plan
                    </button>
                </div>

                {activeTab === 'strategy' ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-white mb-2">Strategy Setup</h3>
                            <p className="text-xs text-slate-400">Optimize for AI Search (GEO) and modern distribution channels.</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Niche / Industry</label>
                            <input
                                type="text"
                                value={niche}
                                onChange={(e) => setNiche(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500"
                                placeholder="e.g., AI Productivity"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Target Audience</label>
                            <input
                                type="text"
                                value={audience}
                                onChange={(e) => setAudience(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500"
                                placeholder="e.g., Remote Workers"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Website (Optional)</label>
                            <input
                                type="url"
                                value={websiteUrl}
                                onChange={(e) => setWebsiteUrl(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500"
                                placeholder="https://yourbrand.com"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-bold py-3 px-4 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg flex justify-center items-center gap-2"
                        >
                            {loading ? <Loader /> : <span>Generate Roadmap</span>}
                        </button>
                        {error && <p className="text-red-400 text-xs text-center bg-red-900/20 p-2 rounded">{error}</p>}
                    </form>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-bold text-white mb-2">Execution Plan</h3>
                            <p className="text-xs text-slate-400">8-Week Engineering Timeline</p>
                        </div>
                        <div className="text-xs text-slate-400">
                            <p className="mb-2">Total Epics: <span className="text-white font-bold">{ENGINEERING_PLAN.length}</span></p>
                            <p className="mb-2">Total Weeks: <span className="text-white font-bold">8</span></p>
                        </div>
                        <button 
                            onClick={handleCopyPlan}
                            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-xl transition border border-slate-700 flex justify-center items-center gap-2 text-xs"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                            Copy Full Plan to Clipboard
                        </button>
                    </div>
                )}
            </div>

            {/* Main Result Area */}
            <div className="flex-grow bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col overflow-hidden relative">
                
                {activeTab === 'strategy' ? (
                    <>
                        <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                            <h3 className="font-bold text-white text-sm uppercase tracking-wider">Growth Roadmap</h3>
                            {result && (
                                <button
                                    onClick={() => onShare({ contentText: formatShareText(result), contentType: 'text' })}
                                    className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded font-bold transition"
                                >
                                    Share Strategy
                                </button>
                            )}
                        </div>

                        <div className="flex-grow p-8 overflow-y-auto relative custom-scrollbar">
                            <div className="absolute inset-0 bg-grid-slate-800/20 pointer-events-none"></div>
                            
                            {loading && (
                                <div className="h-full flex flex-col items-center justify-center">
                                    <Loader message="Consulting AI Marketing Experts..." />
                                </div>
                            )}

                            {!loading && !result && (
                                <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-60">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                    <p className="text-lg">Define your market to generate a strategy.</p>
                                </div>
                            )}

                            {result && (
                                <div className="space-y-6 relative z-10 max-w-5xl mx-auto animate-fadeIn">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Card 1: GEO & Content */}
                                        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-md">
                                            <div className="flex items-center mb-4 text-cyan-400">
                                                <div className="p-2 bg-cyan-400/10 rounded-lg mr-3">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                                </div>
                                                <h3 className="text-lg font-bold text-white">1. Content & GEO</h3>
                                            </div>
                                            <ul className="space-y-2 mb-4 text-slate-300 list-disc list-inside text-sm">
                                                {result.geoStrategy.tactics.map((t, i) => <li key={i}>{t}</li>)}
                                            </ul>
                                            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                                                <h4 className="text-[10px] font-bold text-cyan-500 uppercase mb-2">Assets</h4>
                                                <ul className="space-y-1">
                                                    {result.geoStrategy.citationContent.map((idea, i) => (
                                                        <li key={i} className="text-xs text-slate-400 flex justify-between group">
                                                            <span>{idea}</span>
                                                            <button onClick={() => handleCopy(idea)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-white transition-opacity" title="Copy">📋</button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        {/* Card 2: Social */}
                                        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-md">
                                            <div className="flex items-center mb-4 text-purple-400">
                                                <div className="p-2 bg-purple-400/10 rounded-lg mr-3">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
                                                </div>
                                                <h3 className="text-lg font-bold text-white">2. Social Dominance</h3>
                                            </div>
                                            <ul className="space-y-2 mb-4 text-slate-300 list-disc list-inside text-sm">
                                                {result.socialStrategy.repurposingTactics.map((t, i) => <li key={i}>{t}</li>)}
                                            </ul>
                                            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                                                <h4 className="text-[10px] font-bold text-purple-500 uppercase mb-2">Viral Hooks</h4>
                                                <ul className="space-y-1">
                                                    {result.socialStrategy.viralHooks.map((hook, i) => (
                                                        <li key={i} className="text-xs text-slate-400 flex justify-between group">
                                                            <span>"{hook}"</span>
                                                            <button onClick={() => handleCopy(hook)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-white transition-opacity" title="Copy">📋</button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        {/* Card 3: Technical */}
                                        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-md">
                                            <div className="flex items-center mb-4 text-green-400">
                                                <div className="p-2 bg-green-400/10 rounded-lg mr-3">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                                                </div>
                                                <h3 className="text-lg font-bold text-white">3. Technical Foundation</h3>
                                            </div>
                                            <ul className="space-y-2 mb-4 text-slate-300 list-disc list-inside text-sm">
                                                {result.technicalStrategy.analyticsTips.map((t, i) => <li key={i}>{t}</li>)}
                                            </ul>
                                            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                                                <h4 className="text-[10px] font-bold text-green-500 uppercase mb-2">Schema</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {result.technicalStrategy.schemaMarkup.map((schema, i) => (
                                                        <span key={i} className="text-[10px] bg-green-900/30 text-green-200 px-2 py-1 rounded border border-green-700/50">{schema}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card 4: Paid Growth */}
                                        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-md">
                                            <div className="flex items-center mb-4 text-amber-400">
                                                <div className="p-2 bg-amber-400/10 rounded-lg mr-3">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                </div>
                                                <h3 className="text-lg font-bold text-white">4. Growth & UX</h3>
                                            </div>
                                            <ul className="space-y-2 mb-4 text-slate-300 list-disc list-inside text-sm">
                                                {result.growthStrategy.adTargeting.map((t, i) => <li key={i}>{t}</li>)}
                                            </ul>
                                            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                                                <h4 className="text-[10px] font-bold text-amber-500 uppercase mb-2">Personalization</h4>
                                                <ul className="space-y-1">
                                                    {result.growthStrategy.uxPersonalization.map((idea, i) => (
                                                        <li key={i} className="text-xs text-slate-400 flex justify-between">
                                                            <span>{idea}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-grow p-8 overflow-y-auto relative custom-scrollbar bg-slate-950/50">
                        <div className="max-w-5xl mx-auto space-y-8">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-white">8-Week Engineering Plan</h2>
                                <p className="text-slate-400">AI Traffic Booster Platform Execution</p>
                            </div>

                            {ENGINEERING_PLAN.map((epic) => (
                                <div key={epic.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg">
                                    {/* Epic Header */}
                                    <div className="p-6 border-b border-slate-700 bg-slate-800">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-lg font-bold text-white flex-grow">{epic.title}</h3>
                                            <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-900/50 text-cyan-400 border border-cyan-700/30 whitespace-nowrap ml-4">
                                                {epic.duration}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-400">{epic.goal}</p>
                                    </div>

                                    {/* Stories */}
                                    <div className="divide-y divide-slate-700/50">
                                        {epic.stories.map((story) => {
                                            const isExpanded = expandedStories.has(story.id);
                                            return (
                                                <div key={story.id} className="bg-slate-800/50">
                                                    <div 
                                                        onClick={() => toggleStory(story.id)}
                                                        className="p-4 cursor-pointer hover:bg-slate-700/50 transition flex items-center justify-between"
                                                    >
                                                        <div className="flex items-center space-x-3">
                                                            <div className="bg-purple-900/30 text-purple-400 text-xs font-mono px-2 py-1 rounded border border-purple-500/20">{story.id}</div>
                                                            <span className="text-sm font-medium text-slate-200">{story.title}</span>
                                                        </div>
                                                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </div>
                                                    
                                                    {isExpanded && (
                                                        <div className="px-12 pb-6 pt-2 space-y-4 animate-fadeIn">
                                                            <p className="text-sm text-slate-400 italic">{story.description}</p>
                                                            
                                                            <div>
                                                                <h5 className="text-xs font-bold text-green-400 uppercase mb-2">Acceptance Criteria</h5>
                                                                <ul className="space-y-2">
                                                                    {story.criteria.map((c, i) => (
                                                                        <li key={i} className="flex items-start text-sm text-slate-300">
                                                                            <div className="w-4 h-4 rounded border border-slate-500 mr-3 flex-shrink-0 mt-0.5"></div>
                                                                            <span>{c}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>

                                                            <div>
                                                                <h5 className="text-xs font-bold text-amber-400 uppercase mb-2">Deliverables</h5>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {story.deliverables.map((d, i) => (
                                                                        <span key={i} className="text-xs bg-amber-900/20 text-amber-200 px-2 py-1 rounded border border-amber-700/30">
                                                                            {d}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AiTrafficBooster;
