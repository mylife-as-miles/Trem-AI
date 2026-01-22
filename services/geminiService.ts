import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Use v1alpha as requested for media_resolution support
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

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

export const analyzeAsset = async (asset: { id: string, name: string, blob?: Blob }): Promise<AnalyzedAsset> => {
  if (!ai || !asset.blob) {
    // Mock fallback
    await new Promise(r => setTimeout(r, 1500));
    return {
      id: asset.id,
      description: `Analyzed content for ${asset.name}`,
      tags: ['auto-detected', 'mock']
    };
  }

  try {
    const base64Data = await fileToBase64(asset.blob);
    const model = 'gemini-3-flash-preview';

    // Correct structure for Gemini 3 Flash with media_resolution
    const response = await ai.models.generateContent({
      model,
      generationConfig: {
        responseMimeType: 'application/json'
      },
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: "Analyze this video clip. Return a short description and 3 tags. Format: JSON { \"description\": \"...\", \"tags\": [...] }"
            },
            {
              inlineData: {
                mimeType: asset.blob.type || 'video/mp4',
                data: base64Data
              },
              // @ts-ignore - v1beta feature
              media_resolution: "media_resolution_low"
            }
          ]
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

// Helper for Exponential Backoff
const retryWithBackoff = async <T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    if (retries === 0 || error?.status !== 503) throw error;

    console.warn(`Gemini 503 Overload. Retrying in ${delay}ms... (${retries} attempts left)`);
    await new Promise(r => setTimeout(r, delay));
    return retryWithBackoff(fn, retries - 1, delay * 2);
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

export const generateRepoStructure = async (inputs: RepoGenerationInputs) => {
  // ... (Prompt string logic remains the same) ...
  const PROMPT = `
# Identity
You are Trem, a highly advanced Video Intelligence Engine designed for the Trem AI video editing platform. Your purpose is to analyze video content and generate a comprehensive, AI-native repository structure that enables intelligent video editing workflows.

## Core Capabilities
You excel at:
- **Scene Detection**: Identifying ALL visual and audio scene boundaries with frame-level precision.
- **Content Analysis**: Understanding narrative structure, emotional arcs, and visual composition.
- **Metadata Generation**: Creating rich, structured metadata for downstream AI agents.

---

# Inputs
- **Video Duration**: ${inputs.duration || '2 minutes 14 seconds'}
- **Audio Transcript**: ${inputs.transcript || 'PROVIDED (use for dialogue detection)'}
- **Scene Boundaries**: ${inputs.sceneBoundaries || 'PROVIDED (raw visual cuts)'}
- **Asset Context**: ${inputs.assetContext || 'None provided'}

---

# Tasks
1. Generate scenes/scenes.json
2. Generate captions/captions.srt
3. Generate metadata/video.md
4. Generate metadata/scenes.md
5. Generate timeline/base.otio.json
6. Generate dag/ingest.json
7. Generate commits/0001.json
8. Generate repo.json

# Output Schema (Strict JSON)
You MUST output ONLY valid JSON matching this exact structure. No markdown, no commentary.

{
  "repo": {
    "name": "string (kebab-case repo name)",
    "brief": "string (1-2 sentence video summary)",
    "created": "number (Unix timestamp)",
    "version": "1.0.0",
    "pipeline": "trem-video-pipeline-v2"
  },
  "scenes": {
    "scenes": [
      {
        "id": "scene-001",
        "start": 0.0,
        "end": 3.5,
        "summary": "string (concise visual description)",
        "emotion": "string (primary emotion: joy, tension, calm, etc.)",
        "shot_type": "string (wide, medium, close-up, extreme-close-up)",
        "motion": "string (static, pan-left, pan-right, zoom-in, zoom-out, tracking, handheld)",
        "audio_cues": ["string (music, dialogue, ambient, silence)"],
        "characters": ["string (detected characters or subjects)"],
        "visual_notes": ["string (lighting, color grade, composition notes)"]
      }
    ]
  },
  "captions_srt": "string (valid SRT format)",
  "metadata": {
    "video_md": "string (Markdown video overview)",
    "scenes_md": "string (Markdown scene-by-scene breakdown)"
  },
  "timeline": {},
  "dag": {},
  "commit": {
    "id": "0001",
    "parent": null,
    "timestamp": "string (ISO 8601)",
    "message": "string (conventional commit: feat: ingest 14s makeup transformation...)",
    "state": {
      "timeline": "timeline/base.otio.json",
      "scenes": "scenes/scenes.json",
      "captions": "captions/captions.srt",
      "metadata": [
        "metadata/video.md",
        "metadata/scenes.md"
      ],
      "dag": "dag/ingest.json"
    },
    "hashtags": ["#tag1", "#tag2", "#tag3"]
  }
}

---

# Hashtag Generation Rules
Generate 4-6 hashtags based on actual content analysis:
- **Format**: #vertical, #horizontal, #square, #4k, #1080p
- **Style**: #cinematic, #documentary, #vlog, #tutorial, #high-contrast, #low-key, #neon, #natural-light
- **Content**: #glow-up, #transformation, #dance, #music, #dialogue, #b-roll, #timelapse, #action
- **Platform**: #tiktok, #reels, #youtube-shorts, #social-media

---

# Final Reminders
- Output ONLY the JSON object. No explanation, no markdown fences.
- Scenes array must contain **multiple scenes** proportional to video length.
- Be precise with timestamps (use decimals like 3.5, 7.25).
- Use the Asset Context to inform descriptions and tags.
`;

  if (!ai) {
    console.warn("Gemini API Key missing. Using Mock Data.");
    // Simulate delay
    await new Promise(r => setTimeout(r, 2000));

    // Return Mock Data (v1 Structure)
    return {
      repo: {
        name: "video-repo",
        brief: "A quiet, emotionally grounded short film exploring isolation and interruption.",
        created: Date.now(),
        version: "1.0.0",
        pipeline: "trem-video-pipeline-v1"
      },
      scenes: {
        "scenes": [
          {
            "id": "scene-001",
            "start": 0.0,
            "end": 18.2,
            "summary": "Character wakes up alone, quiet morning light",
            "emotion": "melancholy",
            "characters": ["Clara"],
            "visual_notes": ["soft light", "static camera"],
            "audio_notes": ["room tone", "no dialogue"]
          },
          {
            "id": "scene-002",
            "start": 18.2,
            "end": 42.7,
            "summary": "Phone rings, disruption",
            "emotion": "unease",
            "characters": ["Clara"],
            "audio_notes": ["ringtone", "sharp cut"]
          }
        ]
      },
      captions_srt: `1
00:00:03,000 --> 00:00:06,200
I didn’t expect the house to feel this empty.

2
00:00:18,500 --> 00:00:21,000
Hello?`,
      metadata: {
        video_md: `# Video Description

A quiet, emotionally grounded short film exploring isolation and interruption.

## Themes
- Grief
- Routine
- Sudden disruption

## Runtime
2 minutes 14 seconds`,
        scenes_md: `## Scene 1 (0:00–0:18)
Clara wakes up in silence. The room feels larger than it should.

## Scene 2 (0:18–0:42)
A phone call breaks the calm. Something has changed.`
      },
      timeline: {},
      dag: {},
      commit: {
        "id": "0001",
        "parent": null,
        "timestamp": new Date().toISOString(),
        "message": "feat: ingest 2m14s footage with 2 detected scenes",
        "state": {
          "timeline": "timeline/base.otio.json",
          "scenes": "scenes/scenes.json",
          "captions": "captions/captions.srt",
          "metadata": [
            "metadata/video.md",
            "metadata/scenes.md"
          ],
          "dag": "dag/ingest.json"
        },
        "hashtags": ["#cinematic", "#low-key", "#dialogue", "#social-media"]
      }
    };
  }

  try {
    const config = {
      model: 'gemini-3-flash-preview',
      contents: PROMPT,
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