/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                primary: "#22C55E", // Green 500
                primary_hover: "#16A34A", // Green 600
                "background-light": "#f8fafc",
                "background-dark": "#000000",
                "surface-light": "#ffffff",
                "surface-dark": "#000000",
                "surface-card": "#0a0a0a",
                "border-dark": "#1f1f1f",
            },
            fontFamily: {
                display: ["'Space Grotesk'", "sans-serif"],
                sans: ["'Inter'", "sans-serif"],
                mono: ["'JetBrains Mono'", "monospace"],
            },
            // Removed glow-related shadows
            boxShadow: {},
            dropShadow: {}
        },
    },
    plugins: [],
}
