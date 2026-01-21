import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Initialize only if key exists to avoid immediate errors, though functionality will depend on it.
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
}

export const generateRepoStructure = async (inputs: RepoGenerationInputs) => {
  const PROMPT = `
You are initializing an AI-native video repository.

Inputs:
- Video duration: ${inputs.duration || '2 minutes 14 seconds'}
- Audio transcript: PROVIDED
- Scene boundaries: PROVIDED

Tasks:
1. Generate scenes/scenes.json
2. Generate subtitles/main.srt
3. Generate descriptions/video.md
4. Generate descriptions/scenes.md
5. Generate otio/main.otio.json
6. Generate dag/graph.json
7. Generate commits/0001.json
8. Generate repo.json

Rules:
- Output JSON ONLY
- No markdown
- No commentary
- Paths must be relative to repo root

Output format:
{
  "repo": {...},
  "scenes": {...},
  "subtitles_srt": "...",
  "descriptions": {
    "video_md": "...",
    "scenes_md": "..."
  },
  "otio": {...},
  "dag": {...},
  "commit": {...}
}
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
        "message": "Initial ingest: scenes, subtitles, timeline",
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
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: PROMPT,
      config: {
        thinkingConfig: { thinkingLevel: 'medium' }
      } as any // Cast because type def might not have thinkingConfig yet
    });

    const text = response.text || "{}";
    // Parse potentially markdown-wrapped JSON
    const jsonStr = text.replace(/```json\n|\n```/g, '');
    return JSON.parse(jsonStr);

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};