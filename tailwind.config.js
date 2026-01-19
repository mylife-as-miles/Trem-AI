/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./App.tsx",
        "./index.tsx",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./utils/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                serif: ['Playfair Display', 'serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            colors: {
                primary: '#A855F7', // Purple-500 (Brand Color)
                secondary: '#9CA3AF', // Gray-400 (Subtext)
                background: '#000000', // True Black
                surface: '#0A0A0A', // Slightly lighter black for cards
                foreground: '#FFFFFF', // White text
                accentBlue: '#3B82F6', // Keep for minor accents if needed
            }
        },
    },
    plugins: [],
}
