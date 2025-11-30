
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

export const enhancePrompt = async (originalPrompt: string, type: 'image' | 'video' | 'text'): Promise<GenerateContentResponse> => {
    const ai = getGeminiAI();
    let systemInstruction = "";
    if (type === 'image') systemInstruction = "You are an expert prompt engineer for AI image generation. Rewrite the user's prompt to be highly detailed, descriptive, and optimized for photorealism, lighting, and texture. Keep it under 60 words.";
    if (type === 'video') systemInstruction = "You are an expert prompt engineer for AI video generation (Veo). Rewrite the user's prompt to include specific camera angles, lighting, motion details, and atmospheric description. Keep it concise.";
    if (type === 'text') systemInstruction = "You are an expert editor. Improve the clarity, tone, and impact of the following text prompt to get the best possible result from an LLM.";

    return ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: originalPrompt,
        config: { systemInstruction }
    });
};

// --- Text Generation ---
export const generateText = async (prompt: string, model: 'gemini-2.5-flash' | 'gemini-2.5-flash-lite' | 'gemini-3-pro-preview' = 'gemini-2.5-flash', config?: any): Promise<GenerateContentResponse> => {
    return getGeminiAI().models.generateContent({ model, contents: prompt, config });
};

export const generateTextWithThinking = async (prompt: string): Promise<GenerateContentResponse> => {
    return getGeminiAI().models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { thinkingConfig: { thinkingBudget: 1024 } }, // Reduced budget for speed/stability
    });
};

// --- Chat ---
export const createChatSession = (systemInstruction?: string, config?: any): Chat => {
    return getGeminiAI().chats.create({
        model: 'gemini-2.5-flash',
        config: { 
            systemInstruction,
            ...config
        },
    });
};

// --- Image Generation & Editing ---
export const generateImage = async (prompt: string, aspectRatio: string): Promise<string> => {
    // Using gemini-2.5-flash-image as default for efficiency
    const ai = getGeminiAI();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { 
            responseModalities: [Modality.IMAGE],
            imageConfig: { aspectRatio: aspectRatio as any }
        },
    });
    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (!part?.inlineData?.data) throw new Error("No image generated");
    return part.inlineData.data;
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
    getGeminiAI().models.generateContent({ model: 'gemini-3-pro-preview', contents: { parts: [{ text: prompt }, { inlineData: { data: imageBase64, mimeType } }] } });

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
        prompt: prompt || undefined,
        image: { imageBytes: imageBase64, mimeType },
        config: { numberOfVideos: 1, resolution: '720p', aspectRatio },
    });
};

export const extendVideo = async (prompt: string, video: any, aspectRatio: '16:9' | '9:16'): Promise<any> => {
    return getGeminiAI().models.generateVideos({
        model: 'veo-3.1-generate-preview',
        prompt,
        video,
        config: { numberOfVideos: 1, resolution: '720p', aspectRatio },
    });
};

export const pollVideoOperation = async (operation: any): Promise<any> => {
    // Correct usage: pass the operation name, not the whole object if checking via name,
    // but the SDK method getVideosOperation accepts {operation: op} according to guidelines.
    return getGeminiAI().operations.getVideosOperation({ operation });
};

// --- Movie Generator Specifics ---

export const generateMovieConcept = async (
    genre: string, 
    tone: string, 
    premise: string, 
    duration: string = '120 min', 
    worldContext?: {
        timePeriod: string;
        location: string;
        techLevel: string;
        magicRules: string;
        politics: string;
    }
): Promise<GenerateContentResponse> => {
    const worldPrompt = worldContext ? `
    World Context:
    - Time Period: ${worldContext.timePeriod}
    - Location/Setting: ${worldContext.location}
    - Technology Level: ${worldContext.techLevel}
    - Magic/Supernatural Rules: ${worldContext.magicRules}
    - Political/Social System: ${worldContext.politics}
    ` : '';

    const prompt = `Develop a unique movie concept based on:
    Genre: ${genre}
    Tone: ${tone}
    Premise: ${premise}
    Target Duration: ${duration}
    ${worldPrompt}

    Return a JSON object with:
    - title: A catchy title
    - logline: A one-sentence summary (max 30 words)
    - worldDescription: A short paragraph describing the setting and atmosphere, incorporating the provided world context details.
    `;
    
    return generateJsonContent(prompt, {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            logline: { type: Type.STRING },
            worldDescription: { type: Type.STRING }
        }
    });
};

export const generateDetailedStory = async (
    title: string, 
    logline: string, 
    genre: string,
    targetSceneCount: string = "100-120",
    endingType: string = "Happy"
): Promise<GenerateContentResponse> => {
    const prompt = `Create a comprehensive story development package for the movie "${title}" (${genre}).
    Logline: ${logline}.
    
    Requirements:
    - Structure: Standard 3-Act Structure.
    - Scene Count Target: Approximately ${targetSceneCount} scenes total.
    - Ending Type: ${endingType}.
    
    Return a JSON object containing:
    1. acts: An array of acts, where each act has a name and a list of 'beats' (the Beat Sheet).
    2. majorPlotPoints: A list of 5-7 key turning points in the narrative.
    3. twists: A list of 1-3 surprising plot twists.
    4. endingDescription: A description of the ending, adhering to the '${endingType}' type.
    5. estimatedSceneCount: An integer estimate of the final scene count based on this structure.
    `;

    return generateJsonContent(prompt, {
        type: Type.OBJECT,
        properties: {
            acts: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        beats: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                }
            },
            majorPlotPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            twists: { type: Type.ARRAY, items: { type: Type.STRING } },
            endingDescription: { type: Type.STRING },
            estimatedSceneCount: { type: Type.INTEGER }
        }
    }, 'gemini-3-pro-preview');
};

export const generateDetailedCharacters = async (title: string, logline: string): Promise<GenerateContentResponse> => {
    const prompt = `Create 3-5 main characters for "${title}". Logline: ${logline}. Return JSON array of objects {name, role, backstory, visualDescription}.`;
    return generateJsonContent(prompt, {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                role: { type: Type.STRING },
                backstory: { type: Type.STRING },
                visualDescription: { type: Type.STRING }
            }
        }
    }, 'gemini-3-pro-preview');
};

export const generateScreenplayScene = async (title: string, beat: string, style: string, details: string[] = []): Promise<GenerateContentResponse> => {
    const detailsPrompt = details.length > 0 ? `\n\nEnsure the following elements are explicitly included and detailed in the screenplay:\n${details.map(d => `- ${d}`).join('\n')}` : '';
    const prompt = `Write a detailed screenplay scene for "${title}" covering the beat: "${beat}". Style: ${style}. Use standard Fountain/screenplay format.${detailsPrompt}`;
    return generateText(prompt, 'gemini-3-pro-preview');
};

export const generateVisualPrompts = async (title: string, style: string, scenes: string[]): Promise<GenerateContentResponse> => {
    const prompt = `For the movie "${title}", generate detailed image generation prompts for these scenes: ${JSON.stringify(scenes)}. Art Style: ${style}. Return JSON array of objects {sceneId, prompt}.`;
    return generateJsonContent(prompt, {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                sceneId: { type: Type.STRING },
                prompt: { type: Type.STRING }
            }
        }
    });
};

export const generateProductionPlan = async (title: string, duration: string): Promise<GenerateContentResponse> => {
    const prompt = `Generate a high-level production plan for the movie "${title}" (Duration: ${duration}). Include: Estimated Budget (Low/Mid/High options), Shooting Schedule (weeks), Key Locations needed, and VFX requirements. Output as Markdown.`;
    return generateText(prompt, 'gemini-2.5-flash');
};

export const generateMarketingAssets = async (title: string, logline: string, type: string): Promise<GenerateContentResponse> => {
    const prompt = `Generate marketing copy for "${title}" (${logline}). Asset Type: ${type}. Include variations if applicable.`;
    return generateText(prompt, 'gemini-2.5-flash');
};

export const generateCharacterSheet = async (name: string, bio: string): Promise<GenerateContentResponse> => {
    const prompt = `Create a detailed character sheet for ${name}: ${bio}. Include: Personality traits (3-5), Costume details, Key prop/item, and a quote. Return JSON.`;
    return generateJsonContent(prompt, {
        type: Type.OBJECT,
        properties: {
            traits: { type: Type.ARRAY, items: { type: Type.STRING } },
            costumeDetails: { type: Type.STRING },
            keyProp: { type: Type.STRING },
            quote: { type: Type.STRING }
        }
    });
};

export const generateWorldDetails = async (baseDescription: string): Promise<GenerateContentResponse> => {
    const prompt = `Expand on this movie world description: "${baseDescription}". Return JSON with: environmentDescription (detailed), uniqueRulesOrMagic (if any), vehicleDesigns (list of strings).`;
    return generateJsonContent(prompt, {
        type: Type.OBJECT,
        properties: {
            environmentDescription: { type: Type.STRING },
            uniqueRulesOrMagic: { type: Type.STRING },
            vehicleDesigns: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
    });
};

export const analyzeStoryStructure = async (structureJson: string): Promise<GenerateContentResponse> => {
    const prompt = `Analyze this story structure JSON: ${structureJson}. Provide a critique on pacing, tension, and character arcs. Return JSON with: tensionCurve (description), characterRelationships (description).`;
    return generateJsonContent(prompt, {
        type: Type.OBJECT,
        properties: {
            tensionCurve: { type: Type.STRING },
            characterRelationships: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
    }, 'gemini-3-pro-preview');
};

export const generateSceneBreakdown = async (sceneHeading: string): Promise<GenerateContentResponse> => {
    const prompt = `Create a production breakdown for scene: "${sceneHeading}". Return JSON with: castNeeded (list), props (list), vfxNotes (string or null), shotList (array of strings).`;
    return generateJsonContent(prompt, {
        type: Type.OBJECT,
        properties: {
            castNeeded: { type: Type.ARRAY, items: { type: Type.STRING } },
            props: { type: Type.ARRAY, items: { type: Type.STRING } },
            vfxNotes: { type: Type.STRING, nullable: true },
            shotList: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
    });
};

// --- General App Features ---

export const performGroundedSearch = async (query: string, useMaps: boolean, location?: { latitude: number, longitude: number }): Promise<GenerateContentResponse> => {
    const ai = getGeminiAI();
    const config: any = {
        tools: useMaps ? [{ googleMaps: {} }] : [{ googleSearch: {} }],
    };
    
    if (useMaps && location) {
        config.toolConfig = {
            retrievalConfig: {
                latLng: {
                    latitude: location.latitude,
                    longitude: location.longitude
                }
            }
        };
    }

    return ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: query,
        config
    });
};

export const generateOutreachPitch = async (businessName: string, service: string, format: 'email' | 'sms' | 'phone script'): Promise<GenerateContentResponse> => {
    const prompt = `Write a persuasive ${format} pitch to ${businessName} offering ${service}. Keep it professional, concise, and focused on value.`;
    return generateText(prompt, 'gemini-2.5-flash');
};

export const generateTrafficStrategy = async (niche: string, audience: string, url?: string): Promise<GenerateContentResponse> => {
    const prompt = `Act as a world-class growth marketer. Create a comprehensive traffic strategy for:
    Niche: ${niche}
    Audience: ${audience}
    ${url ? `Website: ${url}` : ''}

    Focus on "Generative Engine Optimization" (GEO), Social Virality, and Technical SEO.
    Return JSON with 4 sections: 
    1. geoStrategy (tactics, citationContent list)
    2. socialStrategy (repurposingTactics, viralHooks list)
    3. technicalStrategy (schemaMarkup list, analyticsTips)
    4. growthStrategy (adTargeting list, uxPersonalization list)`;

    return generateJsonContent(prompt, {
        type: Type.OBJECT,
        properties: {
            geoStrategy: { type: Type.OBJECT, properties: { tactics: { type: Type.ARRAY, items: { type: Type.STRING } }, citationContent: { type: Type.ARRAY, items: { type: Type.STRING } } } },
            socialStrategy: { type: Type.OBJECT, properties: { repurposingTactics: { type: Type.ARRAY, items: { type: Type.STRING } }, viralHooks: { type: Type.ARRAY, items: { type: Type.STRING } } } },
            technicalStrategy: { type: Type.OBJECT, properties: { schemaMarkup: { type: Type.ARRAY, items: { type: Type.STRING } }, analyticsTips: { type: Type.ARRAY, items: { type: Type.STRING } } } },
            growthStrategy: { type: Type.OBJECT, properties: { adTargeting: { type: Type.ARRAY, items: { type: Type.STRING } }, uxPersonalization: { type: Type.ARRAY, items: { type: Type.STRING } } } }
        }
    }, 'gemini-3-pro-preview');
};

export const generateMemeConcept = async (topic: string, style: string): Promise<GenerateContentResponse> => {
    const prompt = `Generate a viral meme concept about "${topic}" in the style of "${style}". Return JSON with: imageDescription (for generation), topText, bottomText.`;
    return generateJsonContent(prompt, {
        type: Type.OBJECT,
        properties: {
            imageDescription: { type: Type.STRING },
            topText: { type: Type.STRING },
            bottomText: { type: Type.STRING }
        }
    });
};

export const generateMemeConceptFromImage = async (imageBase64: string, mimeType: string, style: string): Promise<GenerateContentResponse> => {
    const prompt = `Analyze this image and generate a viral meme caption in the style of "${style}". Return JSON with: imageDescription (brief), topText, bottomText.`;
    const ai = getGeminiAI();
    return ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ inlineData: { data: imageBase64, mimeType } }, { text: prompt }] },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    imageDescription: { type: Type.STRING },
                    topText: { type: Type.STRING },
                    bottomText: { type: Type.STRING }
                }
            }
        }
    });
};

export const generateSlideDeckStructure = async (topic: string, audience: string, slideCount: number, tone: string, format: string, language: string, length: string, contextData?: {data: string, mimeType: string}): Promise<GenerateContentResponse> => {
    const prompt = `Create a slide deck structure for "${topic}". Audience: ${audience}. Slides: ${slideCount}. Tone: ${tone}. Format: ${format}. Language: ${language}. Content Depth: ${length}.
    Return JSON array of slides, where each slide has: title, bullets (array of strings), visualDescription (for image gen), speakerNotes.`;
    
    const contents: any[] = [{ text: prompt }];
    if (contextData) {
        contents.push({ inlineData: contextData });
    }

    const ai = getGeminiAI();
    return ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: { parts: contents },
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
                    }
                }
            }
        }
    });
};

export const generateReportContent = async (topic: string, type: string, length: string, language: string): Promise<GenerateContentResponse> => {
    const prompt = `Write a professional ${type} about "${topic}". Length: ${length}. Language: ${language}. Use Markdown formatting. Include headers, bullet points, and data placeholders where necessary.`;
    const ai = getGeminiAI();
    return ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }] // Use search for reports
        }
    });
};

export const generateInfographicConcepts = async (topic: string, style: string, language: string): Promise<GenerateContentResponse> => {
    const prompt = `Create an infographic concept for "${topic}". Style: ${style}. Language: ${language}. Return JSON with: title, visualLayout (description), dataPoints (array of short strings to visualize).`;
    return generateJsonContent(prompt, {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            visualLayout: { type: Type.STRING },
            dataPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
    });
};

export const generateFlashcards = async (topic: string, count: number, language: string): Promise<GenerateContentResponse> => {
    const prompt = `Create ${count} study flashcards for "${topic}" in ${language}. Return JSON array of objects {front, back}.`;
    return generateJsonContent(prompt, {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                front: { type: Type.STRING },
                back: { type: Type.STRING }
            }
        }
    });
};

export const generateVibeApp = async (prompt: string): Promise<GenerateContentResponse> => {
    const fullPrompt = `You are an expert web developer. Create a single-file HTML/JS/CSS application based on this request: "${prompt}".
    The code should be modern, responsive, and visually appealing (using Tailwind CSS via CDN).
    It must be self-contained in a single HTML file.
    Do not use external JS frameworks (like React/Vue) unless imported via CDN in the HTML.
    Use FontAwesome for icons if needed.
    Return ONLY the HTML code string, no markdown formatting.`;
    
    return generateTextWithThinking(fullPrompt);
};

export const reviewCode = async (code: string): Promise<GenerateContentResponse> => {
    const prompt = `Review the following code for security vulnerabilities, logic bugs, and performance issues.
    Code:
    ${code.substring(0, 10000)} // Limit context

    Return a JSON object with:
    - summary: Executive summary of findings.
    - bugScore: 0-100 score.
    - securityScore: 0-100 score.
    - issues: Array of objects { type, line, severity, description, rootCause, fix }.
    - fixedCode: The refactored code block.
    `;
    
    return generateJsonContent(prompt, {
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
                        severity: { type: Type.STRING },
                        description: { type: Type.STRING },
                        rootCause: { type: Type.STRING },
                        fix: { type: Type.STRING }
                    } 
                } 
            },
            fixedCode: { type: Type.STRING }
        }
    }, 'gemini-3-pro-preview');
};

export const generateBrandGuidelines = async (brandProfile: any): Promise<GenerateContentResponse> => {
    const prompt = `Create a brand guideline document for: ${JSON.stringify(brandProfile)}. Include sections on Logo Usage, Color Palette (hex codes), Typography, and Tone of Voice. Output as Markdown.`;
    return generateText(prompt, 'gemini-2.5-flash');
};

export const analyzeLayoutForResize = async (targetPlatform: string, originalContent: string, imageBase64?: string): Promise<GenerateContentResponse> => {
    let prompt = `Analyze the content: "${originalContent}". Suggest a visual layout and image generation prompt optimized for ${targetPlatform}.`;
    if (imageBase64) {
        return analyzeImage(prompt, imageBase64, 'image/png'); // Reuse existing helper
    }
    return generateText(prompt, 'gemini-2.5-flash');
};

export const generateDomainAndHostingRecommendations = async (description: string, projectType: string): Promise<GenerateContentResponse> => {
    const prompt = `Suggest 5 creative domain names and 3 free/cheap hosting providers for a "${projectType}" project described as: "${description}".
    Return JSON: { domains: string[], hosting: { name, description, bestFor, freeTierFeatures }[] }.`;
    
    return generateJsonContent(prompt, {
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
                    } 
                } 
            }
        }
    });
};

export const generateSpeech = async (text: string, voiceName: string = 'Puck', referenceAudioBase64?: string): Promise<string | null> => {
    const ai = getGeminiAI();
    
    const speechConfig: any = {
        voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
        },
    };

    const parts: any[] = [{ text }];
    // If reference audio provided, send it for context (multimodal prompting style)
    if (referenceAudioBase64) {
        parts.push({ inlineData: { mimeType: 'audio/wav', data: referenceAudioBase64 } });
        parts.push({ text: "Use the style of the attached audio." });
    }

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: { parts },
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig,
        },
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data ?? null;
};

export const generateMultiSpeakerSpeech = async (script: string, speakers: {speaker: string, voiceName: string}[], referenceAudioBase64?: string): Promise<string | null> => {
    const ai = getGeminiAI();
    
    // Construct speaker config map
    const speakerVoiceConfigs = speakers.map(s => ({
        speaker: s.speaker,
        voiceConfig: { prebuiltVoiceConfig: { voiceName: s.voiceName } }
    }));

    const parts: any[] = [{ text: script }];
    if (referenceAudioBase64) {
        parts.push({ inlineData: { mimeType: 'audio/wav', data: referenceAudioBase64 } });
    }

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: { parts },
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                multiSpeakerVoiceConfig: {
                    speakerVoiceConfigs
                }
            },
        },
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data ?? null;
};

export const generatePodcastScript = async (sourceText: string): Promise<GenerateContentResponse> => {
    const prompt = `Create a podcast script based on this source text. Two hosts, Alex (enthusiastic) and Jamie (skeptical/analytical), discuss the topic.
    Source: "${sourceText.substring(0, 5000)}..."
    
    Return JSON array of objects: { speaker: "Alex" | "Jamie", text: string }.
    Keep it engaging, conversational, and about 2 minutes long (approx 300-400 words total).`;

    return generateJsonContent(prompt, {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                speaker: { type: Type.STRING },
                text: { type: Type.STRING }
            }
        }
    });
};

export const generateAudiobookScript = async (text: string): Promise<GenerateContentResponse> => {
    const prompt = `Analyze the following story text. Identify the narrator and distinct characters speaking. 
    Then, format the text into a script where each segment is assigned to a speaker (e.g., 'Narrator', 'Character Name').
    
    Text: "${text.substring(0, 8000)}..."

    Return JSON array: { speaker: string, text: string }.`;

    return generateJsonContent(prompt, {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                speaker: { type: Type.STRING },
                text: { type: Type.STRING }
            }
        }
    });
};

export const translateScript = async (script: string, targetLanguage: string): Promise<GenerateContentResponse> => {
    const prompt = `Translate the following script to ${targetLanguage}. Maintain the speaker labels if present (e.g. Speaker: Text).
    If it is a JSON array of {speaker, text}, return a JSON array of {speaker, text} in the target language.
    If plain text, return plain text.
    
    Input: ${script}
    `;
    
    // Check if input looks like JSON
    if (script.trim().startsWith('[')) {
         return generateJsonContent(prompt, {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    speaker: { type: Type.STRING },
                    text: { type: Type.STRING }
                }
            }
        });
    }
    
    return generateText(prompt, 'gemini-2.5-flash');
};

export const generateSongConcept = async (genre: string, mood: string, topic: string): Promise<GenerateContentResponse> => {
    const prompt = `Write a song concept about "${topic}". Genre: ${genre}. Mood: ${mood}.
    Return JSON with: title, lyrics (complete with verse/chorus structure), chordProgression (simple notation), arrangementDescription (instruments and vibe).`;
    
    return generateJsonContent(prompt, {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            lyrics: { type: Type.STRING },
            chordProgression: { type: Type.STRING },
            arrangementDescription: { type: Type.STRING }
        }
    }, 'gemini-3-pro-preview');
};

export const generateTrendReport = async (topic: string): Promise<GenerateContentResponse> => {
    const prompt = `Generate a trend forecast report for "${topic}".
    Include: Emerging patterns, key players, consumer sentiment, and a future outlook (next 12 months).
    Use Google Search grounding to get real-time data. Output as detailed Markdown.`;
    
    const ai = getGeminiAI();
    return ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }]
        }
    });
};

// --- Marketing Assistant ---

export const generateBulkEmails = async (template: string): Promise<GenerateContentResponse> => {
    const prompt = `Generate 3 distinct email variations based on this template/topic: "${template}".
    Return a JSON array of objects with "subject" and "body" properties.`;
    return generateJsonContent(prompt, {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                subject: { type: Type.STRING },
                body: { type: Type.STRING }
            }
        }
    });
};

export const generateBulkSms = async (template: string): Promise<GenerateContentResponse> => {
    const prompt = `Generate 5 distinct SMS variations based on this template/topic: "${template}". Keep them short and concise.
    Return a JSON array of objects with a "body" property.`;
    return generateJsonContent(prompt, {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                body: { type: Type.STRING }
            }
        }
    });
};

export const generateAbTestCopy = async (product: string, message: string, audience: string): Promise<GenerateContentResponse> => {
    const prompt = `Generate 3 distinct A/B test copy variations for a marketing campaign.
    Product: ${product}
    Key Message: ${message}
    Target Audience: ${audience}
    
    Return a JSON array of objects with:
    - angle: The marketing angle used (e.g., "Urgency", "Benefit-focused", "Storytelling")
    - copy: The actual ad text
    `;
    return generateJsonContent(prompt, {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                angle: { type: Type.STRING },
                copy: { type: Type.STRING }
            }
        }
    });
};

// --- Content Generator ---

export const expandContent = async (topic: string, contentType: string, tone: string): Promise<GenerateContentResponse> => {
    const prompt = `Write a high-quality ${contentType} about "${topic}". Tone: ${tone}.
    Ensure the content is engaging, well-structured, and ready to publish. Output as Markdown.`;
    return generateText(prompt, 'gemini-3-pro-preview');
};

// --- Strands Generator ---

export const generateBrandEssence = async (concept: string, audience: string, keywords: string, instruction: string): Promise<GenerateContentResponse> => {
    const prompt = `
    ${instruction}
    
    Develop a brand essence for:
    Concept: ${concept}
    Target Audience: ${audience}
    Keywords: ${keywords}
    
    Return a JSON object with a single property "brandEssence" containing a compelling description of the brand's core identity and mission (approx 50-75 words).
    `;
    return generateJsonContent(prompt, {
        type: Type.OBJECT,
        properties: {
            brandEssence: { type: Type.STRING }
        }
    }, 'gemini-3-pro-preview');
};

export const generateNameSuggestions = async (brandEssence: string, instruction: string): Promise<GenerateContentResponse> => {
    const prompt = `
    ${instruction}
    
    Brand Essence: ${brandEssence}
    
    Generate 5 creative and available-sounding brand names.
    Return a JSON object with "nameSuggestions": string[].
    `;
    return generateJsonContent(prompt, {
        type: Type.OBJECT,
        properties: {
            nameSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
    });
};

export const generateTaglinesAndSocial = async (brandEssence: string, instruction: string): Promise<GenerateContentResponse> => {
    const prompt = `
    ${instruction}
    
    Brand Essence: ${brandEssence}
    
    Generate 3 catchy taglines and 1 example social media post (e.g. Instagram/Twitter).
    Return JSON: { taglines: string[], socialMediaPost: string }
    `;
    return generateJsonContent(prompt, {
        type: Type.OBJECT,
        properties: {
            taglines: { type: Type.ARRAY, items: { type: Type.STRING } },
            socialMediaPost: { type: Type.STRING }
        }
    });
};

export const generateVisualIdentity = async (brandEssence: string, instruction: string): Promise<GenerateContentResponse> => {
    const prompt = `
    ${instruction}
    
    Brand Essence: ${brandEssence}
    
    Define a visual identity.
    Return JSON with:
    - logoConcept: Description of a logo idea.
    - colorPalette: Array of {name, hex}.
    - typography: Suggested font pairing description.
    `;
    return generateJsonContent(prompt, {
        type: Type.OBJECT,
        properties: {
            logoConcept: { type: Type.STRING },
            colorPalette: { 
                type: Type.ARRAY, 
                items: { 
                    type: Type.OBJECT, 
                    properties: { name: { type: Type.STRING }, hex: { type: Type.STRING } } 
                } 
            },
            typography: { type: Type.STRING }
        }
    });
};

export const generateMarketingAngles = async (brandEssence: string, instruction: string): Promise<GenerateContentResponse> => {
    const prompt = `
    ${instruction}
    
    Brand Essence: ${brandEssence}
    
    Suggest 3 distinct marketing angles or campaign themes.
    Return JSON with "marketingAngles": string[].
    `;
    return generateJsonContent(prompt, {
        type: Type.OBJECT,
        properties: {
            marketingAngles: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
    });
};

// --- Smart Quiz Generator ---

export const generateSmartQuiz = async (input: string, isTopic: boolean): Promise<GenerateContentResponse> => {
    const prompt = isTopic 
        ? `Create a 5-question multiple choice quiz about "${input}".`
        : `Create a 5-question multiple choice quiz based on the following text:\n\n"${input.substring(0, 5000)}..."`;

    const fullPrompt = `${prompt}
    
    The quiz should be engaging and educational.
    Return JSON with:
    - title: Quiz title
    - questions: Array of objects { id, question, options: [{text, isCorrect, feedback}], difficulty, type }.
    - summary: { perfectMessage, goodMessage, averageMessage }
    `;

    return generateJsonContent(fullPrompt, {
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
                                }
                            }
                        },
                        difficulty: { type: Type.STRING },
                        type: { type: Type.STRING }
                    }
                }
            },
            summary: {
                type: Type.OBJECT,
                properties: {
                    perfectMessage: { type: Type.STRING },
                    goodMessage: { type: Type.STRING },
                    averageMessage: { type: Type.STRING }
                }
            }
        }
    }, 'gemini-3-pro-preview');
};
