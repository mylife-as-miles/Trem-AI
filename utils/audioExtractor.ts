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
    return new Promise((resolve, reject) => {
        try {
            // Create video element
            const video = document.createElement('video');
            const videoURL = URL.createObjectURL(videoBlob);
            video.src = videoURL;
            video.muted = true;
            video.playsInline = true;

            video.onloadedmetadata = async () => {
                try {
                    // Create audio context
                    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

                    // Create media element source
                    const source = audioContext.createMediaElementSource(video);

                    // Create destination for recording
                    const destination = audioContext.createMediaStreamDestination();
                    source.connect(destination);

                    // Set up MediaRecorder
                    const mediaRecorder = new MediaRecorder(destination.stream, {
                        mimeType: 'audio/webm;codecs=opus'
                    });

                    const audioChunks: Blob[] = [];

                    mediaRecorder.ondataavailable = (event) => {
                        if (event.data.size > 0) {
                            audioChunks.push(event.data);
                        }
                    };

                    mediaRecorder.onstop = async () => {
                        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                        URL.revokeObjectURL(videoURL);
                        await audioContext.close();
                        resolve(audioBlob);
                    };

                    mediaRecorder.onerror = (error) => {
                        console.error('MediaRecorder error:', error);
                        URL.revokeObjectURL(videoURL);
                        audioContext.close();
                        reject(error);
                    };

                    // Play video and record audio
                    mediaRecorder.start();
                    video.play();

                    // Stop recording when video ends
                    video.onended = () => {
                        mediaRecorder.stop();
                    };

                } catch (error) {
                    console.error('Audio extraction error:', error);
                    URL.revokeObjectURL(videoURL);
                    reject(error);
                }
            };

            video.onerror = (error) => {
                console.error('Video loading error:', error);
                URL.revokeObjectURL(videoURL);
                reject(error);
            };

        } catch (error) {
            console.error('Audio extractor initialization error:', error);
            reject(error);
        }
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
