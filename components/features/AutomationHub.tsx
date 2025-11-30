
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
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-1">Super Automation Hub</h2>
                    <p className="text-slate-400 text-sm">60+ autonomous agents working 24/7 to grow your business.</p>
                </div>
                <div className="relative w-full md:w-64">
                    <input 
                        type="text" 
                        placeholder="Search agents..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-4 text-white focus:ring-2 focus:ring-cyan-500 pl-10"
                    />
                    <svg className="w-4 h-4 text-slate-500 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                            selectedCategory === cat 
                                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/20' 
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="flex gap-6 flex-grow overflow-hidden">
                {/* Grid List */}
                <div className={`flex-grow overflow-y-auto custom-scrollbar pr-2 ${activeAutomation ? 'hidden lg:block lg:w-1/2' : 'w-full'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredAutomations.map((auto) => (
                            <div 
                                key={auto.slug}
                                onClick={() => { setActiveAutomation(auto); setSimulationResult(null); setSimulationInput(''); }}
                                className={`p-4 rounded-xl border cursor-pointer transition-all hover:border-cyan-500/50 hover:bg-slate-800/80 group ${
                                    activeAutomation?.slug === auto.slug ? 'bg-slate-800 border-cyan-500 ring-1 ring-cyan-500' : 'bg-slate-900/50 border-slate-800'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className={`p-2 rounded-lg ${
                                        auto.category === 'Content' ? 'bg-blue-500/20 text-blue-400' :
                                        auto.category === 'SEO' ? 'bg-green-500/20 text-green-400' :
                                        auto.category === 'UX' ? 'bg-purple-500/20 text-purple-400' :
                                        'bg-amber-500/20 text-amber-400'
                                    }`}>
                                        {/* Icons based on category */}
                                        {auto.category === 'Content' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>}
                                        {auto.category === 'SEO' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                                        {auto.category === 'UX' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                                        {auto.category === 'Authority' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded border ${getStatusColor(auto.schedule)}`}>
                                        {auto.schedule}
                                    </span>
                                </div>
                                <h3 className="font-bold text-white text-sm mb-1 group-hover:text-cyan-400 transition-colors">{auto.name}</h3>
                                <p className="text-xs text-slate-400 line-clamp-2">{auto.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Simulation Panel */}
                {activeAutomation && (
                    <div className="w-full lg:w-1/2 bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden shadow-2xl relative animate-slideInRight">
                        <div className="p-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    {activeAutomation.name}
                                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">{activeAutomation.category}</span>
                                </h3>
                            </div>
                            <button onClick={() => setActiveAutomation(null)} className="lg:hidden text-slate-400 hover:text-white">Close</button>
                        </div>

                        <div className="flex-grow flex flex-col p-6 overflow-hidden">
                            {!simulationResult ? (
                                <div className="flex-grow flex flex-col gap-4">
                                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Agent Task</h4>
                                        <p className="text-sm text-slate-300">{activeAutomation.description}</p>
                                    </div>
                                    
                                    <div className="flex-grow flex flex-col justify-center">
                                        <label className="block text-sm font-bold text-white mb-2">Input Context / Trigger Data</label>
                                        <textarea
                                            value={simulationInput}
                                            onChange={(e) => setSimulationInput(e.target.value)}
                                            className="w-full h-32 bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-cyan-500 resize-none mb-4"
                                            placeholder={`e.g., URL to analyze, topic to write about, or data to process for ${activeAutomation.name}...`}
                                        />
                                        <button 
                                            onClick={handleSimulate}
                                            disabled={loading || !simulationInput.trim()}
                                            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-50 transition shadow-lg flex justify-center items-center gap-2"
                                        >
                                            {loading ? <Loader /> : (
                                                <>
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    <span>Simulate Run</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col h-full">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-sm font-bold text-green-400 uppercase flex items-center gap-2">
                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                            Run Successful
                                        </h4>
                                        <div className="flex gap-2">
                                            <button onClick={() => setSimulationResult(null)} className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded transition">New Run</button>
                                            <button onClick={() => onShare({ contentText: simulationResult, contentType: 'text' })} className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded transition">Share Output</button>
                                        </div>
                                    </div>
                                    <div className="flex-grow overflow-y-auto custom-scrollbar bg-black/30 rounded-xl p-4 border border-slate-800">
                                        <div className="prose prose-invert prose-sm max-w-none">
                                            <div dangerouslySetInnerHTML={{ __html: md.render(simulationResult) }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AutomationHub;
