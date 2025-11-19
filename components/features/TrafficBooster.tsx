
import React, { useState, useEffect } from 'react';
import { performGroundedSearch, generateOutreachPitch } from '../../services/geminiService';
import Loader from '../common/Loader';
import { GroundingChunk } from '@google/genai';
import { PITCH_SERVICES } from '../../constants';

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
            // Phone script - perhaps copy to clipboard is best "send" action
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
                                            <button onClick={() => setPitch('')} className="flex items-center space-x-1 text-xs bg-red-900/50 hover:bg-red-700 text-red-200 px-3 py-1.5 rounded transition" title="Discard">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                                <span>Discard</span>
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
                                            {format === 'email' && <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>}
                                            {format === 'sms' && <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm2.5 4a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm5 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm5 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" /></svg>}
                                            {format === 'phone script' && <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>}
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

const TrafficBooster: React.FC<{onShare: (options: any) => void;}> = () => {
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
        handleUseCurrentLocation(); // Try to get location on component mount
    }, []);

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
    
    const openPitchModal = (businessName: string, format: 'email' | 'sms' | 'phone script') => {
        setPitchModalState({ show: true, businessName, format });
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
             <PitchGeneratorModal
                show={pitchModalState?.show ?? false}
                businessName={pitchModalState?.businessName ?? ''}
                format={pitchModalState?.format ?? 'email'}
                onClose={() => setPitchModalState(null)}
            />
            <form onSubmit={handleSubmit} className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-4">
                 <h3 className="text-xl font-bold">Find & Pitch Local Businesses</h3>
                 <p className="text-sm text-slate-400">Find businesses for market research or generate AI-powered outreach pitches to offer your services.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white"
                        placeholder="Business type (e.g., coffee shops)"
                    />
                    <div className="relative">
                        <input
                            type="text"
                            value={manualLocationQuery}
                            onChange={(e) => { setManualLocationQuery(e.target.value); setUseGeo(false); }}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white pr-12"
                            placeholder="City, State or Zip Code"
                        />
                        <button type="button" onClick={handleUseCurrentLocation} title="Use Current Location" className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${useGeo ? 'bg-cyan-500 text-white' : 'bg-slate-600 text-slate-300 hover:bg-cyan-500 hover:text-white'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                        </button>
                    </div>
                </div>
                 <button type="submit" disabled={loading} className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 disabled:bg-slate-600 transition-colors">
                    {loading ? 'Searching...' : 'Find Businesses'}
                </button>
                 {(error || locationError) && <p className="text-red-400 text-sm text-center">{error || locationError}</p>}
                 {useGeo && manualLocationQuery === '' && <p className="text-xs text-center text-slate-400">Using current location. To search elsewhere, type in the location field.</p>}
            </form>
            
            <div className="min-h-[400px]">
                {loading && <Loader message="Searching Google Maps..." />}
                {!loading && (results.length > 0 || summary) && (
                    <div className="space-y-6">
                        {summary && <div className="p-4 bg-slate-800/50 rounded-lg text-slate-300 border border-slate-700 prose prose-sm prose-invert max-w-none">{summary}</div>}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {results.map((chunk, index) => (
                                chunk.maps && (
                                    <div key={index} className="flex flex-col p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-500 transition-colors">
                                        <div className="flex-grow">
                                            <h4 className="font-bold text-white truncate">{chunk.maps.title}</h4>
                                            <p className="text-sm text-slate-400 mt-1 line-clamp-2">{(chunk.maps.placeAnswerSources?.reviewSnippets?.[0] as any)?.snippet ?? 'No review snippet available.'}</p>
                                        </div>
                                        <a href={chunk.maps.uri} target="_blank" rel="noopener noreferrer" className="text-sm text-cyan-400 hover:underline mt-3 inline-flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                                            View on Google Maps
                                        </a>
                                        <div className="mt-4 pt-4 border-t border-slate-700">
                                            <h5 className="text-xs font-semibold text-slate-400 mb-2">Generate Pitch</h5>
                                            <div className="flex justify-around gap-2">
                                                <button onClick={() => openPitchModal(chunk.maps!.title, 'email')} className="text-xs bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-3 rounded-md w-full transition flex justify-center items-center space-x-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                                                    <span>Email</span>
                                                </button>
                                                <button onClick={() => openPitchModal(chunk.maps!.title, 'sms')} className="text-xs bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-3 rounded-md w-full transition flex justify-center items-center space-x-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm2.5 4a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm5 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm5 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" /></svg>
                                                    <span>SMS</span>
                                                </button>
                                                <button onClick={() => openPitchModal(chunk.maps!.title, 'phone script')} className="text-xs bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-3 rounded-md w-full transition flex justify-center items-center space-x-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                                                    <span>Script</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                )}
                {!loading && results.length === 0 && !summary && !error && !locationError && (
                    <div className="text-center text-slate-500 pt-16">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 opacity-30" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"></path></svg>
                        <p className="mt-4">Local business listings will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrafficBooster;
