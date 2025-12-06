
import React from 'react';

// --- SVG Icons for UI ---
const CreateIcon = ({className, ...props}: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-4 w-4"} viewBox="0 0 20 20" fill="currentColor" {...props}><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>;
const AnalyzeIcon = ({className, ...props}: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-4 w-4"} viewBox="0 0 20 20" fill="currentColor" {...props}><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>;
export const AccountIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-4 w-4"} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>;
export const PricingIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-4 w-4"} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" /></svg>;

// OS Icons
const ImageOSIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M5 21C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5ZM11.6213 14.1213L7.37868 18.364H19V17.0355L14.4497 12.4853L11.6213 14.1213ZM9 14L14.0355 8.96447L19 13.9289V5H5V16.2929L9 12.2929V14ZM8 10C8.55228 10 9 9.55228 9 9C9 8.44772 8.55228 8 8 8C7.44772 8 7 8.44772 7 9C7 9.55228 7.44772 10 8 10Z" /></svg>;
const ScriptOSIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M21 4H7C5.89543 4 5 4.89543 5 6V19C5 20.1046 5.89543 21 7 21H21C22.1046 21 23 20.1046 23 19V6C23 4.89543 22.1046 4 21 4ZM7 19V6H21V19H7ZM2 8H4V18H2V8ZM9 9H19V11H9V9ZM9 13H19V15H9V13ZM9 17H15V19H9V17Z" /></svg>;
const VideoOSIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M2 3.9934C2 3.44476 2.45531 3 2.9918 3H21.0082C21.556 3 22 3.44495 22 3.9934V20.0066C22 20.5552 21.5447 21 21.0082 21H2.9918C2.44405 21 2 20.5551 2 20.0066V3.9934ZM4 5V19H20V5H4ZM8 15V9L16 12L8 15Z" /></svg>;
const AudioOSIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM9 7H11V15H12V17H8V15H9V7ZM15 7H13V15H14V17H10V15H11V7Z M12 3.5C14.5 3.5 16.5 5.5 16.5 8S14.5 12.5 12 12.5 7.5 10.5 7.5 8 9.5 3.5 12 3.5z" /><path d="M12 13.5L12 18.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="8" r="4"/></svg>;
const ThreeDOSIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 2L1 7L12 12L23 7L12 2ZM2 17L12 22L22 17V8.5L12 13.5L2 8.5V17Z" /></svg>;
const CodeOSIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M24 12L18.3431 17.6569L16.9289 16.2426L21.1716 12L16.9289 7.75736L18.3431 6.34315L24 12ZM2.82843 12L7.07107 16.2426L5.65685 17.6569L0 12L5.65685 6.34315L7.07107 7.75736L2.82843 12ZM9.78845 21H7.66009L14.2116 3H16.3399L9.78845 21Z" /></svg>;
const BrandOSIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 2L1 21H23L12 2ZM12 6L19.5 20H4.5L12 6ZM12 11C13.6569 11 15 12.3431 15 14C15 15.6569 13.6569 17 12 17C10.3431 17 9 15.6569 9 14C9 12.3431 10.3431 11 12 11Z" /></svg>;
const AutomationOSIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M13.2 2.62793L13.8267 10.1479L21.3467 10.7746L13.8267 11.4013L13.2 18.9213L12.5734 11.4013L5.05334 10.7746L12.5734 10.1479L13.2 2.62793ZM13.2 5.76126L12.9267 9.04126L9.64668 9.3146L12.9267 9.58793L13.2 12.8679L13.4734 9.58793L16.7534 9.3146L13.4734 9.04126L13.2 5.76126ZM19.2667 13.9213L19.58 17.6813L23.34 17.9946L19.58 18.3079L19.2667 22.0679L18.9534 18.3079L15.1934 17.9946L18.9534 17.6813L19.2667 13.9213ZM6.12001 2.62793L6.43334 6.38793L10.1933 6.70126L6.43334 7.0146L6.12001 10.7746L5.80667 7.0146L2.04668 6.70126L5.80667 6.38793L6.12001 2.62793Z" /></svg>;

// --- Feature Configuration ---
export const FEATURES = [
    { id: 'image-os', title: 'ImageOS', description: 'Design, Edit & Generate Assets.', category: 'Creative Engines', icon: <ImageOSIcon /> },
    { id: 'video-os', title: 'VideoOS', description: 'Full Video Creation Suite.', category: 'Creative Engines', icon: <VideoOSIcon /> },
    { id: 'audio-os', title: 'AudioOS', description: 'Voices, Music & SFX.', category: 'Creative Engines', icon: <AudioOSIcon /> },
    { id: '3d-os', title: '3D/VR/AR OS', description: 'World Builder & Assets.', category: 'Creative Engines', icon: <ThreeDOSIcon /> },
    { id: 'script-os', title: 'ScriptOS', description: 'Writing, Brainstorming & Chat.', category: 'Creative Engines', icon: <ScriptOSIcon /> },
    { id: 'code-os', title: 'CodeOS', description: 'AI Development Engine.', category: 'Technical Engines', icon: <CodeOSIcon /> },
    { id: 'brand-os', title: 'BrandOS', description: 'Ultimate Marketing AI.', category: 'Technical Engines', icon: <BrandOSIcon /> },
    { id: 'automation-os', title: 'AutomationOS', description: 'Workflows & Data.', category: 'Technical Engines', icon: <AutomationOSIcon /> },
] as const;

export type FeatureId = typeof FEATURES[number]['id'] | 'pricing' | 'profile-settings';

export const CATEGORY_DETAILS: Record<string, { icon: React.ReactElement }> = {
    'Creative Engines': { icon: <CreateIcon /> },
    'Technical Engines': { icon: <AnalyzeIcon /> },
};

// --- Shared Constants (Remaining from previous setup) ---
export type PlatformCategory = 'Social & Micro' | 'Video & Streaming' | 'Professional & Business' | 'Messaging & Chat' | 'Art & Creative' | 'Dev & Code';

export interface Platform {
    name: string;
    icon: React.ReactElement;
    category: PlatformCategory;
    shareUrl?: (url: string, text: string, type: 'image' | 'video' | 'text' | 'audio') => string;
}

export const PLATFORMS: Platform[] = [
    {
        name: 'Twitter / X',
        icon: <svg fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
        category: 'Social & Micro',
        shareUrl: (url, text) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
    },
    {
        name: 'LinkedIn',
        icon: <svg fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>,
        category: 'Professional & Business',
        shareUrl: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    },
    {
        name: 'Facebook',
        icon: <svg fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>,
        category: 'Social & Micro',
        shareUrl: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    },
    {
        name: 'Reddit',
        icon: <svg fill="currentColor" viewBox="0 0 24 24"><path d="M14.238 15.348c.085.084.085.221 0 .306-.465.462-1.194.687-2.231.687l-.008-.002-.008.002c-1.036 0-1.766-.225-2.231-.688-.085-.084-.085-.221 0-.305.084-.084.222-.084.307 0 .379.377 1.008.561 1.924.561l.008.002.008-.002c.915 0 1.544-.184 1.924-.561.085-.084.223-.084.307 0zm-3.44-2.418c0-.507-.414-.919-.922-.919-.509 0-.923.412-.923.919 0 .506.414.918.923.918.508.001.922-.411.922-.918zm13.202-.93c-3.925-2.573-8.032-2.573-11.957 0-3.925-2.573-8.03-2.573-11.955 0 .041 3.023.184 5.922 4.026 8.351 2.368 1.498 5.46 1.583 7.929 0 3.841-2.43 3.984-5.328 4.026-8.351 1.926-.243 3.429-1.92 3.429-3.966 0-2.203-1.792-3.989-4.004-3.989-1.579 0-2.946.914-3.6 2.271l-4.225-3.044-.225.766c-.033.111-.12.197-.23.23l-.766.225 4.194 3.022c-1.399-2.73-4.321-4.47-7.598-4.47-3.279 0-6.199 1.74-7.598 4.47l4.194-3.022-.766-.225c-.11-.033-.197-.119-.23-.23l-.225-.766-4.226 3.044c-.654-1.357-2.021-2.271-3.6-2.271-2.211 0-4.004 1.786-4.004 3.989 0 2.046 1.503 3.723 3.429 3.966zm-5.461-1.121c0-.507-.414-.919-.923-.919-.508 0-.922.412-.922.919 0 .506.414.918.922.918.509.001.923-.411.923-.918z"/></svg>,
        category: 'Social & Micro',
        shareUrl: (url, text) => `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`
    }
];

export const DESIGN_STYLES = ['Photorealistic', 'Cinematic', '3D Render', 'Anime', 'Digital Art', 'Oil Painting', 'Watercolor', 'Pixel Art', 'Cyberpunk', 'Steampunk', 'Minimalist', 'Retro', 'Futuristic', 'Gothic', 'Pop Art', 'Concept Art'];
export const DESIGN_TYPES = ['General Art', 'Logo Design', 'Packaging Design', 'UI/UX Mockup', 'Interior Design', 'Fashion Design', 'Character Design', 'Poster/Cover Art'];
export const PACKAGING_TYPES = ['Box', 'Bottle', 'Pouch', 'Can', 'Tube', 'Bag', 'Jar', 'Wrapper'];
export const PACKAGING_MATERIALS = ['Cardboard', 'Glass', 'Plastic', 'Metal', 'Paper', 'Foil', 'Wood'];
export const PACKAGING_STYLES = ['Minimalist', 'Luxury', 'Eco-Friendly', 'Playful', 'Industrial', 'Vintage', 'Futuristic', 'Handmade'];
export const PACKAGING_ENVIRONMENTS = ['Studio Background', 'Store Shelf', 'Kitchen Counter', 'On Table', 'In Hand', 'Nature Setting', 'Luxury Display'];

export const INTERIOR_TYPES = ['Living Room', 'Kitchen', 'Bedroom', 'Office', 'Bathroom', 'Cafe', 'Retail Store', 'Hotel Lobby'];
export const INTERIOR_STYLES = ['Modern', 'Industrial', 'Scandinavian', 'Bohemian', 'Mid-Century Modern', 'Minimalist', 'Art Deco', 'Rustic'];
export const UI_TYPES = ['Mobile App Screen', 'SaaS Dashboard', 'Landing Page Hero', 'E-commerce Product Page', 'Smart Watch Interface', 'Tablet App', 'VR/AR Interface'];
export const FASHION_ITEMS = ['Avant-garde Dress', 'Business Suit', 'Streetwear Outfit', 'Luxury Handbag', 'Futuristic Sneakers', 'Jewelry Set', 'Athleisure'];
export const FASHION_MATERIALS = ['Cotton', 'Silk', 'Leather', 'Denim', 'Velvet', 'Synthetic', 'Wool', 'Linen', 'Latex'];
export const CHARACTER_TYPES = ['RPG Hero', 'Cyberpunk Hacker', 'Fantasy Creature', 'Pixar-style Character', 'Anime Protagonist', 'Sci-Fi Soldier', 'Mascot'];
export const LOGO_STYLES = ['Minimalist', 'Mascot', 'Emblem', 'Abstract', 'Lettermark', 'Vintage', '3D Gradient'];

export const ASPECT_RATIOS = ['1:1', '16:9', '9:16', '4:3', '3:4', '21:9'];
export const VIDEO_ASPECT_RATIOS = ['16:9', '9:16'];
export const ARTISTIC_STYLES = ['None', 'Minimalist', 'Abstract', 'Surrealism', 'Pop Art', 'Impressionism', 'Expressionism', 'Cubism', 'Art Nouveau', 'Art Deco'];
export const VISUAL_EFFECTS = ['None', 'Bokeh', 'Motion Blur', 'Glitch', 'Vignette', 'Film Grain', 'Chromatic Aberration', 'Lens Flare', 'Bloom', 'HDR'];
export const BACKGROUND_OPTIONS = [
    { label: 'None', value: '' },
    { label: 'Studio', value: 'in a professional studio setting with neutral background' },
    { label: 'Nature', value: 'in a lush nature setting with sunlight' },
    { label: 'Urban', value: 'in a modern city street with neon lights' },
    { label: 'Sci-Fi', value: 'in a futuristic sci-fi environment' },
    { label: 'Office', value: 'in a modern corporate office' },
    { label: 'Home', value: 'in a cozy living room' }
];

export const LIGHTING_STYLES = ['Studio Lighting', 'Natural Sunlight', 'Golden Hour', 'Neon / Cyberpunk', 'Softbox', 'Dramatic / Chiaroscuro', 'Flat Lighting'];
export const VIEW_ANGLES = ['Front View', 'Isometric View', 'Top-Down / Flat Lay', 'Low Angle', 'Close-up / Macro', '3/4 Angle'];

export const CAMERA_CONTROLS = ['None', 'Pan Left', 'Pan Right', 'Tilt Up', 'Tilt Down', 'Zoom In', 'Zoom Out', 'Truck Left', 'Truck Right'];
export const VIDEO_EDIT_ACTIONS = ['Smoothen Motion', 'Remove Background', 'Color Grade (Cinematic)', 'Make Loopable', 'Slow Motion'];
export const EXPORT_FORMATS = ['16:9 (Landscape)', '9:16 (Portrait)', '1:1 (Square)'];

export const VEO_LOADING_MESSAGES = [
    "Conceptualizing scene geometry...",
    "Rendering light and shadow...",
    "Calculating physics simulations...",
    "Applying texture maps...",
    "Polishing final frames...",
    "Generating video stream...",
    "Encoding output..."
];

export const VIDEO_EXTENSION_SUGGESTIONS = [
    "Zoom in on the subject",
    "Pan camera to the right",
    "Add a dramatic explosion",
    "Transition to sunset",
    "Make the character smile",
    "Change the background to space",
    "Add rain effects"
];

export const TTS_CATEGORIES = ['Narrative', 'Conversational', 'News', 'Creative', 'ASMR'];
export const TTS_VOICES = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr', 'Aoife', 'Fielden', 'Niamh', 'Wren'];

export const AVATAR_HAIR_COLORS = ['brown', 'black', 'blonde', 'red', 'white', 'grey', 'blue', 'pink', 'green', 'purple', 'any color'];
export const AVATAR_EYE_COLORS = ['brown', 'blue', 'green', 'hazel', 'grey', 'amber', 'any color'];
export const AVATAR_CLOTHING_STYLES = ['casual', 'business', 'formal', 'sporty', 'futuristic', 'fantasy', 'vintage', 'any style'];
export const AVATAR_EXPRESSIONS = ['neutral', 'happy', 'sad', 'angry', 'surprised', 'excited', 'serious', 'thoughtful'];

export const SOUND_EFFECT_CATEGORIES = ['Sci-Fi', 'Nature', 'Urban', 'Household', 'Office', 'Horror', 'Cartoon', 'Animals', 'Weather', 'Industrial'];
export const MUSIC_STYLES = ['Cinematic', 'Pop', 'Rock', 'Electronic', 'Jazz', 'Classical', 'Hip Hop', 'Ambient', 'Country', 'Folk', 'Metal'];
export const MUSIC_GENRES = MUSIC_STYLES;
export const MUSIC_MOODS = ['Happy', 'Sad', 'Energetic', 'Calm', 'Tense', 'Romantic', 'Dark', 'Uplifting', 'Melancholic', 'Aggressive'];

export interface Plan {
    name: string;
    price: { monthly: number | string; yearly: number | string };
    features: string[];
    cta: string;
    popular?: boolean;
}

export const MOVIE_GENRES = ['Action', 'Comedy', 'Drama', 'Sci-Fi', 'Horror', 'Romance', 'Thriller', 'Fantasy', 'Documentary', 'Animation', 'Mystery', 'Western'];
export const VISUAL_STYLES = ['Realistic', 'Cartoon', 'Anime', '3D Animation', 'Hand-drawn', 'Stop Motion', 'Pixel Art', 'Watercolor', 'Noir', 'Cyberpunk'];

export const EXPANDED_CONTENT_TYPES = ['Blog Post', 'Social Media Caption', 'Email Newsletter', 'Press Release', 'Product Description', 'Video Script', 'Twitter Thread', 'LinkedIn Article'];
export const CONTENT_TONES = ['Professional', 'Casual', 'Humorous', 'Enthusiastic', 'Serious', 'Persuasive', 'Inspirational', 'Educational'];

export const COMEDIAN_STYLES = ['Observational', 'Storyteller', 'Deadpan', 'Improv', 'Satirical', 'Physical', 'Surreal', 'Self-deprecating'];
export const AUDIENCE_TYPES = ['Comedy Club', 'Late Night TV', 'Corporate Event', 'College Campus', 'Family Reunion', 'Tech Conference'];

export interface AgentType {
    id: string;
    name: string;
    description: string;
    expertise?: string;
    icon?: React.ReactNode;
    systemInstruction: string;
}

export const AGENT_TYPES: AgentType[] = [
    { id: 'persona', name: 'Persona Agent', description: 'Simulates a specific user persona.', systemInstruction: 'You are a specific user persona.' },
    { id: 'critic', name: 'Critic Agent', description: 'Critiques and improves content.', systemInstruction: 'You are a harsh but fair critic.' },
    { id: 'analyst', name: 'Analyst Agent', description: 'Analyzes data and provides insights.', systemInstruction: 'You are a data analyst.' },
    { id: 'creative', name: 'Creative Agent', description: 'Generates innovative ideas.', systemInstruction: 'You are a creative thinker.' }
];

export const STRANDS_LEAD_AGENTS: AgentType[] = [
    { id: 'visionary', name: 'The Visionary', expertise: 'Big Picture Strategy', icon: '🔭', description: 'Focuses on long-term vision.', systemInstruction: 'You are a visionary brand strategist.' },
    { id: 'pragmatist', name: 'The Pragmatist', expertise: 'Actionable Tactics', icon: '🛠️', description: 'Focuses on execution.', systemInstruction: 'You are a pragmatic marketing strategist.' }
];

export const STRANDS_SPECIALIST_AGENTS = {
    namer: { name: 'Namer', icon: '🏷️', systemInstruction: 'Generate catchy brand names.' },
    copywriter: { name: 'Copywriter', icon: '✍️', systemInstruction: 'Write compelling taglines and copy.' },
    artDirector: { name: 'Art Director', icon: '🎨', systemInstruction: 'Define visual identity.' },
    marketer: { name: 'Marketer', icon: '🚀', systemInstruction: 'Develop marketing angles.' }
};

export const DANCE_STYLES = ['Hip Hop', 'Ballet', 'Salsa', 'Breakdance', 'Tango', 'Robot', 'Contemporary', 'Tap', 'Jazz', 'Swing'];

export const PITCH_SERVICES = ['SEO Optimization', 'Social Media Management', 'Content Creation', 'Web Design', 'Email Marketing', 'PPC Advertising', 'Branding'];

export const MEME_STYLES = ['Classic', 'Dank', 'Wholesome', 'Surreal', 'Corporate', 'Deep Fried', 'Reaction', 'Advice Animal'];

export const SUPPORTED_LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Chinese', 'Japanese', 'Korean', 'Russian', 'Arabic', 'Hindi', 'Dutch', 'Swedish'];

export const SLIDE_DECK_THEMES = ['Modern', 'Corporate', 'Creative', 'Minimalist', 'Tech', 'Nature', 'Dark Mode', 'Colorful'];
export const SLIDE_DECK_AUDIENCES = ['Executives', 'Investors', 'Students', 'General Public', 'Technical Team', 'Marketing Team'];
export const SLIDE_DECK_TONES = ['Professional', 'Inspiring', 'Educational', 'Persuasive', 'Casual'];
export const SLIDE_FORMATS = ['Standard (4:3)', 'Widescreen (16:9)'];
export const CONTENT_LENGTHS = ['Short', 'Medium', 'Long'];
export const REPORT_TYPES = ['Executive Summary', 'Market Research', 'Financial Report', 'Project Status', 'Technical Whitepaper'];
export const INFOGRAPHIC_STYLES = ['Timeline', 'Process', 'Comparison', 'Statistical', 'List', 'Geographic'];

// --- Foundation Model Constants ---
export const IMAGE_ENGINES = [
    'Diffusion Engine v2', 
    'Photoreal Pro (Midjourney-class)', 
    'Typography Engine (Idiogram-class)', 
    'Fast Turbo'
];

export const VIDEO_MODELS = [
    'Veo 3.1 (Standard)', 
    'Veo 3.1 Pro (High-Fidelity)', 
    'Cinematic Render', 
    'Character Animator'
];

export const AUDIO_MODELS = [
    'Speech Synthesis (ElevenLabs-class)', 
    'Music Gen (Suno-class)', 
    'Sound FX Pro'
];

export const TEXT_MODELS = [
    'Creative Writer (GPT-4o)', 
    'Reasoning Core (o1)', 
    'Brand Voice Aligner'
];

export const APP_CATEGORIES = [
    'Social Media', 
    'E-commerce', 
    'Productivity', 
    'Health & Fitness', 
    'Education', 
    'Finance', 
    'Entertainment', 
    'Travel'
];

export const UI_PLATFORMS = [
    'Mobile (iOS)', 
    'Mobile (Android)', 
    'Tablet', 
    'Desktop Web', 
    'Admin Dashboard'
];

export const COUNTRY_CODES = [
    { name: "United States", code: "US", dial_code: "+1", flag: "🇺🇸" },
    { name: "United Kingdom", code: "GB", dial_code: "+44", flag: "🇬🇧" },
    { name: "Canada", code: "CA", dial_code: "+1", flag: "🇨🇦" },
    { name: "India", code: "IN", dial_code: "+91", flag: "🇮🇳" },
    { name: "Australia", code: "AU", dial_code: "+61", flag: "🇦🇺" },
    { name: "Germany", code: "DE", dial_code: "+49", flag: "🇩🇪" },
    { name: "France", code: "FR", dial_code: "+33", flag: "🇫🇷" },
    { name: "Japan", code: "JP", dial_code: "+81", flag: "🇯🇵" },
    { name: "China", code: "CN", dial_code: "+86", flag: "🇨🇳" },
    { name: "Brazil", code: "BR", dial_code: "+55", flag: "🇧🇷" },
    { name: "Mexico", code: "MX", dial_code: "+52", flag: "🇲🇽" },
    { name: "Russia", code: "RU", dial_code: "+7", flag: "🇷🇺" },
    { name: "South Africa", code: "ZA", dial_code: "+27", flag: "🇿🇦" },
    { name: "South Korea", code: "KR", dial_code: "+82", flag: "🇰🇷" },
    { name: "Italy", code: "IT", dial_code: "+39", flag: "🇮🇹" },
    { name: "Spain", code: "ES", dial_code: "+34", flag: "🇪🇸" },
    { name: "Netherlands", code: "NL", dial_code: "+31", flag: "🇳🇱" },
    { name: "Sweden", code: "SE", dial_code: "+46", flag: "🇸🇪" },
    { name: "Switzerland", code: "CH", dial_code: "+41", flag: "🇨🇭" },
    { name: "Turkey", code: "TR", dial_code: "+90", flag: "🇹🇷" },
    { name: "Saudi Arabia", code: "SA", dial_code: "+966", flag: "🇸🇦" },
    { name: "United Arab Emirates", code: "AE", dial_code: "+971", flag: "🇦🇪" },
    { name: "Singapore", code: "SG", dial_code: "+65", flag: "🇸🇬" },
    { name: "Argentina", code: "AR", dial_code: "+54", flag: "🇦🇷" },
    { name: "Nigeria", code: "NG", dial_code: "+234", flag: "🇳🇬" },
    { name: "Kenya", code: "KE", dial_code: "+254", flag: "🇰🇪" },
    { name: "Egypt", code: "EG", dial_code: "+20", flag: "🇪🇬" },
    { name: "Indonesia", code: "ID", dial_code: "+62", flag: "🇮🇩" },
    { name: "Vietnam", code: "VN", dial_code: "+84", flag: "🇻🇳" },
    { name: "Thailand", code: "TH", dial_code: "+66", flag: "🇹🇭" },
    { name: "Philippines", code: "PH", dial_code: "+63", flag: "🇵🇭" },
    { name: "Malaysia", code: "MY", dial_code: "+60", flag: "🇲🇾" },
    { name: "Pakistan", code: "PK", dial_code: "+92", flag: "🇵🇰" },
    { name: "Bangladesh", code: "BD", dial_code: "+880", flag: "🇧🇩" },
];