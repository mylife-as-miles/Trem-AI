/**
 * Audio Extraction Utility
 * Extracts audio track from video blob using Web Audio API
 */

// @ts-ignore
import * as lamejs from 'lamejs';

/**
 * Extracts audio from a video blob and converts it to MP3 format
 * @param videoBlob - The video file as a Blob
 * @returns Audio blob in MP3 format
 */
// Helper to encode AudioBuffer to MP3
const encodeMP3 = (samples: Float32Array, sampleRate: number): Blob => {
    // Convert Float32 to Int16
    const buffer = new Int16Array(samples.length);
    for (let i = 0; i < samples.length; i++) {
        const s = Math.max(-1, Math.min(1, samples[i]));
        buffer[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }

    // Initialize Encoder
    // Mono, SampleRate, 32kbps (sufficient for speech)
    // @ts-ignore
    const mp3encoder = new lamejs.Mp3Encoder(1, sampleRate, 32);
    const mp3Data = [];

    // Encode in chunks
    const sampleBlockSize = 1152; // multiple of 576
    for (let i = 0; i < buffer.length; i += sampleBlockSize) {
        const sampleChunk = buffer.subarray(i, i + sampleBlockSize);
        const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
        if (mp3buf.length > 0) {
            mp3Data.push(mp3buf);
        }
    }

    // Flush
    const mp3buf = mp3encoder.flush();
    if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
    }

    return new Blob(mp3Data, { type: 'audio/mp3' });
};



export const extractAudioFromVideo = async (videoBlob: Blob): Promise<Blob> => {
    try {
        const arrayBuffer = await videoBlob.arrayBuffer();
        // @ts-ignore - Web Audio API types might be missing or conflict
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Decode
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // Mix down to mono for efficiency
        const channelData = audioBuffer.getChannelData(0);
        const originalSampleRate = audioBuffer.sampleRate;

        // Downsample to 16kHz (Whisper's native rate) to reduce file size
        // This reduces size by ~2.7x for 44.1kHz source, ~3x for 48kHz source
        const TARGET_SAMPLE_RATE = 16000;
        let finalSamples: Float32Array;
        let finalSampleRate: number;

        if (originalSampleRate > TARGET_SAMPLE_RATE) {
            // Downsample using linear interpolation
            const ratio = originalSampleRate / TARGET_SAMPLE_RATE;
            const newLength = Math.floor(channelData.length / ratio);
            finalSamples = new Float32Array(newLength);

            for (let i = 0; i < newLength; i++) {
                const srcIndex = i * ratio;
                const srcIndexFloor = Math.floor(srcIndex);
                const srcIndexCeil = Math.min(srcIndexFloor + 1, channelData.length - 1);
                const t = srcIndex - srcIndexFloor;
                // Linear interpolation for smoother downsampling
                finalSamples[i] = channelData[srcIndexFloor] * (1 - t) + channelData[srcIndexCeil] * t;
            }
            finalSampleRate = TARGET_SAMPLE_RATE;
            console.log(`Audio downsampled: ${originalSampleRate}Hz → ${TARGET_SAMPLE_RATE}Hz (${(channelData.length * 2 / 1024 / 1024).toFixed(1)}MB → ${(finalSamples.length * 2 / 1024 / 1024).toFixed(1)}MB)`);
        } else {
            finalSamples = channelData;
            finalSampleRate = originalSampleRate;
        }

        const mp3Blob = encodeMP3(finalSamples, finalSampleRate);
        return mp3Blob;

    } catch (error) {
        console.error('Audio extraction error (client-side):', error);
        // Return null if decoding fails so we don't send video bytes as audio
        return null as any;
    }
};

const blobToDataURL = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

/**
 * Convert audio blob to base64 for API upload
 * @param audioBlob - The audio file as a Blob
 * @returns Base64 encoded string
 */
export const audioToBase64 = (audioBlob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
    });
};
