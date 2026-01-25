import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Use v1alpha as requested for media_resolution support
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const retryWithBackoff = async <T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
};

export const interpretAgentCommand = async (command: string): Promise<string> => {
  if (!ai) {
    console.warn("Gemini API Key is missing. Returning mock response.");
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("Simulated Plan: Analysis complete. Starting 3 parallel agents.");
      }, 1500);
    });
  }

  try {
    const model = 'gemini-3-flash-preview';
    const response = await ai.models.generateContent({
      model,
      contents: `You are an AI Video Orchestrator System. 
      Interpret the following user command for video processing agents and return a brief, technical summary of the actions triggered.
      Keep it under 20 words.
      
      Command: ${command}`,
    });

    return response.text || "Command processed.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error interpreting command. Please check system logs.";
  }
};

export interface RepoGenerationInputs {
  duration?: string;
  transcript?: string;
  sceneBoundaries?: string;
  assetContext?: string;
  images?: string[]; // Array of base64 strings (keyframes)
}

export interface AnalyzedAsset {
  id: string;
  description: string;
  tags: string[];
}

// Convert Blob/File to Base64
const fileToBase64 = (file: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove "data:*/*;base64," prefix
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error("Failed to convert file to base64"));
      }
    };
    reader.onerror = error => reject(error);
  });
};

export const analyzeAsset = async (asset: { id: string, name: string, blob?: Blob, images?: string[] }): Promise<AnalyzedAsset> => {
  if (!ai) {
    // Mock fallback
    await new Promise(r => setTimeout(r, 1500));
    return {
      id: asset.id,
      description: `Analyzed content for ${asset.name}`,
      tags: ['auto-detected', 'mock']
    };
  }

  try {
    const model = 'gemini-3-flash-preview';
    const parts: any[] = [
      { text: "Analyze this video clip based on these keyframes. Return a short description and 3 tags. Format: JSON { \"description\": \"...\", \"tags\": [...] }" }
    ];

    // Use Keyframes if available
    if (asset.images && asset.images.length > 0) {
      asset.images.forEach(base64Image => {
        const cleanBase64 = base64Image.replace(/^data:image\/[a-z]+;base64,/, "");
        parts.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: cleanBase64
          }
        });
      });
    } else if (asset.blob) {
      // Fallback to Blob if no images (legacy path)
      const base64Data = await fileToBase64(asset.blob);
      parts.push({
        inlineData: {
          mimeType: asset.blob.type || 'video/mp4',
          data: base64Data
        }
      });
    }

    // Correct structure for Gemini 3 Flash with media_resolution
    const response = await ai.models.generateContent({
      model,
      generationConfig: {
        responseMimeType: 'application/json'
      },
      contents: [
        {
          role: 'user',
          parts: parts
        }
      ]
    } as any);

    const text = response.text || "{}";
    return extractJSON(text);

  } catch (e) {
    console.error(`Failed to analyze asset ${asset.name}`, e);
    return {
      id: asset.id,
      description: "Analysis failed",
      tags: ['error']
    };
  }
};

// @ts-ignore
import repoGenerationPrompt from '../prompts/repo-generation.md?raw';

export const generateRepoStructure = async (inputs: RepoGenerationInputs) => {
  if (!ai) {
    console.warn("Gemini API Key missing.");
    throw new Error("Gemini API Key is missing. Please configure GEMINI_API_KEY in your environment to use AI features.");
  }

  // Pre-calculate inputs for template
  const duration = inputs.duration || 'Unknown';
  const transcript = inputs.transcript || 'None (detect from context)';
  const sceneBoundaries = inputs.sceneBoundaries !== 'auto-detected' ? inputs.sceneBoundaries : 'AUTO-DETECT (Analyze visual cues to find cuts)';
  const assetContext = inputs.assetContext || 'None provided';
  const visualContextCount = (inputs.images?.length || 0).toString();

  // Interpolate Prompt
  const promptText = repoGenerationPrompt
    .replace('{{DURATION}}', duration)
    .replace('{{TRANSCRIPT}}', transcript)
    .replace('{{SCENE_BOUNDARIES}}', sceneBoundaries)
    .replace('{{ASSET_CONTEXT}}', assetContext)
    .replace('{{VISUAL_CONTEXT_COUNT}}', visualContextCount);

  try {
    // Construct Parts
    const parts: any[] = [{ text: promptText }];

    // Add Images if provided
    if (inputs.images && inputs.images.length > 0) {
      inputs.images.forEach(base64Image => {
        // Remove header if present for safety
        const cleanBase64 = base64Image.replace(/^data:image\/[a-z]+;base64,/, "");
        parts.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: cleanBase64
          }
        });
      });
    }

    const config = {
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts }], // Structured contents
      generationConfig: {
        responseMimeType: 'application/json'
      }
    };

    // Use retry wrapper
    // @ts-ignore - config type mismatch with simple wrapper
    const response = await retryWithBackoff(() => ai.models.generateContent(config as any));

    const text = response.text || "{}";
    return extractJSON(text);

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};

// @ts-ignore
import remotionGenerationPrompt from '../prompts/remotion-generation.md?raw';

export const generateRemotionProject = async (userPrompt: string): Promise<Record<string, string>> => {
  if (!ai) {
    // Mock response for dev without API key
    await new Promise(r => setTimeout(r, 2000));
    return {
      "Root.tsx": `import {Composition} from 'remotion';\nimport {MyVideo} from './MyVideo';\n\nexport const Root: React.FC = () => {\n  return (\n    <Composition\n      id="MyVideo"\n      component={MyVideo}\n      durationInFrames={150}\n      width={1920}\n      height={1080}\n      fps={30}\n    />\n  );\n};`,
      "MyVideo.tsx": `import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';\n\nexport const MyVideo: React.FC = () => {\n  const frame = useCurrentFrame();\n  const opacity = interpolate(frame, [0, 30], [0, 1]);\n  return (\n    <AbsoluteFill className="bg-white flex items-center justify-center">\n      <h1 style={{ opacity }} className="text-6xl font-bold text-slate-900">Hello Trem AI</h1>\n    </AbsoluteFill>\n  );\n};`
    };
  }

  try {
    const promptText = remotionGenerationPrompt.replace('{{USER_PROMPT}}', userPrompt);

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      generationConfig: {
        responseMimeType: 'application/json'
      },
      contents: [{ role: 'user', parts: [{ text: promptText }] }]
    } as any);

    const text = response.text || "{}";
    const json = extractJSON(text);
    return json.files || json; // Support both new nested schema and legacy flat schema if model hallucinates

  } catch (error) {
    console.error("Remotion Generation Failed:", error);
    throw error;
  }
};

// Helper to strip markdown and extract JSON
const extractJSON = (text: string): any => {
  try {
    // 1. Try direct parse
    return JSON.parse(text);
  } catch (e) {
    // 2. Try stripping markdown code blocks
    const markdownMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```([\s\S]*?)```/);
    if (markdownMatch && markdownMatch[1]) {
      try {
        return JSON.parse(markdownMatch[1]);
      } catch (e2) {
        // continue
      }
    }

    // 3. Try finding the first '{' and last '}'
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e3) {
        throw new Error("Failed to extract valid JSON from response");
      }
    }

    throw new Error("No JSON found in response");
  }
};