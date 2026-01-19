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
                primary: '#EDEDED', // Light text for dark mode
                secondary: '#A1A1AA', // Gray text for dark mode
                card: '#0A0A0A', // Dark background (matches ThreeScene)
                accentBlue: '#60A5FA', // Lighter blue for better contrast
            }
        },
    },
    plugins: [],
}
