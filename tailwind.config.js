/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                primary: "#D9F85F", // Lime Green
                primary_hover: "#C8E64D", // Darker Lime Green
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
