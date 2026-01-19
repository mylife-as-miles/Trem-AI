export const createIconTexture = (type: string, color: string): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Clear
    ctx.clearRect(0, 0, 128, 128);

    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Use a bold font
    ctx.font = 'bold 80px sans-serif';

    let symbol = '';
    switch (type) {
        case 'link': symbol = '🔗'; break;
        case 'cloud': symbol = '☁'; break;
        case 'wifi': symbol = '📶'; break;
        case 'shield': symbol = '🛡'; break;
        case 'dots': symbol = '•••'; ctx.font = 'bold 60px sans-serif'; break;
        default: symbol = '';
    }

    if (symbol) {
        ctx.fillText(symbol, 64, 68); // Slight Y offset for centering
    } else {
        // Fallback geometric shape if no symbol matches or for 'solid' without icon
        // But based on usage, iconType is optional.
    }

    return canvas.toDataURL();
}
