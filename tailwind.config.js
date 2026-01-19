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
            boxShadow: {
                'neon': '0 0 10px theme("colors.green.500"), 0 0 20px theme("colors.green.900")',
                'glow-box': '0 0 40px -10px rgba(34, 197, 94, 0.25)',
            },
            dropShadow: {
                'glow-text': '0 0 8px rgba(34, 197, 94, 0.6)',
            }
        },
    },
    plugins: [],
}
