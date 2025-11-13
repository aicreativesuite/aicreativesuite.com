

import React from 'react';

export const DESIGN_STYLES = [
    "Advertising",
    "Advertising graphic",
    "Aerospace Engineering",
    "Album Cover Design",
    "Anatomical Illustration",
    "Animation",
    "App design",
    "Architecture",
    "Architectural Blueprint",
    "Architectural Visualization",
    "Augmented Reality (AR) Design",
    "Automotive design",
    "Automotive Styling",
    "Banner Ad Design",
    "Biomechanical Illustration",
    "Biomedical Engineering",
    "Book Cover Design",
    "Botanical Illustration",
    "Brand design",
    "Brand Identity Design",
    "Brochure Design",
    "Calligraphy",
    "Caricature",
    "Cartography / Map Design",
    "Cartooning",
    "Ceramics Design",
    "Character Design",
    "Chemical Engineering",
    "Children's Book Illustration",
    "Cinematography",
    "Civil design",
    "Clothing Design",
    "Collage Art",
    "Coloring Book Design",
    "Comic Book Art",
    "Concept Art",
    "Costume Design",
    "Creative Direction",
    "Culinary Arts Design",
    "Data Visualization",
    "Digital Painting",
    "Doodle Art",
    "Editorial Illustration",
    "Electrical design",
    "Electronics design",
    "Engineering design",
    "Engraving",
    "Environmental graphic",
    "Exhibition Design",
    "Fashion Design",
    "Fashion Illustration",
    "Film Poster Design",
    "Fine Art",
    "Flyer Design",
    "Furniture Design",
    "Game design",
    "Graffiti Art",
    "Greeting Card Design",
    "Icon Design",
    "Illustration",
    "Industrial design",
    "Infographic Design",
    "Installation Art",
    "Instructional Design",
    "Interaction design",
    "Interior design",
    "Jewelry Design",
    "Landscape Architecture",
    "Landscape Design",
    "Layout Design",
    "Level Design (Gaming)",
    "Lighting Design",
    "Linocut",
    "Logo Design",
    "Magazine Layout",
    "Mandala Design",
    "Mascot Design",
    "Mechanical Engineering Design",
    "Medical Device Design",
    "Medical design",
    "Mobile App Design",
    "Mosaic Art",
    "Motion graphics",
    "Mural Art",
    "Museum Exhibit Design",
    "Music Video Direction",
    "Origami",
    "Packaging",
    "Pattern Design",
    "Pharmacy Design",
    "Photojournalism",
    "Presentation Design",
    "Print design",
    "Printmaking",
    "Product Design",
    "Prop Design",
    "Prosthetics Design",
    "Publication",
    "Retail Design",
    "Robotics Design",
    "Scientific Illustration",
    "Sculpting",
    "Service design",
    "Set Design",
    "Signage Design",
    "Sketching",
    "Software design",
    "Sound Design",
    "Stained Glass Design",
    "Sticker Design",
    "Storyboarding",
    "Street Art",
    "Surgical Instrument Design",
    "Tattoo Design",
    "Technical Drawing",
    "Textile Design",
    "Toy Design",
    "Typeface Design",
    "Typography",
    "UI/UX Design",
    "Urban Planning",
    "Visual Effects (VFX)",
    "Web Design",
    "Wireframing",
    "Woodworking Design",
    "Zentangle"
];

// NOTE: Added ASPECT_RATIOS as it is used by other components
// but was missing from the provided file content. This ensures the app remains functional.
export const ASPECT_RATIOS = ['1:1', '3:4', '4:3', '9:16', '16:9'];

export const ART_TECHNIQUES_BY_DESIGN: Record<string, string[]> = {
    "Advertising": ["Minimalist", "Retro", "Corporate", "Bold"],
    "Architecture": ["Minimalist", "Brutalist", "Gothic", "Art Deco", "Modern"],
    "Character Design": ["Cartoon", "Anime", "Realistic", "Chibi"],
    "Fashion Design": ["Haute Couture", "Streetwear", "Vintage", "Futuristic"],
    "Game design": ["Pixel Art", "Low Poly", "Cel Shaded", "Realistic"],
    "Illustration": ["Line Art", "Watercolor", "Vector Art", "Geometric"],
    "UI/UX Design": ["Neumorphism", "Glassmorphism", "Material Design", "Flat Design"]
};

export const ARTISTIC_STYLES = [
    "Abstract",
    "Abstract Expressionism",
    "Academicism",
    "Action painting",
    "Aetherpunk",
    "Afrofuturism",
    "Anime",
    "Art Deco",
    "Art Nouveau",
    "Avant-garde",
    "Baroque",
    "Bauhaus",
    "Biomorphic",
    "Biopunk",
    "Brutalism",
    "Cartoon",
    "Cel shaded",
    "Chibi",
    "Chip-carving",
    "Classicism",
    "Clockpunk",
    "Cloisonnism",
    "Collage",
    "Color Field",
    "Comic book",
    "Conceptual",
    "Constructivism",
    "Cubism",
    "Cyber-noir",
    "Cyberpunk",
    "Dada",
    "Dark Fantasy",
    "De Stijl",
    "Decopunk",
    "Dieselpunk",
    "Digital painting",
    "Dot art",
    "Drip painting",
    "Encaustic",
    "Expressionism",
    "Fantasy",
    "Fauvism",
    "Figurative",
    "Flat design",
    "Folk art",
    "Fresco",
    "Futurism",
    "Geometric",
    "Geometric abstraction",
    "Glassmorphism",
    "Glitch art",
    "Gothic",
    "Gouache",
    "Graffiti",
    "Hard-edge painting",
    "High-tech",
    "Hyperrealism",
    "Impasto",
    "Impressionism",
    "Infrared",
    "Ink wash",
    "Kawaii",
    "Kinetic",
    "Kitsch",
    "Land art",
    "Line art",
    "Low poly",
    "Lyrical abstraction",
    "Magic realism",
    "Manga",
    "Material design",
    "Maximalism",
    "Metaphysical",
    "Mid-century modern",
    "Minimalism",
    "Modernism",
    "Monochromatic",
    "Naive art",
    "Neoclassicism",
    "Neumorphism",
    "Op art",
    "Orphism",
    "Pastel",
    "Photorealism",
    "Pixel art",
    "Pointillism",
    "Pop art",
    "Post-Impressionism",
    "Postmodernism",
    "Primitivism",
    "Psychedelic",
    "Raypunk",
    "Realism",
    "Renaissance",
    "Retro-futurism",
    "Rococo",
    "Rococopunk",
    "Romanticism",
    "Sci-Fi",
    "Scratchboard",
    "Sfumato",
    "Silhouette",
    "Silverpoint",
    "Skeuomorphism",
    "Sketch",
    "Solarpunk",
    "Steampunk",
    "Stonepunk",
    "Street art",
    "Stuckism",
    "Suprematism",
    "Surrealism",
    "Symbolism",
    "Synthwave",
    "Tachisme",
    "Tenebrism",
    "Thermal",
    "Ukiyo-e",
    "Vaporwave",
    "Vector art",
    "Verism",
    "Vintage",
    "Vorticism",
    "Watercolor"
];


// New Avatar Constants
export const AVATAR_HAIR_COLORS = [
    'any color', 'black', 'brown', 'blonde', 'red', 'white', 'gray', 'blue', 'green', 'pink', 'purple', 'rainbow'
];

export const AVATAR_EYE_COLORS = [
    'any color', 'brown', 'blue', 'green', 'hazel', 'gray', 'amber', 'red', 'glowing'
];

export const AVATAR_CLOTHING_STYLES = [
    'any style', 'casual wear', 'formal suit', 'fantasy armor', 'sci-fi uniform', 'cyberpunk gear', 'steampunk attire', 'vintage fashion', 'wizard robes', 'ninja outfit'
];

export const AVATAR_EXPRESSIONS = [
    'neutral', 'smiling', 'laughing', 'serious', 'surprised', 'thinking', 'winking', 'determined', 'curious'
];

export const VIDEO_ASPECT_RATIOS = ['16:9', '9:16'];
export const VEO_LOADING_MESSAGES = [ "Warming up the AI director...", "Scouting digital locations...", "Casting virtual actors...", "Rendering the first scene...", "This can take a few minutes...", "Adding special effects...", "Finalizing the soundtrack...", "Almost ready for the premiere..." ];

export const IMAGE_EDIT_SUGGESTIONS = [
    'Remove the background',
    'Make the image black and white',
    'Add a vintage film grain effect',
    'Increase color saturation and pop',
    'Convert to a pencil sketch style',
    'Add dramatic cinematic lighting',
    'Change the season to winter',
    'Place the subject on a beach',
];

export const VIDEO_EXTENSION_SUGGESTIONS = ['...and then something unexpected happens.', '...as the camera slowly zooms out.', '...and the weather changes dramatically.', '...revealing a hidden character.', '...transitioning to a new location.'];

export const SOUND_EFFECT_CATEGORIES = ['Sci-Fi', 'Nature', 'Urban', 'Fantasy', 'Cartoon', 'Horror'];
export const MUSIC_STYLES = ['Cinematic', 'Electronic', 'Orchestral', 'Ambient', 'Hip Hop', 'Rock', 'Jazz', 'Folk'];

export const MOVIE_GENRES = [ "Science Fiction", "Fantasy", "Horror", "Action", "Comedy", "Drama", "Thriller", "Romance", "Mystery", "Western" ];
export const VISUAL_STYLES = [ "Photorealistic", "Anime", "Cyberpunk", "Vaporwave", "Steampunk", "Film Noir", "Synthwave", "Impressionistic", "Expressionistic" ];
export const DIRECTOR_STYLES_DESCRIPTIVE = [
    { name: 'Symmetrical & Whimsical', value: 'a symmetrical, whimsical style with pastel color palettes' },
    { name: 'Non-linear & Stylized', value: 'a non-linear narrative style with stylized visuals and pop culture references' },
    { name: 'Complex & Muted', value: 'a style with complex plots, practical effects, and muted color palettes' },
    { name: 'Gothic & Quirky', value: 'a gothic, quirky, dark fantasy style' },
    { name: 'Cinematic & Emotional', value: 'a style filled with cinematic wonder, emotional storytelling, and adventure' },
    { name: 'Suspenseful & Psychological', value: 'a suspenseful, psychological thriller style with innovative camerawork' },
    { name: 'Fantastical & Hand-drawn', value: 'a hand-drawn animation style with fantastical worlds and environmental themes' }
];
export const TTS_VOICES = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'];

// New Songs Generator Constants
export const MUSIC_GENRES = ['Pop', 'Rock', 'Hip Hop', 'Electronic', 'R&B', 'Country', 'Folk', 'Jazz', 'Indie', 'Metal'];
export const MUSIC_MOODS = ['Uplifting / Happy', 'Melancholic / Sad', 'Energetic / Driving', 'Chill / Relaxed', 'Epic / Cinematic', 'Romantic', 'Dark / Moody', 'Nostalgic'];

// New Standup Generator Constants
export const COMEDIAN_STYLES = ['Observational', 'Sarcastic', 'High-Energy', 'Deadpan', 'Storytelling', 'One-Liner', 'Absurdist'];
export const AUDIENCE_TYPES = ['Intimate Comedy Club', 'Coffee Shop Open Mic', 'Tech Conference', 'Stadium Arena', 'Late Night Show', 'College Campus'];

export const DANCE_STYLES = [
    'Acro Dance',
    'Aerial Dance',
    'African Dance',
    'Afro-Cuban',
    'Afro-Fusion',
    'American Rhythm',
    'American Smooth',
    'Argentine Tango',
    'Bachata',
    'Ballet',
    'Ballroom',
    'Belly Dance',
    'Bhangra',
    'Bolero',
    'Bollywood',
    'Bomba',
    'Boogaloo',
    'Breakdancing',
    'Burlesque',
    'C-Walk',
    'Cajun Jig',
    'Calypso',
    'Capoeira',
    'Cha-Cha-Cha',
    'Charleston',
    'Clogging',
    'Contact Improvisation',
    'Contemporary Dance',
    'Country Western',
    'Cumbia',
    'Dancehall',
    'Disco',
    'Dragon Dance',
    'East Coast Swing',
    'Fandango',
    'Flamenco',
    'Folk Dance',
    'Foxtrot',
    'Freestyle',
    'Funk',
    'Fusion',
    'Garba',
    'Gavotte',
    'Gigue',
    'Gumboot Dance',
    'Haka',
    'Hambo',
    'Hardstyle',
    'Hip Hop',
    'Hula',
    'Irish Step Dance',
    'Isadora Duncan Dance',
    'J-Setting',
    'Jarocho',
    'Jazz Dance',
    'Jive',
    'Jookin\'',
    'Jumpstyle',
    'Kathak',
    'Kizomba',
    'Krumping',
    'Lambada',
    'Latin Dance',
    'Lindy Hop',
    'Line Dance',
    'Locking',
    'Lyrical Dance',
    'Mambo',
    'Merengue',
    'Minuet',
    'Modern Dance',
    'Moonwalk',
    'Morris Dance',
    'Odissi',
    'Paso Doble',
    'Peabody',
    'Plena',
    'Pole Dance',
    'Polka',
    'Popping',
    'Quickstep',
    'Rara',
    'Reggaeton',
    'Rhumba',
    'Robot Dance',
    'Rock and Roll',
    'Rueda de Casino',
    'Rumba',
    'Salsa',
    'Samba',
    'Sean-nós dance',
    'Shag',
    'Shuffle',
    'Skanking',
    'Square Dance',
    'Street Dance',
    'Swing',
    'Tango',
    'Tap Dance',
    'Tarantella',
    'Techno',
    'Tez-teke',
    'Tinikling',
    'Trance',
    'Twerking',
    'Two-Step',
    'Urban Dance',
    'Viennese Waltz',
    'Vogue',
    'Waacking',
    'Waltz',
    'West Coast Swing',
    'Whirling',
    'Yosakoi',
    'Zouk',
];

export type PlatformCategory = 'Photo Sharing' | 'Video Platforms' | 'Social Media' | 'Professional';
export type Platform = {
    name: string;
    icon: React.ReactElement;
    category: PlatformCategory;
    shareUrl?: (url: string, text: string, contentType?: 'image' | 'video' | 'text' | 'audio') => string;
};

export const PLATFORMS: Platform[] = [
  // Photo Sharing
  { name: 'Instagram', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.012 3.584-.07 4.85c-.148 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.85s.012-3.584.07-4.85c.149-3.227 1.664-4.771 4.919-4.919C8.416 2.175 8.796 2.163 12 2.163zm0 1.441c-3.119 0-3.483.011-4.708.069-2.61.12-3.856 1.36-3.978 3.978-.058 1.224-.069 1.588-.069 4.708s.011 3.483.069 4.708c.12 2.61 1.368 3.856 3.978 3.978 1.225.058 1.589.069 4.708.069s3.483-.011 4.708-.069c2.61-.12 3.856-1.368 3.978-3.978.058-1.225.069-1.589.069-4.708s-.011-3.483-.069-4.708c-.12-2.61-1.368-3.856-3.978-3.978C15.483 3.614 15.119 3.604 12 3.604zM12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5zm0 1.441a2.31 2.31 0 110 4.62 2.31 2.31 0 010-4.62zM16.837 6.062a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4z"></path></svg>, category: 'Photo Sharing' },
  // Fix: Add optional `_contentType` parameter to match Platform type definition.
  { name: 'Pinterest', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.237 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.182-.78 1.172-4.97 1.172-4.97s-.299-.6-.299-1.486c0-1.39.806-2.428 1.81-2.428.852 0 1.264.64 1.264 1.408 0 .858-.545 2.14-.828 3.33-.236.995.5 1.807 1.48 1.807 1.778 0 3.144-1.874 3.144-4.58 0-2.393-1.72-4.068-4.177-4.068-2.845 0-4.515 2.135-4.515 4.34 0 .859.331 1.781.745 2.281a.3.3 0 01.069.288l-.278 1.133c-.044.183-.145.223-.335.134-1.344-.595-2.2-2.647-2.2-4.21 0-3.411 2.46-6.209 7.03-6.209 3.693 0 6.265 2.656 6.265 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.965-.527-2.29-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.938.326 1.912.516 2.922.516 5.523 0 10-4.477 10-10S17.523 2 12 2z"></path></svg>, category: 'Photo Sharing', shareUrl: (url, text, _contentType) => `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(url)}&description=${encodeURIComponent(text)}` },
  
  // Video Platforms
  { name: 'YouTube', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M21.582 7.693c-.236-1.336-1.225-2.325-2.559-2.56C16.643 4.5 12 4.5 12 4.5s-4.643 0-7.023.633c-1.334.235-2.323 1.224-2.559 2.56C2 9.06 2 12 2 12s0 2.94.418 4.307c.236 1.336 1.225 2.325 2.559 2.56C7.357 19.5 12 19.5 12 19.5s4.643 0 7.023-.633c1.334-.235 2.323-1.224 2.559-2.56C22 14.94 22 12 22 12s0-2.94-.418-4.307zM9.75 15.194V8.806L15.318 12 9.75 15.194z"></path></svg>, category: 'Video Platforms' },
  { name: 'TikTok', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525 2.017c1.331 0 2.455.517 3.39 1.452s1.452 2.059 1.452 3.39V12.2c0 .248-.02.495-.06.74s-.09.486-.15.726a4.8 4.8 0 01-2.28 2.85 4.7 4.7 0 01-3.33 1.104c-1.331 0-2.455-.517-3.39-1.452s-1.452-2.059-1.452-3.39V8.694c0-.248.02-.495.06-.74.04-.245.09-.486.15-.726a4.8 4.8 0 012.28-2.85 4.7 4.7 0 013.33-1.104zm-1.08 2.872a1.8 1.8 0 00-1.29.544 1.9 1.9 0 00-.544 1.29v5.828a1.9 1.9 0 00.544 1.29 1.8 1.8 0 001.29.544c.516 0 .954-.181 1.29-.544a1.9 1.9 0 00.544-1.29V3.417a6.2 6.2 0 011.08.18c.245.08.45.18.615.3a2.3 2.3 0 01.975 1.71v5.1a4.2 4.2 0 01-1.26 3.09 4.1 4.1 0 01-3.09 1.26 4.2 4.2 0 01-3.09-1.26 4.1 4.1 0 01-1.26-3.09V7.126a2.3 2.3 0 01.36-1.29 2.2 2.2 0 011.02-.915 5.5 5.5 0 011.32-.3z"></path></svg>, category: 'Video Platforms' },

  // Social Media
  // Fix: Add optional `_contentType` parameter to match Platform type definition.
  { name: 'X', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>, category: 'Social Media', shareUrl: (url, text, _contentType) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}` },
  // Fix: Add optional `_contentType` parameter to match Platform type definition.
  { name: 'Facebook', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path></svg>, category: 'Social Media', shareUrl: (url, text, _contentType) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}` },
  // Fix: Add optional `_contentType` parameter to match Platform type definition.
  { name: 'WhatsApp', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.79.46 3.48 1.32 4.95L2 22l5.25-1.38c1.41.79 3.02 1.22 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.92c0-5.46-4.45-9.91-9.92-9.91zM17.18 15.25c-.21.12-.76.38-1.04.22c-.28-.16-1.12-.52-1.28-.58c-.16-.06-.28-.03-.4.12c-.12.16-.48.58-.58.7c-.12.12-.23.13-.43.01c-.2-.12-1.04-.38-1.98-.98c-.73-.46-1.22-.92-1.36-1.22c-.14-.3-.02-.46.1-.61c.11-.13.23-.21.35-.33c.12-.12.16-.21.23-.35c.08-.14.04-.27 0-.39c-.04-.12-.4-1.04-.54-1.42c-.14-.38-.28-.33-.39-.33c-.1 0-.22 0-.34.01c-.12.01-.3.04-.46.22c-.16.18-.61.6-.61 1.48c0 .88.63 1.71.71 1.83c.08.12 1.22 1.86 3.01 2.66c1.79.8 1.79.53 2.1.5c.31-.03.96-.39 1.1-.76c.14-.38.14-.7.1-.76c-.05-.06-.18-.1-.39-.22z"></path></svg>, category: 'Social Media', shareUrl: (url, text, _contentType) => `https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}` },
  // Fix: Add optional `_contentType` parameter to match Platform type definition.
  { name: 'Telegram', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="m9.417 15.181-.397 5.584c.568 0 .814-.244 1.109-.537l2.663-2.545 5.518 4.041c1.012.564 1.725.267 1.998-.931L23.43 3.245c.272-1.215-.434-1.734-1.258-1.432L1.21 8.423c-1.22.482-1.21 1.161-.22 1.462L6.99 11.85l9.285-5.7c.433-.261.82-.122.498.173z"></path></svg>, category: 'Social Media', shareUrl: (url, text, _contentType) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}` },
  { name: 'Reddit', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.128 2.545 7.674 6.138 9.14-1.121-1.66-1.58-3.483-1.634-4.66.014-.112.028-.225.044-.336.14-.993.66-2.529 1.1-3.527C7.218 12.35 7 11.94 7 11.417c0-1.14.88-2.115 1.916-2.115 1.033 0 1.516.732 1.516 1.619 0 .984-.62 2.34-1.016 3.527-.333 1.02.5 1.848 1.516 1.848 1.815 0 3.033-2.145 3.033-4.96 0-2.583-1.84-4.595-4.46-4.595-3.049 0-4.944 2.252-4.944 4.723 0 .91.332 1.912.75 2.508a.3.3 0 01.066.288l-.272 1.133c-.044.183-.145.223-.334.134-1.344-.595-2.2-2.647-2.2-4.21 0-3.411 2.46-6.209 7.03-6.209 3.693 0 6.265 2.656 6.265 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.965-.527-2.29-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.938.326 1.912.516 2.922.516 5.523 0 10-4.477 10-10S17.523 2 12 2z"></path></svg>, category: 'Social Media', shareUrl: (url, text, contentType?: 'image' | 'video' | 'text' | 'audio') => {
        const title = text.split('\n')[0].substring(0, 300);
        if (contentType === 'text' || contentType === 'audio') {
            return `https://www.reddit.com/submit?title=${encodeURIComponent(title)}&text=${encodeURIComponent(text)}`;
        }
        return `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
    } },

  // Professional
  // Fix: Add optional `_contentType` parameter to match Platform type definition.
  { name: 'LinkedIn', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 11-4.125 0 2.062 2.062 0 014.125 0zM7.153 9H3.528v11.452H7.153V9z"></path></svg>, category: 'Professional', shareUrl: (url, text, _contentType) => `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}` },
  // Fix: Add optional `_contentType` parameter to match Platform type definition.
  { name: 'Email', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M1.946 9.315c.522-.174 1.103-.349 1.724-.523l8.706-2.612a.5.5 0 01.543.543l-2.612 8.706c-.174.621-.349 1.202-.523 1.724a.5.5 0 01-.848 0c-.174-.522-.349-1.103-.523-1.724L5.006 9.857a.5.5 0 010-.848zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path></svg>, category: 'Professional', shareUrl: (url, text, _contentType) => {
    const subject = text.split('\n')[0].substring(0, 100);
    const body = `${text}\n\nShared from AI Creative Suite:\n${url}`;
    return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }},
];

export type FeatureId =
    | 'image-generator'
    | 'image-editor'
    | 'video-generator'
    | 'movie-generator'
    | 'voice-chat'
    | 'chatbot'
    | 'grounded-search'
    | 'media-analyzer'
    | 'text-to-speech'
    | 'avatar-generator'
    | 'video-editor'
    | 'sound-studio'
    | 'songs-generator'
    | 'marketing-assistant'
    | 'content-generator'
    | 'standup-generator'
    | 'strands-generator'
    | 'dance-generator'
    | 'pricing'
    | 'profile-settings';
    
export const FEATURES: {
    id: FeatureId;
    title: string;
    description: string;
    icon: React.ReactElement;
    category: 'Create & Edit' | 'Assist & Analyze' | 'Account';
}[] = [
    { id: 'image-generator', title: 'Image Generator', description: 'Create new and original images from text prompts using AI.', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12.55,6.14L13.23,4.77L14.6,5.45L13.92,6.82L12.55,6.14M16.4,3.5L14.7,4.05L15.38,5.42L17.08,4.86L16.4,3.5M9.68,8.23L11.05,7.55L10.37,6.18L8.67,6.74L9.68,8.23M19,3A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3H19M5,19H19V5H5V19M16,13L14.28,15.46L11.5,11.5L8,16H18L16,13Z"></path></svg>, category: 'Create & Edit'},
    { id: 'image-editor', title: 'Image Editor', description: 'Modify and enhance your images using conversational AI prompts.', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11 15.5V17H13V15.5C14.1 15.2 15 14.2 15 13C15 11.34 13.66 10 12 10C10.34 10 9 11.34 9 13C9 14.2 9.9 15.2 11 15.5ZM12 4C14.49 4 16.5 6.01 16.5 8.5C16.5 10.99 14.49 13 12 13C9.51 13 7.5 10.99 7.5 8.5C7.5 6.01 9.51 4 12 4Z"></path></svg>, category: 'Create & Edit'},
    { id: 'video-generator', title: 'Video Generator', description: 'Generate high-quality 720p videos from text or images with Veo.', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7C17 6.45 16.55 6 16 6H4C3.45 6 3 6.45 3 7V17C3 17.55 3.45 18 4 18H16C16.55 18 17 17.55 17 17V13.5L21 17.5V6.5L17 10.5Z"></path></svg>, category: 'Create & Edit'},
    { id: 'movie-generator', title: 'Movie Generator', description: 'Develop a full movie concept, from poster to script and storyboards.', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M18 3V5H16V3H8V5H6V3H4V21H6V19H8V21H16V19H18V21H20V3H18ZM8 17H6V15H8V17ZM8 13H6V11H8V13ZM8 9H6V7H8V9ZM18 17H16V15H18V17ZM18 13H16V11H18V13ZM18 9H16V7H18V9Z"></path></svg>, category: 'Create & Edit'},
    { id: 'avatar-generator', title: 'Avatar Generator', description: 'Create unique, personalized avatars for profiles, games, or virtual worlds.', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 6C13.93 6 15.5 7.57 15.5 9.5C15.5 11.43 13.93 13 12 13C10.07 13 8.5 11.43 8.5 9.5C8.5 7.57 10.07 6 12 6ZM12 20C9.96 20 7.33 18.41 6 16.97C6.03 14.99 10 13.9 12 13.9C13.99 13.9 17.97 14.99 18 16.97C16.67 18.41 14.04 20 12 20Z"></path></svg>, category: 'Create & Edit'},
    { id: 'video-editor', title: 'Video Editor', description: 'Create a base video and then extend it with new prompts to build a sequence.', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M21.58 16.09L19.69 17.21L14.04 12L19.69 6.79L21.58 7.91C22.36 8.35 22.36 9.45 21.58 9.89L18.43 12L21.58 14.11C22.36 14.55 22.36 15.65 21.58 16.09ZM2.42 7.91L4.31 6.79L9.96 12L4.31 17.21L2.42 16.09C1.64 15.65 1.64 14.55 2.42 14.11L5.57 12L2.42 9.89C1.64 9.45 1.64 8.35 2.42 7.91Z"></path></svg>, category: 'Create & Edit'},
    { id: 'sound-studio', title: 'Sound Studio', description: 'Generate speech, get SFX ideas, and brainstorm musical concepts.', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3V13.55C11.41 13.21 10.73 13 10 13C7.79 13 6 14.79 6 17C6 19.21 7.79 21 10 21C12.21 21 14 19.21 14 17V7H18V3H12Z"></path></svg>, category: 'Create & Edit'},
    { id: 'songs-generator', title: 'Songs Generator', description: 'Generate lyrics, chords, and musical concepts for original songs.', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55c-2.21 0-4 1.79-4 4s1.79 4 4 4s4-1.79 4-4V7h4V3h-6z" /></svg>, category: 'Create & Edit'},
    { id: 'strands-generator', title: 'Strands Generator', description: 'Weave a cohesive brand identity from a single core concept.', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M9.4 16.6C9.8 17.1 10.3 17.5 10.9 17.7C12.9 18.6 15.2 17.8 16.6 16.1C17.1 15.6 17.5 15 17.7 14.4C18.6 12.4 17.8 10.1 16.1 8.7L14.6 10.2C15.5 11.1 15.8 12.4 15.2 13.5C14.6 14.7 13.2 15.2 12 14.6C10.8 14 10.3 12.6 10.9 11.4L9.4 9.9C7.7 11.6 8.5 14.7 9.4 16.6zM14.6 7.4C14.2 6.9 13.7 6.5 13.1 6.3C11.1 5.4 8.8 6.2 7.4 7.9C6.9 8.4 6.5 9 6.3 9.6C5.4 11.6 6.2 13.9 7.9 15.3L9.4 13.8C8.5 12.9 8.2 11.6 8.8 10.5C9.4 9.3 10.8 8.8 12 9.4C13.2 10 13.7 11.4 13.1 12.6L14.6 14.1C16.3 12.4 15.5 9.3 14.6 7.4zM4 6.9L2.9 5.8L4.3 4.4L5.4 5.5C6.4 4.5 7.8 4 9.2 4C9.6 4 9.9 4 10.3 4.1L11.1 2H13.1L12.3 4.1C12.7 4.1 13.1 4.1 13.5 4.2C15.8 4.8 17.5 6.7 17.8 9H19.9L19.1 11H17.8C17.9 11.3 17.9 11.7 17.8 12.1L19.9 13H19.1L17.8 15C17.2 17.3 15.3 19 13.1 19.5C12.7 19.5 12.4 19.5 12 19.5C10.6 19.5 9.2 19 8.2 18.1L7.1 19.2L5.7 17.8L6.8 16.7C5.8 15.7 5.2 14.4 5.2 13C5.2 12.6 5.3 12.2 5.3 11.9L4 12.3L2 10.3L4.1 9.5C4.1 9.1 4.1 8.8 4.2 8.4C4.1 8.1 4.1 7.8 4 7.5L2.9 8.3L1.5 6.9L4 6.9z"></path></svg>, category: 'Create & Edit'},
    { id: 'standup-generator', title: 'AI Standup Generator', description: 'Generate a comedy set with an AI comedian, script, voice, and video.', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M9.5 7.5c1.38 0 2.5 1.12 2.5 2.5S10.88 12.5 9.5 12.5 7 11.38 7 10s1.12-2.5 2.5-2.5m4.5 2.5c1.38 0 2.5-1.12 2.5-2.5S15.38 7.5 14 7.5s-2.5 1.12-2.5 2.5 1.12 2.5 2.5 2.5M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2M12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8m0-4c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5" /></svg>, category: 'Create & Edit'},
    { id: 'content-generator', title: 'Content Generator', description: 'Generate blog posts, ad copy, video scripts, and more.', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20ZM9 12H15V14H9V12ZM9 16H15V18H9V16Z"></path></svg>, category: 'Create & Edit'},
    { id: 'dance-generator', title: 'Dance Generator', description: 'Create a unique dance video from a description of a character and style.', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm-3.5 4.04l2.12-.89.89-2.12C11.87 4.01 12.83 4.3 13 5.14l2.29 9.14 6.13.43c.9.06 1.34 1.21.69 1.85l-4.63 4.63c-.45.45-1.2.59-1.81.33l-4.5-1.93-4.5 1.93c-.61.26-1.36.12-1.81-.33l-4.63-4.63c-.65-.64-.21-1.79.69-1.85l6.13-.43L11 5.14c.17-.84 1.13-1.13 1.5-.1z"/></svg>, category: 'Create & Edit'},
    { id: 'voice-chat', title: 'Voice Chat', description: 'Have a real-time, low-latency voice conversation with Gemini.', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14C13.66 14 15 12.66 15 11V3C15 1.34 13.66 0 12 0C10.34 0 9 1.34 9 3V11C9 12.66 10.34 14 12 14ZM10.8 3C10.8 2.01 11.39 1.2 12.24 1.2C13.09 1.2 13.68 2.01 13.68 3V11C13.68 11.99 13.09 12.8 12.24 12.8C11.39 12.8 10.8 11.99 10.8 11V3ZM12 16.5C14.76 16.5 17.1 14.21 17.1 11.5H18.9C18.9 14.81 16.48 17.55 13.2 17.93V21H10.8V17.93C7.52 17.55 5.1 14.81 5.1 11.5H6.9C6.9 14.21 9.24 16.5 12 16.5Z"></path></svg>, category: 'Assist & Analyze'},
    { id: 'chatbot', title: 'Chatbot', description: 'Your creative AI assistant for brainstorming and problem-solving.', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4C2.9 2 2 2.9 2 4V16C2 17.1 2.9 18 4 18H18L22 22V4C22 2.9 21.1 2 20 2ZM16.25 10.25H7.75V8.75H16.25V10.25ZM16.25 13.25H7.75V11.75H16.25V13.25ZM16.25 7.25H7.75V5.75H16.25V7.25Z"></path></svg>, category: 'Assist & Analyze'},
    { id: 'grounded-search', title: 'Grounded Search', description: 'Get real-time, fact-checked answers grounded in Google Search.', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z"></path></svg>, category: 'Assist & Analyze'},
    { id: 'media-analyzer', title: 'Media Analyzer', description: 'Analyze and get insights from images, video frames, and audio files.', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11 16.5V12H9V16.5H11ZM11 10.5V7.5H13V10.5H11ZM15 16.5V12H13V16.5H15Z"></path></svg>, category: 'Assist & Analyze'},
    { id: 'marketing-assistant', title: 'Marketing Assistant', description: 'Generate marketing copy, bulk emails, and strategic ideas.', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6.47L12 12L20 6.47V18H4V6.47ZM22 4H2C1.45 4 1 4.45 1 5V19C1 19.55 1.45 20 2 20H22C22.55 20 23 19.55 23 19V5C23 4.45 22.55 4 22 4Z"></path></svg>, category: 'Assist & Analyze'},
    { id: 'pricing', title: 'Pricing', description: 'View our subscription plans and choose the one that fits your needs.', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 10C10.9 10 10 9.1 10 8C10 6.9 10.9 6 12 6C13.1 6 14 6.9 14 8C14 9.1 13.1 10 12 10ZM12 18C9.79 18 8 16.21 8 14C8 11.79 9.79 10 12 10C14.21 10 16 11.79 16 14C16 16.21 14.21 18 12 18Z"></path></svg>, category: 'Account'},
    { id: 'profile-settings', title: 'Profile & Settings', description: 'Manage your account details, preferences, and subscription.', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"></path></svg>, category: 'Account'},
];

export const CATEGORY_DETAILS: { [key: string]: { icon: React.ReactElement } } = {
    'Create & Edit': { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg> },
    'Assist & Analyze': { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 100 2h.01a1 1 0 100-2H11zM10 1a1 1 0 011 1v1a1 1 0 11-2 0V2a1 1 0 011-1zM9 15a1 1 0 102 0v2a1 1 0 10-2 0v-2zM5.636 13.364a1 1 0 00-1.414-1.414 1 1 0 001.414 1.414zM13.364 6.364a1 1 0 00-1.414-1.414 1 1 0 001.414 1.414zM16.485 10.485a1 1 0 00-1.414 0 1 1 0 001.414 1.414zM1.904 4.515a1 1 0 001.414 0 1 1 0 00-1.414-1.414zM4.515 16.096a1 1 0 00-1.414 1.414 1 1 0 001.414-1.414zM10 4a6 6 0 100 12 6 6 0 000-12z" /></svg> },
    'Account': { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0012 11z" clipRule="evenodd" /></svg> }
};

export const STRANDS_LEAD_AGENTS = [
    {
        id: 'minimalist',
        name: 'Mies the Minimalist',
        expertise: 'Focuses on clean lines, simplicity, and "less is more."',
        icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path d="M3 3h18v2H3V3zm0 8h18v2H3v-2zm0 8h18v2H3v-2z"></path></svg>,
        systemInstruction: "You are an expert brand strategist with a minimalist philosophy. You believe in 'less is more'. Your suggestions for brand essence should be clean, simple, and elegant. Use a sophisticated and concise tone. Your single output is the brand essence."
    },
    {
        id: 'vibrant',
        name: 'Viv the Vibrant',
        expertise: 'Loves bold colors, dynamic shapes, and energetic concepts.',
        icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path d="M12 2L9.4 8.5 2 10l6.2 5.8L6.4 22 12 18l5.6 4-1.8-6.2L22 10l-7.4-1.5L12 2z"></path></svg>,
        systemInstruction: "You are a bold and energetic brand strategist who loves vibrant colors and playful language. Your suggestions for brand essence should be eye-catching, memorable, and full of personality. Use an enthusiastic and expressive tone. Your single output is the brand essence."
    },
    {
        id: 'lexicographer',
        name: 'Lex the Lexicographer',
        expertise: 'A master of wordplay, puns, and clever, witty copy.',
        icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path d="M15 4v12h3V4h-3zm-2-2h7v16h-7V2zM4 14h9v2H4v-2zm0-4h9v2H4v-2zm0-4h9v2H4V6z"></path></svg>,
        systemInstruction: "You are a master wordsmith and brand strategist specializing in clever copy. You love puns, alliteration, and memorable wordplay. Your suggestions for brand essence should be witty and smart. Your single output is the brand essence."
    },
    {
        id: 'corporate',
        name: 'Corp the Corporatist',
        expertise: 'Builds trustworthy, professional, and classic brand identities.',
        icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path d="M4 20h16V4H4v16zm2-14h12v12H6V6zM8 8h8v2H8V8zm0 4h8v2H8v-2z"></path></svg>,
        systemInstruction: "You are a seasoned brand strategist specializing in corporate identity. You value trust, stability, and professionalism. Your suggestions for brand essence should be classic, dependable, and suitable for a serious business audience. Use a formal and authoritative tone. Your single output is the brand essence."
    }
];

export const STRANDS_SPECIALIST_AGENTS = {
    namer: {
        name: 'The Namer',
        expertise: 'Generates Names',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.706-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm-.707 7.072l.707-.707a1 1 0 10-1.414-1.414l-.707.707a1 1 0 101.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" clipRule="evenodd" /></svg>,
        systemInstruction: "You are an expert Namer. Based on the brand essence, generate 3-5 creative and memorable brand or product names. Your output must be a JSON object with a single key 'nameSuggestions' which is an array of strings."
    },
    copywriter: {
        name: 'The Copywriter',
        expertise: 'Writes Taglines & Social Posts',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>,
        systemInstruction: "You are an expert Copywriter. Based on the brand essence, create 3-5 catchy taglines and one sample social media post. Your output must be a JSON object with two keys: 'taglines' (an array of strings) and 'socialMediaPost' (a single string)."
    },
    artDirector: {
        name: 'The Art Director',
        expertise: 'Designs Visual Identity',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>,
        systemInstruction: "You are an expert Art Director. Based on the brand essence, define the visual identity. Describe a logo concept, a color palette (3-5 colors with names and hex codes), and typography suggestions. Your output must be a JSON object with a single key 'visualIdentity' containing 'logoConcept', 'colorPalette' (array of objects with 'name' and 'hex'), and 'typography' keys."
    },
    marketer: {
        name: 'The Marketing Guru',
        expertise: 'Develops Marketing Angles',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 009.023 16.5l-3.356-.957 5.23-10.46a1 1 0 00-.356-1.428L6.023 2.553z" /><path d="M14.996 11.523a1 1 0 00-1.788 0l-4.244 8.488a1 1 0 001.17 1.408l5-1.428a1 1 0 00.585-1.049l-1.722-6.418z" /></svg>,
        systemInstruction: "You are an expert Marketing Guru. Based on the brand essence, devise 2-3 unique marketing angles or campaign ideas. Your output must be a JSON object with a single key 'marketingAngles' which is an array of strings."
    }
};