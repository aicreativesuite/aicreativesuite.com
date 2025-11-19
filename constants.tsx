
import React from 'react';

// --- SVG Icons for UI ---
const CreateIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>;
const AnalyzeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>;
export const AccountIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-4 w-4"} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>;
const ImageGeneratorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3ZM5 19V5H19V19H5ZM16.5 16L13.5 12L10 16.5L7.5 13L5 17.5H19L16.5 16Z" /></svg>;
const ImageEditorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v2h-2V6H8v7h3v2H7z M12 16a1 1 0 0 1-1-1v-2h2v1a1 1 0 0 1-1 1zM18 13.5V12a2 2 0 0 0-2-2h-2v2h2v1.5l2.5-2.5L16 8.5V10h-2V8a2 2 0 0 0-2-2h-1.5l2.5 2.5-2.5 2.5H14a2 2 0 0 0 2 2h2v-1.5z"/></svg>;
const VideoGeneratorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3.5l4 4v-11l-4 4z"/></svg>;
const MovieGeneratorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-2z"/></svg>;
const VoiceChatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z M17.3 11c-.55 0-1 .45-1 1s.45 1 1 1c2.76 0 5-2.24 5-5s-2.24-5-5-5c-.55 0-1 .45-1 1s.45 1 1 1c1.66 0 3 1.34 3 3s-1.34 3-3 3z"/></svg>;
const ChatbotIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>;
const GroundedSearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>;
const MediaAnalyzerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>;
const TextToSpeechIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>;
const AvatarGeneratorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-4.43-.82-6.14-2.88C7.55 15.8 9.68 15 12 15s4.45.8 5.14 2.12C16.43 19.18 14.03 20 12 20z"/></svg>;
const VideoEditorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M2.5 4v3h5v12h3V7h5V4h-13zm19 5h-9v3h3v7h3v-7h3V9z"/></svg>;
const SoundStudioIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 10v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71V6.41c0-.89-1.08-1.34-1.71-.71L7 9H4c-.55 0-1 .45-1 1z M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>;
const SongsGeneratorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>;
const MarketingAssistantIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h4l3 3 3-3h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-5.12 10.88L12 15l-1.88-2.12L6 17h12l-4.12-4.12z"/></svg>;
const ContentGeneratorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z M16 18H8v-2h8v2z m0-4H8v-2h8v2z m-3-5V3.5L18.5 9H13z"/></svg>;
const StandupGeneratorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2M12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8m-5-6h10v2H7z"/></svg>;
const StrandsGeneratorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11.94 2.94a1 1 0 0 0-1.88 0l-1.33 4.02-4.02 1.33a1 1 0 0 0 0 1.88l4.02 1.33 1.33 4.02a1 1 0 0 0 1.88 0l1.33-4.02 4.02-1.33a1 1 0 0 0 0-1.88l-4.02-1.33-1.33-4.02z"/></svg>;
const DanceGeneratorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm-3.5 4.04l2.12-.89.89-2.12C11.87 4.01 12.83 4.3 13 5.14l2.29 9.14 6.13.43c.9.06 1.34 1.21.69 1.85l-4.63 4.63c-.45.45-1.2.59-1.81.33l-4.5-1.93-4.5 1.93c-.61.26-1.36.12-1.81-.33l-4.63-4.63c-.65-.64-.21-1.79.69-1.85l6.13-.43L11 5.14c.17-.84 1.13-1.13 1.5-.1z"/></svg>;
const TrafficBoosterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z M11 7h2v6h-2z m0 8h2v2h-2z"/></svg>;
const AiTrafficBoosterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/></svg>;
const ViralMemeGeneratorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM9.5 15.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm5 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm.36-4.13c-.63.85-1.6 1.38-2.73 1.38s-2.1-.53-2.73-1.38C9.37 11.23 9 10.95 9 10.61c0-.51.64-.81.97-.42.33.39.73.71 1.25.89.33.12.71.12.98 0 .52-.18.92-.5 1.25-.89.33-.39.97-.09.97.42-.01.34-.37.62-.64.76z"/></svg>;
const DomainFinderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39zM20 12c0-4.41-3.59-8-8-8s-8 3.59-8 8 3.59 8 8 8 8-3.59 8-8z"/><path d="M12 14c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/></svg>;
const PodcastGeneratorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>;
const TrendForecasterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>;
export const PricingIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-4 w-4"} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.47-2.45-2.9v-1.2h-1.71v1.11c-1.02.3-1.84 1.15-1.84 2.23 0 1.44 1.23 2.25 2.91 2.65 1.9.45 2.34.94 2.34 1.67 0-.92-.86-1.52-2.14-1.52-1.44 0-2.23.75-2.23 1.51H8.3c.05-1.41.9-2.62 2.6-3.01v-1.2h1.71v1.13c1.02.29 1.84 1.13 1.84 2.23 0 1.44-1.23 2.25-2.91 2.65z"/></svg>;

const IconInitials = ({ initials, color = "#334155" }: { initials: string, color?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="6" fill={color}/>
        <text x="50%" y="55%" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="sans-serif">{initials}</text>
    </svg>
);

// --- Feature Definitions ---
export const FEATURES = [
    { id: 'image-generator', title: 'Image Generator', description: 'Create stunning visuals from text descriptions.', icon: <ImageGeneratorIcon />, category: 'Create & Edit' },
    { id: 'image-editor', title: 'Image Editor', description: 'Edit and transform your images with AI.', icon: <ImageEditorIcon />, category: 'Create & Edit' },
    { id: 'video-generator', title: 'Video Generator', description: 'Generate short video clips from text or images.', icon: <VideoGeneratorIcon />, category: 'Create & Edit' },
    { id: 'podcast-generator', title: 'Podcast Generator', description: 'Turn topics or text into a multi-speaker audio show.', icon: <PodcastGeneratorIcon />, category: 'Create & Edit' },
    { id: 'movie-generator', title: 'Movie Generator', description: 'Pre-production toolkit for your next blockbuster.', icon: <MovieGeneratorIcon />, category: 'Create & Edit' },
    { id: 'voice-chat', title: 'Voice Chat', description: 'Have a real-time voice conversation with an AI.', icon: <VoiceChatIcon />, category: 'Assist & Analyze' },
    { id: 'chatbot', title: 'AI Assistant', description: 'Chat with a knowledgeable AI assistant.', icon: <ChatbotIcon />, category: 'Assist & Analyze' },
    { id: 'grounded-search', title: 'Grounded Search', description: 'Get real-time answers from the web and maps.', icon: <GroundedSearchIcon />, category: 'Assist & Analyze' },
    { id: 'trend-forecaster', title: 'Trend Forecaster', description: 'Analyze market trends with real-time search grounding.', icon: <TrendForecasterIcon />, category: 'Assist & Analyze' },
    { id: 'media-analyzer', title: 'Media Analyzer', description: 'Analyze images, videos, and audio content.', icon: <MediaAnalyzerIcon />, category: 'Assist & Analyze' },
    { id: 'text-to-speech', title: 'Text-to-Speech', description: 'Convert text into natural-sounding speech.', icon: <TextToSpeechIcon />, category: 'Create & Edit' },
    { id: 'avatar-generator', title: 'Avatar Generator', description: 'Create custom avatars and profile pictures.', icon: <AvatarGeneratorIcon />, category: 'Create & Edit' },
    { id: 'video-editor', title: 'Video Editor', description: 'Create and extend video sequences.', icon: <VideoEditorIcon />, category: 'Create & Edit' },
    { id: 'sound-studio', title: 'Sound Studio', description: 'Generate speech, SFX, and music ideas.', icon: <SoundStudioIcon />, category: 'Create & Edit' },
    { id: 'songs-generator', title: 'Songs Generator', description: 'Compose lyrics, chords, and song concepts.', icon: <SongsGeneratorIcon />, category: 'Create & Edit' },
    { id: 'marketing-assistant', title: 'Marketing Assistant', description: 'Your AI partner for marketing strategies.', icon: <MarketingAssistantIcon />, category: 'Assist & Analyze' },
    { id: 'content-generator', title: 'Content Generator', description: 'Expand short ideas into long-form content.', icon: <ContentGeneratorIcon />, category: 'Create & Edit' },
    { id: 'standup-generator', title: 'Standup Generator', description: 'Create a full standup comedy set with an AI comedian.', icon: <StandupGeneratorIcon />, category: 'Create & Edit' },
    { id: 'strands-generator', title: 'Strands Generator', description: 'Use a team of AI agents to build a brand identity.', icon: <StrandsGeneratorIcon />, category: 'Assist & Analyze' },
    { id: 'dance-generator', title: 'Dance Generator', description: 'Generate videos of characters performing various dances.', icon: <DanceGeneratorIcon />, category: 'Create & Edit' },
    { id: 'traffic-booster', title: 'Traffic Booster', description: 'Find local businesses and generate AI-powered pitches to offer your services.', icon: <TrafficBoosterIcon />, category: 'Assist & Analyze' },
    { id: 'ai-traffic-booster', title: 'AI Traffic Booster', description: 'Generate comprehensive strategies to capture organic traffic.', icon: <AiTrafficBoosterIcon />, category: 'Assist & Analyze' },
    { id: 'viral-meme-generator', title: 'Viral Meme Generator', description: 'Create the next trending meme video.', icon: <ViralMemeGeneratorIcon />, category: 'Create & Edit' },
    { id: 'domain-finder', title: 'Domain & Hosting', description: 'Find creative domain names and free hosting options.', icon: <DomainFinderIcon />, category: 'Assist & Analyze' },
];

export type FeatureId = typeof FEATURES[number]['id'] | 'pricing' | 'profile-settings';

export const CATEGORY_DETAILS: Record<string, { icon: React.ReactElement }> = {
    'Create & Edit': { icon: <CreateIcon /> },
    'Assist & Analyze': { icon: <AnalyzeIcon /> },
    'Account': { icon: <AccountIcon /> },
};

// --- Traffic Booster / Sharing ---
export type PlatformCategory = 'Photo & Art' | 'Video & Live' | 'Social & Micro' | 'Messaging' | 'Blogs & News' | 'Communities' | 'Virtual & Games' | 'Dating' | 'Reviews & Food' | 'Fitness' | 'Location';

export interface Platform {
    name: string;
    icon: React.ReactElement;
    category: PlatformCategory;
    shareUrl?: (url: string, text: string, type: 'image' | 'video' | 'text' | 'audio') => string;
}

const defaultShare = (url: string, text: string) => `#`; // Placeholder for no web share

export const PLATFORMS: Platform[] = [
    // --- Photo & Art ---
    { name: 'Instagram', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M17.25,5.5A1.25,1.25 0 0,1 18.5,6.75A1.25,1.25 0 0,1 17.25,8A1.25,1.25 0 0,1 16,6.75A1.25,1.25 0 0,1 17.25,5.5M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z" /></svg>, category: 'Photo & Art', shareUrl: defaultShare },
    { name: 'Pinterest', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 9,21.5C9.07,20.95 9,20.27 9.15,19.77L9.83,17.2C9.83,17.2 9.5,16.58 9.5,15.81C9.5,14.42 10.45,13.2 11.6,13.2C12.6,13.2 13.03,13.91 13.03,14.64C13.03,15.45 12.4,16.7 11.9,17.44C11.45,18.1 12.06,19.5 12.92,19.5C14.5,19.5 15.82,17.76 15.82,15.14C15.82,12.85 14.1,11.1 11.83,11.1C9.2,11.1 7.63,13.25 7.63,15.53C7.63,16.41 8,17.21 8.38,17.76C8.5,17.91 8.5,18.06 8.44,18.25L8.2,19.14C8.15,19.33 7.91,19.41 7.73,19.26C6.35,18.15 5.5,16.27 5.5,14.28C5.5,10.74 8.42,8 12.23,8C16.41,8 19.5,11.12 19.5,14.8C19.5,18.57 17.2,21.5 13.6,21.5C12.35,21.5 11.18,20.89 10.8,20.12L10.33,21.89C10.23,22.31 9.94,22.47 9.53,22.39C5.3,21.29 2.19,17.5 2.19,12.81C2.19,7.17 6.62,2.5 12.28,2.5C12.19,2.33 12.1,2.17 12,2Z" /></svg>, category: 'Photo & Art', shareUrl: (url, text) => `https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(text)}` },
    { name: 'Lemon8', icon: <IconInitials initials="L8" color="#facc15" />, category: 'Photo & Art', shareUrl: defaultShare },
    { name: 'VSCO', icon: <IconInitials initials="VS" />, category: 'Photo & Art', shareUrl: defaultShare },
    { name: 'Flickr', icon: <IconInitials initials="FL" color="#2563eb" />, category: 'Photo & Art', shareUrl: defaultShare },
    { name: '500px', icon: <IconInitials initials="500" />, category: 'Photo & Art', shareUrl: defaultShare },
    { name: 'Behance', icon: <IconInitials initials="Be" color="#175de8" />, category: 'Photo & Art', shareUrl: defaultShare },
    { name: 'DeviantArt', icon: <IconInitials initials="DA" color="#059669" />, category: 'Photo & Art', shareUrl: defaultShare },
    { name: 'FamilyAlbum', icon: <IconInitials initials="FA" />, category: 'Photo & Art', shareUrl: defaultShare },
    { name: 'GuruShots', icon: <IconInitials initials="GS" />, category: 'Photo & Art', shareUrl: defaultShare },

    // --- Video & Live ---
    { name: 'YouTube', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10,15L15.19,12L10,9V15M21.56,7.17C21.69,7.64 21.78,8.27 21.84,9.07C21.91,9.87 21.94,10.56 21.94,11.16L22,12C22,14.19 21.84,15.8 21.56,16.83C21.31,17.73 20.73,18.31 19.83,18.56C19.36,18.69 18.73,18.78 17.93,18.84C17.13,18.91 16.44,18.94 15.84,18.94L15,19C12.81,19 11.2,18.84 10.17,18.56C9.27,18.31 8.69,17.73 8.44,16.83C8.31,16.36 8.22,15.73 8.16,14.93C8.09,14.13 8.06,13.44 8.06,12.84L8,12C8,9.81 8.16,8.2 8.44,7.17C8.69,6.27 9.27,5.69 10.17,5.44C11.2,5.16 12.81,5 15,5L15.84,5.06C16.44,5.06 17.13,5.09 17.93,5.16C18.73,5.22 19.36,5.31 19.83,5.44C20.73,5.69 21.31,6.27 21.56,7.17Z" /></svg>, category: 'Video & Live', shareUrl: defaultShare },
    { name: 'TikTok', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.1,10.2L14.3,10.6C14.2,9.6 13.9,8.7 13.3,8L14,7.1C15.1,8 15.8,9 16.1,10.2M10,12.3V14.3H8V12.4C8,11.3 8.3,10.4 9,9.7L9.8,10.5C9.3,11 9,11.6 9,12.3H10M17,14.3H15V12.3C15,11.5 14.8,10.8 14.3,10.2L15,9.4C16,10.2 17,11.7 17,14.3M12,11.3C11.9,10.3 11.6,9.4 11.1,8.6L11.8,7.8C12.6,8.5 13,9.5 13,10.5V11.3H12M11,15.5V17H9V15.5H11M14,15.5H16V17H14V15.5M12.5,4.5A0.5,0.5 0 0,1 13,5V10.8C13,11.4 12.8,12 12.4,12.4C12,12.8 11.4,13 10.8,13H8.5V15.5H12.5A0.5,0.5 0 0,1 13,16A0.5,0.5 0 0,1 12.5,16.5H8.5A0.5,0.5 0 0,1 8,16V13C8,12.7 8.1,12.5 8.3,12.3C8.5,12.1 8.7,12 9,12H10.8C11.1,12 11.3,11.9 11.5,11.7C11.7,11.5 11.8,11.3 11.8,11V5A0.5,0.5 0 0,1 12.5,4.5M6.4,7.1L7.1,8C6.6,8.7 6.2,9.6 6.1,10.6L4.3,10.2C4.6,9 5.3,8 6.4,7.1M10.9,17.9L10.2,18.7C9.3,17.8 8.7,16.7 8.3,15.5H10.1C10.4,16.4 10.6,17.2 10.9,17.9M13.2,18.7L12.4,17.9C12.7,17.2 13,16.4 13.2,15.5H15C14.6,16.7 14,17.8 13.2,18.7Z" /></svg>, category: 'Video & Live', shareUrl: defaultShare },
    { name: 'Twitch', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11.64 5.93h1.43v4.28h-1.43m3.93-4.28h1.43v4.28h-1.43M7 2L3.43 5.57v12.86h4.28V22l3.58-3.57h2.85L20.57 12V2m-1.43 9.29l-2.85 2.85h-2.86l-2.5 2.5v-2.5H7.71V3.43h11.43Z" /></svg>, category: 'Video & Live', shareUrl: defaultShare },
    { name: 'BIGO LIVE', icon: <IconInitials initials="BL" color="#00a1d6" />, category: 'Video & Live', shareUrl: defaultShare },
    { name: 'Kick', icon: <IconInitials initials="Ki" color="#53fc18" />, category: 'Video & Live', shareUrl: defaultShare },
    { name: 'Kwai', icon: <IconInitials initials="Kw" color="#ff6600" />, category: 'Video & Live', shareUrl: defaultShare },
    { name: 'Moj', icon: <IconInitials initials="Mo" color="#ffd700" />, category: 'Video & Live', shareUrl: defaultShare },
    { name: 'Likee', icon: <IconInitials initials="Li" color="#ec407a" />, category: 'Video & Live', shareUrl: defaultShare },

    // --- Social & Micro ---
    { name: 'Facebook', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 12 2.04Z" /></svg>, category: 'Social & Micro', shareUrl: (url, text) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}` },
    { name: 'X (Twitter)', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>, category: 'Social & Micro', shareUrl: (url, text) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}` },
    { name: 'LinkedIn', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19,3A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3H19M8.5,7H5.5V17H8.5V7M12.25,7H9.25V17H12.25V12.25C12.25,11.36 12.5,10.5 13.6,10.5C14.7,10.5 15,11.25 15,12.25V17H18V11C18,8.75 16.25,7 14,7C12.75,7 12.25,7.75 12.25,7.75V7Z" /></svg>, category: 'Social & Micro', shareUrl: (url, text) => `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}&summary=${encodeURIComponent(text)}` },
    { name: 'Threads', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.02c-5.51 0-9.98 4.47-9.98 9.98s4.47 9.98 9.98 9.98 9.98-4.47 9.98-9.98S17.51 2.02 12 2.02zm0 17.13c-3.95 0-7.15-3.2-7.15-7.15s3.2-7.15 7.15-7.15c1.95 0 3.73.79 5.03 2.07l-2.01 2.01c-.76-.76-1.81-1.23-2.97-1.23-2.35 0-4.25 1.91-4.25 4.25s1.9 4.25 4.25 4.25c1.53 0 2.86-.82 3.6-2.04h2.66c-.93 2.71-3.51 4.69-6.5 4.69z"/></svg>, category: 'Social & Micro', shareUrl: defaultShare },
    { name: 'Bluesky', icon: <IconInitials initials="BS" color="#0085ff" />, category: 'Social & Micro', shareUrl: defaultShare },
    { name: 'Mastodon', icon: <IconInitials initials="M" color="#6364ff" />, category: 'Social & Micro', shareUrl: defaultShare },
    { name: 'Nextdoor', icon: <IconInitials initials="ND" color="#00b246" />, category: 'Social & Micro', shareUrl: defaultShare },
    { name: 'BeReal', icon: <IconInitials initials="BR" />, category: 'Social & Micro', shareUrl: defaultShare },
    { name: 'Yubo', icon: <IconInitials initials="Yu" color="#ffc107" />, category: 'Social & Micro', shareUrl: defaultShare },
    { name: 'HOWBOUT', icon: <IconInitials initials="HB" />, category: 'Social & Micro', shareUrl: defaultShare },
    { name: 'Yik Yak', icon: <IconInitials initials="YY" color="#06b6d4" />, category: 'Social & Micro', shareUrl: defaultShare },
    { name: 'Weverse', icon: <IconInitials initials="We" color="#00d38f" />, category: 'Social & Micro', shareUrl: defaultShare },

    // --- Messaging ---
    { name: 'WhatsApp', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.31 3.44 16.74L2.03 21.86L7.31 20.48C8.66 21.29 10.28 21.75 12.04 21.75C17.5 21.75 21.95 17.3 21.95 11.84C21.95 9.31 20.95 7.04 19.21 5.3C17.47 3.56 15.19 2.56 12.56 2.56L12.04 2M12.04 3.63C16.56 3.63 20.24 7.22 20.24 11.84C20.24 16.46 16.56 20.05 12.04 20.05C10.45 20.05 8.95 19.64 7.64 18.91L7.25 18.7L4.03 19.59L4.93 16.45L4.72 16.05C3.93 14.74 3.53 13.18 3.53 11.81C3.53 7.19 7.21 3.63 12.04 3.63M9.64 6.95C9.44 6.95 9.24 6.95 9.07 7.14C8.9 7.34 8.23 7.96 8.23 9.07C8.23 10.18 9.07 11.21 9.24 11.41C9.41 11.61 10.47 13.25 12.18 13.97C13.89 14.69 14.28 14.52 14.73 14.47C15.18 14.42 16.15 13.89 16.35 13.31C16.55 12.73 16.55 12.25 16.45 12.11C16.35 11.97 16.18 11.91 15.91 11.78C15.64 11.64 14.44 11.06 14.21 10.96C13.98 10.86 13.81 10.83 13.64 11.03C13.48 11.23 13.06 11.68 12.93 11.85C12.79 12.02 12.66 12.05 12.43 11.95C12.19 11.85 11.44 11.61 10.53 10.79C9.82 10.15 9.31 9.34 9.14 9.07C8.97 8.81 9.11 8.67 9.24 8.54C9.35 8.42 9.48 8.25 9.61 8.11C9.74 7.98 9.78 7.88 9.84 7.74C9.91 7.61 9.84 7.47 9.78 7.34C9.71 7.21 9.64 6.95 9.64 6.95Z" /></svg>, category: 'Messaging', shareUrl: (url, text) => `https://api.whatsapp.com/send?text=${encodeURIComponent(text + '\n' + url)}` },
    { name: 'Messenger', icon: <IconInitials initials="Me" color="#0084ff" />, category: 'Messaging', shareUrl: defaultShare },
    { name: 'Telegram', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.75-.33 1.42.2 1.17 1.33l-2.75 12.93c-.19.88-.67.97-1.29.61l-3.61-2.63-1.75 1.67c-.2.19-.36.33-.55.33l.24-2.97z"/></svg>, category: 'Messaging', shareUrl: (url, text) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}` },
    { name: 'Snapchat', icon: <IconInitials initials="Sn" color="#fffc00" />, category: 'Messaging', shareUrl: defaultShare },
    { name: 'Discord', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08 0-.1c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09 0 .1c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12z"/></svg>, category: 'Messaging', shareUrl: defaultShare },
    { name: 'Signal', icon: <IconInitials initials="Si" color="#3a76f0" />, category: 'Messaging', shareUrl: defaultShare },
    { name: 'WeChat', icon: <IconInitials initials="WC" color="#7bb32e" />, category: 'Messaging', shareUrl: defaultShare },
    { name: 'LINE', icon: <IconInitials initials="LN" color="#00c300" />, category: 'Messaging', shareUrl: defaultShare },
    { name: 'Imo', icon: <IconInitials initials="Im" />, category: 'Messaging', shareUrl: defaultShare },
    { name: 'Viber', icon: <IconInitials initials="Vi" color="#7360f2" />, category: 'Messaging', shareUrl: defaultShare },
    { name: 'TALK', icon: <IconInitials initials="TK" />, category: 'Messaging', shareUrl: defaultShare },
    { name: 'NGL', icon: <IconInitials initials="NGL" color="#ff0055" />, category: 'Messaging', shareUrl: defaultShare },
    { name: 'WIZZ', icon: <IconInitials initials="WZ" color="#ffb700" />, category: 'Messaging', shareUrl: defaultShare },
    { name: 'Kik', icon: <IconInitials initials="Kk" color="#82bc00" />, category: 'Messaging', shareUrl: defaultShare },
    { name: 'Ten Ten', icon: <IconInitials initials="10" />, category: 'Messaging', shareUrl: defaultShare },
    { name: 'Email', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.532 60.532 0 0021.056-10.151.75.75 0 000-1.172A60.533 60.533 0 003.478 2.405z" /></svg>, category: 'Messaging', shareUrl: (url, text) => `mailto:?subject=Check this out&body=${encodeURIComponent(text + '\n\n' + url)}` },
    { name: 'SMS', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm2.5 4a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm5 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm5 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" /></svg>, category: 'Messaging', shareUrl: (url, text) => `sms:?body=${encodeURIComponent(text + ' ' + url)}` },

    // --- Blogs & News ---
    { name: 'Reddit', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>, category: 'Communities', shareUrl: (url, text) => `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}` },
    { name: 'Tumblr', icon: <IconInitials initials="Tu" color="#36465d" />, category: 'Blogs & News', shareUrl: defaultShare },
    { name: 'Quora', icon: <IconInitials initials="Qu" color="#b92b27" />, category: 'Communities', shareUrl: defaultShare },
    { name: 'Medium', icon: <IconInitials initials="Me" color="#000000" />, category: 'Blogs & News', shareUrl: defaultShare },
    { name: 'Substack', icon: <IconInitials initials="Su" color="#ff6719" />, category: 'Blogs & News', shareUrl: defaultShare },

    // --- Virtual & Games ---
    { name: 'ZEPETO', icon: <IconInitials initials="ZP" />, category: 'Virtual & Games', shareUrl: defaultShare },
    { name: 'IMVU', icon: <IconInitials initials="IM" />, category: 'Virtual & Games', shareUrl: defaultShare },
    { name: 'Avakin Life', icon: <IconInitials initials="AL" />, category: 'Virtual & Games', shareUrl: defaultShare },

    // --- Dating ---
    { name: 'Tinder', icon: <IconInitials initials="Ti" color="#fe3c72" />, category: 'Dating', shareUrl: defaultShare },
    { name: 'Bumble', icon: <IconInitials initials="Bu" color="#ffc629" />, category: 'Dating', shareUrl: defaultShare },
    { name: 'Hinge', icon: <IconInitials initials="Hi" />, category: 'Dating', shareUrl: defaultShare },
    { name: 'Grindr', icon: <IconInitials initials="Gr" color="#1c1c1e" />, category: 'Dating', shareUrl: defaultShare },
    { name: 'Badoo', icon: <IconInitials initials="Ba" color="#7839fd" />, category: 'Dating', shareUrl: defaultShare },
    { name: 'Match', icon: <IconInitials initials="Ma" color="#0054a6" />, category: 'Dating', shareUrl: defaultShare },
    { name: 'POF', icon: <IconInitials initials="PF" />, category: 'Dating', shareUrl: defaultShare },
    { name: 'Hily', icon: <IconInitials initials="Hy" />, category: 'Dating', shareUrl: defaultShare },
    { name: 'Feeld', icon: <IconInitials initials="Fe" />, category: 'Dating', shareUrl: defaultShare },
    { name: 'PURE', icon: <IconInitials initials="Pu" />, category: 'Dating', shareUrl: defaultShare },
    { name: 'BLK', icon: <IconInitials initials="BL" />, category: 'Dating', shareUrl: defaultShare },
    { name: 'Omi', icon: <IconInitials initials="Om" />, category: 'Dating', shareUrl: defaultShare },
    { name: 'Happn', icon: <IconInitials initials="Ha" />, category: 'Dating', shareUrl: defaultShare },

    // --- Reviews & Food ---
    { name: 'Letterboxd', icon: <IconInitials initials="Lb" color="#40bcf4" />, category: 'Reviews & Food', shareUrl: defaultShare },
    { name: 'Goodreads', icon: <IconInitials initials="GR" color="#754f23" />, category: 'Reviews & Food', shareUrl: defaultShare },
    { name: 'Tripadvisor', icon: <IconInitials initials="TA" color="#00af87" />, category: 'Reviews & Food', shareUrl: defaultShare },
    { name: 'Yelp', icon: <IconInitials initials="Ye" color="#d32323" />, category: 'Reviews & Food', shareUrl: defaultShare },
    { name: 'Vivino', icon: <IconInitials initials="Vi" color="#a61a3e" />, category: 'Reviews & Food', shareUrl: defaultShare },
    { name: 'Discogs', icon: <IconInitials initials="Di" />, category: 'Reviews & Food', shareUrl: defaultShare },
    { name: 'Beli', icon: <IconInitials initials="Be" />, category: 'Reviews & Food', shareUrl: defaultShare },
    { name: 'Product Hunt', icon: <IconInitials initials="PH" color="#da552f" />, category: 'Reviews & Food', shareUrl: defaultShare },

    // --- Fitness ---
    { name: 'Strava', icon: <IconInitials initials="St" color="#fc4c02" />, category: 'Fitness', shareUrl: defaultShare },
    { name: 'Nike Run', icon: <IconInitials initials="NR" />, category: 'Fitness', shareUrl: defaultShare },
    { name: 'Peloton', icon: <IconInitials initials="Pe" color="#df1c2f" />, category: 'Fitness', shareUrl: defaultShare },
    { name: 'AllTrails', icon: <IconInitials initials="AT" color="#428a13" />, category: 'Fitness', shareUrl: defaultShare },
    { name: 'Runna', icon: <IconInitials initials="Ru" />, category: 'Fitness', shareUrl: defaultShare },
    { name: 'LIFTOFF', icon: <IconInitials initials="LO" />, category: 'Fitness', shareUrl: defaultShare },

    // --- Location ---
    { name: 'Life360', icon: <IconInitials initials="360" color="#440099" />, category: 'Location', shareUrl: defaultShare },
    { name: 'BUMP', icon: <IconInitials initials="Bu" />, category: 'Location', shareUrl: defaultShare },
    { name: 'Glympse', icon: <IconInitials initials="Gl" color="#ff6f00" />, category: 'Location', shareUrl: defaultShare },
    { name: 'Find My', icon: <IconInitials initials="FM" color="#34c759" />, category: 'Location', shareUrl: defaultShare },
];

// --- Traffic Booster ---
export const PITCH_SERVICES = [
    "APP Designing",
    "Brand Promotion",
    "Email Marketing",
    "Job Services / Recruitment",
    "Products Sales",
    "SEO Services",
    "SMS Marketing",
    "Social Media Management",
    "Voice Marketing (Phone Scripts)",
    "Website Designing",
].sort();

// --- Pricing ---
export type Plan = {
    name: string;
    price: {
        monthly: number | 'Free' | 'Custom';
        yearly: number | 'Free' | 'Custom';
    };
    features: string[];
    cta: string;
    popular?: boolean;
};

// --- Image Generator ---
export const ASPECT_RATIOS = ["1:1", "3:4", "4:3", "9:16", "16:9"];
export const DESIGN_STYLES = [
    "Abstract", "Abstract Expressionism", "Afrofuturism", "Art Deco", "Art Nouveau", "Aurora UI", "Bauhaus", "Biopunk", "Blueprint drawing", "Brutalist", "Cartoon", "Chalkboard drawing", "Claymation aesthetic", "Collage", "Comic Book Style", "Constructivism", "Cottagecore", "Cyberpunk", "Dadaism", "Dark Academia", "Dark Mode UI", "Deconstructivism", "Digital Art", "Diorama", "Flat Design", "Frutiger Aero", "Futurism", "Glassmorphism", "Glitch Art", "Goblincore", "Gothic Architecture", "Grunge", "Infographic", "International Typographic Style", "Isometric", "Kirigami", "Letterpress aesthetic", "Light Academia", "Low Poly", "Lunarpunk", "Manga/Anime", "Memphis Design", "Minimalist", "Modernist Architecture", "Neumorphism", "Op Art", "Papercraft", "Parametricism", "Photorealistic", "Pop Art", "Psychedelic", "Risograph Print", "Rococo", "Saul Bass style poster", "Screenprint aesthetic", "Skeuomorphism", "Solarpunk", "Steampunk", "Suprematism", "Surrealism", "Swiss Style", "Synthwave", "Tattoo art style", "Technical Illustration", "Vaporwave", "Victorian Architecture", "Vintage", "Y2K UI aesthetic", "Zine culture aesthetic"
].sort();
export const ART_TECHNIQUES_BY_DESIGN: Record<string, string[]> = {
    "Photorealistic": ["High-resolution Photography", "Macro Photography", "Portrait Photography"],
    "Digital Art": ["3D Render", "Concept Art", "Illustration", "Pixel Art", "Vector Art"],
    "Minimalist": [],
    "Abstract": [],
    "Vintage": ["Sepia Tone", "Black and White", "Film Grain", "Daguerreotype"],
    "Comic Book Style": ["Cel Shading", "Line Art", "Halftone"],
    "Manga/Anime": ["Cel Shading", "Line Art"],
};
export const ARTISTIC_STYLES = [
    "Abstract Expressionism", "American Realism", "Art Deco", "Australian Aboriginal Dot Painting", "Baroque", "Byzantine Iconography", "Celtic Knotwork", "Charcoal sketch", "Chinese Ink Wash Painting", "Cinematic", "Cubism", "Dalí style", "Expressionism", "Fantasy", "Fauvism", "Film Noir", "Fresco", "Frida Kahlo style", "Gothic", "Gouache painting", "H.R. Giger style", "Hayao Miyazaki style", "Hudson River School", "Impressionism", "Islamic Geometric Patterns", "Linocut print", "Mannerism", "Mayan Glyphs", "Minimalism", "Moebius style", "Monet style", "Neoclassicism", "None", "Oil painting", "Pastel drawing", "Pen and ink drawing", "Picasso style", "Pointillism", "Pop Art", "Post-Impressionism", "Pre-Raphaelite", "Realism", "Renaissance", "Romanticism", "Sci-Fi", "Street Art", "Surrealism", "Symbolism", "Synthwave Aesthetic", "Tenebrism", "Tim Burton style", "Ukiyo-e", "Van Gogh style", "Watercolor painting", "Wes Anderson style", "Woodcut print", "Zdzisław Beksiński style"
].sort();

// --- Image Editor ---
export const IMAGE_EDIT_SUGGESTIONS = [
    "Add a dramatic, cinematic filter",
    "Make the colors more vibrant and pop",
    "Change the background to a futuristic city",
    "Turn this into a cartoon or anime style",
    "Apply a vintage, black and white film effect",
    "Make it look like a watercolor painting"
];

// --- Video Generator ---
export const VIDEO_ASPECT_RATIOS = ["16:9", "9:16"];
export const VEO_LOADING_MESSAGES = [
    "Warming up the video generators...",
    "Rendering the first few frames...",
    "This can take a minute, great things are worth the wait!",
    "Compositing visual effects...",
    "Finalizing the video stream..."
];

// --- Avatar Generator ---
export const AVATAR_HAIR_COLORS = ['any color', 'black', 'brown', 'blonde', 'red', 'blue', 'pink', 'white'];
export const AVATAR_EYE_COLORS = ['any color', 'brown', 'blue', 'green', 'hazel', 'grey'];
export const AVATAR_CLOTHING_STYLES = [
    '1950s greaser jacket', '1960s mod dress', '1970s disco suit', '1980s power suit', '1990s grunge flannel', 'Academic robes', 'African dashiki', 'Alien ambassador robes', 'Ancient Egyptian linen', 'Android\'s minimalist suit', 'any style', 'Artist\'s smock', 'astronaut suit', 'athletic wear', 'Baroque gown', 'beachwear', 'Biker leathers', 'bohemian chic', 'business casual', 'casual wear', 'Chef\'s uniform', 'Chinese qipao', 'Construction worker vest', 'Cottagecore dress', 'cyberpunk gear', 'Dark Academia blazer', 'detective trench coat', 'Doctor\'s scrubs', 'Dwarven mithril armor', 'E-girl outfit', 'Elizabethan ruff collar dress', 'Elven silk robes', 'fantasy armor', 'Firefighter gear', 'formal suit', 'Galactic bounty hunter armor', 'gothic lolita dress', 'Goth trench coat', 'Hip hop streetwear', 'Indian sari', 'Japanese kimono', 'Judge\'s robes', 'Korean hanbok', 'Light Academia sweater', 'Maasai shuka', 'mage robes', 'Medieval knight armor', 'Mexican charro suit', 'Musician\'s concert attire', 'Native American buckskin', 'ninja garb', 'Orcish war leathers', 'pilot uniform', 'pirate costume', 'Police uniform', 'post-apocalyptic rags', 'Punk rock leather jacket', 'Rave outfit', 'Regency era dress', 'Renaissance doublet and hose', 'roaring twenties fashion', 'Rockabilly dress', 'Roman toga', 'royal robes', 'Russian ushanka and coat', 'samurai armor', 'sci-fi suit', 'Scientist\'s lab coat', 'Scottish kilt', 'Skater apparel', 'Spanish flamenco dress', 'Starship captain uniform', 'steampunk attire', 'superhero costume', 'Time traveler\'s eclectic outfit', 'Vietnamese Ao Dai', 'viking leathers', 'victorian era clothing', 'Wild West gunslinger attire', 'winter gear', 'wizard robes', 'Zookeeper uniform'
].sort();
export const AVATAR_EXPRESSIONS = [
    'agitated', 'alarmed', 'angry', 'anxious', 'appalled', 'beaming', 'betrayed', 'bitter', 'blissful', 'bored', 'confused', 'confident', 'contemplative', 'content', 'coy', 'crestfallen', 'cunning', 'curious', 'cynical', 'dejected', 'defiant', 'demure', 'despairing', 'desolate', 'determined', 'disgusted', 'distressed', 'drained', 'dreamy', 'dubious', 'ecstatic', 'elated', 'embarrassed', 'enigmatic', 'enthusiastic', 'euphoric', 'exasperated', 'fearful', 'flirty', 'frustrated', 'furious', 'gleeful', 'grim', 'guilty', 'haughty', 'heartbroken', 'hopeful', 'horrified', 'hostile', 'humiliated', 'humble', 'indignant', 'infuriated', 'insecure', 'intrigued', 'irate', 'irritated', 'jealous', 'joyful', 'jubilant', 'knowing', 'lighthearted', 'lonely', 'longing', 'malevolent', 'meditative', 'melancholic', 'mischievous', 'miserable', 'morose', 'neutral', 'nostalgic', 'outraged', 'paranoid', 'peaceful', 'pensive', 'perplexed', 'pessimistic', 'petrified', 'playful', 'proud', 'puzzled', 'radiant', 'rapturous', 'regretful', 'relieved', 'remorseful', 'resentful', 'revolted', 'sad', 'satisfied', 'serene', 'serious', 'sheepish', 'shy', 'skeptical', 'sleepy', 'smiling', 'smirking', 'smug', 'sorrowful', 'spiteful', 'stoic', 'stubborn', 'sullen', 'surprised', 'suspicious', 'terrified', 'threatened', 'thoughtful', 'thrilled', 'triumphant', 'uncertain', 'vengeful', 'winking', 'withdrawn', 'wistful', 'worried', 'yearning', 'zealous'
].sort();

// --- Video Editor ---
export const VIDEO_EXTENSION_SUGGESTIONS = [
    "then it starts to rain",
    "and then the camera zooms out",
    "and a magical portal opens",
    "revealing something unexpected",
];

// --- Sound Studio / TTS ---
export const SOUND_EFFECT_CATEGORIES = ["Sci-Fi", "Fantasy", "Nature", "Urban", "Cartoon"];
export const MUSIC_STYLES = ["Orchestral", "Electronic", "Acoustic", "Rock", "Hip Hop", "Ambient"];
export const TTS_VOICES = ["Kore", "Puck", "Charon", "Zephyr", "Fenrir"];

// --- Songs Generator ---
export const MUSIC_GENRES = [
    "Acid Jazz", "Afrobeat", "Alternative", "Ambient", "Anti-Folk", "Baroque Pop", "Bebop", "Black Metal", "Bluegrass", "Blues", "Boom Bap", "Bossa Nova", "Britpop", "Chiptune", "Classical", "Cloud Rap", "Conscious Hip Hop", "Cool Jazz", "Country", "Death Metal", "Disco", "Doom Metal", "Downtempo", "Drill", "Drum and Bass", "Dubstep", "Electronic", "Emo", "Fado", "Folk", "Folk Rock", "Free Jazz", "Funk", "G-Funk", "Gabber", "Garage Rock", "Gospel", "Grunge", "Hard Bop", "Hard Rock", "Hardcore", "Heavy Metal", "Highlife", "Hip Hop", "House", "IDM", "Indie Rock", "Industrial Rock", "J-Pop", "Jazz", "Jazz Fusion", "K-Pop", "Lo-fi Hip Hop", "Mariachi", "Metal", "Mumble Rap", "Musical Theatre", "Neofolk", "New Wave", "Noise Rock", "Nu Metal", "Pop", "Post-Punk", "Post-Rock", "Power Metal", "Progressive Rock", "Psychedelic Folk", "Psychedelic Rock", "Punk", "R&B", "Reggae", "Rock", "Salsa", "Samba", "Screamo", "Shoegaze", "Ska", "Soul", "Southern Rock", "Spoken Word", "Swing", "Symphonic Metal", "Synth-pop", "Synthwave", "Techno", "Thrash Metal", "Trance", "Trap", "UK Garage", "Vaporwave"
].sort();
export const MUSIC_MOODS = ["Happy", "Sad", "Energetic", "Relaxing", "Epic", "Romantic", "Melancholic", "Upbeat"];

// --- Movie Generator ---
export const MOVIE_GENRES = [
    "Action", "Acid Western", "Adventure", "Alien Invasion Film", "Avant-garde Film", "Biopunk", "Biopic", "Black Comedy", "Body Horror", "Coming-of-Age Story", "Comedy", "Conspiracy Thriller", "Contained Action", "Cosmic Horror", "Costume Drama", "Courtroom Drama", "Cyberpunk", "Dark Comedy", "Detective", "Disaster", "Drama", "Dystopian", "Erotic Thriller", "Experimental Film", "Family Saga", "Fantasy", "Farce", "Film Noir", "First Contact Story", "Folk Horror", "Found Footage Horror", "Giallo", "Gothic Horror", "Heist", "Horror", "J-Horror", "K-Drama", "Kaiju Film", "Legal Drama", "Lovecraftian Horror", "Martial Arts Film", "Medical Drama", "Melodrama", "Military Science Fiction", "Mockumentary", "Musical", "Mystery", "Neo-Noir", "Parody Film", "Period Drama", "Political Drama", "Political Thriller", "Post-Apocalyptic Film", "Psychological Thriller", "Road Movie", "Rock Musical", "Romantic Comedy", "Satire Film", "Science Fiction", "Screwball Comedy", "Slapstick Comedy", "Slasher", "Space Opera", "Spaghetti Western", "Spy Film", "Steampunk", "Superhero", "Supernatural Horror", "Swashbuckler Film", "Tech-noir", "Thriller", "Time Travel Film", "Urban Fantasy", "Vampire Film", "War", "Werewolf Film", "Western", "Zombie Apocalypse"
].sort();
export const VISUAL_STYLES = [
    "16mm film look", "2D Animation", "8mm film look", "Anamorphic widescreen", "Anime", "Black and White", "Bleach bypass", "Blue hour lighting", "Bollywood spectacle", "Bullet time effect", "CGI Animation", "Chiaroscuro", "Cinematic", "Claymation", "Cross-processing", "Deep focus", "Documentary", "Dogme 95", "Double exposure", "Dutch angle", "Fisheye lens", "Found Footage", "French New Wave", "German Expressionism", "Glitch Aesthetic", "Golden hour lighting", "Grainy film stock", "Gritty Realism", "Handheld/Shaky Cam", "High-key lighting", "Italian Neorealism", "Lens flare aesthetic", "Lo-fi", "Long take", "Low-key lighting", "Matte painting", "Monochrome", "Muted Palette", "Neo-Noir", "Neon-drenched", "One-shot", "Rotoscoping", "Saturated Colors", "Sepia tone", "Shallow depth of field", "Silent film aesthetic", "Silhouette", "Slow motion", "Soviet Montage", "Split screen", "Stop Motion", "Super 8 look", "Surrealist", "Teal and orange color grade", "Technicolor", "Time-lapse", "VHS aesthetic"
].sort();
export const DIRECTOR_STYLES_DESCRIPTIVE = [
    { name: 'Wes Anderson', value: 'symmetrical, quirky, and meticulously detailed with a distinct color palette' },
    { name: 'Quentin Tarantino', value: 'stylized, non-linear, with sharp dialogue and pop culture references' },
    { name: 'Christopher Nolan', value: 'complex narratives, practical effects, and a grand, serious tone' },
    { name: 'Hayao Miyazaki', value: 'hand-drawn, whimsical, and detailed with themes of nature and humanism' },
];

// --- Content Generator ---
export const EXPANDED_CONTENT_TYPES = [
    "Affiliate Marketing Guide", "Annual Report Summary", "API Reference Guide", "App Store Description", "Blog Post", "Book Review", "Brand Guidelines Document", "Case Study", "Character Backstory", "Comic Book Script", "Competitor Analysis Report", "Cover Letter", "Customer Testimonial", "D&D Campaign Outline", "Detailed Article", "E-book Chapter", "Eulogy", "FAQ Section", "Film Review", "Forum Post", "Grant Proposal", "How-To Guide", "Installation Guide", "Investor Pitch Deck", "Job Description", "Landing Page Copy", "LinkedIn Article", "Literature Review", "Marketing Email", "Movie Treatment", "Newsletter", "Novel Chapter Outline", "Onboarding Manual", "Online Course Module", "Op-Ed Piece", "Personal Bio", "Personal Essay", "Playwright Scene", "Podcast Script", "Poem", "Presentation Slides", "Press Release", "Privacy Policy Draft", "Product Description", "Product Hunt Launch Copy", "Quora Answer", "Recipe Card", "Reddit Post", "Research Paper Abstract", "Resignation Letter", "Sales Script", "Scientific Journal Article summary", "Screenplay Scene", "SEO Meta Descriptions", "Short Story", "Social Media Thread", "Song Lyrics", "Speech", "SWOT Analysis", "Technical Documentation", "Terms of Service Draft", "Thesis Statement", "Travel Diary Entry", "Troubleshooting Guide", "Tutorial", "User Manual", "Video Game Quest Dialogue", "Video Script", "Wedding Vow", "Website About Us Page", "White Paper", "Workshop Outline", "World-building Document"
].sort();
export const CONTENT_TONES = ["Professional", "Casual", "Enthusiastic", "Humorous", "Academic", "Technical"];

// --- Standup Generator ---
export const COMEDIAN_STYLES = [
    "Absurdist", "Aggressive", "Anecdotal", "Anxious", "Arrogant", "Blue Collar", "Callback-heavy", "Character Comedy", "Confessional", "Cringe Comedy", "Cynical", "Dark Humor", "Dry/Deadpan", "Energetic", "Family-focused", "Folksy", "Geek Culture", "Historical", "Impressionist", "Improvisational", "Insult Comedy", "Intellectual", "Manic", "Meta-comedy", "Musical Comedy", "Nerd Culture", "Observational", "One-liner", "Optimistic", "Philosophical", "Political", "Prop Comedy", "Rambling", "Relationship-based", "Satirical", "Self-deprecating", "Shaggy Dog Story", "Storytelling", "Surreal", "Understated", "Ventriloquism", "Vulnerable", "Whimsical"
].sort();
export const AUDIENCE_TYPES = ["Comedy Club", "Corporate Event", "College Campus", "Theater", "Bar Show"];

// --- Strands Generator ---
export const STRANDS_LEAD_AGENTS = [
    { id: 'balanced', name: 'Balanced', expertise: 'A versatile, all-around strategist.', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z" /></svg>, systemInstruction: 'You are an AI brand strategist. Your job is to create a well-rounded and appealing brand identity. Be clear, creative, and professional.' },
    { id: 'disruptor', name: 'Disruptor', expertise: 'A bold agent for edgy, modern brands.', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3v6h-2V3h2m4.83 2.17l-1.42 1.42C17.97 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.03-4.14 2.58-5.42L6.17 5.17C4.22 6.84 3 9.25 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.75-1.22-5.16-3.17-6.83z" /></svg>, systemInstruction: 'You are an AI brand disruptor. Your job is to create a brand that is bold, unconventional, and challenges the status quo. Be edgy and provocative.' },
];
export const STRANDS_SPECIALIST_AGENTS = {
    namer: { name: 'Namer', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6.5 10h-2v7h2v-7zm6 0h-2v7h2v-7zm8.5 0h-2v7h2v-7zm-4.5 0h-2v7h2v-7zM20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" /></svg>, systemInstruction: 'You are an expert AI Namer. Your sole job is to generate catchy, memorable, and available-sounding brand names based on the provided brand essence.' },
    copywriter: { name: 'Copywriter', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h4l3 3 3-3h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-5.12 10.88L12 15l-1.88-2.12L6 17h12l-4.12-4.12z" /></svg>, systemInstruction: 'You are a master AI Copywriter. You create punchy taglines and engaging social media posts based on the brand essence.' },
    artDirector: { name: 'Art Director', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM6 3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM6 15c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg>, systemInstruction: 'You are a visionary AI Art Director. You define the complete visual identity, including logo concepts, color palettes, and typography, from the brand essence.' },
    marketer: { name: 'Marketer', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>, systemInstruction: 'You are a strategic AI Marketer. Your job is to analyze the brand essence and propose unique, effective marketing angles and campaign ideas.' },
};

// --- Dance Generator ---
export const DANCE_STYLES = [
    "Acro Dance", "Ballet", "Ballroom", "Belly Dance", "Bolero", "Bollywood", "Breakdancing", "Butoh", "Capoeira", "Cha-cha", "Charleston", "Contemporary", "Contact Improvisation", "Contra Dance", "Cossack Dance", "Dougie", "Dragon Dance", "Flamenco", "Foxtrot", "Galliard", "Griddy", "Gumboot Dance", "Hip Hop", "House Dance", "Hula", "Irish Step Dance", "Jazz", "Jerkin'", "Jive", "Kathakali", "Kecak", "Krumping", "Litefeet", "Locking", "Lyrical Dance", "Mambo", "Minuet", "Modern", "Moonwalk", "Morris Dance", "Paso Doble", "Pavane", "Polka", "Popping", "Quickstep", "Robot Dance", "Rumba", "Salsa", "Samba", "Schuhplattler", "Shuffle", "Sufi Whirling", "Swing", "Tango", "Tap Dance", "The Floss", "The Renegade", "Tinikling", "Turfing", "Tutting", "Twerking", "Voguing", "Waacking", "Waltz"
].sort();

// --- Viral Meme Generator ---
export const MEME_STYLES = [
    "2012-era (Rage comics)", "Anti-meme", "Bone Hurting Juice", "Brainlet", "Chad vs. Virgin", "Classic", "Compressed", "Cringe", "Cursed", "Dank", "Dark Humor", "Deep Fried", "Demotivational Poster", "Distracted Boyfriend format", "Drakeposting format", "Exploitable Comic", "Fandom-specific", "Format-based", "History meme", "Image Macro", "Ironic", "Low-quality", "Me and the boys format", "Motivational", "Nobody format", "Nostalgic", "Okay Boomer", "Programming meme", "Reaction", "Relatable", "Schizoposting", "Science meme", "Sigma Male", "Soyjak", "Starter Pack", "Surreal", "TikTok trend", "Throwback", "Vine-era humor", "Wholesome", "Wojak"
].sort();
