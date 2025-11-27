
import { GoogleGenAI, GenerateContentResponse, Chat, Modality, Type } from "@google/genai";

const getGeminiAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Helpers ---
const generateJsonContent = async (prompt: string, schema: any, model = 'gemini-2.5-flash'): Promise<GenerateContentResponse> => {
    const ai = getGeminiAI();
    return ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: schema,
        },
    });
};

// --- Text Generation ---
export const generateText = async (prompt: string, model: 'gemini-2.5-flash' | 'gemini-2.5-flash-lite' | 'gemini-2.5-pro' = 'gemini-2.5-flash'): Promise<GenerateContentResponse> => {
    return getGeminiAI().models.generateContent({ model, contents: prompt });
};

export const generateTextWithThinking = async (prompt: string): Promise<GenerateContentResponse> => {
    return getGeminiAI().models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: { thinkingConfig: { thinkingBudget: 32768 } },
    });
};

// --- Chat ---
export const createChatSession = (systemInstruction?: string): Chat => {
    return getGeminiAI().chats.create({
        model: 'gemini-2.5-flash',
        config: systemInstruction ? { systemInstruction } : undefined,
    });
};

// --- Image Generation & Editing ---
export const generateImage = async (prompt: string, aspectRatio: string): Promise<string> => {
    const response = await getGeminiAI().models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt,
        config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio },
    });
    return response.generatedImages[0].image.imageBytes;
};

export const editImage = async (prompt: string, imageBase64: string, mimeType: string): Promise<string | null> => {
    const response = await getGeminiAI().models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ inlineData: { data: imageBase64, mimeType } }, { text: prompt }] },
        config: { responseModalities: [Modality.IMAGE] },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data ?? null;
};

// --- Media Analysis ---
export const analyzeImage = async (prompt: string, imageBase64: string, mimeType: string) => 
    getGeminiAI().models.generateContent({ model: 'gemini-2.5-flash', contents: { parts: [{ text: prompt }, { inlineData: { data: imageBase64, mimeType } }] } });

export const analyzeVideoFrame = async (prompt: string, imageBase64: string, mimeType: string) => 
    getGeminiAI().models.generateContent({ model: 'gemini-2.5-pro', contents: { parts: [{ text: prompt }, { inlineData: { data: imageBase64, mimeType } }] } });

export const analyzeVideo = async (prompt: string, videoBase64: string, mimeType: string) => 
    getGeminiAI().models.generateContent({ model: 'gemini-2.5-flash', contents: { parts: [{ text: prompt }, { inlineData: { data: videoBase64, mimeType } }] } });

export const transcribeAudio = async (audioBase64: string, mimeType: string, prompt = "Transcribe.") => 
    getGeminiAI().models.generateContent({ model: 'gemini-2.5-flash', contents: { parts: [{ text: prompt }, { inlineData: { data: audioBase64, mimeType } }] } });

// --- Video Generation (Veo) ---
export const generateVideoFromPrompt = async (prompt: string, aspectRatio: '16:9' | '9:16', isHighQuality: boolean): Promise<any> => {
    return getGeminiAI().models.generateVideos({
        model: isHighQuality ? 'veo-3.1-generate-preview' : 'veo-3.1-fast-generate-preview',
        prompt,
        config: { numberOfVideos: 1, resolution: '720p', aspectRatio },
    });
};

export const generateVideoFromImage = async (prompt: string | null, imageBase64: string, mimeType: string, aspectRatio: '16:9' | '9:16', isHighQuality: boolean): Promise<any> => {
    return getGeminiAI().models.generateVideos({
        model: isHighQuality ? 'veo-3.1-generate-preview' : 'veo-3.1-fast-generate-preview',
        prompt: prompt ?? "Animate this.",
        image: { imageBytes: imageBase64, mimeType },
        config: { numberOfVideos: 1, resolution: '720p', aspectRatio },
    });
};

export const extendVideo = async (prompt: string, previousVideo: any, aspectRatio: '16:9' | '9:16'): Promise<any> => {
    return getGeminiAI().models.generateVideos({
        model: 'veo-3.1-generate-preview',
        prompt,
        video: previousVideo,
        config: { numberOfVideos: 1, resolution: '720p', aspectRatio },
    });
};

export const pollVideoOperation = async (operation: any) => getGeminiAI().operations.getVideosOperation({ operation });

// --- Grounded Generation ---
export const performGroundedSearch = async (prompt: string, useMaps: boolean, location?: { latitude: number; longitude: number }): Promise<GenerateContentResponse> => {
    const tools: any[] = [{ googleSearch: {} }];
    if (useMaps) tools.push({ googleMaps: {} });
    return getGeminiAI().models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { tools, toolConfig: useMaps && location ? { retrievalConfig: { latLng: location } } : undefined },
    });
};

// --- Text-to-Speech ---
export const generateSpeech = async (text: string, voiceName = 'Kore', referenceAudioBase64?: string): Promise<string | null> => {
    const parts: any[] = [{ text }];
    if (referenceAudioBase64) parts.push({ inlineData: { mimeType: 'audio/mp3', data: referenceAudioBase64 } });
    const response = await getGeminiAI().models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts }],
        config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } } },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data ?? null;
};

export const generateMultiSpeakerSpeech = async (text: string, speakers: { speaker: string; voiceName: string }[], referenceAudioBase64?: string): Promise<string | null> => {
    const parts: any[] = [{ text }];
    if (referenceAudioBase64) parts.push({ inlineData: { mimeType: 'audio/mp3', data: referenceAudioBase64 } });
    const response = await getGeminiAI().models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts }],
        config: { 
            responseModalities: [Modality.AUDIO], 
            speechConfig: { multiSpeakerVoiceConfig: { speakerVoiceConfigs: speakers.map(s => ({ speaker: s.speaker, voiceConfig: { prebuiltVoiceConfig: { voiceName: s.voiceName } } })) } } 
        },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data ?? null;
};

// --- Songs ---
export const generateSongConcept = async (genre: string, mood: string, topic: string) => generateJsonContent(
    `Generate a song concept. Genre: ${genre}, Mood: ${mood}, Topic: ${topic}. Include title, lyrics (sections marked), chordProgression, arrangementDescription.`,
    {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            lyrics: { type: Type.STRING },
            chordProgression: { type: Type.STRING },
            arrangementDescription: { type: Type.STRING },
        },
        required: ["title", "lyrics", "chordProgression", "arrangementDescription"],
    }, 'gemini-2.5-pro'
);

// --- Audio Tools ---
export const generateAudiobookScript = async (text: string) => generateJsonContent(
    `Convert this text into an audiobook script format. Identify speakers (Narrator, Character1, Character2). If no clear characters, use Narrator. JSON Array of {speaker, text}. \n\nTEXT:\n${text.substring(0, 10000)}`,
    {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                speaker: { type: Type.STRING },
                text: { type: Type.STRING }
            },
            required: ["speaker", "text"]
        }
    }
);

export const translateScript = async (script: string, targetLanguage: string) => generateJsonContent(
    `Translate the following script to ${targetLanguage}. Maintain speaker labels. Input format: JSON Array {speaker, text}. Output format: JSON Array {speaker, text}. \n\nSCRIPT:\n${script}`,
    {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                speaker: { type: Type.STRING },
                text: { type: Type.STRING }
            },
            required: ["speaker", "text"]
        }
    }
);

// --- Movie (Advanced) ---
export const generateMovieConcept = async (genre: string, tone: string, topic: string) => generateJsonContent(
    `Movie Concept for: "${topic}". Genre: ${genre}, Tone: ${tone}. Include title, logline, worldDescription, visualStyleRef.`,
    { type: Type.OBJECT, properties: { title: { type: Type.STRING }, logline: { type: Type.STRING }, worldDescription: { type: Type.STRING }, visualStyleRef: { type: Type.STRING } }, required: ['title', 'logline', 'worldDescription'] }
);

export const generateDetailedStory = async (title: string, logline: string, genre: string) => generateJsonContent(
    `Detailed Story for "${title}" (${genre}): "${logline}". 3-Act Structure. JSON: { acts: [{name, description, beats: [string]}], characterArcSummary: string }.`,
    { type: Type.OBJECT, properties: { acts: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING }, beats: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ['name', 'beats'] } }, characterArcSummary: { type: Type.STRING } }, required: ['acts', 'characterArcSummary'] }, 'gemini-2.5-pro'
);

export const generateDetailedCharacters = async (title: string, logline: string) => generateJsonContent(
    `Main Characters for "${title}": "${logline}". JSON Array: { name, role, age, backstory, visualDescription, voiceStyle }.`,
    { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, role: { type: Type.STRING }, age: { type: Type.STRING }, backstory: { type: Type.STRING }, visualDescription: { type: Type.STRING }, voiceStyle: { type: Type.STRING } }, required: ['name', 'visualDescription'] } }, 'gemini-2.5-pro'
);

export const generateScreenplayScene = async (title: string, sceneBeat: string, style: string) => getGeminiAI().models.generateContent({
    model: 'gemini-2.5-pro',
    contents: `Write a full screenplay scene for "${title}". Scene Context: ${sceneBeat}. Style Module: ${style} (e.g. Comedy, Action, Noir). Include INT/EXT, Action lines, Dialogue, and Camera Directions.`
});

export const generateVisualPrompts = async (title: string, visualStyle: string, scenes: string[]) => generateJsonContent(
    `Generate Image Prompts for "${title}". Style: ${visualStyle}. Scenes: ${scenes.join(' | ')}. JSON Array: { sceneId, prompt, negativePrompt }.`,
    { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { sceneId: { type: Type.STRING }, prompt: { type: Type.STRING }, negativePrompt: { type: Type.STRING } }, required: ['prompt'] } }
);

export const generateProductionPlan = async (title: string, duration: string) => getGeminiAI().models.generateContent({
    model: 'gemini-2.5-pro',
    contents: `Generate a Production Plan for "${title}" (${duration}). Include: Shot List (5 key shots), VFX Requirements, Costume Design Brief, Sound Design Notes.`
});

// New Advanced Movie Features
export const generateCharacterSheet = async (name: string, description: string) => generateJsonContent(
    `Character Sheet for "${name}": ${description}. JSON: { personality, strengths, weaknesses, costumeDetails, makeupNotes, keyPoses: [string] }`,
    { type: Type.OBJECT, properties: { personality: { type: Type.STRING }, strengths: { type: Type.STRING }, weaknesses: { type: Type.STRING }, costumeDetails: { type: Type.STRING }, makeupNotes: { type: Type.STRING }, keyPoses: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ['personality', 'costumeDetails', 'keyPoses'] }
);

export const generateWorldDetails = async (setting: string) => generateJsonContent(
    `World Building for "${setting}". JSON: { environmentDescription, architectureStyle, uniqueRulesOrMagic, vehicleDesigns: [string], propList: [string] }`,
    { type: Type.OBJECT, properties: { environmentDescription: { type: Type.STRING }, architectureStyle: { type: Type.STRING }, uniqueRulesOrMagic: { type: Type.STRING }, vehicleDesigns: { type: Type.ARRAY, items: { type: Type.STRING } }, propList: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ['environmentDescription', 'uniqueRulesOrMagic'] }
);

export const analyzeStoryStructure = async (plot: string) => generateJsonContent(
    `Analyze this story plot: "${plot}". JSON: { tensionCurve: string, plotTwists: [string], characterRelationships: [string], pacingAnalysis: string }`,
    { type: Type.OBJECT, properties: { tensionCurve: { type: Type.STRING }, plotTwists: { type: Type.ARRAY, items: { type: Type.STRING } }, characterRelationships: { type: Type.ARRAY, items: { type: Type.STRING } }, pacingAnalysis: { type: Type.STRING } }, required: ['tensionCurve', 'plotTwists'] }
);

export const generateSceneBreakdown = async (scene: string) => generateJsonContent(
    `Breakdown scene for production: "${scene}". JSON: { shotList: [{type, angle, movement, subject}], vfxNotes: string, soundDesign: string }`,
    { type: Type.OBJECT, properties: { shotList: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { type: { type: Type.STRING }, angle: { type: Type.STRING }, movement: { type: Type.STRING }, subject: { type: Type.STRING } }, required: ['type'] } }, vfxNotes: { type: Type.STRING }, soundDesign: { type: Type.STRING } }, required: ['shotList', 'vfxNotes'] }
);

export const generateAudioScoreDescription = async (mood: string, action: string) => getGeminiAI().models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Describe a musical score for a movie scene. Mood: ${mood}. Action: ${action}. Include instrumentation, tempo, and dynamics.`
});

export const generateMarketingAssets = async (title: string, logline: string, type: string) => getGeminiAI().models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Create ${type} for movie "${title}": ${logline}.`
});

// --- Meme ---
export const generateMemeConcept = async (topic: string, style: string) => generateJsonContent(
    `Viral meme concept. Topic: "${topic}", Style: "${style}". Return {imageDescription, topText, bottomText}.`,
    { type: Type.OBJECT, properties: { imageDescription: { type: Type.STRING }, topText: { type: Type.STRING }, bottomText: { type: Type.STRING } }, required: ["imageDescription", "topText", "bottomText"] }
);

export const generateMemeConceptFromImage = async (imageBase64: string, mimeType: string, style: string) => {
    const prompt = `Meme concept from image, style "${style}". Return JSON {imageDescription (spoken script), topText, bottomText}.`;
    const schema = { type: Type.OBJECT, properties: { imageDescription: { type: Type.STRING }, topText: { type: Type.STRING }, bottomText: { type: Type.STRING } }, required: ["imageDescription", "topText", "bottomText"] };
    return getGeminiAI().models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: prompt }, { inlineData: { data: imageBase64, mimeType } }] },
        config: { responseMimeType: "application/json", responseSchema: schema }
    });
};

// --- Marketing ---
export const generateAbTestCopy = async (product: string, msg: string, audience: string) => generateJsonContent(
    `3 A/B marketing copy variations. Product: ${product}, Goal: ${msg}, Audience: ${audience}. Return array of {angle, copy}.`,
    { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { angle: { type: Type.STRING }, copy: { type: Type.STRING } }, required: ['angle', 'copy'] } }
);

export const generateBulkEmails = async (template: string) => generateJsonContent(
    `3 varied bulk emails based on: ${template}. Return array of {subject, body}.`,
    { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { subject: { type: Type.STRING }, body: { type: Type.STRING } }, required: ['subject', 'body'] } }
);

export const generateBulkSms = async (template: string) => generateJsonContent(
    `3 varied SMS based on: ${template}. Return array of {body}.`,
    { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { body: { type: Type.STRING } }, required: ['body'] } }
);

export const generateOutreachPitch = async (businessName: string, service: string, format: string) => 
    getGeminiAI().models.generateContent({ model: 'gemini-2.5-flash', contents: `Write a ${format} pitch to "${businessName}" offering "${service}". Concise.` });

export const generateTrafficStrategy = async (niche: string, audience: string, url: string) => generateJsonContent(
    `Traffic strategy for ${niche}, ${audience}, ${url}. 4 pillars: geoStrategy, socialStrategy, technicalStrategy, growthStrategy. Return JSON.`,
    {
        type: Type.OBJECT,
        properties: {
            geoStrategy: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, tactics: {type: Type.ARRAY, items: {type: Type.STRING}}, citationContent: {type: Type.ARRAY, items: {type: Type.STRING}} }, required: ["tactics", "citationContent"] },
            socialStrategy: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, repurposingTactics: {type: Type.ARRAY, items: {type: Type.STRING}}, viralHooks: {type: Type.ARRAY, items: {type: Type.STRING}} }, required: ["repurposingTactics", "viralHooks"] },
            technicalStrategy: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, schemaMarkup: {type: Type.ARRAY, items: {type: Type.STRING}}, analyticsTips: {type: Type.ARRAY, items: {type: Type.STRING}} }, required: ["schemaMarkup", "analyticsTips"] },
            growthStrategy: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, adTargeting: {type: Type.ARRAY, items: {type: Type.STRING}}, uxPersonalization: {type: Type.ARRAY, items: {type: Type.STRING}} }, required: ["adTargeting", "uxPersonalization"] }
        },
        required: ["geoStrategy", "socialStrategy", "technicalStrategy", "growthStrategy"]
    }, 'gemini-2.5-pro'
);

// --- Strands ---
const brandCompSchema = (prop: string, desc: string, isArray = false, subProps?: any) => ({
    type: Type.OBJECT,
    properties: { [prop]: isArray ? { type: Type.ARRAY, description: desc, items: { type: Type.STRING } } : (subProps ? { type: Type.OBJECT, properties: subProps, required: Object.keys(subProps) } : { type: Type.STRING, description: desc }) },
    required: [prop]
});

export const generateBrandEssence = async (c: string, a: string, k: string, sys: string) => generateJsonContent(`Brand essence for: ${c}, ${a}, ${k}.`, brandCompSchema('brandEssence', 'Summary'), 'gemini-2.5-pro');
export const generateNameSuggestions = async (e: string, sys: string) => generateJsonContent(`Names for: ${e}`, brandCompSchema('nameSuggestions', '3-5 names', true), 'gemini-2.5-pro');
export const generateTaglinesAndSocial = async (e: string, sys: string) => generateJsonContent(`Taglines & Post for: ${e}`, { type: Type.OBJECT, properties: { taglines: { type: Type.ARRAY, items: { type: Type.STRING } }, socialMediaPost: { type: Type.STRING } }, required: ["taglines", "socialMediaPost"] }, 'gemini-2.5-pro');
export const generateVisualIdentity = async (e: string, sys: string) => generateJsonContent(`Visual ID for: ${e}`, brandCompSchema('visualIdentity', '', false, { logoConcept: { type: Type.STRING }, colorPalette: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, hex: { type: Type.STRING } }, required: ["name", "hex"] } }, typography: { type: Type.STRING } }), 'gemini-2.5-pro');
export const generateMarketingAngles = async (e: string, sys: string) => generateJsonContent(`Angles for: ${e}`, brandCompSchema('marketingAngles', '2-3 angles', true), 'gemini-2.5-pro');

// --- Brand Kit Helpers ---
export const generateBrandGuidelines = async (brandData: any) => getGeminiAI().models.generateContent({
    model: 'gemini-2.5-pro',
    contents: `Create comprehensive brand guidelines for the following brand profile. Include sections on Voice & Tone, Logo Usage, Typography Rules, and Color Usage. Format as Markdown.
    
    Brand Profile:
    ${JSON.stringify(brandData, null, 2)}`
});

export const analyzeLayoutForResize = async (platform: string, description: string, imageBase64?: string) => {
    let prompt = `Analyze this design context and provide a tailored image generation prompt to resize/adapt the design for ${platform}. The new design should maintain brand identity but be optimized for the target platform's aspect ratio and user behavior. Description: "${description}".`;
    const parts: any[] = [{ text: prompt }];
    if (imageBase64) parts.push({ inlineData: { data: imageBase64, mimeType: 'image/png' } });
    
    return getGeminiAI().models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts }
    });
};

// --- Content ---
export const expandContent = async (topic: string, type: string, tone: string) => getGeminiAI().models.generateContent({ model: 'gemini-2.5-pro', contents: `Expand "${topic}" into a ${type}. Tone: ${tone}. Markdown.` });

export const generatePodcastScript = async (source: string) => generateJsonContent(
    `Podcast script (Alex & Jamie) about: "${source}". JSON array of {speaker, text}.`,
    { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { speaker: { type: Type.STRING, enum: ["Alex", "Jamie"] }, text: { type: Type.STRING } }, required: ["speaker", "text"] } }
);

export const generateTrendReport = async (topic: string) => getGeminiAI().models.generateContent({ model: 'gemini-2.5-pro', contents: `Trend report for "${topic}". Emerging, Declining, Wildcard. Markdown.`, config: { tools: [{ googleSearch: {} }] } });

// --- Quiz & Deck ---
export const generateSmartQuiz = async (content: string, fromTopic = false) => generateJsonContent(
    `Smart quiz ${fromTopic ? 'about' : 'from'}: "${content}". JSON {title, questions:[{id, question, options:[{text, isCorrect, feedback}], difficulty, type}], summary:{perfectMessage, goodMessage, averageMessage}}.`,
    { type: Type.OBJECT, properties: { title: { type: Type.STRING }, questions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.INTEGER }, question: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { text: { type: Type.STRING }, isCorrect: { type: Type.BOOLEAN }, feedback: { type: Type.STRING } }, required: ["text", "isCorrect", "feedback"] } }, difficulty: { type: Type.STRING }, type: { type: Type.STRING } }, required: ["id", "question", "options", "difficulty", "type"] } }, summary: { type: Type.OBJECT, properties: { perfectMessage: { type: Type.STRING }, goodMessage: { type: Type.STRING }, averageMessage: { type: Type.STRING } }, required: ["perfectMessage", "goodMessage", "averageMessage"] } }, required: ["title", "questions", "summary"] },
    'gemini-2.5-pro'
);

export const generateSlideDeckStructure = async (topic: string, audience: string, count: number, tone: string, format: string, lang: string, len: string, context?: { data: string, mimeType: string }) => {
    const prompt = `Create ${len} ${format} (${lang}). Topic: "${topic}", Audience: "${audience}", Tone: "${tone}", ${count} slides. JSON array of {title, bullets[], visualDescription, speakerNotes}.`;
    const contents = context ? { parts: [{ text: prompt }, { inlineData: context }] } : { parts: [{ text: prompt }] };
    return getGeminiAI().models.generateContent({
        model: 'gemini-2.5-pro',
        contents,
        config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, bullets: { type: Type.ARRAY, items: { type: Type.STRING } }, visualDescription: { type: Type.STRING }, speakerNotes: { type: Type.STRING } }, required: ["title", "bullets", "visualDescription", "speakerNotes"] } } }
    });
};

export const generateReportContent = async (topic: string, type: string, len: string, lang: string) => 
    getGeminiAI().models.generateContent({ model: 'gemini-2.5-pro', contents: `Write ${len} ${type} about "${topic}" in ${lang}. Markdown.`, config: { tools: [{ googleSearch: {} }] } });

export const generateInfographicConcepts = async (topic: string, style: string, lang: string) => generateJsonContent(
    `Infographic concept for "${topic}" (${lang}, ${style}). JSON {title, visualLayout, dataPoints[]}.`,
    {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            visualLayout: { type: Type.STRING },
            dataPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["title", "visualLayout", "dataPoints"]
    }
);

export const generateFlashcards = async (topic: string, count: number, lang: string) => generateJsonContent(
    `${count} flashcards about "${topic}" in ${lang}. JSON array of {front, back}.`,
    { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { front: { type: Type.STRING }, back: { type: Type.STRING } }, required: ["front", "back"] } }
);

// --- Domain Finder ---
export const generateDomainAndHostingRecommendations = async (description: string, projectType: string) => generateJsonContent(
    `Suggest domains and hosting for: "${description}" (Type: ${projectType}). JSON {domains: string[], hosting: [{name, description, bestFor, freeTierFeatures}]}.`,
    {
        type: Type.OBJECT,
        properties: {
            domains: { type: Type.ARRAY, items: { type: Type.STRING } },
            hosting: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        bestFor: { type: Type.STRING },
                        freeTierFeatures: { type: Type.STRING }
                    },
                    required: ["name", "description", "bestFor", "freeTierFeatures"]
                }
            }
        },
        required: ["domains", "hosting"]
    },
    'gemini-2.5-pro'
);

// --- Vibe Coding ---
export const generateVibeApp = async (prompt: string) => getGeminiAI().models.generateContent({
    model: 'gemini-2.5-pro',
    contents: `Create a single-file HTML/JS/CSS app based on this idea: "${prompt}". It should be modern, colorful, and fully functional. Return the code directly.`
});

// --- Code Reviewer ---
export const reviewCode = async (code: string) => generateJsonContent(
    `Review this code for security, bugs, and performance. Return JSON: {summary, bugScore (0-100), securityScore (0-100), issues: [{type, line, severity (Critical/High/Medium/Low), description, rootCause, fix}], fixedCode}. Code:\n${code}`,
    {
        type: Type.OBJECT,
        properties: {
            summary: { type: Type.STRING },
            bugScore: { type: Type.INTEGER },
            securityScore: { type: Type.INTEGER },
            issues: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        type: { type: Type.STRING },
                        line: { type: Type.INTEGER },
                        severity: { type: Type.STRING, enum: ['Critical', 'High', 'Medium', 'Low'] },
                        description: { type: Type.STRING },
                        rootCause: { type: Type.STRING },
                        fix: { type: Type.STRING }
                    },
                    required: ["type", "line", "severity", "description", "rootCause", "fix"]
                }
            },
            fixedCode: { type: Type.STRING }
        },
        required: ["summary", "bugScore", "securityScore", "issues", "fixedCode"]
    },
    'gemini-2.5-pro'
);
