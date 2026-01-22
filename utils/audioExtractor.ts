/**
 * Audio Extraction Utility
 * Extracts audio track from video blob using Web Audio API
 */

/**
 * Extracts audio from a video blob and converts it to WAV format
 * @param videoBlob - The video file as a Blob
 * @returns Audio blob in WAV format
 */
export const extractAudioFromVideo = async (videoBlob: Blob): Promise<Blob> => {
    try {
        const base64Video = await blobToDataURL(videoBlob);

        const response = await fetch('/api/extract-audio', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ file: base64Video }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Audio extraction failed');
        }

        const data = await response.json();
        // create blob from base64 response
        const res = await fetch(data.audio);
        return await res.blob();

    } catch (error) {
        console.error('Audio extraction error:', error);
        throw error;
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
