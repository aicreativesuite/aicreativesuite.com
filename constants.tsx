
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
const TrendIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>;
const ProductionIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M4 6h16v2H4zm2 4h12v2H6zm2 4h8v2H8zm-4 4h16v2H4z"/></svg>;
const GlobalAvatarIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>;
const QuizIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>;
const SlideDeckIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"/></svg>;
const AudiobookIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 11.55C9.64 9.35 6.48 8 3 8v11c3.48 0 6.64 1.35 9 3.55 2.36-2.19 5.52-3.55 9-3.55V8c-3.48 0-6.64 1.35-9 3.55zM12 8c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3z"/></svg>;
const DubbingIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4zM14 13h-3v3H9v-3H6v-2h3V8h2v3h3v2z"/></svg>;
const LabIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>;
const TranscribeIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>;
const BrandKitIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 2L1 21h22L12 2zm0 3.8L19.3 19H4.7L12 5.8z"/><path d="M12 16c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z" fill="#FFF"/></svg>;
const VideoToolkitIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-2zM8 16c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1s1 .45 1 1v4c0 .55-.45 1-1 1zm6 0c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1s1 .45 1 1v4c0 .55-.45 1-1 1z"/></svg>;
const OfficeSuiteIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm2 2h8v2H8V8zm0 4h8v2H8v-2zm0 4h5v2H8v-2z"/></svg>;
const AutomationIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2zM5 12a5 5 0 0 0 5 5h4a5 5 0 0 0 5-5H5zm2 2a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm10 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/></svg>;
const DevStudioIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M3 3h18v18H3V3zm16 16V5H5v14h14zM7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z"/></svg>;
const PodcastIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zm7 9h-2a5 5 0 0 0-5 5v2h-4v-2a5 5 0 0 0-5-5H1a7 7 0 0 1 7-7h8a7 7 0 0 1 7 7z"/></svg>;
const OverviewIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>;

// --- Feature Configuration ---
export const FEATURES = [
    { id: 'dev-studio', title: 'Dev Studio', description: 'Build, audit, and deploy AI apps with Vibe Coding.', category: 'Create & Edit', icon: <DevStudioIcon /> },
    { id: 'automation-hub', title: 'Super Automation Hub', description: 'Central command for Content, SEO, UX & Authority automations.', category: 'Assist & Analyze', icon: <AutomationIcon /> },
    { id: 'office-suite', title: 'Office & Business Suite', description: 'Powerful PDF tools, document management, and business AI.', category: 'Assist & Analyze', icon: <OfficeSuiteIcon /> },
    { id: 'video-toolkit', title: 'Video Toolkit', description: 'Comprehensive suite of video utilities, converters, and AI enhancements.', category: 'Create & Edit', icon: <VideoToolkitIcon /> },
    { id: 'brand-kit', title: 'Brand Kit', description: 'Manage brand assets, generate guidelines, and ensure consistency.', category: 'Create & Edit', icon: <BrandKitIcon /> },
    { id: 'audiobook-creator', title: 'Audiobook Creator', description: 'Create multi-voice audiobooks from text.', category: 'Create & Edit', icon: <AudiobookIcon /> },
    { id: 'podcast-generator', title: 'Podcast Creator', description: 'Generate AI-hosted podcasts from any topic.', category: 'Create & Edit', icon: <PodcastIcon /> },
    { id: 'video-dubber', title: 'Video Dubber', description: 'Translate and dub videos into other languages.', category: 'Create & Edit', icon: <DubbingIcon /> },
    { id: 'voice-lab', title: 'Voice Lab', description: 'Clone, isolate, and modify voices.', category: 'Create & Edit', icon: <LabIcon /> },
    { id: 'realtime-transcriber', title: 'Realtime Transcriber', description: 'Live speech-to-text transcription.', category: 'Assist & Analyze', icon: <TranscribeIcon /> },
    { id: 'text-to-speech', title: 'Text to Speech', description: 'Convert text into lifelike spoken audio.', category: 'Create & Edit', icon: <TextToSpeechIcon /> },
    { id: 'sound-studio', title: 'Sound Studio', description: 'All-in-one audio suite: SFX, Music, and Speech.', category: 'Create & Edit', icon: <SoundStudioIcon /> },
    { id: 'image-generator', title: 'Image Generator', description: 'Create stunning images from text prompts.', category: 'Create & Edit', icon: <ImageGeneratorIcon /> },
    { id: 'image-editor', title: 'Image Editor', description: 'Edit and refine your images with AI.', category: 'Create & Edit', icon: <ImageEditorIcon /> },
    { id: 'slide-deck', title: 'Slide Deck Generator', description: 'Create comprehensive slide decks, reports, and visual aids.', category: 'Create & Edit', icon: <SlideDeckIcon /> },
    { id: 'video-generator', title: 'Video Generator', description: 'Turn text and images into captivating videos.', category: 'Create & Edit', icon: <VideoGeneratorIcon /> },
    { id: 'global-avatar', title: 'Global Avatar Creator', description: 'Create multilingual speaking avatars.', category: 'Create & Edit', icon: <GlobalAvatarIcon /> },
    { id: 'movie-generator', title: 'Movie Concept Creator', description: 'Develop movie ideas, scripts, and visuals.', category: 'Create & Edit', icon: <MovieGeneratorIcon /> },
    { id: 'smart-quiz', title: 'Smart Quiz Generator', description: 'Turn any topic into a gamified quiz.', category: 'Assist & Analyze', icon: <QuizIcon /> },
    { id: 'voice-chat', title: 'Voice Chat', description: 'Have real-time voice conversations with AI.', category: 'Assist & Analyze', icon: <VoiceChatIcon /> },
    { id: 'chatbot', title: 'AI Assistant', description: 'Chat with a helpful AI for any task.', category: 'Assist & Analyze', icon: <ChatbotIcon /> },
    { id: 'grounded-search', title: 'Grounded Search', description: 'Get real-time, fact-checked information.', category: 'Assist & Analyze', icon: <GroundedSearchIcon /> },
    { id: 'trend-forecaster', title: 'Trend Forecaster', description: 'Predict future trends with real-time data.', category: 'Assist & Analyze', icon: <TrendIcon /> },
    { id: 'media-analyzer', title: 'Media Analyzer', description: 'Analyze images, videos, and audio files.', category: 'Assist & Analyze', icon: <MediaAnalyzerIcon /> },
    { id: 'video-overview', title: 'Video Analysis', description: 'Get detailed summaries and insights from videos.', category: 'Assist & Analyze', icon: <OverviewIcon /> },
    { id: 'avatar-generator', title: 'Avatar Generator', description: 'Create custom character avatars.', category: 'Create & Edit', icon: <AvatarIcon /> },
    { id: 'video-editor', title: 'Video Editor', description: 'Extend and edit your generated videos.', category: 'Create & Edit', icon: <VideoEditorIcon /> },
    { id: 'songs-generator', title: 'AI Music Generator', description: 'Compose lyrics and musical concepts.', category: 'Create & Edit', icon: <MusicIcon /> },
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

// --- Platforms & Shared Types ---

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

// --- Options & Configurations ---

export const DESIGN_STYLES = ['Photorealistic', 'Cinematic', '3D Render', 'Anime', 'Digital Art', 'Oil Painting', 'Watercolor', 'Pixel Art', 'Cyberpunk', 'Steampunk', 'Minimalist', 'Retro', 'Futuristic', 'Gothic', 'Pop Art', 'Concept Art'];
export const ASPECT_RATIOS = ['1:1', '16:9', '9:16', '4:3', '3:4', '21:9'];
export const VIDEO_ASPECT_RATIOS = ['16:9', '9:16'];
export const ART_TECHNIQUES_BY_DESIGN: Record<string, string[]> = {
    'Photorealistic': ['Macro', 'Wide Angle', 'Telephoto', 'Bokeh', 'Studio Lighting'],
    'Digital Art': ['Vector', 'Voxel', 'Low Poly', 'Cell Shaded'],
    'Oil Painting': ['Impasto', 'Glazing', 'Alla Prima'],
    '3D Render': ['Ray Tracing', 'Global Illumination', 'Ambient Occlusion']
};
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
export const DIRECTOR_STYLES_DESCRIPTIVE = ['Nolan-esque', 'Wes Anderson-style', 'Tarantino-esque', 'Kubrickian', 'Bay-hem', 'Burton-esque', 'Spielbergian', 'Hitchcockian'];

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
