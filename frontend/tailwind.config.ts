import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0D0F12",
          card: "#14171C",
          hover: "#1A1E25",
          border: "#23282F",
        },
        accent: {
          DEFAULT: "#F5A623",
          dim: "rgba(245,166,35,0.15)",
          glow: "rgba(245,166,35,0.3)",
        },
        text: {
          DEFAULT: "#F0EDE8",
          muted: "#8A8F98",
          dim: "#555A63",
        },
        status: {
          high: "#EF4444",
          medium: "#F5A623",
          low: "#22C55E",
          positive: "#22C55E",
          neutral: "#F5A623",
          tense: "#EF4444",
          mixed: "#A855F7",
        },
      },
      fontFamily: {
        display: ["var(--font-syne)", "sans-serif"],
        mono: ["var(--font-dm-mono)", "monospace"],
      },
      animation: {
        "wave": "wave 2.5s ease-in-out infinite",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        wave: {
          "0%, 100%": { transform: "scaleY(0.5)" },
          "50%": { transform: "scaleY(1.5)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
