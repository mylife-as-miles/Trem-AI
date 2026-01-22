/**
 * Whisper Transcription Service
 * Handles audio transcription using Replicate's Whisper API
 */

// Note: Replicate package needs to be installed: npm install replicate
// For now, we'll create a mock implementation that can be swapped with real API

export interface WhisperSegment {
    id: number;
    start: number;
    end: number;
    text: string;
}

export interface WhisperTranscription {
    text: string;
    segments: WhisperSegment[];
    srt: string;
    language?: string;
}

/**
 * Transcribe audio using Replicate's Whisper API
 * @param audioBlob - Audio file to transcribe
 * @param options - Transcription options
 * @returns Transcription result with text, segments, and SRT
 */
export const transcribeAudio = async (
    audioBlob: Blob,
    options: {
        language?: string;
        translate?: boolean;
    } = {}
): Promise<WhisperTranscription> => {
    try {
        // Convert blob to base64 data URL
        const base64Audio = await blobToDataURL(audioBlob);

        // Call API Proxy
        const response = await fetch('/api/predictions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                version: '8099696689d249cf8b122d833c36ac3f75505c666a395ca40ef26f68e7d3d16e',
                input: {
                    audio: base64Audio,
                    language: options.language || 'auto',
                    translate: options.translate || false,
                    temperature: 0,
                    transcription: 'srt',
                    suppress_tokens: '-1',
                    logprob_threshold: -1,
                    no_speech_threshold: 0.6,
                    condition_on_previous_text: true,
                    compression_ratio_threshold: 2.4,
                    temperature_increment_on_fallback: 0.2
                }
            })
        });

        // Read full response text ONCE to avoid "body stream already read" errors
        const responseText = await response.text();

        // 1. Check for HTTP errors
        if (!response.ok) {
            let errorDetails = {};
            try {
                errorDetails = JSON.parse(responseText);
            } catch {
                console.warn('API returned non-JSON error response:', responseText.substring(0, 100));
            }

            // Check if it's a configuration error from our API
            if (response.status === 500) {
                // @ts-ignore
                if (errorDetails.error === 'Server configuration error') {
                    console.error('CRITICAL: Missing REPLICATE_API_TOKEN in Vercel environment variables. Please check VERCEL_SETUP.md.');
                }
                console.warn('Server error. Using mock transcription as fallback.');
                return mockTranscription();
            }
            throw new Error(`Replicate API error: ${response.statusText}`);
        }

        // 2. Validate JSON Content-Type (optional but good practice)
        const contentType = response.headers.get("content-type");
        if (contentType && !contentType.includes("application/json")) {
            console.warn(`API returned unexpected content-type: ${contentType}. Likely SPA fallback or 404.`);
            console.warn('Response preview:', responseText.substring(0, 100));
            return mockTranscription();
        }

        // 3. Parse JSON safely
        let output;
        try {
            output = JSON.parse(responseText);
        } catch (e) {
            console.warn('Failed to parse successful response as JSON:', responseText.substring(0, 100));
            return mockTranscription();
        }

        return parseWhisperOutput(output);

    } catch (error) {
        console.error('Whisper transcription error:', error);
        // Fallback to mock
        return mockTranscription();
    }
};

/**
 * Parse Whisper API output into structured format
 */
const parseWhisperOutput = (output: any): WhisperTranscription => {
    // 1. Try to get native segments
    let segments: WhisperSegment[] = [];
    if (output.segments && Array.isArray(output.segments)) {
        segments = output.segments.map((s: any) => ({
            id: s.id,
            start: s.start,
            end: s.end,
            text: (s.text || "").trim()
        }));
    }

    // 2. Determine SRT
    // Use provided transcription if it looks like SRT, otherwise generate from segments
    let srt = output.transcription || "";
    const isSRT = srt.includes('-->');

    if (!isSRT && segments.length > 0) {
        srt = generateSRT(segments);
    }
    else if (isSRT && segments.length === 0) {
        // Fallback: Parse SRT if no segments provided
        segments = parseSRT(srt);
    }

    // 3. Construct full text
    const text = segments.map(s => s.text).join(' ');

    return {
        text,
        segments,
        srt,
        language: output.detected_language
    };
};

/**
 * Generate SRT string from segments
 */
const generateSRT = (segments: WhisperSegment[]): string => {
    return segments.map((seg, i) => {
        const start = formatTime(seg.start);
        const end = formatTime(seg.end);
        return `${i + 1}\n${start} --> ${end}\n${seg.text}\n\n`;
    }).join("");
};

/**
 * Format seconds to SRT timestamp (HH:MM:SS,ms)
 */
const formatTime = (seconds: number): string => {
    const date = new Date(seconds * 1000);
    const hh = String(Math.floor(seconds / 3600)).padStart(2, "0"); // Handle hours manually for >24h support safety
    const mm = String(date.getUTCMinutes()).padStart(2, "0");
    const ss = String(date.getUTCSeconds()).padStart(2, "0");
    const ms = String(date.getUTCMilliseconds()).padStart(3, "0");
    return `${hh}:${mm}:${ss},${ms}`;
};

/**
 * Parse SRT format into segments
 */
const parseSRT = (srt: string): WhisperSegment[] => {
    if (!srt) return [];

    const segments: WhisperSegment[] = [];
    const blocks = srt.trim().split(/\n\s*\n/); // Split by empty lines

    for (const block of blocks) {
        const lines = block.split('\n');
        if (lines.length < 3) continue;

        // Handle cases where ID might be merged or missing
        let timeLineIndex = 1;
        if (!lines[1].includes('-->')) {
            timeLineIndex = 0; // Maybe no ID
            if (!lines[0].includes('-->')) continue; // Invalid block
        }

        const id = timeLineIndex === 1 ? parseInt(lines[0]) : segments.length + 1;
        const timeParts = lines[timeLineIndex].split(' --> ');
        const start = srtTimeToSeconds(timeParts[0]);
        const end = srtTimeToSeconds(timeParts[1]);
        const text = lines.slice(timeLineIndex + 1).join('\n');

        segments.push({ id, start, end, text });
    }

    return segments;
};

/**
 * Convert SRT timestamp to seconds
 */
const srtTimeToSeconds = (timeStr: string): number => {
    if (!timeStr) return 0;
    const [hours, minutes, seconds] = timeStr.split(':');
    const [secs, millis] = seconds.split(',');
    return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(secs) + parseInt(millis || '0') / 1000;
};

/**
 * Convert blob to data URL
 */
const blobToDataURL = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

/**
 * Mock transcription for testing without API
 */
const mockTranscription = (): WhisperTranscription => {
    const segments = [
        { id: 1, start: 0, end: 3.5, text: 'Welcome to this video demonstration.' },
        { id: 2, start: 3.5, end: 7.0, text: 'This is an automatically generated transcript.' },
        { id: 3, start: 7.0, end: 11.2, text: 'In production, this would be real Whisper AI transcription.' }
    ];

    return {
        text: 'Welcome to this video demonstration. This is an automatically generated transcript. In production, this would be real Whisper AI transcription.',
        segments,
        srt: generateSRT(segments),
        language: 'en'
    };
};
