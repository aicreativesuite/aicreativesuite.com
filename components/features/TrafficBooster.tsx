
import React, { useState, useEffect } from 'react';
import { performGroundedSearch, generateOutreachPitch, generateText } from '../../services/geminiService';
import Loader from '../common/Loader';
import { GroundingChunk } from '@google/genai';
import { PITCH_SERVICES } from '../../constants';
import { TRAFFIC_TOOLS, TrafficTool, ToolType } from './trafficConstants';
import { Remarkable } from 'remarkable';

const md = new Remarkable({ html: true });

interface PitchModalProps {
    show: boolean;
    businessName: string;
    format: 'email' | 'sms' | 'phone script';
    onClose: () => void;
}

const PitchGeneratorModal: React.FC<PitchModalProps> = ({ show, businessName, format, onClose }) => {
    const [service, setService] = useState(PITCH_SERVICES[0]);
    const [pitch, setPitch] = useState('');
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
        if (show) {
            setPitch('');
            setService(PITCH_SERVICES[0]);
            setIsEditing(false);
        }
    }, [show]);

    const displayToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(''), 3000);
    };

    const handleGeneratePitch = async () => {
        setLoading(true);
        setPitch('');
        setIsEditing(false);
        try {
            const response = await generateOutreachPitch(businessName, service, format);
            setPitch(response.text);
        } catch (err) {
            setPitch('Sorry, I was unable to generate a pitch. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        const blob = new Blob([pitch], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${businessName.replace(/[^a-z0-9]/gi, '_')}_pitch.txt`;
        a.click();
        URL.revokeObjectURL(url);
        displayToast('Downloaded!');
    };

    const handleSend = () => {
        let url = '';
        if (format === 'email') {
            url = `mailto:?subject=Collaboration with ${businessName}&body=${encodeURIComponent(pitch)}`;
        } else if (format === 'sms') {
            url = `sms:?body=${encodeURIComponent(pitch)}`;
        } else {
            navigator.clipboard.writeText(pitch);
            displayToast('Script copied to clipboard for your call!');
            return;
        }
        window.open(url, '_blank');
    };
    
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 modal-overlay" onClick={onClose}>
             {toastMessage && (
                <div className="absolute top-5 bg-green-500 text-white py-2 px-4 rounded-lg animate-pulse z-50">
                    {toastMessage}
                </div>
            )}
            <div className="bg-slate-800 rounded-lg p-8 max-w-2xl w-full mx-4 border border-slate-700 shadow-2xl modal-content" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">Generate {format === 'phone script' ? 'Phone Script' : format === 'sms' ? 'SMS' : 'Email'}</h2>
                        <p className="text-slate-400">to <span className="font-semibold text-cyan-400">{businessName}</span></p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                        <div>
                            <label htmlFor="service" className="block text-sm font-medium text-slate-300 mb-2">Service to Offer</label>
                            <select id="service" value={service} onChange={e => setService(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white">
                                {PITCH_SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <button onClick={handleGeneratePitch} disabled={loading} className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 disabled:bg-slate-600 transition-colors">
                            {loading ? 'Generating...' : 'Generate Pitch'}
                        </button>
                    </div>
                    
                    {(loading || pitch) && (
                        <div className="bg-slate-900/50 rounded-lg border border-slate-700 min-h-[250px] relative flex flex-col">
                            {loading ? (
                                <div className="absolute inset-0 flex items-center justify-center"><Loader /></div>
                            ) : (
                                <>
                                    {/* Toolbar */}
                                    <div className="flex items-center justify-between p-2 border-b border-slate-700 bg-slate-800/50 rounded-t-lg">
                                        <div className="flex space-x-1">
                                            {isEditing ? (
                                                <button onClick={() => setIsEditing(false)} className="flex items-center space-x-1 text-xs bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded transition" title="Save">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                                    <span>Save</span>
                                                </button>
                                            ) : (
                                                <button onClick={() => setIsEditing(true)} className="flex items-center space-x-1 text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded transition" title="Edit">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                                                    <span>Edit</span>
                                                </button>
                                            )}
                                            <button onClick={handleDownload} className="flex items-center space-x-1 text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded transition" title="Download">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                                <span>Download</span>
                                            </button>
                                        </div>
                                        <div className="flex space-x-1">
                                            <button onClick={() => { navigator.clipboard.writeText(pitch); displayToast('Copied!'); }} className="p-1.5 text-slate-400 hover:text-white transition" title="Copy">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" /></svg>
                                            </button>
                                        </div>
                                    </div>

                                    <textarea 
                                        value={pitch} 
                                        onChange={(e) => setPitch(e.target.value)}
                                        readOnly={!isEditing}
                                        className={`flex-grow w-full bg-transparent border-none text-slate-300 text-sm resize-none p-4 focus:ring-0 ${isEditing ? 'bg-slate-800/50' : ''}`} 
                                    />
                                    
                                    {/* Action Footer */}
                                    <div className="p-4 border-t border-slate-700 flex justify-end">
                                        <button 
                                            onClick={handleSend} 
                                            className={`flex items-center space-x-2 font-bold py-2 px-6 rounded-lg transition-colors ${format === 'email' ? 'bg-blue-600 hover:bg-blue-700' : format === 'sms' ? 'bg-green-600 hover:bg-green-700' : 'bg-cyan-600 hover:bg-cyan-700'} text-white`}
                                        >
                                            <span>{format === 'email' ? 'Send Email' : format === 'sms' ? 'Send SMS' : 'Copy for Call'}</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---

const TrafficBooster: React.FC<{onShare: (options: any) => void;}> = () => {
    const [activeTab, setActiveTab] = useState<'live' | 'directory'>('live');
    
    // Live Search State
    const [query, setQuery] = useState('');
    const [manualLocationQuery, setManualLocationQuery] = useState('');
    const [useGeo, setUseGeo] = useState(true);
    const [geoLocation, setGeoLocation] = useState<{ latitude: number, longitude: number } | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [results, setResults] = useState<GroundingChunk[]>([]);
    const [summary, setSummary] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pitchModalState, setPitchModalState] = useState<{ show: boolean; businessName: string; format: 'email' | 'sms' | 'phone script'; } | null>(null);

    // Directory State (Super Automation Hub Layout)
    const [searchTool, setSearchTool] = useState('');
    const [toolCategory, setToolCategory] = useState<string>('All');
    const [selectedTool, setSelectedTool] = useState<TrafficTool | null>(null);
    const [toolContext, setToolContext] = useState('');
    const [toolResult, setToolResult] = useState<string | null>(null);
    const [toolLoading, setToolLoading] = useState(false);

    const handleUseCurrentLocation = () => {
        setUseGeo(true);
        setManualLocationQuery('');
        setLocationError(null);
        if (!geoLocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => setGeoLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
                () => setLocationError('Could not get location. Please enable location services.')
            );
        }
    };

    useEffect(() => {
        handleUseCurrentLocation(); 
    }, []);

    // Live Search Handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query) { setError('Please enter a business type.'); return; }
        if (useGeo && !geoLocation) { setError('Current location is not available. Please enable location services or enter a location manually.'); return; }
        if (!useGeo && !manualLocationQuery) { setError('Please enter a location or use your current location.'); return; }

        setLoading(true);
        setError(null);
        setResults([]);
        setSummary(null);

        try {
            const fullQuery = useGeo ? `${query} near me` : `${query} in ${manualLocationQuery}`;
            const locationToUse = useGeo ? geoLocation ?? undefined : undefined;
            const response = await performGroundedSearch(fullQuery, true, locationToUse);
            const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.filter(c => c.maps) || [];
            setResults(chunks);
            setSummary(response.text);
        } catch (err) {
            setError('Failed to fetch results. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
    // Directory Tool Run Handler
    const handleToolRun = async () => {
        if (!selectedTool) return;
        setToolLoading(true);
        setToolResult(null);
        try {
             let prompt = "";
            if (selectedTool.type === 'Custom Scraper' || selectedTool.type === 'Browser Extension') {
                prompt = `You are an expert developer. Create a ${selectedTool.type === 'Browser Extension' ? 'JavaScript snippet (console runnable)' : 'Python script'} for a tool named "${selectedTool.name}" (${selectedTool.category}).
                Context/Target: ${toolContext || 'General use'}.
                
                Provide the full code and instructions on how to run it. Wrap code in markdown.`;
            } else {
                prompt = `Act as the "${selectedTool.name}" (${selectedTool.type}).
                Category: ${selectedTool.category}.
                
                The user wants to use this tool for: "${toolContext || 'General discovery'}".
                
                Simulate the output of this tool. If it's a lead scraper, generate a sample list of 5 leads with realistic data (Name, Email, Role, Company) in a Markdown table.
                If it's an analysis tool, provide a detailed dummy report based on the context.`;
            }

            const response = await generateText(prompt, 'gemini-2.5-flash');
            setToolResult(response.text);
        } catch (e) {
            setToolResult("Error generating output. Please try again.");
        } finally {
            setToolLoading(false);
        }
    };
    
    const openPitchModal = (businessName: string, format: 'email' | 'sms' | 'phone script') => {
        setPitchModalState({ show: true, businessName, format });
    };

    const filteredTools = TRAFFIC_TOOLS.filter(t => 
        (toolCategory === 'All' || t.type === toolCategory) &&
        (t.name.toLowerCase().includes(searchTool.toLowerCase()) || t.category.toLowerCase().includes(searchTool.toLowerCase()))
    );

    const getToolColor = (type: ToolType) => {
        switch(type) {
            case 'Browser Extension': return 'border-orange-500/50 bg-orange-900/10 text-orange-400';
            case 'SaaS Tool': return 'border-blue-500/50 bg-blue-900/10 text-blue-400';
            case 'AI Scraper': return 'border-purple-500/50 bg-purple-900/10 text-purple-400';
            case 'Custom Scraper': return 'border-green-500/50 bg-green-900/10 text-green-400';
            case 'Hybrid': return 'border-cyan-500/50 bg-cyan-900/10 text-cyan-400';
            default: return 'border-slate-700 bg-slate-800 text-slate-300';
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-10rem)] min-h-[600px] relative">
             <PitchGeneratorModal
                show={pitchModalState?.show ?? false}
                businessName={pitchModalState?.businessName ?? ''}
                format={pitchModalState?.format ?? 'email'}
                onClose={() => setPitchModalState(null)}
            />
            
            {/* Top Navigation for Hub */}
            <div className="flex justify-center mb-6 flex-shrink-0">
                <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex gap-1">
                    <button 
                        onClick={() => setActiveTab('live')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'live' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        Lead Finder (Live)
                    </button>
                    <button 
                        onClick={() => { setActiveTab('directory'); setSelectedTool(null); setToolResult(null); setToolContext(''); }}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'directory' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        Tool Directory (200+)
                    </button>
                </div>
            </div>
            
            {activeTab === 'live' ? (
                <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden">
                    {/* Sidebar Controls */}
                    <div className="w-full lg:w-80 flex-shrink-0 bg-slate-900/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-800 overflow-y-auto custom-scrollbar">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Business Type</label>
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-cyan-500"
                                    placeholder="e.g., coffee shops, plumbers"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Location</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={manualLocationQuery}
                                        onChange={(e) => { setManualLocationQuery(e.target.value); setUseGeo(false); }}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm pr-10 focus:ring-2 focus:ring-cyan-500"
                                        placeholder="City, State or Zip Code"
                                    />
                                    <button type="button" onClick={handleUseCurrentLocation} title="Use Current Location" className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-colors ${useGeo ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-slate-400 hover:bg-cyan-500 hover:text-white'}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                                    </button>
                                </div>
                                {useGeo && manualLocationQuery === '' && <p className="text-[10px] text-cyan-400 mt-1">Using current location.</p>}
                            </div>

                            <button type="submit" disabled={loading} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2">
                                {loading ? <Loader /> : 'Find Leads'}
                            </button>
                            {(error || locationError) && <p className="text-red-400 text-xs text-center bg-red-900/20 p-2 rounded">{error || locationError}</p>}
                        </form>
                    </div>

                    {/* Main Result Area */}
                    <div className="flex-grow bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col overflow-hidden relative">
                        <div className="p-4 border-b border-slate-800 bg-slate-900">
                            <h3 className="font-bold text-white text-sm uppercase tracking-wider">Search Results</h3>
                        </div>

                        <div className="flex-grow overflow-y-auto p-6 relative custom-scrollbar">
                            <div className="absolute inset-0 bg-grid-slate-800/20 pointer-events-none"></div>
                            
                            {loading && (
                                <div className="h-full flex flex-col items-center justify-center">
                                    <Loader message="Scouting locations..." />
                                </div>
                            )}

                            {!loading && results.length === 0 && !summary && (
                                <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-60">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"></path></svg>
                                    <p className="text-lg">Enter criteria to find businesses.</p>
                                </div>
                            )}

                            {!loading && (results.length > 0 || summary) && (
                                <div className="space-y-6 relative z-10 max-w-5xl mx-auto">
                                    {summary && <div className="p-4 bg-slate-800 rounded-lg text-slate-300 border border-slate-700 text-sm leading-relaxed">{summary}</div>}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {results.map((chunk, index) => (
                                            chunk.maps && (
                                                <div key={index} className="flex flex-col p-4 bg-slate-800/80 rounded-xl border border-slate-700 hover:border-cyan-500/50 transition-all shadow-lg hover:shadow-cyan-900/20 group">
                                                    <div className="flex-grow mb-4">
                                                        <h4 className="font-bold text-white text-lg leading-tight mb-2 truncate">{chunk.maps.title}</h4>
                                                        <p className="text-xs text-slate-400 line-clamp-3">{(chunk.maps.placeAnswerSources?.reviewSnippets?.[0] as any)?.snippet ?? 'No review snippet available.'}</p>
                                                    </div>
                                                    
                                                    <a href={chunk.maps.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 hover:text-cyan-300 inline-flex items-center mb-4 transition-colors">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                                                        View on Maps
                                                    </a>
                                                    
                                                    <div className="pt-3 border-t border-slate-700">
                                                        <h5 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Outreach Actions</h5>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <button onClick={() => openPitchModal(chunk.maps!.title, 'email')} className="text-xs bg-slate-700 hover:bg-slate-600 text-white font-medium py-1.5 px-2 rounded transition flex flex-col items-center gap-1 group-hover:bg-slate-600 group-hover:hover:bg-cyan-600">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                                                                <span>Email</span>
                                                            </button>
                                                            <button onClick={() => openPitchModal(chunk.maps!.title, 'sms')} className="text-xs bg-slate-700 hover:bg-slate-600 text-white font-medium py-1.5 px-2 rounded transition flex flex-col items-center gap-1 group-hover:bg-slate-600 group-hover:hover:bg-green-600">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm2.5 4a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm5 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm5 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" /></svg>
                                                                <span>SMS</span>
                                                            </button>
                                                            <button onClick={() => openPitchModal(chunk.maps!.title, 'phone script')} className="text-xs bg-slate-700 hover:bg-slate-600 text-white font-medium py-1.5 px-2 rounded transition flex flex-col items-center gap-1 group-hover:bg-slate-600 group-hover:hover:bg-purple-600">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                                                                <span>Call</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden">
                    {/* Directory Sidebar - Now with Config View */}
                    <div className="w-full lg:w-80 flex-shrink-0 bg-slate-900/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-800 flex flex-col gap-4 overflow-hidden transition-all duration-300">
                        {!selectedTool ? (
                            <>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">Tool Directory</h3>
                                    <p className="text-xs text-slate-400">200+ specialized automation tools.</p>
                                </div>

                                {/* Search */}
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        placeholder="Search tools..." 
                                        value={searchTool}
                                        onChange={(e) => setSearchTool(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 px-4 text-white text-xs focus:ring-2 focus:ring-cyan-500 pl-9"
                                    />
                                    <svg className="w-4 h-4 text-slate-500 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </div>

                                {/* Filter Tabs */}
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide flex-shrink-0">
                                    {['All', 'Browser Extension', 'SaaS Tool', 'AI Scraper', 'Custom Scraper', 'Hybrid'].map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setToolCategory(cat)}
                                            className={`px-3 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-colors ${
                                                toolCategory === cat 
                                                    ? 'bg-cyan-600 text-white' 
                                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>

                                {/* Tool List */}
                                <div className="flex-grow space-y-2 overflow-y-auto pr-1 custom-scrollbar">
                                    {filteredTools.map(tool => {
                                        const colorClass = getToolColor(tool.type);
                                        return (
                                            <div 
                                                key={tool.id}
                                                onClick={() => setSelectedTool(tool)}
                                                className="p-3 rounded-xl border border-slate-800 bg-slate-950/50 hover:border-cyan-500/50 hover:bg-slate-800 cursor-pointer transition flex flex-col gap-1"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <h4 className="text-xs font-bold text-white">{tool.name}</h4>
                                                    <span className="text-[9px] text-slate-500">#{tool.id}</span>
                                                </div>
                                                <div className="flex justify-between items-center mt-1">
                                                    <span className="text-[10px] text-slate-400 truncate max-w-[60%]">{tool.category}</span>
                                                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase ${colorClass}`}>
                                                        {tool.type.split(' ')[0]}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {filteredTools.length === 0 && (
                                        <div className="text-center py-8 text-slate-500 text-xs">
                                            No tools match your search.
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col h-full animate-fadeIn">
                                <button 
                                    onClick={() => setSelectedTool(null)}
                                    className="flex items-center space-x-2 text-xs text-slate-400 hover:text-white mb-4 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                    <span>Back to Directory</span>
                                </button>

                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-white mb-1 leading-tight">{selectedTool.name}</h3>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        <span className={`text-[9px] px-2 py-0.5 rounded border uppercase ${getToolColor(selectedTool.type)}`}>{selectedTool.type}</span>
                                        <span className="text-[9px] px-2 py-0.5 rounded border border-slate-700 text-slate-400 uppercase">{selectedTool.category}</span>
                                    </div>
                                    <p className="text-xs text-slate-400">{selectedTool.description || `Specialized tool for ${selectedTool.category.toLowerCase()}.`}</p>
                                </div>

                                <div className="flex-grow flex flex-col gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">Target / Context</label>
                                        <textarea
                                            value={toolContext}
                                            onChange={(e) => setToolContext(e.target.value)}
                                            className="w-full h-40 bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-xs focus:ring-2 focus:ring-cyan-500 resize-none"
                                            placeholder="e.g., Software Engineers in San Francisco, or 'Coffee Shops'"
                                        />
                                    </div>
                                    <button 
                                        onClick={handleToolRun}
                                        disabled={toolLoading}
                                        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-50 transition shadow-lg flex justify-center items-center gap-2 mt-auto"
                                    >
                                        {toolLoading ? <Loader /> : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                <span>{selectedTool.type === 'Custom Scraper' || selectedTool.type === 'Browser Extension' ? 'Generate Script' : 'Run Simulation'}</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Main Workspace Area */}
                    <div className="flex-grow bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col overflow-hidden relative">
                        <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                            <h3 className="font-bold text-white text-sm uppercase tracking-wider">
                                {selectedTool ? `${selectedTool.name} Output` : 'Tool Workspace'}
                            </h3>
                            {selectedTool && (
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => openPitchModal("Target Business", 'email')}
                                        className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold py-1.5 px-3 rounded transition flex items-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                        Draft Pitch
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex-grow p-8 overflow-y-auto custom-scrollbar relative">
                            <div className="absolute inset-0 bg-grid-slate-800/20 pointer-events-none"></div>
                            
                            {toolLoading ? (
                                <div className="h-full flex flex-col items-center justify-center text-cyan-500">
                                    <Loader message={`Running ${selectedTool?.name}...`} />
                                </div>
                            ) : toolResult ? (
                                <div className="prose prose-invert prose-sm max-w-none relative z-10 animate-fadeIn">
                                    <div dangerouslySetInnerHTML={{ __html: md.render(toolResult) }} />
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-60">
                                    <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-slate-700">
                                        <svg className="w-10 h-10 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-300 mb-2">Select a Tool</h3>
                                    <p className="text-sm max-w-xs text-center">Choose from 200+ specialized automation tools in the directory sidebar to begin configuration.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrafficBooster;
