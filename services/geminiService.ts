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
    const jsonStr = text.replace(/```json\n|\n```/g, '');
    return JSON.parse(jsonStr);

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

export const generateRepoStructure = async (inputs: RepoGenerationInputs) => {
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

# Scene Detection Rules (CRITICAL)
You MUST follow these rules for scene segmentation:

1.  **Granularity is paramount.** Aim for **at least 1 scene per 3-5 seconds** of video content. For a 14-second clip, you should detect **4-7 scenes minimum**.
2.  **A new scene starts when ANY of the following occur:**
    - Hard cut or transition (fade, wipe, dissolve)
    - Significant camera motion change (static to pan, zoom start/end)
    - Major lighting or color grade shift
    - Audio transition (music drop, silence, new speaker)
    - Subject or character change within the frame
    - Location or background change
3.  **Do NOT merge scenes.** If in doubt, split rather than combine.
4.  **Each scene must have a distinct summary** describing the visual action.

---

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
  "subtitles_srt": "string (valid SRT format)",
  "descriptions": {
    "video_md": "string (Markdown video overview)",
    "scenes_md": "string (Markdown scene-by-scene breakdown)"
  },
  "otio": {},
  "dag": {},
  "commit": {
    "id": "0001",
    "parent": null,
    "branch": "main",
    "message": "string (conventional commit: feat: ingest Xm video with Y scenes)",
    "hashtags": ["#tag1", "#tag2", "#tag3"],
    "author": "trem-intelligence-v2",
    "timestamp": "string (ISO 8601)",
    "artifacts": {
      "otio": "otio/main.otio.json",
      "dag": "dag/graph.json",
      "scenes": "scenes/scenes.json",
      "subtitles": "subtitles/main.srt",
      "descriptions": ["descriptions/video.md", "descriptions/scenes.md"]
    }
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
      subtitles_srt: `1
00:00:03,000 --> 00:00:06,200
I didn’t expect the house to feel this empty.

2
00:00:18,500 --> 00:00:21,000
Hello?`,
      descriptions: {
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
      otio: {},
      dag: {},
      commit: {
        "id": "0001",
        "parent": null,
        "branch": "main",
        "message": "feat: ingest 2m14s footage with 2 detected scenes",
        "hashtags": ["#cinematic", "#low-key", "#dialogue", "#social-media"],
        "author": "gemini-3-flash",
        "timestamp": new Date().toISOString(),
        "artifacts": {
          "otio": "otio/main.otio.json",
          "dag": "dag/graph.json",
          "scenes": "scenes/scenes.json",
          "subtitles": "subtitles/main.srt",
          "descriptions": [
            "descriptions/video.md",
            "descriptions/scenes.md"
          ]
        }
      }
    };
  }

  try {
    const config = {
      model: 'gemini-3-flash-preview',
      contents: PROMPT,
      config: {
        thinkingConfig: { thinkingLevel: 'medium' }
      } as any
    };

    // Use retry wrapper
    const response = await retryWithBackoff(() => ai.models.generateContent(config));

    const text = response.text || "{}";
    const jsonStr = text.replace(/```json\n|\n```/g, '');
    return JSON.parse(jsonStr);

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};