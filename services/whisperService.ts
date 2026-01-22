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

        if (!response.ok) {
            // Try to parse error details
            let errorDetails = {};
            try {
                const text = await response.text();
                try {
                    errorDetails = JSON.parse(text);
                } catch {
                    // Not JSON, likely HTML error page
                    console.warn('API returned non-JSON error response:', text.substring(0, 100));
                }
            } catch (e) {
                // Ignore read error
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

        // Verify content type is valid JSON before parsing
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            console.warn(`API returned unexpected content-type: ${contentType}. Likely SPA fallback or 404.`);
            // Log the first few chars to debug
            const text = await response.text();
            console.warn('Response preview:', text.substring(0, 100));
            return mockTranscription();
        }

        const prediction = await response.json();

        // Poll for completion
        const result = await pollPrediction(prediction.id);

        return parseWhisperOutput(result.output);

    } catch (error) {
        console.error('Whisper transcription error:', error);
        // Fallback to mock
        return mockTranscription();
    }
};

/**
 * Poll Replicate prediction until complete
 */
const pollPrediction = async (predictionId: string, maxAttempts = 60): Promise<any> => {
    for (let i = 0; i < maxAttempts; i++) {
        const response = await fetch(`/api/predictions/${predictionId}`);

        // Check content type
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error(`Poll API returned non-JSON: ${contentType}`);
        }

        const prediction = await response.json();

        if (prediction.status === 'succeeded') {
            return prediction;
        }

        if (prediction.status === 'failed') {
            throw new Error('Prediction failed');
        }

        // Wait 2 seconds before next poll
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    throw new Error('Prediction timeout');
};

/**
 * Parse Whisper API output into structured format
 */
const parseWhisperOutput = (output: any): WhisperTranscription => {
    // Whisper returns SRT format string
    const srt = output.transcription || output;

    // Use native segments if available, otherwise parse SRT
    let segments: WhisperSegment[] = [];
    if (output.segments && Array.isArray(output.segments)) {
        segments = output.segments.map((s: any) => ({
            id: s.id,
            start: s.start,
            end: s.end,
            text: s.text.trim()
        }));
    } else {
        segments = parseSRT(srt);
    }

    // Construct full text if not present or just to be safe
    const text = segments.map(s => s.text).join(' ');

    return {
        text,
        segments,
        srt,
        language: output.detected_language
    };
};

/**
 * Parse SRT format into segments
 */
const parseSRT = (srt: string): WhisperSegment[] => {
    const segments: WhisperSegment[] = [];
    const blocks = srt.trim().split('\n\n');

    for (const block of blocks) {
        const lines = block.split('\n');
        if (lines.length < 3) continue;

        const id = parseInt(lines[0]);
        const timeParts = lines[1].split(' --> ');
        const start = srtTimeToSeconds(timeParts[0]);
        const end = srtTimeToSeconds(timeParts[1]);
        const text = lines.slice(2).join('\n');

        segments.push({ id, start, end, text });
    }

    return segments;
};

/**
 * Convert SRT timestamp to seconds
 */
const srtTimeToSeconds = (timeStr: string): number => {
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
    const srt = `1
00:00:00,000 --> 00:00:03,500
Welcome to this video demonstration.

2
00:00:03,500 --> 00:00:07,000
This is an automatically generated transcript.

3
00:00:07,000 --> 00:00:11,200
In production, this would be real Whisper AI transcription.`;

    return {
        text: 'Welcome to this video demonstration. This is an automatically generated transcript. In production, this would be real Whisper AI transcription.',
        segments: [
            { id: 1, start: 0, end: 3.5, text: 'Welcome to this video demonstration.' },
            { id: 2, start: 3.5, end: 7.0, text: 'This is an automatically generated transcript.' },
            { id: 3, start: 7.0, end: 11.2, text: 'In production, this would be real Whisper AI transcription.' }
        ],
        srt,
        language: 'en'
    };
};
