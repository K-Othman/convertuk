import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // The one dark element on the page: the results "display".
        ink: {
          DEFAULT: "#0b1120",
          soft: "#141d31",
          line: "#243049",
        },
        // Cool, deliberate off-white — not a warm cream.
        paper: "#f5f7fa",
        // Single brand accent: a confident emerald (the payoff colour).
        accent: {
          DEFAULT: "#059669", // emerald-600, for light backgrounds
          bright: "#34d399", // emerald-400, glows on the dark display
        },
      },
      fontFamily: {
        sans: [
          "var(--font-geist-sans)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          "var(--font-geist-mono)",
          "ui-monospace",
          "SFMono-Regular",
          "monospace",
        ],
      },
      boxShadow: {
        display: "0 24px 60px -28px rgba(5, 150, 105, 0.45)",
        card: "0 1px 2px rgba(11, 17, 32, 0.04), 0 12px 32px -20px rgba(11, 17, 32, 0.25)",
      },
    },
  },
  plugins: [],
};
export default config;
