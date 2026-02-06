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
                "background-dark": "#09090b", // Zinc 950
                "surface-light": "#ffffff",
                "surface-dark": "#09090b",
                "surface-card": "#18181b", // Zinc 900
                "border-dark": "#27272a", // Zinc 800
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
