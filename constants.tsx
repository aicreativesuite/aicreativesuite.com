
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
];

export type FeatureId = typeof FEATURES[number]['id'] | 'pricing' | 'profile-settings';

export const CATEGORY_DETAILS: Record<string, { icon: React.ReactElement }> = {
    'Create & Edit': { icon: <CreateIcon /> },
    'Assist & Analyze': { icon: <AnalyzeIcon /> },
    'Account': { icon: <AccountIcon /> },
};

// --- Platform Types for TrafficBooster ---
export type PlatformCategory = 'Social & Micro' | 'Video & Streaming' | 'Professional & Blogs' | 'Messaging & Chat';

export interface Platform {
    name: string;
    icon: React.ReactElement;
    category: PlatformCategory;
    shareUrl?: (url: string, text: string, type: 'image' | 'video' | 'text' | 'audio') => string;
}

// --- Platforms ---
const TwitterIcon = () => <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>;
const FacebookIcon = () => <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
const LinkedInIcon = () => <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;

export const PLATFORMS: Platform[] = [
    { name: 'Twitter / X', icon: <TwitterIcon />, category: 'Social & Micro', shareUrl: (url, text) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}` },
    { name: 'Facebook', icon: <FacebookIcon />, category: 'Social & Micro', shareUrl: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { name: 'LinkedIn', icon: <LinkedInIcon />, category: 'Professional & Blogs', shareUrl: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
    { name: 'Email', icon: <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>, category: 'Messaging & Chat', shareUrl: (url, text) => `mailto:?body=${encodeURIComponent(text + ' ' + url)}` },
    { name: 'Reddit', icon: <div className="font-bold text-lg">Rd</div>, category: 'Social & Micro', shareUrl: (url, text) => `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}` },
    { name: 'Pinterest', icon: <div className="font-bold text-lg">Pn</div>, category: 'Social & Micro', shareUrl: (url, text) => `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(text)}` },
    { name: 'WhatsApp', icon: <div className="font-bold text-lg">WA</div>, category: 'Messaging & Chat', shareUrl: (url, text) => `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}` },
];

// --- Image Generator Constants ---
export const DESIGN_STYLES = ['Photorealistic', 'Anime', 'Digital Art', 'Oil Painting', 'Watercolor', 'Cyberpunk', 'Steampunk', 'Sketch', '3D Render', 'Pop Art', 'Origami', 'Pixel Art', '3D Cinema', '4D Cinema', '5D Cinema', '6D Cinema', '7D Cinema', '8D Cinema', '9D Cinema', 'XD Cinema'];
export const VISUAL_EFFECTS = ['None', 'Cinematic Lighting', 'Lens Flare', 'Bokeh', 'Film Grain', 'Motion Blur', 'Ray Tracing', 'Fog/Mist', 'Rain', 'Snow', 'Sparks', 'Glow', 'HDR', 'Chromatic Aberration'];
export const ASPECT_RATIOS = ['1:1', '4:3', '3:4', '16:9', '9:16'];
export const ARTISTIC_STYLES = ['None', 'Minimalist', 'Surreal', 'Abstract', 'Vintage', 'Gothic', 'Baroque', 'Impressionist'];
export const ART_TECHNIQUES_BY_DESIGN: Record<string, string[]> = {
    'Photorealistic': ['Macro Photography', 'Wide Angle', 'Telephoto', 'Bokeh'],
    'Digital Art': ['Vector', 'Raster', 'Voxel'],
    'Oil Painting': ['Impasto', 'Glazing', 'Alla Prima'],
    'Watercolor': ['Wet on Wet', 'Dry Brush', 'Wash'],
};

// --- Image Editor ---
export const IMAGE_EDIT_SUGGESTIONS = ["Make it cybernetic", "Add a sunset background", "Turn into a sketch", "Add neon lights", "Make it underwater", "Remove background"];

// --- Video Generator ---
export const VIDEO_ASPECT_RATIOS = ['16:9', '9:16'];
export const VEO_LOADING_MESSAGES = [
    "Analyzing prompt...",
    "Generating frames...",
    "Enhancing motion...",
    "Rendering video...",
    "Finalizing output..."
];

// --- Avatar Generator ---
export const AVATAR_HAIR_COLORS = ['any color', 'blonde', 'brown', 'black', 'red', 'grey', 'white', 'blue', 'pink', 'green', 'purple'];
export const AVATAR_EYE_COLORS = ['any color', 'blue', 'brown', 'green', 'hazel', 'grey', 'amber'];
export const AVATAR_CLOTHING_STYLES = ['any style', 'casual', 'formal', 'business', 'sportswear', 'fantasy', 'sci-fi', 'historical'];
export const AVATAR_EXPRESSIONS = ['neutral', 'happy', 'sad', 'angry', 'surprised', 'serious', 'laughing'];

// --- Video Editor ---
export const VIDEO_EXTENSION_SUGGESTIONS = ["Zoom in", "Pan left", "Pan right", "Tilt up", "Tilt down", "Fade out"];

// --- Sound Studio ---
export const SOUND_EFFECT_CATEGORIES = ['Sci-Fi', 'Nature', 'Urban', 'Horror', 'Cartoon', 'UI', 'Weapon', 'Vehicle'];
export const MUSIC_STYLES = ['Cinematic', 'Rock', 'Pop', 'Jazz', 'Electronic', 'Classical', 'Ambient', 'Hip Hop'];
export const TTS_VOICES = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr', 'Aoede'];

// --- Pricing ---
export interface Plan {
    name: string;
    price: { monthly: number | string; yearly: number | string };
    features: string[];
    cta: string;
    popular?: boolean;
}

// --- Movie Generator ---
export const MOVIE_GENRES = ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'Western'];
export const VISUAL_STYLES = ['Noir', 'Wes Anderson-esque', 'Cyberpunk', 'Gothic', 'Pastel', 'Gritty Realism', 'High Fantasy'];
export const DIRECTOR_STYLES_DESCRIPTIVE = [
    { name: 'Christopher Nolan', value: 'Complex, time-bending, practical effects' },
    { name: 'Wes Anderson', value: 'Symmetrical, pastel colors, quirky' },
    { name: 'Quentin Tarantino', value: 'Stylized violence, sharp dialogue, non-linear' },
    { name: 'Tim Burton', value: 'Gothic, dark fantasy, eccentric' },
    { name: 'Greta Gerwig', value: 'Humanistic, warm, dialogue-driven' }
];

// --- Content Generator ---
export const EXPANDED_CONTENT_TYPES = ['Blog Post', 'Social Media Caption', 'Email Newsletter', 'Press Release', 'Video Script', 'Product Description'];
export const CONTENT_TONES = ['Professional', 'Casual', 'Humorous', 'Enthusiastic', 'Formal', 'Persuasive', 'Empathetic'];

// --- Standup Generator ---
export const COMEDIAN_STYLES = ['Observational', 'Anecdotal', 'Deadpan', 'Improvisational', 'Satire', 'Slapstick'];
export const AUDIENCE_TYPES = ['Comedy Club', 'Theater', 'Corporate Event', 'Late Night Show', 'Zoom Call'];

// --- Strands Generator ---
export const STRANDS_LEAD_AGENTS = [
    { id: 'innovator', name: 'The Innovator', expertise: 'Disruptive Tech & Modern solutions', icon: '🚀', systemInstruction: 'You are a visionary strategist focusing on innovation and disruption.' },
    { id: 'classic', name: 'The Classicist', expertise: 'Timeless Luxury & Trust', icon: '🏛️', systemInstruction: 'You are a brand strategist focusing on heritage, trust, and timeless value.' },
    { id: 'pop', name: 'The Pop Icon', expertise: 'Viral Trends & Youth Culture', icon: '✨', systemInstruction: 'You are a trend-savvy strategist focusing on what is viral, youthful, and energetic.' }
];

export const STRANDS_SPECIALIST_AGENTS = {
    namer: { name: 'Namer', icon: '🏷️', systemInstruction: 'Generate creative, memorable, and available brand names.' },
    copywriter: { name: 'Copywriter', icon: '✍️', systemInstruction: 'Write punchy, persuasive, and on-brand copy.' },
    artDirector: { name: 'Art Director', icon: '🎨', systemInstruction: 'Define visual identities, color palettes, and logo concepts.' },
    marketer: { name: 'Marketer', icon: '📢', systemInstruction: 'Develop go-to-market strategies and campaign angles.' }
};

// --- Dance Generator ---
export const DANCE_STYLES = ['Ballet', 'Hip Hop', 'Salsa', 'Tango', 'Breakdance', 'Robot', 'Contemporary', 'Disco'];

// --- Songs Generator ---
export const MUSIC_GENRES = ['Pop', 'Rock', 'Jazz', 'Classical', 'Hip Hop', 'Electronic', 'Country', 'R&B', 'Folk', 'Metal'];
export const MUSIC_MOODS = ['Happy', 'Sad', 'Energetic', 'Relaxed', 'Romantic', 'Angry', 'Mysterious', 'Inspiring'];

// --- Traffic Booster ---
export const PITCH_SERVICES = ['SEO Optimization', 'Social Media Management', 'Web Design', 'Content Creation', 'Email Marketing', 'Paid Advertising'];

// --- Viral Meme Generator ---
export const MEME_STYLES = ['Classic (Top/Bottom Text)', 'Modern (Twitter style)', 'Surreal', 'Wholesome', 'Deep Fried', 'Corporate', 'Dank'];