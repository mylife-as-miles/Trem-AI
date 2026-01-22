/**
 * Frame Extraction Utility
 * Extracts keyframes from video using server-side FFmpeg
 */

export const extractFramesFromVideo = async (videoBlob: Blob): Promise<string[]> => {
    try {
        const base64Video = await blobToDataURL(videoBlob);

        const response = await fetch('/api/extract-frames', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ file: base64Video }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Frame extraction failed');
        }

        const data = await response.json();
        return data.frames; // Array of base64 strings

    } catch (error) {
        console.error('Frame extraction error:', error);
        return []; // Fallback to empty if fails, rather than blocking entire flow
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
