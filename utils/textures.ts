// Utility to generate simple icon textures on the fly using HTML Canvas
// This avoids external asset dependencies and ensures crisp vector-like quality.

export const createIconTexture = (type: string, color: string = '#000000'): string => {
    const canvas = document.createElement('canvas');
    const size = 512;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Background
    ctx.fillStyle = '#ffffff00'; // Transparent
    ctx.clearRect(0, 0, size, size);

    // Draw settings
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 15;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const cx = size / 2;
    const cy = size / 2;

    switch (type) {
        case 'wifi': // Kept for 'cloud/stream' connection
            ctx.beginPath();
            ctx.arc(cx, cy + 100, 30, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(cx, cy + 100, 80, Math.PI * 1.2, Math.PI * 1.8);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(cx, cy + 100, 140, Math.PI * 1.2, Math.PI * 1.8);
            ctx.stroke();
            break;

        case 'link': // Kept for 'integration'
            ctx.translate(cx, cy);
            ctx.rotate(-Math.PI / 4);
            ctx.translate(-cx, -cy);
            ctx.beginPath();
            ctx.roundRect(cx - 100, cy - 40, 120, 80, 40);
            ctx.stroke();
            ctx.beginPath();
            ctx.roundRect(cx - 20, cy - 40, 120, 80, 40);
            ctx.stroke();
            break;

        case 'cloud': // Kept for 'storage'
            ctx.beginPath();
            ctx.arc(cx - 60, cy + 20, 50, 0, Math.PI * 2);
            ctx.arc(cx + 60, cy + 20, 50, 0, Math.PI * 2);
            ctx.arc(cx, cy - 40, 70, 0, Math.PI * 2);
            ctx.fill();
            break;

        case 'play':
            ctx.beginPath();
            // Triangle pointing right
            ctx.moveTo(cx - 40, cy - 60);
            ctx.lineTo(cx + 60, cy);
            ctx.lineTo(cx - 40, cy + 60);
            ctx.closePath();
            ctx.fill(); // Solid fill
            // Circle around it
            ctx.beginPath();
            ctx.arc(cx, cy, 100, 0, Math.PI * 2);
            ctx.stroke();
            break;

        case 'film':
            // Film strip segment
            ctx.beginPath();
            ctx.rect(cx - 80, cy - 100, 160, 200);
            ctx.stroke();
            // Sprocket holes
            ctx.fillStyle = color;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.rect(cx - 60, cy - 80 + (i * 60), 20, 40);
                ctx.fill();
                ctx.beginPath();
                ctx.rect(cx + 40, cy - 80 + (i * 60), 20, 40);
                ctx.fill();
            }
            break;

        case 'audio':
            // Waveform bars
            const bars = [40, 70, 100, 60, 90, 50, 30];
            const barWidth = 20;
            const spacing = 15;
            const startX = cx - ((bars.length * (barWidth + spacing)) / 2);

            for (let i = 0; i < bars.length; i++) {
                ctx.beginPath();
                ctx.roundRect(startX + i * (barWidth + spacing), cy - bars[i] / 2, barWidth, bars[i], 10);
                ctx.fill();
            }
            break;

        case 'render':
            // Progress circle/gear
            ctx.beginPath();
            ctx.arc(cx, cy, 80, 0, Math.PI * 2);
            ctx.stroke();

            // Inner segments
            ctx.beginPath();
            ctx.moveTo(cx, cy - 80);
            ctx.lineTo(cx, cy - 40);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(cx, cy + 80);
            ctx.lineTo(cx, cy + 40);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(cx - 80, cy);
            ctx.lineTo(cx - 40, cy);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(cx + 80, cy);
            ctx.lineTo(cx + 40, cy);
            ctx.stroke();
            break;
    }

    return canvas.toDataURL();
};
