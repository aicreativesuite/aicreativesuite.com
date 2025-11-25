
import React from 'react';

// --- SVG Icons for UI ---
const CreateIcon = ({className, ...props}: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-4 w-4"} viewBox="0 0 20 20" fill="currentColor" {...props}><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>;
const AnalyzeIcon = ({className, ...props}: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-4 w-4"} viewBox="0 0 20 20" fill="currentColor" {...props}><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>;
export const AccountIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-4 w-4"} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>;
export const PricingIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-4 w-4"} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" /></svg>;

const ImageGeneratorIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3ZM5 19V5H19V19H5ZM16.5 16L13.5 12L10 16.5L7.5 13L5 17.5H19L16.5 16Z" /></svg>;
const ImageEditorIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M7 14a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v2h-2V6H8v7h3v2H7z M12 16a1 1 0 0 1-1-1v-2h2v1a1 1 0 0 1-1 1zM18 13.5V12a2 2 0 0 0-2-2h-2v2h2v1.5l2.5-2.5L16 8.5V10h-2V8a2 2 0 0 0-2-2h-1.5l2.5 2.5-2.5 2.5H14a2 2 0 0 0 2 2h2v-1.5z"/></svg>;
const VideoGeneratorIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M17 10.5V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3.5l4 4v-11l-4 4z"/></svg>;
const MovieGeneratorIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-2z"/></svg>;
const VoiceChatIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z M17.3 11c-.55 0-1 .45-1 1s.45 1 1 1c2.76 0 5-2.24 5-5s-2.24-5-5-5c-.55 0-1 .45-1 1s.45 1 1 1c1.66 0 3 1.34 3 3s-1.34 3-3 3z"/></svg>;
const ChatbotIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>;
const GroundedSearchIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>;
const MediaAnalyzerIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14"/></svg>;
const TextToSpeechIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>;
const AvatarIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>;
const VideoEditorIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-2zM8 16c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1s1 .45 1 1v4c0 .55-.45 1-1 1zm6 0c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1s1 .45 1 1v4c0 .55-.45 1-1 1z"/></svg>;
const SoundStudioIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/></svg>;
const MusicIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55c-2.21 0-4 1.79-4 4s1.79 4 4 4s4-1.79 4-4V7h4V3h-6z"/></svg>;
const MarketingIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>;
const ContentIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>;
const StandupIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>;
const BrandIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 2L1 21h22L12 2zm0 3.8L19.3 19H4.7L12 5.8zM11 16h2v2h-2v-2zm0-6h2v4h-2v-4z"/></svg>;
const DanceIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm-3.5 4.04l2.12-.89.89-2.12C11.87 4.01 12.83 4.3 13 5.14l2.29 9.14 6.13.43c.9.06 1.34 1.21.69 1.85l-4.63 4.63c-.45.45-1.2.59-1.81.33l-4.5-1.93-4.5 1.93c-.61.26-1.36.12-1.81-.33l-4.63-4.63c-.65-.64-.21-1.79.69-1.85l6.13-.43L11 5.14c.17-.84 1.13-1.13 1.5-.1z"/></svg>;
const PitchIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/></svg>;
const StrategyIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-10 2h3v2h-3V5zm-5 2h3v4H6V7zm0 6h3v4H6v-4zm5 0h3v4h-3v-4zm5-6h3v10h-3V7zm-5-2h3v2h-3V5z"/></svg>;
const MemeIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M9 11.75c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zm6 0c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-.29.02-.58.05-.86 2.36-1.05 4.23-2.98 5.21-5.37C11.07 8.33 14.05 10 17.42 10c.78 0 1.53-.09 2.25-.26.21 1.01.33 2.05.33 3.12 0 4.41-3.59 8-8 8z"/></svg>;
const PodcastIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3zM7 9a1 1 0 0 0-1 1v2a6 6 0 0 0 5 5.91V21h2v-3.09A6 6 0 0 0 18 12v-2a1 1 0 0 0-1-1h-1a1 1 0 0 0-1 1v2a4 4 0 0 1-4 4 4 4 0 0 1-4-4v-2a1 1 0 0 0-1-1H7z"/></svg>;
const TrendIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>;
const ProductionIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M4 6h16v2H4zm2 4h12v2H6zm2 4h8v2H8zm-4 4h16v2H4z"/></svg>;
const GlobalAvatarIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>;
const QuizIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>;
const SlideDeckIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"/></svg>;

// --- Feature Configuration ---
export const FEATURES = [
    { id: 'image-generator', title: 'Image Generator', description: 'Create stunning images from text prompts.', category: 'Create & Edit', icon: <ImageGeneratorIcon /> },
    { id: 'image-editor', title: 'Image Editor', description: 'Edit and refine your images with AI.', category: 'Create & Edit', icon: <ImageEditorIcon /> },
    { id: 'slide-deck', title: 'Slide Deck Generator', description: 'Create comprehensive slide decks, reports, and visual aids.', category: 'Create & Edit', icon: <SlideDeckIcon /> },
    { id: 'video-generator', title: 'Video Generator', description: 'Turn text and images into captivating videos.', category: 'Create & Edit', icon: <VideoGeneratorIcon /> },
    { id: 'global-avatar', title: 'Global Avatar Creator', description: 'Create multilingual speaking avatars.', category: 'Create & Edit', icon: <GlobalAvatarIcon /> },
    { id: 'podcast-generator', title: 'Podcast Generator', description: 'Turn text into engaging audio shows.', category: 'Create & Edit', icon: <PodcastIcon /> },
    { id: 'movie-generator', title: 'Movie Concept Creator', description: 'Develop movie ideas, scripts, and visuals.', category: 'Create & Edit', icon: <MovieGeneratorIcon /> },
    { id: 'smart-quiz', title: 'Smart Quiz Generator', description: 'Turn any topic into a gamified quiz.', category: 'Assist & Analyze', icon: <QuizIcon /> },
    { id: 'voice-chat', title: 'Voice Chat', description: 'Have real-time voice conversations with AI.', category: 'Assist & Analyze', icon: <VoiceChatIcon /> },
    { id: 'chatbot', title: 'AI Assistant', description: 'Chat with a helpful AI for any task.', category: 'Assist & Analyze', icon: <ChatbotIcon /> },
    { id: 'grounded-search', title: 'Grounded Search', description: 'Get real-time, fact-checked information.', category: 'Assist & Analyze', icon: <GroundedSearchIcon /> },
    { id: 'trend-forecaster', title: 'Trend Forecaster', description: 'Predict future trends with real-time data.', category: 'Assist & Analyze', icon: <TrendIcon /> },
    { id: 'media-analyzer', title: 'Media Analyzer', description: 'Analyze images, videos, and audio files.', category: 'Assist & Analyze', icon: <MediaAnalyzerIcon /> },
    { id: 'text-to-speech', title: 'Text to Speech', description: 'Convert text into lifelike speech.', category: 'Create & Edit', icon: <TextToSpeechIcon /> },
    { id: 'avatar-generator', title: 'Avatar Generator', description: 'Create custom character avatars.', category: 'Create & Edit', icon: <AvatarIcon /> },
    { id: 'video-editor', title: 'Video Editor', description: 'Extend and edit your generated videos.', category: 'Create & Edit', icon: <VideoEditorIcon /> },
    { id: 'sound-studio', title: 'Sound Studio', description: 'Generate sound effects and voiceovers.', category: 'Create & Edit', icon: <SoundStudioIcon /> },
    { id: 'songs-generator', title: 'Songwriter', description: 'Compose lyrics and musical concepts.', category: 'Create & Edit', icon: <MusicIcon /> },
    { id: 'marketing-assistant', title: 'Marketing Agent', description: 'Generate copy, strategy, and campaigns.', category: 'Assist & Analyze', icon: <MarketingIcon /> },
    { id: 'content-generator', title: 'Content Generator', description: 'Expand ideas into full articles or posts.', category: 'Create & Edit', icon: <ContentIcon /> },
    { id: 'standup-generator', title: 'Standup Comedy', description: 'Create AI comedy routines and videos.', category: 'Create & Edit', icon: <StandupIcon /> },
    { id: 'strands-generator', title: 'Brand Strands', description: 'Develop comprehensive brand identities.', category: 'Create & Edit', icon: <BrandIcon /> },
    { id: 'dance-generator', title: 'Dance Generator', description: 'Create dance videos with AI characters.', category: 'Create & Edit', icon: <DanceIcon /> },
    { id: 'traffic-booster', title: 'Lead Finder', description: 'Find local businesses and generate pitches.', category: 'Assist & Analyze', icon: <PitchIcon /> },
    { id: 'ai-traffic-booster', title: 'Strategy Generator', description: 'Create comprehensive growth strategies.', category: 'Assist & Analyze', icon: <StrategyIcon /> },
    { id: 'viral-meme-generator', title: 'Viral Meme Maker', description: 'Create viral video memes from topics.', category: 'Create & Edit', icon: <MemeIcon /> },
    { id: 'production-planner', title: 'Production Planner', description: 'Tools for film and video production.', category: 'Assist & Analyze', icon: <ProductionIcon /> },
] as const;

export type FeatureId = typeof FEATURES[number]['id'] | 'pricing' | 'profile-settings';

export const CATEGORY_DETAILS: Record<string, { icon: React.ReactElement }> = {
    'Create & Edit': { icon: <CreateIcon /> },
    'Assist & Analyze': { icon: <AnalyzeIcon /> },
};

// --- Constants for individual features ---

// Image Generator
export const DESIGN_STYLES = ['Photorealistic', 'Anime', 'Digital Art', 'Oil Painting', 'Cyberpunk', 'Steampunk', 'Watercolor', 'Sketch', '3D Render', 'Pixel Art', 'Vector Art', 'Abstract', 'Minimalist', 'Pop Art', 'Gothic', 'Fantasy', 'Sci-Fi', 'Retro', 'Vintage', 'Noir'];
export const ASPECT_RATIOS = ['1:1', '16:9', '9:16', '4:3', '3:4'];
export const ART_TECHNIQUES_BY_DESIGN: { [key: string]: string[] } = {
    'Photorealistic': ['Macro Photography', 'Wide Angle', 'Portrait', 'Long Exposure', 'Bokeh', 'Cinematic Lighting'],
    'Oil Painting': ['Impressionist', 'Realism', 'Abstract Expressionism', 'Pointillism', 'Renaissance'],
    'Digital Art': ['Matte Painting', 'Concept Art', 'Low Poly', 'Voxel Art', 'Glitch Art'],
    'Sketch': ['Charcoal', 'Pencil', 'Ink', 'Technical Drawing', 'Storyboard'],
    'Watercolor': ['Wet on Wet', 'Dry Brush', 'Wash', 'Splatter'],
};
export const ARTISTIC_STYLES = ['None', 'Surrealism', 'Cubism', 'Art Nouveau', 'Baroque', 'Bauhaus', 'Dadaism', 'Expressionism', 'Fauvism', 'Futurism', 'Impressionism', 'Minimalism', 'Modernism', 'Neoclassicism', 'Op Art', 'Pop Art', 'Post-Impressionism', 'Realism', 'Renaissance', 'Rococo', 'Romanticism', 'Symbolism'];
export const VISUAL_EFFECTS = ['None', 'Cinematic Lighting', 'Volumetric Lighting', 'Bioluminescence', 'Neon Glow', 'Lens Flare', 'Chromatic Aberration', 'Vignette', 'Film Grain', 'Double Exposure', 'HDR', 'Ray Tracing', 'Global Illumination'];
export const BACKGROUND_OPTIONS = [
    { label: 'None / Simple', value: '' },
    { label: 'Studio Lighting', value: 'in a professional studio with 3-point lighting' },
    { label: 'Nature / Outdoors', value: 'in a lush forest with sunlight filtering through trees' },
    { label: 'Urban / City', value: 'in a busy cyberpunk city street at night with neon signs' },
    { label: 'Space / Sci-Fi', value: 'on a futuristic space station overlooking a nebula' },
    { label: 'Abstract / Artistic', value: 'against a backdrop of swirling abstract colors' },
];

// Image Editor
export const IMAGE_EDIT_SUGGESTIONS = ["Make it sunset", "Add snow", "Change background to a beach", "Make it a painting", "Add a red hat", "Remove the background", "Convert to sketch", "Add fireworks", "Make it cyberpunk style", "Add rain"];

// Video Generator
export const VIDEO_ASPECT_RATIOS = ['16:9', '9:16'];
export const VEO_LOADING_MESSAGES = [
    "Dreaming up the scene...",
    "Directing the actors...",
    "Setting up the lighting...",
    "Rendering pixels...",
    "Polishing the frames...",
    "Almost ready for the premiere..."
];
export const VIDEO_EXTENSION_SUGGESTIONS = ["Zoom in", "Pan left", "Pan right", "Tilt up", "Tilt down", "Add an explosion", "Change lighting to sunset", "Make it rain"];

// Avatar Generator
export const AVATAR_HAIR_COLORS = ['brown', 'blonde', 'black', 'red', 'white', 'grey', 'blue', 'green', 'pink', 'purple', 'multicolored', 'any color'];
export const AVATAR_EYE_COLORS = ['brown', 'blue', 'green', 'hazel', 'grey', 'amber', 'violet', 'red', 'heterochromia', 'any color'];
export const AVATAR_CLOTHING_STYLES = ['casual', 'formal', 'business', 'fantasy', 'sci-fi', 'steampunk', 'cyberpunk', 'vintage', 'streetwear', 'sportswear', 'any style'];
export const AVATAR_EXPRESSIONS = ['neutral', 'happy', 'sad', 'angry', 'surprised', 'fearful', 'disgusted', 'contemptuous', 'excited', 'thoughtful', 'confused'];

// Sound Studio
export const SOUND_EFFECT_CATEGORIES = ['Sci-Fi', 'Nature', 'Urban', 'Horror', 'Cartoon', 'Foley', 'UI/Interface', 'Weapons', 'Vehicles'];
export const MUSIC_STYLES = ['Cinematic', 'Electronic', 'Rock', 'Jazz', 'Classical', 'Hip Hop', 'Ambient', 'Folk', 'Pop', 'Reggae'];
export const TTS_VOICES = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'];

// Songs Generator
export const MUSIC_GENRES = ['Pop', 'Rock', 'Hip Hop', 'Jazz', 'Classical', 'Electronic', 'Country', 'R&B', 'Reggae', 'Folk', 'Blues', 'Metal'];
export const MUSIC_MOODS = ['Happy', 'Sad', 'Energetic', 'Relaxed', 'Romantic', 'Angry', 'Fearful', 'Suspenseful', 'Melancholic', 'Upbeat', 'Dreamy'];

// Content Generator
export const EXPANDED_CONTENT_TYPES = ['Blog Post', 'Social Media Post', 'Email Newsletter', 'Press Release', 'Video Script', 'Product Description', 'Short Story', 'Poem', 'Essay', 'Technical Documentation'];
export const CONTENT_TONES = ['Professional', 'Casual', 'Humorous', 'Enthusiastic', 'Persuasive', 'Informative', 'Inspirational', 'Dramatic', 'Witty', 'Sarcastic'];

// Slide Deck Generator
export const SLIDE_DECK_THEMES = ['Modern', 'Corporate', 'Creative', 'Minimalist', 'Tech', 'Nature', 'Dark', 'Playful'];
export const SLIDE_DECK_AUDIENCES = ['Investors', 'Students', 'Colleagues', 'General Public', 'Experts', 'Children'];
export const SLIDE_DECK_TONES = ['Professional', 'Inspirational', 'Educational', 'Persuasive', 'Casual', 'Humorous'];
export const SLIDE_FORMATS = ['Detailed Deck', 'Presentation Slides'];
export const CONTENT_LENGTHS = ['Short', 'Default', 'Long'];
export const REPORT_TYPES = ['Executive Summary', 'Technical Report', 'Whitepaper', 'Case Study', 'Memo'];
export const INFOGRAPHIC_STYLES = ['Timeline', 'Process Flow', 'Comparison', 'Data Visualization', 'Anatomical'];
export const SUPPORTED_LANGUAGES = [
    "Abkhaz", "Afar", "Afrikaans", "Akan", "Albanian", "Amharic", "Arabic", "Aragonese", "Armenian", "Assamese", 
    "Avaric", "Avestan", "Aymara", "Azerbaijani", "Bambara", "Bashkir", "Basque", "Belarusian", "Bengali", "Bihari", 
    "Bislama", "Bosnian", "Breton", "Bulgarian", "Burmese", "Catalan", "Chamorro", "Chechen", "Chichewa", "Chinese", 
    "Chuvash", "Cornish", "Corsican", "Cree", "Croatian", "Czech", "Danish", "Divehi", "Dutch", "Dzongkha", "English", 
    "Esperanto", "Estonian", "Ewe", "Faroese", "Fijian", "Finnish", "French", "Fula", "Galician", "Ganda", "Georgian", 
    "German", "Greek", "Guarani", "Gujarati", "Haitian", "Hausa", "Hebrew", "Herero", "Hindi", "Hiri Motu", "Hungarian", 
    "Icelandic", "Ido", "Igbo", "Indonesian", "Interlingua", "Interlingue", "Inuktitut", "Inupiaq", "Irish", "Italian", 
    "Japanese", "Javanese", "Kalaallisut", "Kannada", "Kanuri", "Kashmiri", "Kazakh", "Khmer", "Kikuyu", "Kinyarwanda", 
    "Kirghiz", "Komi", "Kongo", "Korean", "Kurdish", "Kwanyama", "Lao", "Latin", "Latvian", "Limburgish", "Lingala", 
    "Lithuanian", "Luba-Katanga", "Luxembourgish", "Macedonian", "Malagasy", "Malay", "Malayalam", "Maltese", "Manx", 
    "Maori", "Marathi", "Marshallese", "Mongolian", "Nauru", "Navajo", "Ndebele", "Ndonga", "Nepali", "North Ndebele", 
    "Northern Sami", "Norwegian", "Norwegian Bokmal", "Norwegian Nynorsk", "Nuosu", "Occitan", "Ojibwa", "Oriya", "Oromo", 
    "Ossetian", "Pali", "Pashto", "Persian", "Polish", "Portuguese", "Punjabi", "Quechua", "Romanian", "Romansh", "Rundi", 
    "Russian", "Samoan", "Sango", "Sanskrit", "Sardinian", "Scottish Gaelic", "Serbian", "Shona", "Sindhi", "Sinhala", 
    "Slovak", "Slovenian", "Somali", "Sotho", "Spanish", "Sundanese", "Swahili", "Swati", "Swedish", "Tagalog", "Tahitian", 
    "Tajik", "Tamil", "Tatar", "Telugu", "Thai", "Tibetan", "Tigrinya", "Tonga", "Tsonga", "Tswana", "Turkish", "Turkmen", 
    "Twi", "Uighur", "Ukrainian", "Urdu", "Uzbek", "Venda", "Vietnamese", "Volapuk", "Walloon", "Welsh", "Western Frisian", 
    "Wolof", "Xhosa", "Yiddish", "Yoruba", "Zhuang", "Zulu"
];

// Movie Generator
export const MOVIE_GENRES = ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'Western', 'Documentary', 'Musical'];
export const VISUAL_STYLES = ['Noir', 'Cyberpunk', 'Steampunk', 'Minimalist', 'Surrealist', 'Hyperrealistic', 'Vintage', 'Gothic', 'Wes Anderson-esque', 'Tim Burton-esque', 'Ghibli-esque', 'Pixar-esque'];
export const DIRECTOR_STYLES_DESCRIPTIVE = [
    { name: 'Christopher Nolan', value: 'complex narrative structures, practical effects, grand scale' },
    { name: 'Wes Anderson', value: 'symmetrical composition, pastel color palettes, quirky characters' },
    { name: 'Quentin Tarantino', value: 'non-linear storytelling, stylized violence, sharp dialogue' },
    { name: 'Tim Burton', value: 'gothic atmosphere, quirky characters, dark fantasy elements' },
    { name: 'Hayao Miyazaki', value: 'lush environments, fantastical creatures, strong female protagonists' },
    { name: 'Denis Villeneuve', value: 'atmospheric tension, minimalist visuals, philosophical themes' },
    { name: 'Greta Gerwig', value: 'intimate character studies, naturalistic dialogue, warm visuals' },
    { name: 'Jordan Peele', value: 'social commentary, psychological horror, suspenseful atmosphere' },
];

// Standup Generator
export const COMEDIAN_STYLES = ['Observational', 'Satirical', 'Dark Comedy', 'Slapstick', 'Self-deprecating', 'Improv', 'Storytelling', 'Deadpan', 'Surreal'];
export const AUDIENCE_TYPES = ['Comedy Club', 'Theater', 'Corporate Event', 'Late Night Show', 'Open Mic', 'University Campus'];

// Dance Generator
export const DANCE_STYLES = ['Ballet', 'Hip Hop', 'Salsa', 'Tango', 'Breakdance', 'Tap', 'Flamenco', 'Contemporary', 'Jazz', 'Ballroom', 'Robot', 'Moonwalk'];

// Viral Meme Generator
export const MEME_STYLES = ['Classic (Top/Bottom Text)', 'Modern (Twitter Style)', 'Surreal', 'Wholesome', 'Dank', 'Relatable', 'Deep Fried'];

// Traffic Booster
export const PITCH_SERVICES = ['SEO Optimization', 'Content Marketing', 'Social Media Management', 'Web Design', 'Paid Ads Management', 'Email Marketing', 'Video Production'];

// Strands Generator
export const STRANDS_LEAD_AGENTS = [
    { id: 'visionary', name: 'The Visionary', expertise: 'Big Picture Strategy', icon: '🔭', systemInstruction: 'You are "The Visionary", a lead brand strategist. Focus on the "why" and the long-term impact. Define the core purpose and high-level direction.' },
    { id: 'pragmatist', name: 'The Pragmatist', expertise: 'Market Fit & Execution', icon: '🛠️', systemInstruction: 'You are "The Pragmatist", a practical strategist. Focus on what works, market fit, and actionable steps. Keep things grounded and realistic.' },
    { id: 'disruptor', name: 'The Disruptor', expertise: 'Innovation & Differentiation', icon: '⚡', systemInstruction: 'You are "The Disruptor", a bold strategist. Focus on breaking norms, standing out, and doing things differently. Avoid clichés.' },
];

export const STRANDS_SPECIALIST_AGENTS = {
    namer: { name: 'The Namer', icon: '🏷️', systemInstruction: 'You are an expert brand naming consultant. Generate creative, memorable, and available names based on the brand strategy.' },
    copywriter: { name: 'The Copywriter', icon: '✍️', systemInstruction: 'You are a senior copywriter. Write catchy taglines, slogans, and engaging social media copy that aligns with the brand voice.' },
    artDirector: { name: 'The Art Director', icon: '🎨', systemInstruction: 'You are a creative art director. Define the visual identity, including logo concepts, color palettes (with hex codes), and typography choices.' },
    marketer: { name: 'The Marketer', icon: '📢', systemInstruction: 'You are a growth marketing expert. Suggest specific marketing angles, channels, and campaign ideas to reach the target audience.' },
};

export const AGENT_TYPES = [
    { id: 'persona', name: 'Persona-Based', description: 'Simulates a specific human role (e.g., "Angry Customer", "Expert Lawyer"). Best for empathy and roleplay.' },
    { id: 'react', name: 'ReAct (Reason + Act)', description: 'Thinks, then acts, then observes. Great for tasks requiring tool use and feedback loops.' },
    { id: 'chain-of-thought', name: 'Chain-of-Thought', description: 'Breaks down complex problems step-by-step. Ideal for math, logic, and reasoning.' },
    { id: 'creative-writer', name: 'Creative Writer', description: 'Optimized for storytelling, nuance, and flair. Less structured, more imaginative.' },
    { id: 'critic', name: 'The Critic (Reflective)', description: 'Reviews and critiques its own output to improve quality. Good for iterative refinement.' },
];

// Payment
export interface Plan {
    name: string;
    price: { monthly: number | string; yearly: number | string };
    features: string[];
    cta: string;
    popular?: boolean;
}

// Social Platforms
export interface Platform {
    name: string;
    icon: React.ReactNode;
    category: PlatformCategory;
    shareUrl?: (url: string, text: string, type: 'image' | 'video' | 'text' | 'audio') => string;
}

export type PlatformCategory = 'Social & Micro' | 'Video & Visual' | 'Professional & News' | 'Messaging';

const FacebookIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
const TwitterIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>;
const LinkedInIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;
const PinterestIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.399.165-1.487-.69-2.425-2.857-2.425-4.583 0-3.746 2.724-7.169 7.842-7.169 4.118 0 7.318 2.986 7.318 6.975 0 4.171-2.627 7.539-6.29 7.539-1.228 0-2.382-.64-2.777-1.392l-.753 2.864c-.271 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.62 0 12.017 0z"/></svg>;
const RedditIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M14.238 15.348c.085.084.085.221 0 .306-.465.462-1.194.687-2.231.687l-.008-.002-.008.002c-1.036 0-1.766-.225-2.231-.688-.085-.084-.085-.221 0-.305.084-.084.222-.084.307 0 .379.377 1.008.561 1.924.561l.008-.002.008.002c.915 0 1.544-.184 1.924-.561.085-.084.223-.084.307 0zm-3.44-2.418c0-.507-.414-.919-.922-.919-.509 0-.923.412-.923.919 0 .506.414.918.923.918.508 0 .922-.411.922-.918zm13.202-.93c-3.95 1.01-7.9 2.02-11.8 3.03a9.68 9.68 0 0 0-1.2 4.37c-.05 2.6 1.03 4.88 3.12 6.49-3.2-.5-5.5-3.2-5.5-6.4 0-2.2.9-4.1 2.5-5.5-3.3 1.3-5.3 4.5-5.3 8 0 4.7 3.8 8.5 8.5 8.5s8.5-3.8 8.5-8.5c0-2.5-1.2-4.8-3-6.4 1.8.9 3.1 2.7 3.1 4.9 0 3-2.4 5.4-5.4 5.4-1.9 0-3.6-1-4.6-2.5 1.6-1.2 3.7-1.7 6.2-1.1-.6-2.3-1.7-4.3-3.2-5.9.9-.3 1.8-.7 2.6-1.1zM12 12c2 0 4-1 5-3 .6 1.6 1.6 3 3 4l-1 1c-2-1-4-1-6-1s-4 0-6 1l-1-1c1.4-1 2.4-2.4 3-4 1 2 3 3 5 3z"/></svg>;
const InstagramIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>;
const YouTubeIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>;
const TikTokIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>;
const WhatsAppIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>;
const MessengerIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12 2C6.486 2 2 6.145 2 11.259c0 2.912 1.455 5.516 3.732 7.215.17.127.276.331.263.544l-.169 2.018 2.11-1.165c.19-.105.416-.113.611-.022a9.793 9.793 0 003.453.63c5.514 0 10-4.145 10-9.259S17.514 2 12 2zm-1.292 11.34l-2.48-3.97-4.852 3.97 5.327-5.66 2.48 3.97 4.852-3.97-5.327 5.66z"/></svg>;
const TelegramIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>;
const SnapchatIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12.003 2c-2.965 0-5.382 2.235-5.423 5.155 0 .193-.024.384-.133.519-.615.834-2.363 1.966-2.292 3.941.022 1.075.76 1.92 1.673 2.191.312.094.426.337.336.666-.171.636-.374 1.295-.374 1.964 0 .712.225 1.336.555 1.893.298.474.795.52 1.192.337.397-.18.705-.285.93-.27.405.03 1.02.36 1.665.66 1.185.57 1.245.585 1.86.585.6 0 .675-.015 1.845-.585.645-.3 1.26-.63 1.665-.66.225-.015.54.09.93.27.39.18.885.135 1.185-.33.33-.555.555-1.185.555-1.89 0-.675-.21-1.32-.375-1.965-.09-.33.03-.57.33-.66.915-.27 1.65-.112 1.68-2.19.075-1.98-1.665-3.105-2.295-3.945-.105-.135-.12-.33-.12-.525C17.388 4.235 14.973 2 12.003 2z"/></svg>;

export const PLATFORMS: Platform[] = [
    { name: 'Twitter / X', icon: <TwitterIcon />, category: 'Social & Micro', shareUrl: (url, text) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}` },
    { name: 'Facebook', icon: <FacebookIcon />, category: 'Social & Micro', shareUrl: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { name: 'LinkedIn', icon: <LinkedInIcon />, category: 'Professional & News', shareUrl: (url, text) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
    { name: 'Pinterest', icon: <PinterestIcon />, category: 'Video & Visual', shareUrl: (url, text, type) => type === 'image' || type === 'video' ? `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(url)}&description=${encodeURIComponent(text)}` : '#' },
    { name: 'Reddit', icon: <RedditIcon />, category: 'Social & Micro', shareUrl: (url, text) => `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}` },
    { name: 'WhatsApp', icon: <WhatsAppIcon />, category: 'Messaging', shareUrl: (url, text) => `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}` },
    { name: 'Telegram', icon: <TelegramIcon />, category: 'Messaging', shareUrl: (url, text) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}` },
    { name: 'Instagram', icon: <InstagramIcon />, category: 'Video & Visual', shareUrl: () => '#' }, // Direct sharing not supported via URL
    { name: 'TikTok', icon: <TikTokIcon />, category: 'Video & Visual', shareUrl: () => '#' }, // Direct sharing not supported via URL
    { name: 'YouTube', icon: <YouTubeIcon />, category: 'Video & Visual', shareUrl: () => '#' }, // Direct upload only
    { name: 'Snapchat', icon: <SnapchatIcon />, category: 'Video & Visual', shareUrl: () => '#' }, // Mobile only via kit
    { name: 'Messenger', icon: <MessengerIcon />, category: 'Messaging', shareUrl: (url) => `fb-messenger://share/?link=${encodeURIComponent(url)}` },
];
