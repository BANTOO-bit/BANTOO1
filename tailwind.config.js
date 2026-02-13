/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                "primary": "#FF6B00",
                "background-light": "#F9F9F9",
                "background-dark": "#121212",
                "card-light": "#FFFFFF",
                "card-dark": "#1E1E1E",
                "admin-primary": "#137fec",
                "admin-bg-light": "#f6f7f8",
                "admin-bg-dark": "#101922",
                "text-main": "#2E2E2E",
                "text-secondary": "#7A7A7A",
                "border-color": "#EAEAEA",
                "primary-bg": "#FFF5EB",
                "text-primary-light": "#1F2937",
                "text-primary-dark": "#F3F4F6",
                "text-secondary-light": "#6B7280",
                "text-secondary-dark": "#9CA3AF",
                "border-light": "#E5E7EB",
                "border-dark": "#374151",
                "danger": "#DC2626",
                "warning": "#EAB308",
                "success": "#22C55E",
            },
            fontFamily: {
                "display": ["Inter", "sans-serif"],
                "body": ["Inter", "sans-serif"],
            },
            borderRadius: {
                "DEFAULT": "0.5rem",
                "lg": "1rem",
                "xl": "1.5rem",
                "full": "9999px"
            },
            boxShadow: {
                'soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
            }
        },
    },
    plugins: [],
}
