
import { GoogleGenAI, GenerateContentResponse, Chat, Modality, Type } from "@google/genai";

// This file centralizes all API calls to the Gemini API.

// IMPORTANT: Do not instantiate GoogleGenAI here.
// For features using Veo, a new instance must be created before each call
// to ensure the latest API key from the selection dialog is used.
// For other features, we can create it on demand.

const getGeminiAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Text Generation ---

export const generateText = async (prompt: string, model: 'gemini-2.5-flash' | 'gemini-2.5-flash-lite' | 'gemini-2.5-pro' = 'gemini-2.5-flash'): Promise<GenerateContentResponse> => {
    const ai = getGeminiAI();
    return ai.models.generateContent({ model, contents: prompt });
};

export const generateTextWithThinking = async (prompt: string): Promise<GenerateContentResponse> => {
    const ai = getGeminiAI();
    return ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: { thinkingConfig: { thinkingBudget: 32768 } },
    });
};

// --- Chat ---

export const createChatSession = (systemInstruction?: string): Chat => {
    const ai = getGeminiAI();
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: systemInstruction ? { systemInstruction } : undefined,
    });
};

// --- Image Generation & Editing ---

export const generateImage = async (prompt: string, aspectRatio: string): Promise<string> => {
    const ai = getGeminiAI();
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio,
        },
    });
    return response.generatedImages[0].image.imageBytes;
};

export const editImage = async (prompt: string, imageBase64: string, mimeType: string): Promise<string | null> => {
    const ai = getGeminiAI();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                { inlineData: { data: imageBase64, mimeType } },
                { text: prompt },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });
    const part = response.candidates?.[0]?.content?.parts?.[0];
    return part?.inlineData?.data ?? null;
};

// --- Media Analysis ---

export const analyzeImage = async (prompt: string, imageBase64: string, mimeType: string): Promise<GenerateContentResponse> => {
    const ai = getGeminiAI();
    return ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { text: prompt },
                { inlineData: { data: imageBase64, mimeType } },
            ],
        },
    });
};

export const analyzeVideoFrame = async (prompt: string, imageBase64: string, mimeType: string): Promise<GenerateContentResponse> => {
     const ai = getGeminiAI();
     return ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: {
            parts: [
                { text: `Analyze this video frame. The user's query is: "${prompt}"` },
                { inlineData: { data: imageBase64, mimeType } },
            ],
        },
    });
};

export const transcribeAudio = async (audioBase64: string, mimeType: string): Promise<GenerateContentResponse> => {
    const ai = getGeminiAI();
    return ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { text: "Transcribe the following audio recording." },
                { inlineData: { data: audioBase64, mimeType } }
            ]
        }
    });
}

// --- Video Generation (Veo) ---

export const generateVideoFromPrompt = async (prompt: string, aspectRatio: '16:9' | '9:16', isHighQuality: boolean): Promise<any> => {
    const ai = getGeminiAI();
    const model = isHighQuality ? 'veo-3.1-generate-preview' : 'veo-3.1-fast-generate-preview';
    return ai.models.generateVideos({
        model,
        prompt,
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio,
        },
    });
};

export const generateVideoFromImage = async (prompt: string | null, imageBase64: string, mimeType: string, aspectRatio: '16:9' | '9:16', isHighQuality: boolean): Promise<any> => {
    const ai = getGeminiAI();
    const model = isHighQuality ? 'veo-3.1-generate-preview' : 'veo-3.1-fast-generate-preview';
    return ai.models.generateVideos({
        model,
        prompt: prompt ?? "Animate this image.",
        image: {
            imageBytes: imageBase64,
            mimeType: mimeType,
        },
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio,
        },
    });
};

export const extendVideo = async (prompt: string, previousVideo: any, aspectRatio: '16:9' | '9:16'): Promise<any> => {
    const ai = getGeminiAI();
    return ai.models.generateVideos({
        model: 'veo-3.1-generate-preview',
        prompt,
        video: previousVideo,
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio,
        },
    });
};

export const pollVideoOperation = async (operation: any): Promise<any> => {
    const ai = getGeminiAI();
    return ai.operations.getVideosOperation({ operation });
};

// --- Grounded Generation ---

export const performGroundedSearch = async (prompt: string, useMaps: boolean, location?: { latitude: number; longitude: number }): Promise<GenerateContentResponse> => {
    const ai = getGeminiAI();
    const tools: any[] = [{ googleSearch: {} }];
    if (useMaps) {
        tools.push({ googleMaps: {} });
    }

    const toolConfig = useMaps && location ? {
        retrievalConfig: { latLng: location }
    } : undefined;
    
    return ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            tools,
            toolConfig,
        },
    });
};

// --- Text-to-Speech ---

export const generateSpeech = async (text: string, voiceName: string = 'Kore'): Promise<string | null> => {
    const ai = getGeminiAI();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts: [{ text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName },
                },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio ?? null;
};

export const generateMultiSpeakerSpeech = async (
    text: string,
    speakers: { speaker: string; voiceName: string }[]
): Promise<string | null> => {
    const ai = getGeminiAI();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts: [{ text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                multiSpeakerVoiceConfig: {
                    speakerVoiceConfigs: speakers.map(({ speaker, voiceName }) => ({
                        speaker,
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName }
                        }
                    }))
                }
            }
        }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio ?? null;
};


// --- Songs Generator ---
export const generateSongConcept = async (genre: string, mood: string, topic: string): Promise<GenerateContentResponse> => {
    const ai = getGeminiAI();
    const prompt = `Generate a complete song concept based on the following details:
- Genre: ${genre}
- Mood: ${mood}
- Topic/Theme: ${topic}

The song should include a title, lyrics structured with section markers (e.g., [Verse 1], [Chorus]), a suitable chord progression, and a description of the musical arrangement.`;

    return ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: {
                        type: Type.STRING,
                        description: "The title of the song."
                    },
                    lyrics: {
                        type: Type.STRING,
                        description: "The full lyrics of the song, with sections like [Verse 1], [Chorus], [Bridge], etc. clearly marked."
                    },
                    chordProgression: {
                        type: Type.STRING,
                        description: "A typical chord progression for the song's main sections (e.g., Verse: Am-G-C-F, Chorus: C-G-Am-F)."
                    },
                    arrangementDescription: {
                        type: Type.STRING,
                        description: "A brief description of the musical arrangement, including instrumentation, tempo, and overall feel."
                    },
                },
                required: ["title", "lyrics", "chordProgression", "arrangementDescription"],
            },
        },
    });
};

// --- Movie Generator ---
export const generateDialogueSnippet = async (title: string, logline: string, genre: string): Promise<GenerateContentResponse> => {
    const ai = getGeminiAI();
    const prompt = `Generate a short dialogue snippet (2-4 lines) for a ${genre} movie titled "${title}" with the logline: "${logline}". The dialogue should be between two characters. Return the response as a valid JSON array of objects, where each object has "character" (string), "action" (string, e.g., "whispering"), and "dialogue" (string) keys. For example: [{"character": "KAEL", "action": "(urgently)", "dialogue": "We can't go back."}, {"character": "ELARA", "action": "(looking at the portal)", "dialogue": "We have to."}]`;
    
    return ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        character: { type: Type.STRING },
                        action: { type: Type.STRING },
                        dialogue: { type: Type.STRING },
                    },
                    required: ['character', 'dialogue'],
                },
            },
        },
    });
};

export const generateCharacterSituations = async (title: string, logline: string, genre: string): Promise<GenerateContentResponse> => {
    const ai = getGeminiAI();
    const prompt = `Generate 2-3 main character descriptions and their initial situation/dilemma for a ${genre} movie titled "${title}" with the logline: "${logline}". Focus on what makes them compelling and what their immediate conflict is. Return the response as a valid JSON array of objects, where each object has "characterName" (string) and "description" (string) keys. For example: [{"characterName": "Kael", "description": "A cynical ex-soldier who just wants to be left alone but is pulled back in for one last job."}]`;
    
    return ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        characterName: { type: Type.STRING },
                        description: { type: Type.STRING },
                    },
                    required: ['characterName', 'description'],
                },
            },
        },
    });
};

export const generateStoryOutline = async (title: string, logline: string, genre: string): Promise<GenerateContentResponse> => {
    const ai = getGeminiAI();
    const prompt = `Generate a 3-act story outline for a ${genre} movie titled "${title}" with the logline: "${logline}". Create a title and a brief description for each of the three acts. Return the response as a valid JSON array of objects, where each object has "title" (string, e.g., "Act 1: The Inciting Incident") and "description" (string) keys.`;
    
    return ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                    },
                    required: ['title', 'description'],
                },
            },
        },
    });
};

export const generateMusicCues = async (title: string, genre: string, scenes: {title: string, description: string}[]): Promise<GenerateContentResponse> => {
    const ai = getGeminiAI();
    const sceneDescriptions = scenes.map(s => `- ${s.title}: ${s.description}`).join('\n');
    const prompt = `Based on the following movie concept, suggest 2-3 key music cues or tracks for the soundtrack.
    
    Movie Title: "${title}"
    Genre: ${genre}
    Scenes:
    ${sceneDescriptions || "No scenes defined yet. Suggest a main theme and an action theme."}
    
    For each cue, provide a title and a description of its mood, tempo, and potential instrumentation. Return the response as a valid JSON array of objects, where each object has "title" (string, e.g., "Main Title Theme") and "description" (string) keys.`;
    
    return ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                    },
                    required: ['title', 'description'],
                },
            },
        },
    });
};

// --- Marketing Assistant ---
export const generateAbTestCopy = async (productDescription: string, keyMessage: string, targetAudience: string): Promise<GenerateContentResponse> => {
    const ai = getGeminiAI();
    const prompt = `Generate 3 A/B test variations for marketing copy.
Product Description: ${productDescription}
Key Message/Goal: ${keyMessage}
Target Audience: ${targetAudience}
For each variation, use a different marketing angle (e.g., scarcity, benefit-oriented, question-based, social proof).`;

    return ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        angle: {
                            type: Type.STRING,
                            description: "The marketing angle used for this variation (e.g., 'Scarcity', 'Benefit-Oriented').",
                        },
                        copy: {
                            type: Type.STRING,
                            description: "The generated marketing copy text.",
                        },
                    },
                    required: ['angle', 'copy'],
                },
            },
        },
    });
};

// --- Strands Generator (Multi-Agent) ---

const generateBrandComponent = async (prompt: string, systemInstruction: string, responseSchema: any): Promise<GenerateContentResponse> => {
    const ai = getGeminiAI();
    return ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema,
        },
    });
};

export const generateBrandEssence = async (concept: string, audience: string, keywords: string, leadAgentInstruction: string): Promise<GenerateContentResponse> => {
    const prompt = `Generate a brand essence for the following concept:\n- Core Concept: ${concept}\n- Target Audience: ${audience}\n- Key Values/Keywords: ${keywords}`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            brandEssence: {
                type: Type.STRING,
                description: "A short, one-paragraph summary of the brand's core identity.",
            },
        },
        required: ["brandEssence"],
    };
    return generateBrandComponent(prompt, leadAgentInstruction, schema);
};

export const generateNameSuggestions = async (brandEssence: string, systemInstruction: string): Promise<GenerateContentResponse> => {
    const prompt = `Based on the following brand essence, generate names:\n\n${brandEssence}`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            nameSuggestions: {
                type: Type.ARRAY,
                description: "An array of 3-5 potential brand or product names.",
                items: { type: Type.STRING },
            },
        },
        required: ["nameSuggestions"],
    };
    return generateBrandComponent(prompt, systemInstruction, schema);
};

export const generateTaglinesAndSocial = async (brandEssence: string, systemInstruction: string): Promise<GenerateContentResponse> => {
    const prompt = `Based on the following brand essence, generate taglines and a social media post:\n\n${brandEssence}`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            taglines: {
                type: Type.ARRAY,
                description: "An array of 3-5 catchy taglines or slogans.",
                items: { type: Type.STRING },
            },
            socialMediaPost: {
                type: Type.STRING,
                description: "A sample social media post to kickstart the brand's online presence, including relevant hashtags.",
            },
        },
        required: ["taglines", "socialMediaPost"],
    };
    return generateBrandComponent(prompt, systemInstruction, schema);
};

export const generateVisualIdentity = async (brandEssence: string, systemInstruction: string): Promise<GenerateContentResponse> => {
    const prompt = `Based on the following brand essence, define the visual identity:\n\n${brandEssence}`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            visualIdentity: {
                type: Type.OBJECT,
                properties: {
                    logoConcept: { type: Type.STRING },
                    colorPalette: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                hex: { type: Type.STRING },
                            },
                            required: ["name", "hex"],
                        },
                    },
                    typography: { type: Type.STRING },
                },
                required: ["logoConcept", "colorPalette", "typography"],
            },
        },
        required: ["visualIdentity"],
    };
    return generateBrandComponent(prompt, systemInstruction, schema);
};

export const generateMarketingAngles = async (brandEssence: string, systemInstruction: string): Promise<GenerateContentResponse> => {
    const prompt = `Based on the following brand essence, generate marketing angles:\n\n${brandEssence}`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            marketingAngles: {
                type: Type.ARRAY,
                description: "An array of 2-3 unique marketing angles or campaign ideas.",
                items: { type: Type.STRING },
            },
        },
        required: ["marketingAngles"],
    };
    return generateBrandComponent(prompt, systemInstruction, schema);
};
