
import React, { useState, useEffect, useRef } from 'react';
import { generateImage, generateDialogueSnippet, generateCharacterSituations, generateSpeech, generateStoryOutline, generateMusicCues } from '../../services/geminiService';
import { MOVIE_GENRES, ASPECT_RATIOS, VISUAL_STYLES, DIRECTOR_STYLES_DESCRIPTIVE } from '../../constants';
import Loader from '../common/Loader';
import { pcmToWav, decode } from '../../utils';
import QRCode from 'qrcode';

// --- Types ---
type Scene = {
    id: number;
    title: string;
    description: string;
    backgroundImage?: string;
};

type Music = {
    id: number;
    title: string;
    description: string;
};

type ScriptPart = {
    id: number;
    character: string;
    action: string;
    dialogue: string;
    audioUrl?: string;
    audioType?: 'ai' | 'user';
};

type StoryPoint = {
    id: number;
    title: string;
    description: string;
};

type CharacterSituation = {
    id: number;
    characterName: string;
    description: string;
};

type Tab = 'concept' | 'story' | 'script' | 'visuals' | 'sound';

interface MovieGeneratorProps {
    onShare: (options: any) => void;
}

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
                    const x = canvas.width - qrSize - padding;
                    const y = canvas.height - qrSize - padding;
                    
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                    ctx.fillRect(x - (padding / 2), y - (padding / 2), qrSize + padding, qrSize + padding);
                    ctx.drawImage(qrImage, x, y, qrSize, qrSize);
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

// --- Modals (Unchanged) ---
interface SceneEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (scene: Scene) => void;
    scene: Scene | null;
}

const SceneEditorModal: React.FC<SceneEditorModalProps> = ({ isOpen, onClose, onSave, scene }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (scene) {
            setTitle(scene.title);
            setDescription(scene.description);
        } else {
            setTitle('');
            setDescription('');
        }
    }, [scene, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave({
            ...scene,
            id: scene?.id || Date.now(),
            title,
            description,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-lg p-8 max-w-lg w-full mx-4 border border-slate-700 shadow-2xl">
                <h2 className="text-2xl font-bold text-white mb-4">{scene ? 'Edit Scene' : 'Add New Scene'}</h2>
                <div className="space-y-4">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Scene Title (e.g., Scene 1: The Escape)"
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white"
                    />
                    <textarea
                        rows={5}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Scene description..."
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white"
                    />
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                    <button onClick={onClose} className="py-2 px-4 rounded-lg text-slate-300 hover:bg-slate-700 transition">Cancel</button>
                    <button onClick={handleSave} className="py-2 px-4 rounded-lg bg-cyan-500 text-white font-bold hover:bg-cyan-600 transition">Save Scene</button>
                </div>
            </div>
        </div>
    );
};

interface MusicEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (music: Music) => void;
    music: Music | null;
}

const MusicEditorModal: React.FC<MusicEditorModalProps> = ({ isOpen, onClose, onSave, music }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (music) {
            setTitle(music.title);
            setDescription(music.description);
        } else {
            setTitle('');
            setDescription('');
        }
    }, [music, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave({
            id: music?.id || Date.now(),
            title,
            description,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-lg p-8 max-w-lg w-full mx-4 border border-slate-700 shadow-2xl">
                <h2 className="text-2xl font-bold text-white mb-4">{music ? 'Edit Background Music' : 'Add Background Music'}</h2>
                <div className="space-y-4">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Track Title (e.g., Main Theme)"
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white"
                    />
                    <textarea
                        rows={5}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Music description (e.g., A slow, melancholic piano piece...)"
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white"
                    />
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                    <button onClick={onClose} className="py-2 px-4 rounded-lg text-slate-300 hover:bg-slate-700 transition">Cancel</button>
                    <button onClick={handleSave} className="py-2 px-4 rounded-lg bg-cyan-500 text-white font-bold hover:bg-cyan-600 transition">Save Track</button>
                </div>
            </div>
        </div>
    );
};

interface ScriptEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (scriptPart: ScriptPart) => void;
    scriptPart: ScriptPart | null;
    characterNames?: string[];
}

const ScriptEditorModal: React.FC<ScriptEditorModalProps> = ({ isOpen, onClose, onSave, scriptPart, characterNames = [] }) => {
    const [character, setCharacter] = useState('');
    const [action, setAction] = useState('');
    const [dialogue, setDialogue] = useState('');

    useEffect(() => {
        if (scriptPart) {
            setCharacter(scriptPart.character);
            setAction(scriptPart.action);
            setDialogue(scriptPart.dialogue);
        } else {
            setCharacter('');
            setAction('');
            setDialogue('');
        }
    }, [scriptPart, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave({
            id: scriptPart?.id || Date.now(),
            character,
            action,
            dialogue,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-lg p-8 max-w-lg w-full mx-4 border border-slate-700 shadow-2xl">
                <h2 className="text-2xl font-bold text-white mb-4">{scriptPart ? 'Edit Script Part' : 'Add New Script Part'}</h2>
                <div className="space-y-4">
                    <input
                        type="text"
                        value={character}
                        onChange={(e) => setCharacter(e.target.value)}
                        placeholder="Character Name"
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white"
                        list="character-names-list"
                    />
                    <datalist id="character-names-list">
                        {characterNames.map((name) => <option key={name} value={name} />)}
                    </datalist>
                     <input
                        type="text"
                        value={action}
                        onChange={(e) => setAction(e.target.value)}
                        placeholder="Action/Description (e.g., whispering)"
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white"
                    />
                    <textarea
                        rows={5}
                        value={dialogue}
                        onChange={(e) => setDialogue(e.target.value)}
                        placeholder="Dialogue..."
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white"
                    />
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                    <button onClick={onClose} className="py-2 px-4 rounded-lg text-slate-300 hover:bg-slate-700 transition">Cancel</button>
                    <button onClick={handleSave} className="py-2 px-4 rounded-lg bg-cyan-500 text-white font-bold hover:bg-cyan-600 transition">Save Part</button>
                </div>
            </div>
        </div>
    );
};

interface StoryEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (storyPoint: StoryPoint) => void;
    storyPoint: StoryPoint | null;
}

const StoryEditorModal: React.FC<StoryEditorModalProps> = ({ isOpen, onClose, onSave, storyPoint }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (storyPoint) {
            setTitle(storyPoint.title);
            setDescription(storyPoint.description);
        } else {
            setTitle('');
            setDescription('');
        }
    }, [storyPoint, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave({
            id: storyPoint?.id || Date.now(),
            title,
            description,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-lg p-8 max-w-lg w-full mx-4 border border-slate-700 shadow-2xl">
                <h2 className="text-2xl font-bold text-white mb-4">{storyPoint ? 'Edit Story Point' : 'Add New Story Point'}</h2>
                <div className="space-y-4">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Story Point Title (e.g., Act 1: The Call to Adventure)"
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white"
                    />
                    <textarea
                        rows={5}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Plot details for this point..."
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white"
                    />
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                    <button onClick={onClose} className="py-2 px-4 rounded-lg text-slate-300 hover:bg-slate-700 transition">Cancel</button>
                    <button onClick={handleSave} className="py-2 px-4 rounded-lg bg-cyan-500 text-white font-bold hover:bg-cyan-600 transition">Save Point</button>
                </div>
            </div>
        </div>
    );
};

interface CharacterEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (situation: CharacterSituation) => void;
    situation: CharacterSituation | null;
}

const CharacterEditorModal: React.FC<CharacterEditorModalProps> = ({ isOpen, onClose, onSave, situation }) => {
    const [characterName, setCharacterName] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (situation) {
            setCharacterName(situation.characterName);
            setDescription(situation.description);
        } else {
            setCharacterName('');
            setDescription('');
        }
    }, [situation, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave({
            id: situation?.id || Date.now(),
            characterName,
            description,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-lg p-8 max-w-lg w-full mx-4 border border-slate-700 shadow-2xl">
                <h2 className="text-2xl font-bold text-white mb-4">{situation ? 'Edit Character Situation' : 'Add New Character Situation'}</h2>
                <div className="space-y-4">
                    <input
                        type="text"
                        value={characterName}
                        onChange={(e) => setCharacterName(e.target.value)}
                        placeholder="Character Name"
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white"
                    />
                    <textarea
                        rows={5}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Character situation, dilemma, or description..."
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white"
                    />
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                    <button onClick={onClose} className="py-2 px-4 rounded-lg text-slate-300 hover:bg-slate-700 transition">Cancel</button>
                    <button onClick={handleSave} className="py-2 px-4 rounded-lg bg-cyan-500 text-white font-bold hover:bg-cyan-600 transition">Save Situation</button>
                </div>
            </div>
        </div>
    );
};


// --- Helper Components ---
const TabButton: React.FC<{
    isActive: boolean;
    onClick: () => void;
    children: React.ReactNode;
    disabled?: boolean;
}> = ({ isActive, onClick, children, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center justify-center flex-1 p-3 text-sm font-semibold transition-colors duration-200 border-b-2 ${
            isActive
                ? 'text-cyan-400 border-cyan-400'
                : 'text-slate-400 border-transparent hover:text-white hover:border-slate-500'
        } disabled:text-slate-600 disabled:border-transparent disabled:cursor-not-allowed`}
    >
        {children}
    </button>
);


const MovieGenerator: React.FC<MovieGeneratorProps> = ({ onShare }) => {
    // Concept Details
    const [title, setTitle] = useState('');
    const [logline, setLogline] = useState('');
    const [genre, setGenre] = useState(MOVIE_GENRES[0]);
    const [visualStyle, setVisualStyle] = useState('');
    const [directorStyle, setDirectorStyle] = useState('');
    const [aspectRatio, setAspectRatio] = useState('3:4');
    const [addQr, setAddQr] = useState(true);
    
    // UI State
    const [poster, setPoster] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [projectSaveStatus, setProjectSaveStatus] = useState('');
    const [activeTab, setActiveTab] = useState<Tab>('concept');

    // Scene State
    const [scenes, setScenes] = useState<Scene[]>([]);
    const [editingScene, setEditingScene] = useState<Scene | null>(null);
    const [isSceneModalOpen, setIsSceneModalOpen] = useState(false);
    const [generatingBackgroundForSceneId, setGeneratingBackgroundForSceneId] = useState<number | null>(null);


    // Music State
    const [musicTracks, setMusicTracks] = useState<Music[]>([]);
    const [editingMusic, setEditingMusic] = useState<Music | null>(null);
    const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);
    const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
    const [musicGenError, setMusicGenError] = useState<string | null>(null);

    // Script State
    const [scriptParts, setScriptParts] = useState<ScriptPart[]>([]);
    const [editingScriptPart, setEditingScriptPart] = useState<ScriptPart | null>(null);
    const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
    const [isGeneratingSnippet, setIsGeneratingSnippet] = useState(false);
    const [snippetError, setSnippetError] = useState<string | null>(null);
    
    // Voice Dubbing State
    const [isRecording, setIsRecording] = useState(false);
    const [recordingForPartId, setRecordingForPartId] = useState<number | null>(null);
    const [generatingVoiceForPartId, setGeneratingVoiceForPartId] = useState<number | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // Story State
    const [storyPoints, setStoryPoints] = useState<StoryPoint[]>([]);
    const [editingStoryPoint, setEditingStoryPoint] = useState<StoryPoint | null>(null);
    const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
    const [isGeneratingStory, setIsGeneratingStory] = useState(false);
    const [storyGenError, setStoryGenError] = useState<string | null>(null);
    
    // Character State
    const [characterSituations, setCharacterSituations] = useState<CharacterSituation[]>([]);
    const [editingCharacterSituation, setEditingCharacterSituation] = useState<CharacterSituation | null>(null);
    const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
    const [isGeneratingCharacters, setIsGeneratingCharacters] = useState(false);
    const [characterGenError, setCharacterGenError] = useState<string | null>(null);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !logline) {
            setError('Please enter a title and logline.');
            return;
        }
        setLoading(true);
        setError(null);
        
        try {
            const posterPrompt = `A cinematic movie poster for a ${genre} film titled "${title}". The logline is: "${logline}". The visual style should be ${visualStyle || 'photorealistic'}. ${directorStyle ? `The directorial style is ${directorStyle}.` : ''} The poster should be epic and visually striking.`;
            const imageBytes = await generateImage(posterPrompt, aspectRatio);
            
            if (addQr) {
                const imageWithQr = await addQrCodeToImage(imageBytes);
                setPoster(imageWithQr);
            } else {
                setPoster(`data:image/jpeg;base64,${imageBytes}`);
            }
        } catch (err) {
            setError('Failed to generate movie concept. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const resetAll = () => {
        setTitle('');
        setLogline('');
        setGenre(MOVIE_GENRES[0]);
        setVisualStyle('');
        setDirectorStyle('');
        setAspectRatio('3:4');
        setPoster(null);
        setLoading(false);
        setError(null);
        setScenes([]);
        setMusicTracks([]);
        setScriptParts([]);
        setStoryPoints([]);
        setCharacterSituations([]);
        setProjectSaveStatus('');
        setActiveTab('concept');
    };

    const handleSaveProject = () => {
        const fullConcept = {
            details: { title, logline, genre, visualStyle, directorStyle, aspectRatio },
            poster,
            story: storyPoints,
            characters: characterSituations,
            script: scriptParts.map(({ audioUrl, ...rest }) => rest), // Don't save blob URLs
            scenes: scenes,
            music: musicTracks,
        };
        
        const blob = new Blob([JSON.stringify(fullConcept, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const sanitizedTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'movie_project';
        a.download = `${sanitizedTitle}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    
        setProjectSaveStatus('Project Saved!');
        setTimeout(() => setProjectSaveStatus(''), 3000);
    };

    const handleDeleteProject = () => {
        if (window.confirm("Are you sure you want to delete this entire movie project? This action cannot be undone.")) {
            resetAll();
        }
    };

    const handleSaveScene = (scene: Scene) => {
        if (scenes.some(s => s.id === scene.id)) {
            setScenes(scenes.map(s => s.id === scene.id ? scene : s));
        } else {
            setScenes([...scenes, scene]);
        }
    };

    const handleDeleteScene = (id: number) => {
        setScenes(scenes.filter(s => s.id !== id));
    };

    const handleGenerateBackground = async (sceneId: number) => {
        const scene = scenes.find(s => s.id === sceneId);
        if (!scene) return;
    
        setGeneratingBackgroundForSceneId(sceneId);
        try {
            const prompt = `A cinematic background shot for a movie scene, digital painting. The scene is called "${scene.title}" and is described as: "${scene.description}". This is a wide, atmospheric shot with no main characters visible. The visual style should be ${visualStyle || 'epic and detailed'}.`;
            const imageBytes = await generateImage(prompt, '16:9');
            const imageUrl = `data:image/jpeg;base64,${imageBytes}`;
    
            setScenes(currentScenes =>
                currentScenes.map(s =>
                    s.id === sceneId ? { ...s, backgroundImage: imageUrl } : s
                )
            );
        } catch (err) {
            console.error("Failed to generate scene background:", err);
        } finally {
            setGeneratingBackgroundForSceneId(null);
        }
    };
    
    const handleDeleteBackground = (sceneId: number) => {
        setScenes(currentScenes =>
            currentScenes.map(s => {
                if (s.id === sceneId) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { backgroundImage, ...rest } = s;
                    return rest;
                }
                return s;
            })
        );
    };

    const handleSaveMusic = (music: Music) => {
        if (musicTracks.some(m => m.id === music.id)) {
            setMusicTracks(musicTracks.map(m => m.id === music.id ? music : m));
        } else {
            setMusicTracks([...musicTracks, music]);
        }
    };

    const handleDeleteMusic = (id: number) => {
        setMusicTracks(musicTracks.filter(m => m.id !== id));
    };

    const handleSaveScriptPart = (part: ScriptPart) => {
        if (scriptParts.some(p => p.id === part.id)) {
            setScriptParts(scriptParts.map(p => p.id === part.id ? part : p));
        } else {
            setScriptParts([...scriptParts, part]);
        }
    };

    const handleDeleteScriptPart = (id: number) => {
        setScriptParts(scriptParts.filter(p => p.id !== id));
    };

    const handleGenerateSnippet = async () => {
        if (!title || !logline) {
            setSnippetError("Please provide a title and logline first.");
            setTimeout(() => setSnippetError(null), 3000);
            return;
        }
        setIsGeneratingSnippet(true);
        setSnippetError(null);
        try {
            const response = await generateDialogueSnippet(title, logline, genre);
            const jsonString = response.text;
            const newParts = JSON.parse(jsonString);
    
            if (Array.isArray(newParts)) {
                const formattedParts: ScriptPart[] = newParts.map(part => ({
                    id: Date.now() + Math.random(),
                    character: part.character || 'Unknown',
                    action: part.action || '',
                    dialogue: part.dialogue || '',
                }));
                setScriptParts(prev => [...prev, ...formattedParts]);
            } else {
                throw new Error("Invalid response format from AI.");
            }
        } catch (err) {
            console.error("Failed to generate snippet:", err);
            setSnippetError("AI failed to generate a snippet. Please try again.");
            setTimeout(() => setSnippetError(null), 4000);
        } finally {
            setIsGeneratingSnippet(false);
        }
    };
    
    const handleSaveStoryPoint = (storyPoint: StoryPoint) => {
        if (storyPoints.some(s => s.id === storyPoint.id)) {
            setStoryPoints(storyPoints.map(s => s.id === storyPoint.id ? storyPoint : s));
        } else {
            setStoryPoints([...storyPoints, storyPoint]);
        }
    };

    const handleDeleteStoryPoint = (id: number) => {
        setStoryPoints(storyPoints.filter(s => s.id !== id));
    };
    
    const handleSaveCharacterSituation = (situation: CharacterSituation) => {
        if (characterSituations.some(s => s.id === situation.id)) {
            setCharacterSituations(characterSituations.map(s => s.id === situation.id ? situation : s));
        } else {
            setCharacterSituations([...characterSituations, situation]);
        }
    };

    const handleDeleteCharacterSituation = (id: number) => {
        setCharacterSituations(characterSituations.filter(s => s.id !== id));
    };
    
    const handleGenerateCharacters = async () => {
        if (!title || !logline) {
            setCharacterGenError("Please provide a title and logline first.");
            setTimeout(() => setCharacterGenError(null), 3000);
            return;
        }
        setIsGeneratingCharacters(true);
        setCharacterGenError(null);
        try {
            const response = await generateCharacterSituations(title, logline, genre);
            const jsonString = response.text;
            const newSituations = JSON.parse(jsonString);
    
            if (Array.isArray(newSituations)) {
                const formattedSituations: CharacterSituation[] = newSituations.map(sit => ({
                    id: Date.now() + Math.random(),
                    characterName: sit.characterName || 'Unknown',
                    description: sit.description || '',
                }));
                setCharacterSituations(prev => [...prev, ...formattedSituations]);
            } else {
                throw new Error("Invalid response format from AI.");
            }
        } catch (err) {
            console.error("Failed to generate characters:", err);
            setCharacterGenError("AI failed to generate characters. Please try again.");
            setTimeout(() => setCharacterGenError(null), 4000);
        } finally {
            setIsGeneratingCharacters(false);
        }
    };

    const handleGenerateVoice = async (partId: number) => {
        const part = scriptParts.find(p => p.id === partId);
        if (!part || !part.dialogue) return;
    
        setGeneratingVoiceForPartId(partId);
        setSnippetError(null); 
    
        try {
            const base64Audio = await generateSpeech(part.dialogue);
            if (base64Audio) {
                if (part.audioUrl) URL.revokeObjectURL(part.audioUrl);
    
                const bytes = decode(base64Audio);
                const blob = pcmToWav(bytes, 24000, 1, 16);
                const url = URL.createObjectURL(blob);
                setScriptParts(prev => prev.map(p => p.id === partId ? { ...p, audioUrl: url, audioType: 'ai' } : p));
            } else {
                throw new Error("API did not return audio data.");
            }
        } catch (err) {
            console.error("Failed to generate voice:", err);
            setSnippetError("Failed to generate voice. Please try again.");
            setTimeout(() => setSnippetError(null), 4000);
        } finally {
            setGeneratingVoiceForPartId(null);
        }
    };

    const handleStartRecording = async (partId: number) => {
        if (isRecording) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = event => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const part = scriptParts.find(p => p.id === recordingForPartId);
                if(part?.audioUrl) URL.revokeObjectURL(part.audioUrl);

                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(audioBlob);
                setScriptParts(prev => prev.map(p => p.id === recordingForPartId ? { ...p, audioUrl, audioType: 'user' } : p));
                
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingForPartId(partId);
        } catch (err) {
            console.error("Error starting recording:", err);
            setSnippetError("Microphone access denied. Please allow microphone permissions.");
            setTimeout(() => setSnippetError(null), 4000);
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setRecordingForPartId(null);
        }
    };
    
    const handleDeleteRecording = (partId: number) => {
        setScriptParts(prev => prev.map(p => {
            if (p.id === partId && p.audioUrl) {
                URL.revokeObjectURL(p.audioUrl);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { audioUrl, audioType, ...rest } = p;
                return rest;
            }
            return p;
        }));
    };
    
    const handleGenerateStoryOutline = async () => {
        if (!title || !logline) {
            setStoryGenError("Please provide a title and logline first.");
            setTimeout(() => setStoryGenError(null), 3000);
            return;
        }
        setIsGeneratingStory(true);
        setStoryGenError(null);
        try {
            const response = await generateStoryOutline(title, logline, genre);
            const jsonString = response.text;
            const newPoints = JSON.parse(jsonString);
    
            if (Array.isArray(newPoints)) {
                const formattedPoints: StoryPoint[] = newPoints.map(point => ({
                    id: Date.now() + Math.random(),
                    title: point.title || 'Untitled Act',
                    description: point.description || '',
                }));
                setStoryPoints(prev => [...prev, ...formattedPoints]);
            } else {
                throw new Error("Invalid response format from AI.");
            }
        } catch (err) {
            console.error("Failed to generate story outline:", err);
            setStoryGenError("AI failed to generate a story outline. Please try again.");
            setTimeout(() => setStoryGenError(null), 4000);
        } finally {
            setIsGeneratingStory(false);
        }
    };

    const handleGenerateMusicCues = async () => {
        if (!title || !genre) {
            setMusicGenError("Please provide a title and genre on the Concept tab first.");
            setTimeout(() => setMusicGenError(null), 3000);
            return;
        }
        setIsGeneratingMusic(true);
        setMusicGenError(null);
        try {
            const sceneData = scenes.map(({ title, description }) => ({ title, description }));
            const response = await generateMusicCues(title, genre, sceneData);
            const jsonString = response.text;
            const newTracks = JSON.parse(jsonString);
    
            if (Array.isArray(newTracks)) {
                const formattedTracks: Music[] = newTracks.map(track => ({
                    id: Date.now() + Math.random(),
                    title: track.title || 'Untitled Track',
                    description: track.description || '',
                }));
                setMusicTracks(prev => [...prev, ...formattedTracks]);
            } else {
                throw new Error("Invalid response format from AI.");
            }
        } catch (err) {
            console.error("Failed to generate music cues:", err);
            setMusicGenError("AI failed to generate music cues. Please try again.");
            setTimeout(() => setMusicGenError(null), 4000);
        } finally {
            setIsGeneratingMusic(false);
        }
    };

    const renderTabContent = () => {
        switch(activeTab) {
            case 'concept':
                return (
                    <form onSubmit={handleSubmit} className="space-y-4 bg-slate-900/50 p-4 rounded-lg">
                        <fieldset disabled={loading} className="space-y-4">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">Movie Title</label>
                                <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white" placeholder="e.g., Chronos Rebellion" />
                            </div>
                            <div>
                                <label htmlFor="logline" className="block text-sm font-medium text-slate-300 mb-2">Logline / Synopsis</label>
                                <textarea id="logline" rows={4} value={logline} onChange={(e) => setLogline(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white" placeholder="e.g., A rogue historian discovers time travel..." />
                            </div>
                            <div>
                                <label htmlFor="genre" className="block text-sm font-medium text-slate-300 mb-2">Genre</label>
                                <select id="genre" value={genre} onChange={(e) => setGenre(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white">
                                    {MOVIE_GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="visualStyle" className="block text-sm font-medium text-slate-300 mb-2">Visual Style (Optional)</label>
                                <select id="visualStyle" value={visualStyle} onChange={(e) => setVisualStyle(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white">
                                    <option value="">None</option>
                                    {VISUAL_STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="directorStyle" className="block text-sm font-medium text-slate-300 mb-2">Director Style (Optional)</label>
                                <select id="directorStyle" value={directorStyle} onChange={(e) => setDirectorStyle(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white">
                                    <option value="">None</option>
                                    {DIRECTOR_STYLES_DESCRIPTIVE.map((d) => <option key={d.name} value={d.value}>{d.name}</option>)}
                                </select>
                            </div>
                             <div className="flex items-center">
                                <input
                                    id="add-qr-poster"
                                    type="checkbox"
                                    checked={addQr}
                                    onChange={(e) => setAddQr(e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-cyan-600 focus:ring-cyan-500"
                                />
                                <label htmlFor="add-qr-poster" className="ml-2 block text-sm text-slate-300">Add verification QR code to poster</label>
                            </div>
                            <button type="submit" disabled={loading} className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-300">
                                {loading ? 'Generating...' : (poster ? 'Update Concept & Poster' : 'Generate Movie Concept')}
                            </button>
                            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                        </fieldset>
                    </form>
                );
            case 'story':
                return (
                     <div className="space-y-6">
                        <div className="space-y-4 bg-slate-900/50 p-4 rounded-lg">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold">Story / Plot</h3>
                                <div className="flex items-center space-x-2">
                                     <button 
                                        onClick={handleGenerateStoryOutline}
                                        disabled={isGeneratingStory || loading || !title || !logline}
                                        className="bg-purple-600 text-white text-xs font-semibold py-1 px-3 rounded-full hover:bg-purple-700 transition flex items-center space-x-1 disabled:bg-slate-600"
                                        title="Use AI to generate a story outline"
                                    >
                                        {isGeneratingStory ? (
                                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        ) : ( <span>✨</span> )}
                                        <span>Generate Outline</span>
                                    </button>
                                    <button onClick={() => { setEditingStoryPoint(null); setIsStoryModalOpen(true); }} className="bg-slate-700 text-sm hover:bg-slate-600 text-cyan-400 font-semibold py-2 px-3 rounded-lg transition">
                                       + Add Point
                                    </button>
                                </div>
                            </div>
                            {storyGenError && <p className="text-xs text-center text-red-400 mb-2">{storyGenError}</p>}
                            <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                                {storyPoints.length === 0 && <p className="text-slate-500 text-sm text-center py-4">Flesh out your plot here.</p>}
                                {storyPoints.map(point => (
                                    <div key={point.id} className="bg-slate-800 p-3 rounded-lg flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-slate-200">{point.title}</p>
                                            <p className="text-slate-400 text-sm mt-1 whitespace-pre-wrap">{point.description}</p>
                                        </div>
                                        <div className="flex space-x-2 flex-shrink-0 ml-2">
                                            <button onClick={() => { setEditingStoryPoint(point); setIsStoryModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-cyan-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg></button>
                                            <button onClick={() => handleDeleteStoryPoint(point.id)} className="p-1.5 text-slate-400 hover:text-red-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4 bg-slate-900/50 p-4 rounded-lg">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold">Characters</h3>
                                <div className="flex items-center space-x-2">
                                     <button 
                                        onClick={handleGenerateCharacters}
                                        disabled={isGeneratingCharacters || loading}
                                        className="bg-purple-600 text-white text-xs font-semibold py-1 px-3 rounded-full hover:bg-purple-700 transition flex items-center space-x-1 disabled:bg-slate-600"
                                        title="Use AI to generate character ideas"
                                    >
                                        {isGeneratingCharacters ? (
                                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        ) : ( <span>✨</span> )}
                                        <span>Generate</span>
                                    </button>
                                    <button onClick={() => { setEditingCharacterSituation(null); setIsCharacterModalOpen(true); }} className="bg-slate-700 text-sm hover:bg-slate-600 text-cyan-400 font-semibold py-2 px-3 rounded-lg transition">
                                       + Add
                                    </button>
                                </div>
                            </div>
                            {characterGenError && <p className="text-xs text-center text-red-400 mb-2">{characterGenError}</p>}
                            <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                                {characterSituations.length === 0 && <p className="text-slate-500 text-sm text-center py-4">Describe your characters and their dilemmas.</p>}
                                {characterSituations.map(sit => (
                                    <div key={sit.id} className="bg-slate-800 p-3 rounded-lg flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-slate-200">{sit.characterName}</p>
                                            <p className="text-slate-400 text-sm mt-1 whitespace-pre-wrap">{sit.description}</p>
                                        </div>
                                        <div className="flex space-x-2 flex-shrink-0 ml-2">
                                            <button onClick={() => { setEditingCharacterSituation(sit); setIsCharacterModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-cyan-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg></button>
                                            <button onClick={() => handleDeleteCharacterSituation(sit.id)} className="p-1.5 text-slate-400 hover:text-red-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 'script':
                return (
                    <div className="space-y-4 bg-slate-900/50 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold">Script</h3>
                            <div className="flex items-center space-x-2">
                                <button 
                                    onClick={handleGenerateSnippet}
                                    disabled={isGeneratingSnippet || loading}
                                    className="bg-purple-600 text-white text-xs font-semibold py-1 px-3 rounded-full hover:bg-purple-700 transition flex items-center space-x-1 disabled:bg-slate-600"
                                    title="Use AI to generate a sample snippet"
                                >
                                    {isGeneratingSnippet ? (
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    ) : ( <span>✨</span> )}
                                    <span>Snippet</span>
                                </button>
                                <button onClick={() => { setEditingScriptPart(null); setIsScriptModalOpen(true); }} className="bg-slate-700 text-sm hover:bg-slate-600 text-cyan-400 font-semibold py-2 px-3 rounded-lg transition">
                                   + Add Part
                                </button>
                            </div>
                        </div>
                        {snippetError && <p className="text-xs text-center text-red-400 mb-2">{snippetError}</p>}
                        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                            {scriptParts.length === 0 && <p className="text-slate-500 text-sm text-center py-4">Your script will appear here.</p>}
                            {scriptParts.map(part => (
                                <div key={part.id} className="bg-slate-800 p-3 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-slate-200">{part.character.toUpperCase()}</p>
                                            {part.action && <p className="text-slate-500 text-sm italic">({part.action})</p>}
                                            <p className="text-slate-300 text-sm mt-1 whitespace-pre-wrap">{part.dialogue}</p>
                                        </div>
                                        <div className="flex space-x-2 flex-shrink-0 ml-2">
                                            <button onClick={() => { setEditingScriptPart(part); setIsScriptModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-cyan-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg></button>
                                            <button onClick={() => handleDeleteScriptPart(part.id)} className="p-1.5 text-slate-400 hover:text-red-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
                                        </div>
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-slate-700/50">
                                        {part.audioUrl && (
                                            <div className="mb-2">
                                                <audio src={part.audioUrl} controls className="w-full h-8" />
                                                <div className="text-right mt-1">
                                                    {part.audioType === 'ai' && <span className="text-xs font-semibold px-2 py-0.5 bg-cyan-800 text-cyan-300 rounded-full">AI Voice</span>}
                                                    {part.audioType === 'user' && <span className="text-xs font-semibold px-2 py-0.5 bg-purple-800 text-purple-300 rounded-full">User Recording</span>}
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-center space-x-2">
                                            {isRecording && recordingForPartId === part.id ? (
                                                <button onClick={handleStopRecording} className="w-full text-xs font-semibold py-1 px-2 rounded-md transition bg-red-600 hover:bg-red-700 text-white flex items-center justify-center space-x-1">
                                                    <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                                                    <span>Stop Recording</span>
                                                </button>
                                            ) : (
                                                <>
                                                    <button 
                                                        onClick={() => handleGenerateVoice(part.id)} 
                                                        disabled={isRecording || generatingVoiceForPartId !== null} 
                                                        className="flex-1 text-xs font-semibold py-1 px-2 rounded-md transition bg-purple-600 hover:bg-purple-700 text-white disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed flex items-center justify-center space-x-1.5"
                                                    >
                                                        {generatingVoiceForPartId === part.id ? (
                                                            <>
                                                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                            <span>Generating...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                            <span>✨</span>
                                                            <span>{part.audioType === 'ai' ? 'Regenerate' : 'Generate'}</span>
                                                            </>
                                                        )}
                                                    </button>
                                                    <button 
                                                        onClick={() => handleStartRecording(part.id)} 
                                                        disabled={isRecording || generatingVoiceForPartId !== null} 
                                                        className="flex-1 text-xs font-semibold py-1 px-2 rounded-md transition bg-slate-700 hover:bg-slate-600 text-cyan-400 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed flex items-center justify-center space-x-1.5"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" /><path d="M5.5 8.5a.5.5 0 01.5.5v1a4 4 0 004 4h0a4 4 0 004-4v-1a.5.5 0 011 0v1a5 5 0 01-4.5 4.975V17h3a.5.5 0 010 1h-7a.5.5 0 010-1h3v-1.525A5 5 0 014.5 13v-1a.5.5 0 01.5-.5z" /></svg>
                                                        <span>{part.audioType === 'user' ? 'Re-record' : 'Record'}</span>
                                                    </button>
                                                </>
                                            )}
                                             {part.audioUrl && (!isRecording || recordingForPartId !== part.id) && (
                                                <button onClick={() => handleDeleteRecording(part.id)} className="p-1.5 text-slate-400 hover:text-red-500 flex-shrink-0" title="Delete audio">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'visuals':
                return (
                    <div className="space-y-4 bg-slate-900/50 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold">Scene List & Storyboards</h3>
                             <button onClick={() => { setEditingScene(null); setIsSceneModalOpen(true); }} className="bg-slate-700 text-sm hover:bg-slate-600 text-cyan-400 font-semibold py-2 px-3 rounded-lg transition">
                               + Add Scene
                            </button>
                        </div>
                        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                            {scenes.length === 0 && <p className="text-slate-500 text-sm text-center py-4">Add scenes and generate storyboards.</p>}
                            {scenes.map(scene => (
                                <div key={scene.id} className="bg-slate-800 p-3 rounded-lg">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-grow">
                                            <p className="font-bold text-slate-200">{scene.title}</p>
                                            <p className="text-slate-400 text-sm mt-1 whitespace-pre-wrap">{scene.description}</p>
                                        </div>
                                        <div className="flex space-x-2 flex-shrink-0 ml-2">
                                            <button onClick={() => { setEditingScene(scene); setIsSceneModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-cyan-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg></button>
                                            <button onClick={() => handleDeleteScene(scene.id)} className="p-1.5 text-slate-400 hover:text-red-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
                                        </div>
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-slate-700/50">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Storyboard</h4>
                                            <button 
                                              onClick={() => handleGenerateBackground(scene.id)} 
                                              disabled={generatingBackgroundForSceneId !== null || !scene.description}
                                              className="text-xs font-semibold py-1 px-2 rounded-md transition bg-slate-700 hover:bg-slate-600 text-cyan-400 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
                                            >
                                              {generatingBackgroundForSceneId === scene.id 
                                                ? 'Generating...' 
                                                : scene.backgroundImage ? 'Re-generate' : 'Generate'}
                                            </button>
                                        </div>
                                        <div className="mt-2 relative bg-slate-900/50 rounded min-h-[5rem] flex items-center justify-center">
                                          {generatingBackgroundForSceneId === scene.id && <Loader />}
                                          {!generatingBackgroundForSceneId && scene.backgroundImage && (
                                            <div className="relative group w-full">
                                              <img src={scene.backgroundImage} alt={`Background for ${scene.title}`} className="w-full h-auto rounded" />
                                              <button 
                                                onClick={() => handleDeleteBackground(scene.id)} 
                                                className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Delete background"
                                              >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                              </button>
                                            </div>
                                          )}
                                          {!generatingBackgroundForSceneId && !scene.backgroundImage && <p className="text-slate-600 text-xs">No background generated</p>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'sound':
                return (
                     <div className="space-y-4 bg-slate-900/50 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold">Sound & Music</h3>
                             <div className="flex items-center space-x-2">
                                <button 
                                    onClick={handleGenerateMusicCues}
                                    disabled={isGeneratingMusic || loading || !title || !genre}
                                    className="bg-purple-600 text-white text-xs font-semibold py-1 px-3 rounded-full hover:bg-purple-700 transition flex items-center space-x-1 disabled:bg-slate-600"
                                    title="Use AI to suggest music cues"
                                >
                                    {isGeneratingMusic ? (
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    ) : ( <span>✨</span> )}
                                    <span>Suggest Cues</span>
                                </button>
                                <button onClick={() => { setEditingMusic(null); setIsMusicModalOpen(true); }} className="bg-slate-700 text-sm hover:bg-slate-600 text-cyan-400 font-semibold py-2 px-3 rounded-lg transition">
                                   + Add Track
                                </button>
                            </div>
                        </div>
                        {musicGenError && <p className="text-xs text-center text-red-400 mb-2">{musicGenError}</p>}
                        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                            {musicTracks.length === 0 && <p className="text-slate-500 text-sm text-center py-4">Add ideas for your score and soundtrack.</p>}
                            {musicTracks.map(music => (
                                <div key={music.id} className="bg-slate-800 p-3 rounded-lg flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-slate-200">{music.title}</p>
                                        <p className="text-slate-400 text-sm mt-1 whitespace-pre-wrap">{music.description}</p>
                                    </div>
                                    <div className="flex space-x-2 flex-shrink-0 ml-2">
                                        <button onClick={() => { setEditingMusic(music); setIsMusicModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-cyan-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg></button>
                                        <button onClick={() => handleDeleteMusic(music.id)} className="p-1.5 text-slate-400 hover:text-red-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            default: return null;
        }
    }

    return (
        <div className="flex flex-col md:flex-row gap-8">
            <SceneEditorModal isOpen={isSceneModalOpen} onClose={() => setIsSceneModalOpen(false)} onSave={handleSaveScene} scene={editingScene} />
            <MusicEditorModal isOpen={isMusicModalOpen} onClose={() => setIsMusicModalOpen(false)} onSave={handleSaveMusic} music={editingMusic} />
            <ScriptEditorModal 
                isOpen={isScriptModalOpen} 
                onClose={() => setIsScriptModalOpen(false)} 
                onSave={handleSaveScriptPart} 
                scriptPart={editingScriptPart} 
                characterNames={characterSituations.map(c => c.characterName)}
            />
            <StoryEditorModal isOpen={isStoryModalOpen} onClose={() => setIsStoryModalOpen(false)} onSave={handleSaveStoryPoint} storyPoint={editingStoryPoint} />
            <CharacterEditorModal isOpen={isCharacterModalOpen} onClose={() => setIsCharacterModalOpen(false)} onSave={handleSaveCharacterSituation} situation={editingCharacterSituation} />
            
            <div className="w-full md:w-1/3 space-y-4">
                 <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 space-y-2">
                    <h3 className="text-xl font-bold">Movie Pre-production</h3>
                    <p className="text-sm text-slate-400">Start with a concept, then flesh out your story, script, visuals, and sound using the tabs below.</p>
                    <div className="relative flex items-stretch gap-2 pt-2">
                        <button onClick={handleSaveProject} className="flex-1 text-sm bg-green-700 hover:bg-green-600 text-white font-semibold py-2 px-3 rounded-lg transition">Save Project</button>
                        <button onClick={handleDeleteProject} className="flex-1 text-sm bg-red-800 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-lg transition">Delete Project</button>
                        <button onClick={resetAll} className="flex-1 text-sm bg-slate-700 hover:bg-slate-600 text-cyan-400 font-semibold py-2 px-3 rounded-lg transition">New Project</button>
                            {projectSaveStatus && <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-green-400 whitespace-nowrap">{projectSaveStatus}</span>}
                    </div>
                </div>

                <div className="flex bg-slate-800 rounded-t-lg border-x border-t border-slate-700 overflow-hidden">
                    <TabButton isActive={activeTab === 'concept'} onClick={() => setActiveTab('concept')}>
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 100 2h.01a1 1 0 100-2H11zM10 1a1 1 0 011 1v1a1 1 0 11-2 0V2a1 1 0 011-1zM9 15a1 1 0 102 0v2a1 1 0 10-2 0v-2zM5.636 13.364a1 1 0 00-1.414-1.414 1 1 0 001.414 1.414zM13.364 6.364a1 1 0 00-1.414-1.414 1 1 0 001.414 1.414zM16.485 10.485a1 1 0 00-1.414 0 1 1 0 001.414 1.414zM1.904 4.515a1 1 0 001.414 0 1 1 0 00-1.414-1.414zM4.515 16.096a1 1 0 00-1.414 1.414 1 1 0 001.414-1.414zM10 4a6 6 0 100 12 6 6 0 000-12z" /></svg>
                        Concept
                    </TabButton>
                    <TabButton isActive={activeTab === 'story'} onClick={() => setActiveTab('story')}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H9z" /><path d="M3 5a2 2 0 012-2h2a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" /></svg>
                        Story
                    </TabButton>
                    <TabButton isActive={activeTab === 'script'} onClick={() => setActiveTab('script')}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm3 4a1 1 0 100 2h6a1 1 0 100-2H7zm0 4a1 1 0 100 2h6a1 1 0 100-2H7zm0 4a1 1 0 100 2h4a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                        Script
                    </TabButton>
                </div>
                 <div className="flex bg-slate-800 rounded-b-lg border-x border-b border-slate-700 overflow-hidden -mt-4">
                    <TabButton isActive={activeTab === 'visuals'} onClick={() => setActiveTab('visuals')}>
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
                        Visuals
                    </TabButton>
                    <TabButton isActive={activeTab === 'sound'} onClick={() => setActiveTab('sound')}>
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3V4a1 1 0 00-1-1z" /></svg>
                        Sound
                    </TabButton>
                </div>
                 <div className="flex-grow">
                    {renderTabContent()}
                 </div>
            </div>

            <div className="w-full md:w-2/3 flex flex-col items-center justify-center bg-slate-900/50 rounded-lg border-2 border-dashed border-slate-700 min-h-[400px] md:min-h-0 p-4">
                {loading && <Loader message="Generating poster..." />}
                {!loading && !poster && <p className="text-slate-500">Your movie poster will appear here</p>}
                
                {poster && (
                     <div className="w-full h-full flex flex-col items-center justify-center">
                        <img src={poster} alt="Generated Movie Poster" className="max-w-full max-h-[70vh] rounded-lg object-contain shadow-2xl shadow-black/50" />
                        
                        <div className="mt-4 w-full max-w-2xl">
                            <div className="text-center bg-slate-800/80 p-4 rounded-lg">
                                <h3 className="text-lg font-bold text-white">Concept Generated!</h3>
                                <p className="text-amber-300 text-sm mb-3">Now use the tabs on the left to build out your movie idea.</p>
                                <button
                                    onClick={() => onShare({ contentUrl: poster, contentText: `Check out my movie concept: "${title}"!\n\nLogline: ${logline}`, contentType: 'image' })}
                                    className="flex items-center justify-center space-x-2 bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-300 mx-auto"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
                                    <span>Share Poster</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MovieGenerator;
