
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

// --- Vibe Coding ---

export const generateVibeApp = async (prompt: string): Promise<GenerateContentResponse> => {
    const ai = getGeminiAI();
    const systemPrompt = `You are an expert frontend engineer and UI/UX designer.
    Your task is to generate a complete, single-file HTML application based on the user's description.
    
    Requirements:
    1.  Return ONLY the raw HTML code. Do not wrap it in markdown code blocks (like \`\`\`html).
    2.  Include all CSS in <style> tags and JS in <script> tags.
    3.  Use Tailwind CSS via CDN (https://cdn.tailwindcss.com) for styling.
    4.  Ensure the design is modern, clean, and responsive. Use a dark mode theme by default unless specified otherwise.
    5.  The app should be interactive and functional.
    6.  If the user asks for a game, make it playable. If a tool, make it work.
    
    User Description: ${prompt}`;

    return ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: systemPrompt,
    });
};

// --- Code Reviewer (Terminal Architect) ---

export const reviewCode = async (code: string): Promise<GenerateContentResponse> => {
    const ai = getGeminiAI();
    const systemPrompt = `You are a world-class Senior Principal Engineer and Security Researcher.
    Your task is to perform a deep-dive static analysis, security audit, and logic review of the provided code.
    You are critical, precise, and focused on production-readiness.
    
    You must identify:
    1. **Critical Bugs**: Logic errors that will cause crashes or incorrect behavior.
    2. **Security Vulnerabilities**: OWASP Top 10 issues (XSS, Injection, etc.).
    3. **Performance Issues**: Big-O complexity problems or memory leaks.
    4. **Best Practices**: Clean code violations.
    
    You must also provide the **Fixed Code** that resolves these issues while maintaining the original intent.
    
    Output strictly as JSON.`;

    const userPrompt = `Review this code:\n\n${code}`;

    return ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: userPrompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    summary: { type: Type.STRING, description: "A high-level executive summary of the code quality." },
                    bugScore: { type: Type.INTEGER, description: "0-100 score (100 is perfect)." },
                    securityScore: { type: Type.INTEGER, description: "0-100 score (100 is secure)." },
                    issues: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                type: { type: Type.STRING, enum: ["Bug", "Security", "Performance", "Style"] },
                                line: { type: Type.INTEGER, description: "Approximate line number, or 0 if general." },
                                severity: { type: Type.STRING, enum: ["Critical", "High", "Medium", "Low"] },
                                description: { type: Type.STRING, description: "What is broken." },
                                rootCause: { type: Type.STRING, description: "Why it is broken (deep technical explanation)." },
                                fix: { type: Type.STRING, description: "Short description of the fix." }
                            },
                            required: ["type", "severity", "description", "rootCause", "fix"]
                        }
                    },
                    fixedCode: { type: Type.STRING, description: "The complete, refactored, and fixed version of the code." }
                },
                required: ["summary", "bugScore", "securityScore", "issues", "fixedCode"]
            },
            thinkingConfig: { thinkingBudget: 16384 } // Use thinking to really analyze deep logic
        }
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

export const transcribeAudio = async (audioBase64: string, mimeType: string, prompt: string = "Transcribe the following audio recording."): Promise<GenerateContentResponse> => {
    const ai = getGeminiAI();
    return ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { text: prompt },
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
    const ai = new GoogleGenAI({});
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
    const ai = new GoogleGenAI({});
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

// --- Meme Generator ---
export const generateMemeConcept = async (topic: string, style: string): Promise<GenerateContentResponse> => {
    const ai = getGeminiAI();
    const prompt = `Generate a viral meme concept.
    Topic: "${topic}"
    Style: "${style}"

    Your task is to provide three pieces of information in a JSON format:
    1.  'imageDescription': A highly descriptive, literal visual description of the image to be generated. This should be suitable for an AI image generator. Do NOT mention any text, letters, or words in this description.
    2.  'topText': The short, punchy caption text for the top of the meme. MUST BE IN ALL CAPS.
    3.  'bottomText': The short, punchy caption text for the bottom of the meme. MUST BE IN ALL CAPS.
    
    Example for "Classic" style:
    - Topic: "waking up early"
    - Output: { "imageDescription": "A photorealistic image of a grumpy cat with messy fur, glaring at the camera.", "topText": "I'M A MORNING PERSON", "bottomText": "I MOURN THE LOSS OF MY BED" }
    `;

    return ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    imageDescription: {
                        type: Type.STRING,
                        description: "A detailed, literal description of an image for an AI image generator. No text should be mentioned."
                    },
                    topText: {
                        type: Type.STRING,
                        description: "The caption text for the top of the meme. Keep it short and in ALL CAPS."
                    },
                    bottomText: {
                        type: Type.STRING,
                        description: "The caption text for the bottom of the meme. Keep it short and in ALL CAPS."
                    }
                },
                required: ["imageDescription", "topText", "bottomText"],
            },
        },
    });
};

export const generateMemeConceptFromImage = async (imageBase64: string, mimeType: string, style: string): Promise<GenerateContentResponse> => {
    const ai = getGeminiAI();
    const prompt = `Analyze this image and generate a viral meme concept in the style of "${style}".

    Your task is to provide three pieces of information in a JSON format:
    1.  'imageDescription': A short, witty description of what's happening in the image. This will be used as a spoken script.
    2.  'topText': The short, punchy caption text for the top of the meme. MUST BE IN ALL CAPS.
    3.  'bottomText': The short, punchy caption text for the bottom of the meme. MUST BE IN ALL CAPS.
    `;

    return ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { text: prompt },
                { inlineData: { data: imageBase64, mimeType } },
            ],
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    imageDescription: {
                        type: Type.STRING,
                        description: "A short, witty, spoken-word style description of what's happening in the image. This will become the audio script."
                    },
                    topText: {
                        type: Type.STRING,
                        description: "The caption text for the top of the meme. Keep it short and in ALL CAPS."
                    },
                    bottomText: {
                        type: Type.STRING,
                        description: "The caption text for the bottom of the meme. Keep it short and in ALL CAPS."
                    }
                },
                required: ["imageDescription", "topText", "bottomText"],
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

export const generateBulkEmails = async (template: string): Promise<GenerateContentResponse> => {
    const ai = getGeminiAI();
    const prompt = `Generate 3 examples of a bulk email campaign using the following template. Replace placeholders like [Name] or [Product] with varied, realistic examples.\n\nTemplate:\n${template}`;
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
                        subject: { type: Type.STRING },
                        body: { type: Type.STRING },
                    },
                    required: ['subject', 'body'],
                },
            },
        },
    });
};

export const generateBulkSms = async (template: string): Promise<GenerateContentResponse> => {
    const ai = getGeminiAI();
    const prompt = `Generate 3 varied examples of a bulk SMS campaign using the following template. Keep them concise for SMS. Replace placeholders like [Name] or [Product] with realistic examples.\n\nTemplate:\n${template}`;
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
                        body: { type: Type.STRING },
                    },
                    required: ['body'],
                },
            },
        },
    });
};

// --- Traffic Booster / Outreach (Lead Finding) ---
export const generateOutreachPitch = async (businessName: string, service: string, format: 'email' | 'sms' | 'phone script'): Promise<GenerateContentResponse> => {
    const ai = getGeminiAI();
    const prompt = `Write a short, professional but friendly ${format} pitch to a business named "${businessName}".
    The goal is to offer them "${service}" services.
    
    Keep the pitch concise, friendly, and highlight the potential benefits for their business.
    
    - For an email, include a clear subject line.
    - For an SMS, keep it under 160 characters and include an option to reply STOP.
    - For a phone script, include a friendly opening, a key value proposition, a question to engage them, and a closing.`;

    return ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
};

// --- AI Traffic Booster (Strategy Generator) ---

export const generateTrafficStrategy = async (niche: string, audience: string, url: string): Promise<GenerateContentResponse> => {
    const ai = getGeminiAI();
    const prompt = `Act as an elite "AI Traffic Booster" strategist. Your goal is to help a website grab a slice of the 10 billion monthly visits available online by optimizing for AI Search (GEO), Social Media, and Technical excellence.

    Context:
    - Niche: "${niche}"
    - Audience: "${audience}"
    - Website URL: "${url || 'New Brand'}"

    Generate a comprehensive 4-pillar strategy:

    1. Content & GEO (Generative Engine Optimization):
       - How to rank in AI Overviews (Google SGE) and LLM answers (ChatGPT, Perplexity).
       - Specific "citation-worthy" content formats (tables, stats, quotes).
       - Keyword strategy for conversational queries.

    2. Social Dominance & Distribution:
       - Tactics for repurposing content across platforms (LinkedIn, TikTok, etc.).
       - Viral hooks specific to this niche.
       - Timing/Hashtag strategy.

    3. Technical Foundation & Analytics:
       - Essential Schema Markup (for machine readability).
       - How to track AI-driven traffic (e.g. custom filters).
       - Technical audits (speed, mobile usability).

    4. Paid Growth & Conversion (UX):
       - High-ROI ad targeting strategies.
       - Personalization tactics to lower bounce rate.
       - "Zero-click" value propositions.

    Return strictly as JSON matching the provided schema.`;

    return ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    geoStrategy: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            tactics: { type: Type.ARRAY, items: { type: Type.STRING } },
                            citationContent: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Ideas for citation-worthy content (stats, tables)" },
                        },
                         required: ["title", "tactics", "citationContent"]
                    },
                    socialStrategy: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            repurposingTactics: { type: Type.ARRAY, items: { type: Type.STRING } },
                            viralHooks: { type: Type.ARRAY, items: { type: Type.STRING } },
                        },
                        required: ["title", "repurposingTactics", "viralHooks"]
                    },
                    technicalStrategy: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            schemaMarkup: { type: Type.ARRAY, items: { type: Type.STRING } },
                            analyticsTips: { type: Type.ARRAY, items: { type: Type.STRING } },
                        },
                        required: ["title", "schemaMarkup", "analyticsTips"]
                    },
                    growthStrategy: {
                        type: Type.OBJECT,
                         properties: {
                            title: { type: Type.STRING },
                            adTargeting: { type: Type.ARRAY, items: { type: Type.STRING } },
                            uxPersonalization: { type: Type.ARRAY, items: { type: Type.STRING } },
                        },
                        required: ["title", "adTargeting", "uxPersonalization"]
                    }
                },
                required: ["geoStrategy", "socialStrategy", "technicalStrategy", "growthStrategy"],
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

// --- Content Generator ---
export const expandContent = async (topic: string, contentType: string, tone: string): Promise<GenerateContentResponse> => {
    const ai = getGeminiAI();
    const prompt = `Expand the following topic/idea into a full "${contentType}".
    Topic: "${topic}"
    
    The tone of voice for the content should be: ${tone}.
    
    Format the output in Markdown. Ensure the response is well-structured, comprehensive, and ready for publication.`;
    
    return ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
    });
};

// --- Podcast Generator ---
export const generatePodcastScript = async (sourceText: string): Promise<GenerateContentResponse> => {
    const ai = getGeminiAI();
    const prompt = `Create a lively, engaging podcast script between two hosts, Alex and Jamie, based on the following source material.
    
    Source Material: "${sourceText}"
    
    The conversation should be natural, with banter, "hmm"s, and clear turn-taking.
    Alex is enthusiastic and asks questions. Jamie is insightful and explains details.
    
    Return a JSON array of objects, where each object has a "speaker" (either "Alex" or "Jamie") and "text" (their dialogue).
    Example: [{"speaker": "Alex", "text": "Welcome back everyone!"}, {"speaker": "Jamie", "text": "Today we're diving deep into..."}]`;

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
                        speaker: { type: Type.STRING, enum: ["Alex", "Jamie"] },
                        text: { type: Type.STRING },
                    },
                    required: ["speaker", "text"],
                },
            },
        },
    });
};

// --- Trend Forecaster ---
export const generateTrendReport = async (topic: string): Promise<GenerateContentResponse> => {
    const ai = getGeminiAI();
    const prompt = `Act as a future trends analyst. Research and analyze the current landscape and future trajectory of "${topic}".
    
    Use Google Search to find the latest real-time data, news, and signals.

    Identify:
    1. Three Emerging Trends (What is gaining traction right now?)
    2. One Declining Trend (What is fading away?)
    3. One Wildcard Prediction (Low probability, high impact event)

    Format the output as a clean Markdown report with headers, bullet points, and bold text for emphasis. 
    Do NOT return JSON. Return a human-readable Markdown document.`;

    return ai.models.generateContent({
        model: 'gemini-2.5-pro', // Using Pro for better synthesis
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        }
    });
};

// --- Domain Finder ---
export const generateDomainAndHostingRecommendations = async (description: string, projectType: string): Promise<GenerateContentResponse> => {
    const ai = getGeminiAI();
    const prompt = `Generate domain name suggestions and hosting provider recommendations for the following project.

    Project Description: "${description}"
    Project Type: "${projectType}"

    Provide 5 creative domain names.
    Provide 3 hosting providers suitable for this project type, focusing on those with good free tiers or low cost entry.

    Return the response as a JSON object.`;

    return ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    domains: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.STRING,
                        },
                    },
                    hosting: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: {
                                    type: Type.STRING,
                                },
                                description: {
                                    type: Type.STRING,
                                },
                                bestFor: {
                                    type: Type.STRING,
                                },
                                freeTierFeatures: {
                                    type: Type.STRING,
                                },
                            },
                            required: ["name", "description", "bestFor", "freeTierFeatures"],
                        },
                    },
                },
                required: ["domains", "hosting"],
            },
        },
    });
};

// --- Smart Quiz Generator ---
export const generateSmartQuiz = async (content: string, fromTopic: boolean = false): Promise<GenerateContentResponse> => {
    const ai = getGeminiAI();
    
    const baseInstruction = `You are an expert quiz creator who transforms educational materials into engaging, interactive quizzes with a modern aesthetic.
    
    Analyze the provided ${fromTopic ? 'topic' : 'content'} and generate a visually appealing quiz.
    Include a mix of question types (recall, application, analysis) progressing from easier to more challenging.
    
    The output MUST be a strictly valid JSON object with the following schema:
    {
        "title": "Quiz Title with thematic emoji",
        "questions": [
            {
                "id": 1,
                "question": "Question text here (include an emoji like 📝, 🎯, 💡, etc.)",
                "options": [
                    { "text": "Option 1", "isCorrect": boolean, "feedback": "Immediate feedback explaining why this is right/wrong" },
                    { "text": "Option 2", "isCorrect": boolean, "feedback": "Feedback..." },
                    { "text": "Option 3", "isCorrect": boolean, "feedback": "Feedback..." },
                    { "text": "Option 4", "isCorrect": boolean, "feedback": "Feedback..." }
                ],
                "difficulty": "Easy" | "Medium" | "Hard",
                "type": "Recall" | "Application" | "Analysis"
            }
        ],
        "summary": {
            "perfectMessage": "Message for 100% score (with emojis like 🏆)",
            "goodMessage": "Message for >70% score (with emojis like 🌟)",
            "averageMessage": "Message for <70% score (with emojis like 💪)"
        }
    }
    `;

    const userPrompt = fromTopic 
        ? `Generate a smart quiz about the topic: "${content}". Use your internal knowledge to create accurate and engaging questions.`
        : `Generate a smart quiz based on the following content:\n\n"${content}"`;

    return ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: userPrompt,
        config: {
            systemInstruction: baseInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    questions: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.INTEGER },
                                question: { type: Type.STRING },
                                options: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            text: { type: Type.STRING },
                                            isCorrect: { type: Type.BOOLEAN },
                                            feedback: { type: Type.STRING }
                                        },
                                        required: ["text", "isCorrect", "feedback"]
                                    }
                                },
                                difficulty: { type: Type.STRING },
                                type: { type: Type.STRING }
                            },
                            required: ["id", "question", "options", "difficulty", "type"]
                        }
                    },
                    summary: {
                        type: Type.OBJECT,
                        properties: {
                            perfectMessage: { type: Type.STRING },
                            goodMessage: { type: Type.STRING },
                            averageMessage: { type: Type.STRING }
                        },
                        required: ["perfectMessage", "goodMessage", "averageMessage"]
                    }
                },
                required: ["title", "questions", "summary"]
            },
            ...(fromTopic ? { tools: [{ googleSearch: {} }] } : {}) // Use search if generating from topic
        }
    });
};

// --- Slide Deck Generator ---
export const generateSlideDeckStructure = async (
    topic: string, 
    audience: string, 
    count: number, 
    tone: string,
    format: string,
    language: string,
    length: string,
    context?: { data: string, mimeType: string }
): Promise<GenerateContentResponse> => {
    const ai = getGeminiAI();
    const promptText = `Create a ${length.toLowerCase()} ${format.toLowerCase()} in ${language}.
    Topic: "${topic}"
    Audience: "${audience}"
    Tone: "${tone}"
    Number of Slides: ${count}

    For each slide, provide:
    1. Title
    2. A list of 3-4 key bullet points
    3. A detailed visual description for an image that would go on the slide (for an AI image generator)
    4. Speaker notes

    Return strictly as a JSON array of slide objects.`;

    const contents = context ? {
        parts: [
            { text: promptText },
            { inlineData: context }
        ]
    } : {
        parts: [{ text: promptText }]
    };

    return ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: contents,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
                        visualDescription: { type: Type.STRING },
                        speakerNotes: { type: Type.STRING }
                    },
                    required: ["title", "bullets", "visualDescription", "speakerNotes"]
                }
            }
        }
    });
};

export const generateReportContent = async (topic: string, type: string, length: string, language: string): Promise<GenerateContentResponse> => {
    const ai = getGeminiAI();
    const prompt = `Write a ${length} ${type} about "${topic}" in ${language}. Format it using Markdown with headers, bullet points, and clear sections. Ensure the tone is professional and the content is comprehensive.`;
    return ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
    });
};

export const generateInfographicConcepts = async (topic: string, style: string, language: string): Promise<GenerateContentResponse> => {
    const ai = getGeminiAI();
    const prompt = `Create a concept for a ${style} infographic about "${topic}" in ${language}.
    Provide:
    1. A title for the infographic.
    2. A detailed description of the visual layout.
    3. 5 key data points or facts to include.
    
    Return strictly as JSON.`;

    return ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    visualLayout: { type: Type.STRING },
                    dataPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["title", "visualLayout", "dataPoints"]
            }
        }
    });
};

export const generateFlashcards = async (topic: string, count: number, language: string): Promise<GenerateContentResponse> => {
    const ai = getGeminiAI();
    const prompt = `Create ${count} flashcards about "${topic}" in ${language}.
    Each card should have a "front" (question/term) and a "back" (answer/definition).
    Return strictly as a JSON array.`;

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
                        front: { type: Type.STRING },
                        back: { type: Type.STRING }
                    },
                    required: ["front", "back"]
                }
            }
        }
    });
};
