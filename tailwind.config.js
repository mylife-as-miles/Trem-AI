/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                serif: ['Playfair Display', 'serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            colors: {
                primary: '#1A1A1A',
                secondary: '#6B7280',
                card: '#F3F6FB', // Matches the canvas background color in ThreeScene
                accentBlue: '#3B82F6',
            }
        },
    },
    plugins: [],
}
