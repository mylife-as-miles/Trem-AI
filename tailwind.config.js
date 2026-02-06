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
                "background-dark": "#0E100A", // User Reference
                "surface-light": "#ffffff",
                "surface-dark": "#09090b",
                "surface-card": "#1a1c16", // Adjusted for green-black tint
                "border-dark": "#2a2c26", // Adjusted for green-black tint
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
