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
  previousState?: string; // Optional JSON string of the previous commit state
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
- **Visual Context**: I have attached ${inputs.images?.length || 0} keyframes from the video. Correlate these visual frames with the timestamps in the transcript to determine scene changes.
- **Previous State**: ${inputs.previousState ? 'Provided (see context)' : 'None (Initial Commit)'}

---

# Robustness & Error Handling
- **Missing Duration**: If duration is unknown, estimate it based on the transcript length (approx. 150 words/min) or visual cues.
- **Missing Transcript**: If no transcript is provided, rely entirely on visual scene detection.
- **Ambiguity**: If a scene boundary is unclear, choose the most likely cut point and lower the confidence score.
- **Fail-Safe**: If detection fails completely for a segment, create a single "General Scene" covering that duration.

---

# Strict Ontology / Taxonomy
You must strictly adhere to these values for metadata fields to ensure downstream compatibility:
- **Emotion**: [joy, sadness, tension, calm, fear, anger, surprise, neutral]
- **Shot Type**: [extreme-wide, wide, medium, close-up, extreme-close-up]
- **Motion**: [static, pan, tilt, zoom, dolly, truck, handheld]

# Versioning & State Evolution
- **Commit History**: If a previous commit exists, you MUST generate a new commit ID (e.g., 0002) and set the 'parent' field to the previous ID.
- **State Diffing**: Only update files that have changed. If a file is identical to the previous version, do not regenerate it; reference the existing file path.
- **Message**: Commit messages must describe the *change* (e.g., "fix: adjust scene 2 boundary", "feat: refine emotion tags").

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
  "provenance": {
    "model": "string (e.g. gemini-3-flash-preview)",
    "timestamp": "string (ISO 8601)",
    "input_hash": "string (sha256 of inputs)",
    "agent_version": "string (e.g. trem-core-v1)"
  },
  "confidence": 0.0,
  "detection_method": "string (vision+audio, vision-only, or audio-only)",
  "captions": [
    {
      "start": 0.0,
      "end": 2.5,
      "text": "string (caption text)"
    }
  ],
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
        "emotion": "string (from ontology)",
        "shot_type": "string (from ontology)",
        "motion": "string (from ontology)",
        "audio_cues": ["string (music, dialogue, ambient, silence)"],
        "characters": ["string (detected characters or subjects)"],
        "visual_notes": ["string (lighting, color grade, composition notes)"],
        "confidence": "number (0.0 - 1.0 confidence in scene boundaries and content)",
        "agent_annotations": {}
      }
    ]
  },
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
                        "source_range": {
                          "start_time": { "value": 0, "rate": 30.0 },
                          "duration": { "value": 105, "rate": 30.0 }
                        }
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
      "captions": "captions/captions.json",
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
- IMPORTANT: For 'metadata' fields (Markdown), you must properly escape all newlines (\n) and double quotes (\") so the JSON remains valid.
- Scenes array must contain **multiple scenes** proportional to video length.
- Be precise with timestamps (use decimals like 3.5, 7.25).
- For OTIO 'source_range', use a default rate of 30.0 fps unless detected otherwise. Calculate 'value' as 'seconds * rate' and ROUND TO THE NEAREST INTEGER.
- Use the Asset Context to inform descriptions and tags.
- If critical inputs are missing, infer conservatively and set 'confidence' accordingly.
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