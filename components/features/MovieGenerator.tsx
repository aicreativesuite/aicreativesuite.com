
import React, { useState, useEffect, useRef } from 'react';
import { generateImage, generateDialogueSnippet, generateCharacterSituations, generateSpeech, generateStoryOutline, generateMusicCues } from '../../services/geminiService';
import { MOVIE_GENRES, VISUAL_STYLES, DIRECTOR_STYLES_DESCRIPTIVE } from '../../constants';
import Loader from '../common/Loader';
import { pcmToWav, decode } from '../../utils';
import QRCode from 'qrcode';

// --- Types ---
type Scene = { id: number; title: string; description: string; backgroundImage?: string; };
type Music = { id: number; title: string; description: string; };
type ScriptPart = { id: number; character: string; action: string; dialogue: string; audioUrl?: string; audioType?: 'ai' | 'user'; };
type StoryPoint = { id: number; title: string; description: string; };
type CharacterSituation = { id: number; characterName: string; description: string; };
type Tab = 'concept' | 'story' | 'script' | 'visuals' | 'sound';

interface MovieGeneratorProps { onShare: (options: any) => void; }

// Add helper
const addQrCodeToImage = (imageBase64: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const uniqueId = Date.now().toString(36) + Math.random().toString(36).substring(2);
        const verificationUrl = `https://aicreativesuite.dev/verify?id=${uniqueId}`;
        const baseImage = new Image();
        baseImage.crossOrigin = 'anonymous';
        baseImage.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = baseImage.width;
            canvas.height = baseImage.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject('Could not get canvas context');
            ctx.drawImage(baseImage, 0, 0);
            QRCode.toDataURL(verificationUrl, { errorCorrectionLevel: 'H', margin: 1, width: 128 }, (err, qrUrl) => {
                if (err) return reject(err);
                const qrImage = new Image();
                qrImage.crossOrigin = 'anonymous';
                qrImage.onload = () => {
                    const qrSize = Math.max(64, Math.floor(baseImage.width * 0.1));
                    const padding = qrSize * 0.1;
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                    ctx.fillRect(canvas.width - qrSize - padding - (padding/2), canvas.height - qrSize - padding - (padding/2), qrSize + padding, qrSize + padding);
                    ctx.drawImage(qrImage, canvas.width - qrSize - padding, canvas.height - qrSize - padding, qrSize, qrSize);
                    resolve(canvas.toDataURL('image/jpeg'));
                };
                qrImage.onerror = reject;
                qrImage.src = qrUrl;
            });
        };
        baseImage.onerror = reject;
        baseImage.src = `data:image/jpeg;base64,${imageBase64}`;
    });
};

// --- Generic Modal ---
interface FieldDef { name: string; label?: string; type?: 'text' | 'textarea'; placeholder?: string; list?: string; }
interface GenericEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    initialData: any;
    title: string;
    fields: FieldDef[];
    datalists?: Record<string, string[]>;
}

const GenericEditorModal: React.FC<GenericEditorModalProps> = ({ isOpen, onClose, onSave, initialData, title, fields, datalists }) => {
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData || fields.reduce((acc, f) => ({ ...acc, [f.name]: '' }), {}));
        }
    }, [initialData, isOpen, fields]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        onSave({ ...(initialData || {}), id: initialData?.id || Date.now(), ...formData });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-lg p-8 max-w-lg w-full mx-4 border border-slate-700 shadow-2xl">
                <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
                <div className="space-y-4">
                    {fields.map((field) => (
                        <div key={field.name}>
                            {field.type === 'textarea' ? (
                                <textarea
                                    name={field.name}
                                    rows={5}
                                    value={formData[field.name] || ''}
                                    onChange={handleChange}
                                    placeholder={field.placeholder}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white"
                                />
                            ) : (
                                <>
                                    <input
                                        type="text"
                                        name={field.name}
                                        value={formData[field.name] || ''}
                                        onChange={handleChange}
                                        placeholder={field.placeholder}
                                        className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white"
                                        list={field.list}
                                    />
                                    {field.list && datalists?.[field.list] && (
                                        <datalist id={field.list}>
                                            {datalists[field.list].map(opt => <option key={opt} value={opt} />)}
                                        </datalist>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                    <button onClick={onClose} className="py-2 px-4 rounded-lg text-slate-300 hover:bg-slate-700 transition">Cancel</button>
                    <button onClick={handleSave} className="py-2 px-4 rounded-lg bg-cyan-500 text-white font-bold hover:bg-cyan-600 transition">Save</button>
                </div>
            </div>
        </div>
    );
};

const TabButton: React.FC<{ isActive: boolean; onClick: () => void; children: React.ReactNode; disabled?: boolean; }> = ({ isActive, onClick, children, disabled }) => (
    <button onClick={onClick} disabled={disabled} className={`flex items-center justify-center flex-1 p-3 text-sm font-semibold transition-colors duration-200 border-b-2 ${isActive ? 'text-cyan-400 border-cyan-400' : 'text-slate-400 border-transparent hover:text-white hover:border-slate-500'} disabled:text-slate-600 disabled:border-transparent disabled:cursor-not-allowed`}>
        {children}
    </button>
);

const MovieGenerator: React.FC<MovieGeneratorProps> = ({ onShare }) => {
    // State
    const [title, setTitle] = useState('');
    const [logline, setLogline] = useState('');
    const [genre, setGenre] = useState(MOVIE_GENRES[0]);
    const [visualStyle, setVisualStyle] = useState('');
    const [directorStyle, setDirectorStyle] = useState('');
    const [aspectRatio, setAspectRatio] = useState('3:4');
    const [addQr, setAddQr] = useState(true);
    const [poster, setPoster] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [projectSaveStatus, setProjectSaveStatus] = useState('');
    const [activeTab, setActiveTab] = useState<Tab>('concept');

    const [scenes, setScenes] = useState<Scene[]>([]);
    const [musicTracks, setMusicTracks] = useState<Music[]>([]);
    const [scriptParts, setScriptParts] = useState<ScriptPart[]>([]);
    const [storyPoints, setStoryPoints] = useState<StoryPoint[]>([]);
    const [characterSituations, setCharacterSituations] = useState<CharacterSituation[]>([]);

    // Modal States
    const [activeModal, setActiveModal] = useState<'scene'|'music'|'script'|'story'|'char'|null>(null);
    const [editingItem, setEditingItem] = useState<any>(null);

    const [generatingBackgroundForSceneId, setGeneratingBackgroundForSceneId] = useState<number | null>(null);
    const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
    const [isGeneratingSnippet, setIsGeneratingSnippet] = useState(false);
    const [isGeneratingStory, setIsGeneratingStory] = useState(false);
    const [isGeneratingCharacters, setIsGeneratingCharacters] = useState(false);
    
    // Voice Dubbing
    const [isRecording, setIsRecording] = useState(false);
    const [recordingForPartId, setRecordingForPartId] = useState<number | null>(null);
    const [generatingVoiceForPartId, setGeneratingVoiceForPartId] = useState<number | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !logline) return setError('Please enter a title and logline.');
        setLoading(true);
        setError(null);
        try {
            const posterPrompt = `Cinematic movie poster for ${genre} film "${title}". Logline: "${logline}". Style: ${visualStyle || 'photorealistic'}. ${directorStyle ? `Director: ${directorStyle}.` : ''} Epic visual.`;
            const imageBytes = await generateImage(posterPrompt, aspectRatio);
            setPoster(addQr ? await addQrCodeToImage(imageBytes) : `data:image/jpeg;base64,${imageBytes}`);
        } catch (err) { setError('Failed to generate concept.'); console.error(err); } finally { setLoading(false); }
    };

    const resetAll = () => {
        setTitle(''); setLogline(''); setGenre(MOVIE_GENRES[0]); setVisualStyle(''); setDirectorStyle(''); setAspectRatio('3:4');
        setPoster(null); setLoading(false); setError(null); setScenes([]); setMusicTracks([]); setScriptParts([]);
        setStoryPoints([]); setCharacterSituations([]); setProjectSaveStatus(''); setActiveTab('concept');
    };

    const handleSaveProject = () => {
        const fullConcept = { details: { title, logline, genre, visualStyle, directorStyle, aspectRatio }, poster, story: storyPoints, characters: characterSituations, script: scriptParts.map(({ audioUrl, ...rest }) => rest), scenes, music: musicTracks };
        const blob = new Blob([JSON.stringify(fullConcept, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'movie'}.json`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        setProjectSaveStatus('Saved!'); setTimeout(() => setProjectSaveStatus(''), 3000);
    };

    // Generic Handlers
    const handleSaveItem = (setter: React.Dispatch<React.SetStateAction<any[]>>, item: any) => {
        setter(prev => prev.some(i => i.id === item.id) ? prev.map(i => i.id === item.id ? item : i) : [...prev, item]);
    };
    const handleDeleteItem = (setter: React.Dispatch<React.SetStateAction<any[]>>, id: number) => setter(prev => prev.filter(i => i.id !== id));

    const handleGenerateList = async (type: 'story' | 'char' | 'script' | 'music') => {
        if (!title || (!logline && type !== 'music') || (!genre && type === 'music')) return setError("Please provide project details first.");
        
        const setFlag = (v: boolean) => {
            if(type==='story') setIsGeneratingStory(v);
            else if(type==='char') setIsGeneratingCharacters(v);
            else if(type==='script') setIsGeneratingSnippet(v);
            else setIsGeneratingMusic(v);
        }
        setFlag(true); setError(null);

        try {
            let response;
            if(type === 'story') response = await generateStoryOutline(title, logline, genre);
            else if(type === 'char') response = await generateCharacterSituations(title, logline, genre);
            else if(type === 'script') response = await generateDialogueSnippet(title, logline, genre);
            else response = await generateMusicCues(title, genre, scenes.map(({title, description}) => ({title, description})));

            const newItems = JSON.parse(response.text);
            if (Array.isArray(newItems)) {
                const mapFn = (item: any) => ({ id: Date.now() + Math.random(), ...item });
                const mapped = newItems.map(mapFn);
                if(type==='story') setStoryPoints(p => [...p, ...mapped]);
                else if(type==='char') setCharacterSituations(p => [...p, ...mapped]);
                else if(type==='script') setScriptParts(p => [...p, ...mapped]);
                else setMusicTracks(p => [...p, ...mapped]);
            }
        } catch (err) { console.error(err); setError(`Failed to generate ${type}.`); } finally { setFlag(false); }
    };

    const handleGenerateBackground = async (sceneId: number) => {
        const scene = scenes.find(s => s.id === sceneId);
        if (!scene) return;
        setGeneratingBackgroundForSceneId(sceneId);
        try {
            const prompt = `Cinematic background shot for "${scene.title}": "${scene.description}". Wide shot, no characters. Style: ${visualStyle}.`;
            const imageBytes = await generateImage(prompt, '16:9');
            setScenes(s => s.map(sc => sc.id === sceneId ? { ...sc, backgroundImage: `data:image/jpeg;base64,${imageBytes}` } : sc));
        } catch (err) { console.error(err); } finally { setGeneratingBackgroundForSceneId(null); }
    };

    const handleGenerateVoice = async (partId: number) => {
        const part = scriptParts.find(p => p.id === partId);
        if (!part?.dialogue) return;
        setGeneratingVoiceForPartId(partId);
        try {
            const base64Audio = await generateSpeech(part.dialogue);
            if (base64Audio) {
                if (part.audioUrl) URL.revokeObjectURL(part.audioUrl);
                setScriptParts(prev => prev.map(p => p.id === partId ? { ...p, audioUrl: URL.createObjectURL(pcmToWav(decode(base64Audio), 24000, 1, 16)), audioType: 'ai' } : p));
            }
        } catch (err) { console.error(err); } finally { setGeneratingVoiceForPartId(null); }
    };

    const handleStartRecording = async (partId: number) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];
            mediaRecorderRef.current.ondataavailable = e => audioChunksRef.current.push(e.data);
            mediaRecorderRef.current.onstop = () => {
                const part = scriptParts.find(p => p.id === recordingForPartId);
                if(part?.audioUrl) URL.revokeObjectURL(part.audioUrl);
                setScriptParts(prev => prev.map(p => p.id === recordingForPartId ? { ...p, audioUrl: URL.createObjectURL(new Blob(audioChunksRef.current, { type: 'audio/webm' })), audioType: 'user' } : p));
                stream.getTracks().forEach(t => t.stop());
            };
            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingForPartId(partId);
        } catch (err) { setError("Mic access denied."); }
    };

    const handleStopRecording = () => { if (mediaRecorderRef.current) { mediaRecorderRef.current.stop(); setIsRecording(false); setRecordingForPartId(null); } };

    const renderTabContent = () => {
        switch(activeTab) {
            case 'concept': return (
                <form onSubmit={handleSubmit} className="space-y-4 bg-slate-900/50 p-4 rounded-lg">
                    <fieldset disabled={loading} className="space-y-4">
                        <input value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-700 rounded p-3 text-white border border-slate-600" placeholder="Movie Title" />
                        <textarea value={logline} onChange={e => setLogline(e.target.value)} className="w-full bg-slate-700 rounded p-3 text-white border border-slate-600" placeholder="Logline" rows={4} />
                        <div className="grid grid-cols-2 gap-4">
                            <select value={genre} onChange={e => setGenre(e.target.value)} className="bg-slate-700 rounded p-3 text-white border border-slate-600">{MOVIE_GENRES.map(g => <option key={g} value={g}>{g}</option>)}</select>
                            <select value={aspectRatio} onChange={e => setAspectRatio(e.target.value)} className="bg-slate-700 rounded p-3 text-white border border-slate-600"><option value="2:3">2:3</option><option value="3:4">3:4</option></select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <select value={visualStyle} onChange={e => setVisualStyle(e.target.value)} className="bg-slate-700 rounded p-3 text-white border border-slate-600"><option value="">Visual Style</option>{VISUAL_STYLES.map(s => <option key={s} value={s}>{s}</option>)}</select>
                            <select value={directorStyle} onChange={e => setDirectorStyle(e.target.value)} className="bg-slate-700 rounded p-3 text-white border border-slate-600"><option value="">Director Style</option>{DIRECTOR_STYLES_DESCRIPTIVE.map(d => <option key={d.name} value={d.value}>{d.name}</option>)}</select>
                        </div>
                        <label className="flex items-center text-sm text-slate-300"><input type="checkbox" checked={addQr} onChange={e => setAddQr(e.target.checked)} className="mr-2" />Add verification QR code</label>
                        <button type="submit" className="w-full bg-cyan-500 text-white font-bold py-3 rounded hover:bg-cyan-600 disabled:opacity-50">{loading ? 'Generating...' : (poster ? 'Update Concept' : 'Generate Concept')}</button>
                        {error && <p className="text-red-400 text-sm">{error}</p>}
                    </fieldset>
                </form>
            );
            case 'story': return (
                <div className="space-y-6">
                    <Section title="Story / Plot" onAdd={() => { setEditingItem(null); setActiveModal('story'); }} onGen={() => handleGenerateList('story')} isGen={isGeneratingStory} items={storyPoints} renderItem={p => <><p className="font-bold text-slate-200">{p.title}</p><p className="text-slate-400 text-sm mt-1">{p.description}</p></>} onEdit={i => { setEditingItem(i); setActiveModal('story'); }} onDelete={id => handleDeleteItem(setStoryPoints, id)} />
                    <Section title="Characters" onAdd={() => { setEditingItem(null); setActiveModal('char'); }} onGen={() => handleGenerateList('char')} isGen={isGeneratingCharacters} items={characterSituations} renderItem={c => <><p className="font-bold text-slate-200">{c.characterName}</p><p className="text-slate-400 text-sm mt-1">{c.description}</p></>} onEdit={i => { setEditingItem(i); setActiveModal('char'); }} onDelete={id => handleDeleteItem(setCharacterSituations, id)} />
                </div>
            );
            case 'script': return (
                <div className="space-y-4 bg-slate-900/50 p-4 rounded-lg">
                    <div className="flex justify-between items-center"><h3 className="text-lg font-bold">Script</h3><div className="flex gap-2"><button onClick={() => handleGenerateList('script')} disabled={isGeneratingSnippet} className="bg-purple-600 text-white text-xs py-1 px-3 rounded-full">{isGeneratingSnippet ? '...' : 'Snippet'}</button><button onClick={() => { setEditingItem(null); setActiveModal('script'); }} className="bg-slate-700 text-sm text-cyan-400 font-semibold py-2 px-3 rounded">+ Add</button></div></div>
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                        {scriptParts.map(part => (
                            <div key={part.id} className="bg-slate-800 p-3 rounded-lg">
                                <div className="flex justify-between"><div className="text-sm"><p className="font-bold text-slate-200">{part.character}</p><p className="text-slate-300">{part.dialogue}</p></div><div className="flex gap-2"><button onClick={() => { setEditingItem(part); setActiveModal('script'); }} className="text-cyan-400">Edit</button><button onClick={() => handleDeleteItem(setScriptParts, part.id)} className="text-red-500">Del</button></div></div>
                                <div className="mt-2 pt-2 border-t border-slate-700 flex gap-2">
                                    {part.audioUrl && <audio src={part.audioUrl} controls className="h-8 w-32" />}
                                    <button onClick={() => handleGenerateVoice(part.id)} disabled={!!generatingVoiceForPartId} className="text-xs bg-purple-600 text-white px-2 rounded">{generatingVoiceForPartId === part.id ? '...' : 'AI Voice'}</button>
                                    <button onClick={() => isRecording && recordingForPartId === part.id ? handleStopRecording() : handleStartRecording(part.id)} className={`text-xs px-2 rounded text-white ${isRecording && recordingForPartId === part.id ? 'bg-red-600' : 'bg-slate-700'}`}>{isRecording && recordingForPartId === part.id ? 'Stop' : 'Record'}</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
            case 'visuals': return <Section title="Scene List" onAdd={() => { setEditingItem(null); setActiveModal('scene'); }} items={scenes} renderItem={s => <div><p className="font-bold text-slate-200">{s.title}</p><p className="text-slate-400 text-sm">{s.description}</p><div className="mt-2 border-t border-slate-700 pt-2"><div className="flex justify-between mb-2"><span className="text-xs font-bold uppercase text-slate-500">Storyboard</span><button onClick={() => handleGenerateBackground(s.id)} disabled={generatingBackgroundForSceneId === s.id} className="text-xs bg-slate-700 text-cyan-400 px-2 py-1 rounded">{generatingBackgroundForSceneId === s.id ? '...' : 'Generate'}</button></div>{s.backgroundImage && <img src={s.backgroundImage} className="w-full rounded" alt="bg" />}</div></div>} onEdit={i => { setEditingItem(i); setActiveModal('scene'); }} onDelete={id => handleDeleteItem(setScenes, id)} />;
            case 'sound': return <Section title="Music Cues" onAdd={() => { setEditingItem(null); setActiveModal('music'); }} onGen={() => handleGenerateList('music')} isGen={isGeneratingMusic} items={musicTracks} renderItem={m => <><p className="font-bold text-slate-200">{m.title}</p><p className="text-slate-400 text-sm">{m.description}</p></>} onEdit={i => { setEditingItem(i); setActiveModal('music'); }} onDelete={id => handleDeleteItem(setMusicTracks, id)} />;
            default: return null;
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-8">
            <GenericEditorModal isOpen={activeModal === 'scene'} onClose={() => setActiveModal(null)} onSave={d => handleSaveItem(setScenes, d)} initialData={editingItem} title={editingItem ? "Edit Scene" : "New Scene"} fields={[{ name: 'title', placeholder: 'Scene Title' }, { name: 'description', type: 'textarea', placeholder: 'Description' }]} />
            <GenericEditorModal isOpen={activeModal === 'music'} onClose={() => setActiveModal(null)} onSave={d => handleSaveItem(setMusicTracks, d)} initialData={editingItem} title={editingItem ? "Edit Music" : "New Track"} fields={[{ name: 'title', placeholder: 'Title' }, { name: 'description', type: 'textarea', placeholder: 'Description' }]} />
            <GenericEditorModal isOpen={activeModal === 'script'} onClose={() => setActiveModal(null)} onSave={d => handleSaveItem(setScriptParts, d)} initialData={editingItem} title={editingItem ? "Edit Part" : "New Part"} fields={[{ name: 'character', placeholder: 'Character', list: 'chars' }, { name: 'action', placeholder: 'Action' }, { name: 'dialogue', type: 'textarea', placeholder: 'Dialogue' }]} datalists={{ chars: characterSituations.map(c => c.characterName) }} />
            <GenericEditorModal isOpen={activeModal === 'story'} onClose={() => setActiveModal(null)} onSave={d => handleSaveItem(setStoryPoints, d)} initialData={editingItem} title={editingItem ? "Edit Point" : "New Point"} fields={[{ name: 'title', placeholder: 'Title' }, { name: 'description', type: 'textarea', placeholder: 'Description' }]} />
            <GenericEditorModal isOpen={activeModal === 'char'} onClose={() => setActiveModal(null)} onSave={d => handleSaveItem(setCharacterSituations, d)} initialData={editingItem} title={editingItem ? "Edit Character" : "New Character"} fields={[{ name: 'characterName', placeholder: 'Name' }, { name: 'description', type: 'textarea', placeholder: 'Description' }]} />

            <div className="w-full md:w-1/3 space-y-4">
                <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 space-y-2">
                    <h3 className="text-xl font-bold">Pre-production</h3>
                    <div className="flex gap-2"><button onClick={handleSaveProject} className="flex-1 text-sm bg-green-700 text-white py-2 rounded">Save</button><button onClick={() => window.confirm("Delete?") && resetAll()} className="flex-1 text-sm bg-red-800 text-white py-2 rounded">Reset</button></div>
                    {projectSaveStatus && <span className="text-xs text-green-400 block text-center">{projectSaveStatus}</span>}
                </div>
                <div className="flex bg-slate-800 rounded-t-lg border-x border-t border-slate-700 overflow-hidden"><TabButton isActive={activeTab === 'concept'} onClick={() => setActiveTab('concept')}>Concept</TabButton><TabButton isActive={activeTab === 'story'} onClick={() => setActiveTab('story')}>Story</TabButton><TabButton isActive={activeTab === 'script'} onClick={() => setActiveTab('script')}>Script</TabButton></div>
                <div className="flex bg-slate-800 rounded-b-lg border-x border-b border-slate-700 overflow-hidden -mt-4"><TabButton isActive={activeTab === 'visuals'} onClick={() => setActiveTab('visuals')}>Visuals</TabButton><TabButton isActive={activeTab === 'sound'} onClick={() => setActiveTab('sound')}>Sound</TabButton></div>
                <div className="flex-grow">{renderTabContent()}</div>
            </div>
            <div className="w-full md:w-2/3 flex flex-col items-center justify-center bg-slate-900/50 rounded-lg border-2 border-dashed border-slate-700 min-h-[400px] p-4">
                {loading ? <Loader message="Generating..." /> : poster ? <><img src={poster} alt="Poster" className="max-h-[70vh] rounded shadow-2xl" /><button onClick={() => onShare({ contentUrl: poster, contentText: `${title}: ${logline}`, contentType: 'image' })} className="mt-4 bg-purple-600 text-white font-bold py-2 px-4 rounded hover:bg-purple-700">Share Poster</button></> : <p className="text-slate-500">Poster will appear here</p>}
            </div>
        </div>
    );
};

const Section = ({ title, onAdd, onGen, isGen, items, renderItem, onEdit, onDelete }: any) => (
    <div className="space-y-4 bg-slate-900/50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">{title}</h3>
            <div className="flex gap-2">{onGen && <button onClick={onGen} disabled={isGen} className="bg-purple-600 text-white text-xs py-1 px-3 rounded-full">{isGen ? '...' : 'Auto'}</button>}<button onClick={onAdd} className="bg-slate-700 text-sm text-cyan-400 font-semibold py-2 px-3 rounded">+ Add</button></div>
        </div>
        <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
            {items.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No items yet.</p>}
            {items.map((item: any) => (
                <div key={item.id} className="bg-slate-800 p-3 rounded-lg flex justify-between items-start">
                    <div className="flex-grow">{renderItem(item)}</div>
                    <div className="flex gap-2 ml-2"><button onClick={() => onEdit(item)} className="text-cyan-400">Edit</button><button onClick={() => onDelete(item.id)} className="text-red-500">Del</button></div>
                </div>
            ))}
        </div>
    </div>
);

export default MovieGenerator;
