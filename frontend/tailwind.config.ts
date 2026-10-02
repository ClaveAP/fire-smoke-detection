import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        industrial: {
          canvas: "#0B111E",
          surface: "#131B2A",
          elevated: "#182235",
          border: "#1F293D",
          "border-subtle": "#162033",
          "border-active": "#2E3D5B",
        },
        alert: {
          fire: {
            DEFAULT: "#DC2626",
            bright: "#EF4444",
            muted: "rgba(220, 38, 38, 0.15)",
            border: "rgba(239, 68, 68, 0.3)",
          },
          smoke: {
            DEFAULT: "#D97706",
            bright: "#F59E0B",
            muted: "rgba(217, 119, 6, 0.15)",
            border: "rgba(245, 158, 11, 0.3)",
          },
          safe: {
            DEFAULT: "#059669",
            bright: "#10B981",
            muted: "rgba(5, 150, 105, 0.15)",
            border: "rgba(16, 185, 129, 0.3)",
          },
        },
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "Poppins", "sans-serif"],
        mono: [
          "var(--font-jetbrains-mono)",
          "JetBrains Mono",
          "ui-monospace",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};

export default config;

