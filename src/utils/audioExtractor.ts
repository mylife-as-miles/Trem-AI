/**
 * Audio Extraction Utility
 * Extracts audio track from video blob using Web Audio API
 */

/**
 * Extracts audio from a video blob and converts it to WAV format
 * @param videoBlob - The video file as a Blob
 * @returns Audio blob in WAV format
 */
// Helper to encode AudioBuffer to WAV
const encodeWAV = (samples: Float32Array, sampleRate: number): Blob => {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    // RIFF identifier
    writeString(view, 0, 'RIFF');
    // file length
    view.setUint32(4, 36 + samples.length * 2, true);
    // RIFF type
    writeString(view, 8, 'WAVE');
    // format chunk identifier
    writeString(view, 12, 'fmt ');
    // format chunk length
    view.setUint32(16, 16, true);
    // sample format (raw)
    view.setUint16(20, 1, true);
    // channel count (mono)
    view.setUint16(22, 1, true);
    // sample rate
    view.setUint32(24, sampleRate, true);
    // byte rate (sample rate * block align)
    view.setUint32(28, sampleRate * 2, true);
    // block align (channel count * bytes per sample)
    view.setUint16(32, 2, true);
    // bits per sample
    view.setUint16(34, 16, true);
    // data chunk identifier
    writeString(view, 36, 'data');
    // data chunk length
    view.setUint32(40, samples.length * 2, true);

    // Write samples
    floatTo16BitPCM(view, 44, samples);

    return new Blob([view], { type: 'audio/wav' });
};

const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
};

const floatTo16BitPCM = (output: DataView, offset: number, input: Float32Array) => {
    for (let i = 0; i < input.length; i++, offset += 2) {
        const s = Math.max(-1, Math.min(1, input[i]));
        output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
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

        const wavBlob = encodeWAV(finalSamples, finalSampleRate);
        return wavBlob;

    } catch (error) {
        console.error('Audio extraction error (client-side):', error);
        // Return original blob if decoding fails (might work if it's already audio)
        return videoBlob;
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
