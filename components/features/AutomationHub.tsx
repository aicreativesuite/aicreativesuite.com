
import React, { useState } from 'react';
import { generateText } from '../../services/geminiService';
import Loader from '../common/Loader';
import { Remarkable } from 'remarkable';

const md = new Remarkable({ html: true });

interface AutomationHubProps {
    onShare: (options: { contentText: string; contentType: 'text' }) => void;
}

const AUTOMATIONS = [
  // CONTENT AUTOMATIONS
  { slug: "auto-blog-writer", name: "Auto Blog Writer", category: "Content", description: "Generates SEO-optimized blog posts daily.", schedule: "0 */12 * * *" },
  { slug: "content-refresh", name: "Content Refresh Automation", category: "Content", description: "Detects outdated content and auto-updates it.", schedule: "0 3 * * *" },
  { slug: "auto-keyword-insertion", name: "Auto Keyword Insertion", category: "Content", description: "Optimizes existing articles for new keywords.", schedule: "0 */8 * * *" },
  { slug: "auto-product-description-writer", name: "Product Desc. Writer", category: "Content", description: "Writes optimized e-commerce product descriptions.", schedule: "On Demand" },
  { slug: "faq-expansion", name: "Dynamic FAQ Expansion", category: "Content", description: "Expands FAQ sections based on trending questions.", schedule: "*/30 * * * *" },
  { slug: "ai-topic-cluster-builder", name: "Topic Cluster Builder", category: "Content", description: "Builds topic clusters using internal + external data.", schedule: "Daily" },
  { slug: "auto-newsletter-generator", name: "Auto Newsletter Generator", category: "Content", description: "Creates weekly newsletters based on site activity.", schedule: "Weekly" },
  { slug: "ai-title-optimizer", name: "Title Optimizer", category: "Content", description: "Auto-A/B tests titles & selects high CTR versions.", schedule: "*/20 * * * *" },
  { slug: "ai-thumbnails", name: "Auto Thumbnail Creator", category: "Content", description: "Generates video/blog thumbnails automatically.", schedule: "On Upload" },
  { slug: "auto-meta-description-writer", name: "Meta Description Writer", category: "Content", description: "Writes CTR-optimized meta descriptions.", schedule: "Daily" },
  { slug: "ai-repurposer", name: "Content Repurposer", category: "Content", description: "Turns blogs into reels, shorts, posts.", schedule: "Hourly" },
  { slug: "auto-image-alt-generator", name: "ALT Text Generator", category: "Content", description: "Generates accessible & SEO-friendly ALT text.", schedule: "On Upload" },
  { slug: "auto-schema-writer", name: "Schema Markup Writer", category: "Content", description: "Writes JSON-LD schema for all pages.", schedule: "0 */6 * * *" },
  { slug: "auto-content-gap-finder", name: "Content Gap Finder", category: "Content", description: "Identifies missing topics competitors cover.", schedule: "Daily" },
  { slug: "viral-ideas-generator", name: "Viral Ideas Generator", category: "Content", description: "Generates trending topics daily.", schedule: "Daily" },

  // SEO AUTOMATIONS
  { slug: "keyword-ranking-tracker", name: "Keyword Ranking Tracker", category: "SEO", description: "Tracks keyword rankings with AI insights.", schedule: "*/30 * * * *" },
  { slug: "competitor-keyword-scraper", name: "Competitor Keyword Scraper", category: "SEO", description: "Scrapes competitor sites for SEO opportunities.", schedule: "Daily" },
  { slug: "internal-linking-automation", name: "Internal Linking Builder", category: "SEO", description: "Creates AI-optimized internal links.", schedule: "0 */4 * * *" },
  { slug: "broken-link-scanner", name: "Broken Link Scanner", category: "SEO", description: "Auto-detects & repairs broken links.", schedule: "0 */3 * * *" },
  { slug: "auto-sitemap-updater", name: "Auto Sitemap Updater", category: "SEO", description: "Updates sitemap based on new content.", schedule: "Hourly" },
  { slug: "seo-audit-bot", name: "SEO Audit Bot", category: "SEO", description: "Runs full technical SEO audit nightly.", schedule: "Daily" },
  { slug: "backlink-monitor", name: "Backlink Monitor", category: "SEO", description: "Monitors new & lost backlinks.", schedule: "0 */2 * * *" },
  { slug: "competitor-gap-analysis", name: "Competitor Gap Analysis", category: "SEO", description: "Finds SEO gaps using competitor datasets.", schedule: "Daily" },
  { slug: "auto-serp-feature-optimizer", name: "SERP Feature Optimizer", category: "SEO", description: "Optimizes for featured snippets, FAQs, etc.", schedule: "*/15 * * * *" },
  { slug: "ai-canonical-manager", name: "Canonical Tag Manager", category: "SEO", description: "Fixes duplicate URLs with AI.", schedule: "Daily" },
  { slug: "seo-regression-monitor", name: "SEO Regression Monitor", category: "SEO", description: "Detects sudden SEO drops instantly.", schedule: "*/10 * * * *" },
  { slug: "keyword-cluster-organizer", name: "Keyword Cluster Organizer", category: "SEO", description: "Clusters keywords into intent groups.", schedule: "Daily" },
  { slug: "auto-indexing", name: "Auto Google Indexing", category: "SEO", description: "Instantly pushes URLs to IndexNow.", schedule: "On Publish" },
  { slug: "ai-page-speed-optimizer", name: "Page Speed Optimizer", category: "SEO", description: "Finds slow pages, suggests improvements.", schedule: "Daily" },
  { slug: "seo-title-tagger", name: "SEO Title Tagger", category: "SEO", description: "Optimizes titles with CTR models.", schedule: "*/45 * * * *" },

  // UX AUTOMATIONS
  { slug: "session-replay-ai", name: "AI Session Replay Analyzer", category: "UX", description: "Detects UX friction from user sessions.", schedule: "*/20 * * * *" },
  { slug: "heatmap-generator", name: "Heatmap Generator", category: "UX", description: "Generates heatmaps using clickstream data.", schedule: "Hourly" },
  { slug: "conversion-drop-detector", name: "Conversion Drop Detector", category: "UX", description: "Alerts when conversion rate drops.", schedule: "*/5 * * * *" },
  { slug: "ai-form-optimizer", name: "Form UX Optimizer", category: "UX", description: "Finds confusing form fields.", schedule: "Daily" },
  { slug: "scroll-depth-monitor", name: "Scroll Depth Monitor", category: "UX", description: "Tracks reading behavior & drop-off points.", schedule: "*/15 * * * *" },
  { slug: "ui-bug-detector", name: "UI Bug Detector", category: "UX", description: "Detects broken UI elements using screenshots.", schedule: "*/10 * * * *" },
  { slug: "ai-user-path-optimizer", name: "User Path Optimizer", category: "UX", description: "Finds optimal UX journeys to conversion.", schedule: "Daily" },
  { slug: "auto-a11y-checker", name: "Accessibility Checker", category: "UX", description: "Detects accessibility issues automatically.", schedule: "0 */4 * * *" },
  { slug: "auto-ui-copywriter", name: "UI Copy Optimizer", category: "UX", description: "Improves UX writing (buttons, labels).", schedule: "On Demand" },
  { slug: "mobile-ux-scanner", name: "Mobile UX Scanner", category: "UX", description: "Runs mobile-specific UX diagnostics.", schedule: "Daily" },
  { slug: "rage-click-detector", name: "Rage Click Monitor", category: "UX", description: "Scores frustration events.", schedule: "*/15 * * * *" },
  { slug: "dead-click-finder", name: "Dead Click Finder", category: "UX", description: "Detects non-functional UI elements.", schedule: "*/30 * * * *" },
  { slug: "ai-cta-optimizer", name: "CTA Optimizer", category: "UX", description: "A/B tests CTA text + styling.", schedule: "Hourly" },
  { slug: "auto-navigation-optimizer", name: "Navigation Optimizer", category: "UX", description: "Improves site navigation hierarchy.", schedule: "Daily" },
  { slug: "form-abandonment-tracker", name: "Form Abandonment Tracker", category: "UX", description: "Finds where users drop off.", schedule: "*/10 * * * *" },

  // AUTHORITY AUTOMATIONS
  { slug: "auto-pr-writer", name: "PR Press Release Writer", category: "Authority", description: "Writes weekly press releases.", schedule: "Weekly" },
  { slug: "backlink-generator", name: "Backlink Outreach Generator", category: "Authority", description: "Automates backlink outreach emails.", schedule: "Daily" },
  { slug: "guest-post-finder", name: "Guest Post Finder", category: "Authority", description: "Finds websites open to guest posts.", schedule: "Daily" },
  { slug: "expert-roundup-generator", name: "Expert Roundup Generator", category: "Authority", description: "Creates expert roundup requests.", schedule: "Weekly" },
  { slug: "brand-mention-monitor", name: "Brand Mention Monitor", category: "Authority", description: "Tracks brand mentions across the web.", schedule: "*/10 * * * *" },
  { slug: "review-response-automation", name: "Review Response Bot", category: "Authority", description: "Responds to reviews automatically.", schedule: "*/30 * * * *" },
  { slug: "citation-builder", name: "Citation Builder", category: "Authority", description: "Builds local citations for businesses.", schedule: "Monthly" },
  { slug: "influencer-finder", name: "Influencer Finder", category: "Authority", description: "Finds influencers for niche topics.", schedule: "Daily" },
  { slug: "podcast-outreach", name: "Podcast Outreach Automation", category: "Authority", description: "Pitches podcast guest appearances.", schedule: "Weekly" },
  { slug: "digital-pr-ideas-generator", name: "Digital PR Idea Engine", category: "Authority", description: "Creates newsworthy PR angles.", schedule: "Weekly" },
  { slug: "auto-social-proof-updater", name: "Social Proof Updater", category: "Authority", description: "Updates testimonials & proof across pages.", schedule: "Daily" },
  { slug: "brand-voice-standardizer", name: "Brand Voice Standardizer", category: "Authority", description: "Enforces consistent branding.", schedule: "Daily" },
  { slug: "twitter-auto-engagement", name: "Twitter Auto Engagement", category: "Authority", description: "Boosts authority through automated replies.", schedule: "*/15 * * * *" },
  { slug: "auto-quora-answers", name: "Auto Quora Answer Bot", category: "Authority", description: "Answers Quora questions in niche topics.", schedule: "*/20 * * * *" },
  { slug: "authority-score-monitor", name: "Authority Score Monitor", category: "Authority", description: "Tracks authority metrics & suggests improvements.", schedule: "Daily" },
];

const AutomationHub: React.FC<AutomationHubProps> = ({ onShare }) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeAutomation, setActiveAutomation] = useState<typeof AUTOMATIONS[0] | null>(null);
    const [simulationInput, setSimulationInput] = useState('');
    const [simulationResult, setSimulationResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const categories = ['All', 'Content', 'SEO', 'UX', 'Authority'];

    const filteredAutomations = AUTOMATIONS.filter(automation => {
        const matchesCategory = selectedCategory === 'All' || automation.category === selectedCategory;
        const matchesSearch = automation.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              automation.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleSimulate = async () => {
        if (!activeAutomation || !simulationInput.trim()) return;
        setLoading(true);
        setSimulationResult(null);

        try {
            const prompt = `
                Act as an advanced autonomous agent named "${activeAutomation.name}".
                Your core function is: ${activeAutomation.description}.
                
                The user has provided the following context/input for this run:
                "${simulationInput}"
                
                Please simulate a successful execution of this automation. 
                Provide a detailed output that represents what this automation would generate or the report it would produce.
                Use Markdown formatting for structure (tables, lists, headers).
            `;
            const response = await generateText(prompt, 'gemini-2.5-flash');
            setSimulationResult(response.text);
        } catch (error) {
            setSimulationResult("Simulation failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (schedule: string) => {
        if (schedule.includes('minute') || schedule.includes('Hourly')) return 'text-green-400 bg-green-900/20 border-green-800';
        if (schedule === 'On Demand' || schedule === 'On Upload') return 'text-blue-400 bg-blue-900/20 border-blue-800';
        return 'text-purple-400 bg-purple-900/20 border-purple-800';
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)] min-h-[600px]">
            {/* Sidebar Controls */}
            <div className="w-full lg:w-80 flex-shrink-0 bg-slate-900/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-800 overflow-y-auto custom-scrollbar flex flex-col gap-4 transition-all duration-300">
                {!activeAutomation ? (
                    <>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Automation Hub</h3>
                            <p className="text-xs text-slate-400">60+ autonomous agents ready to deploy.</p>
                        </div>

                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Search agents..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 px-4 text-white text-xs focus:ring-2 focus:ring-cyan-500 pl-9"
                            />
                            <svg className="w-4 h-4 text-slate-500 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-colors ${
                                        selectedCategory === cat 
                                            ? 'bg-cyan-600 text-white' 
                                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <div className="flex-grow space-y-3 overflow-y-auto pr-1">
                            {filteredAutomations.map((auto) => (
                                <div 
                                    key={auto.slug}
                                    onClick={() => { setActiveAutomation(auto); setSimulationResult(null); setSimulationInput(''); }}
                                    className="p-3 rounded-xl border border-slate-800 bg-slate-950/50 hover:border-cyan-500/50 hover:bg-slate-800 cursor-pointer transition group"
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">{auto.name}</h4>
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded border ${getStatusColor(auto.schedule)}`}>{auto.schedule}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 line-clamp-2">{auto.description}</p>
                                </div>
                            ))}
                            {filteredAutomations.length === 0 && (
                                <p className="text-xs text-slate-500 text-center py-4">No agents found.</p>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col h-full animate-fadeIn">
                        <button 
                            onClick={() => setActiveAutomation(null)}
                            className="flex items-center space-x-2 text-xs text-slate-400 hover:text-white mb-4 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            <span>Back to Agents</span>
                        </button>

                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-white mb-1">{activeAutomation.name}</h3>
                            <span className={`text-[10px] px-2 py-0.5 rounded border inline-block mb-2 ${getStatusColor(activeAutomation.schedule)}`}>{activeAutomation.schedule}</span>
                            <p className="text-xs text-slate-400">{activeAutomation.description}</p>
                        </div>

                        <div className="flex-grow flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">Input Context</label>
                                <textarea
                                    value={simulationInput}
                                    onChange={(e) => setSimulationInput(e.target.value)}
                                    className="w-full h-40 bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-xs focus:ring-2 focus:ring-cyan-500 resize-none"
                                    placeholder={`Enter details for ${activeAutomation.name}...`}
                                />
                            </div>
                            <button 
                                onClick={handleSimulate}
                                disabled={loading || !simulationInput.trim()}
                                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-50 transition shadow-lg flex justify-center items-center gap-2 mt-auto"
                            >
                                {loading ? <Loader /> : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <span>Run Simulation</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Result Area */}
            <div className="flex-grow bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col overflow-hidden relative">
                <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                    <h3 className="font-bold text-white text-sm uppercase tracking-wider">
                        {activeAutomation ? `${activeAutomation.name} Output` : 'Agent Workspace'}
                    </h3>
                    {simulationResult && (
                        <div className="flex gap-2">
                            <button onClick={() => setSimulationResult(null)} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded transition">Clear</button>
                            <button onClick={() => onShare({ contentText: simulationResult, contentType: 'text' })} className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded font-bold transition">Share</button>
                        </div>
                    )}
                </div>

                <div className="flex-grow p-8 overflow-y-auto custom-scrollbar relative">
                    <div className="absolute inset-0 bg-grid-slate-800/20 pointer-events-none"></div>
                    
                    {loading && (
                        <div className="h-full flex flex-col items-center justify-center">
                            <Loader message={`Running ${activeAutomation?.name}...`} />
                        </div>
                    )}

                    {!loading && !simulationResult && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-60">
                            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                            </div>
                            <p className="text-lg font-medium">Select an agent to begin</p>
                            <p className="text-sm mt-2 max-w-xs text-center">Configure the automation in the sidebar and run a simulation to see the results here.</p>
                        </div>
                    )}

                    {simulationResult && (
                        <div className="max-w-4xl mx-auto space-y-4 animate-fadeIn relative z-10">
                            <div className="bg-green-900/10 border border-green-500/30 rounded-lg p-3 mb-6 flex items-center gap-3">
                                <div className="bg-green-500 rounded-full p-1"><svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></div>
                                <span className="text-sm font-bold text-green-400">Task Completed Successfully</span>
                            </div>
                            <div className="bg-white text-slate-900 p-8 rounded-xl shadow-lg prose prose-sm max-w-none">
                                <div dangerouslySetInnerHTML={{ __html: md.render(simulationResult) }} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AutomationHub;
