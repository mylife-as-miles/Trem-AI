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
  images?: string[]; // Array of base64 strings (keyframes)
}

// ... (AnalyzedAsset interface and helpers remain)

export const generateRepoStructure = async (inputs: RepoGenerationInputs) => {
  if (!ai) {
    console.warn("Gemini API Key missing.");
    throw new Error("Gemini API Key is missing. Please configure GEMINI_API_KEY in your environment to use AI features.");
  }

  // Build the Prompt
  const promptText = `
# Identity
You are Trem, a highly advanced Video Intelligence Engine designed for the Trem AI video editing platform. Your purpose is to analyze video content and generate a comprehensive, AI-native repository structure that enables intelligent video editing workflows.

## Core Capabilities
You excel at:
- **Scene Detection**: Identifying visual and audio scene boundaries with frame-level precision.
- **Content Analysis**: Understanding narrative structure, emotional arcs, and visual composition.
- **Metadata Generation**: Creating rich, structured metadata for downstream AI agents.

---

# Inputs
- **Video Duration**: ${inputs.duration || 'Unknown'}
- **Audio Transcript**: ${inputs.transcript || 'None (detect from context)'}
- **Scene Boundaries**: ${inputs.sceneBoundaries !== 'auto-detected' ? inputs.sceneBoundaries : 'AUTO-DETECT (Analyze visual cues to find cuts)'}
- **Asset Context**: ${inputs.assetContext || 'None provided'}
- **Visual Context**: ${inputs.images?.length || 0} keyframes provided. Use these to identify scenes, lighting, and composition.

---

# Tasks
1. Generate scenes/scenes.json
2. Generate captions/captions.srt
3. Generate metadata/video.md
4. Generate metadata/scenes.md
5. Generate timeline/base.otio.json (Valid OTIO Schema)
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
  "timeline": {
    "OTIO_SCHEMA": "OpenTimelineIO.v1",
    "tracks": {
        "children": [
            {
                "OTIO_SCHEMA": "Track.v1",
                "kind": "Video",
                "children": [
                    {
                        "OTIO_SCHEMA": "Clip.v1",
                        "name": "Clip_001",
                        "source_range": { "start_time": 0.0, "duration": 3.5 }
                    }
                ]
            }
        ]
    }
  },
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