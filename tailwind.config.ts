import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        alley: {
          cream: "#E8E0D0",
          brown: "#8B6914",
          brownHover: "#C4931A",
          overlay: "rgba(10, 8, 5, 0.45)",
        },
      },
      fontFamily: {
        coding: [
          '"Nanum Gothic Coding"',
          "ui-monospace",
          "SFMono-Regular",
          "monospace",
        ],
      },
      keyframes: {
        "modal-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        toastFade: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "modal-up": "modal-up 0.35s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
