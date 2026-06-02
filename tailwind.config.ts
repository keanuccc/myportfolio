import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Light theme
        bglight: "#f0f5fa",
        cardlight: "#ffffff",
        textlight: "#f0f5fa",
        marrsgreen: "#2b7a4b",
        marrslight: "#3a9d60",
        marrsdark: "#1e5c36",
        // Dark theme
        bgdark: "#0e141a",
        carddark: "#1B2731",
        textdark: "#a6adba",
        carrigreen: "#58d5a3",
        carrilight: "#7ee0b8",
        carridark: "#3cb882",
      },
      fontFamily: {
        jost: ["Jost", "sans-serif"],
      },
      animation: {
        bounce: "bounce 2s infinite",
        fadeIn: "fadeIn 0.5s ease-out forwards",
        slideUp: "slideUp 0.6s ease-out forwards",
        slideDown: "slideDown 0.5s ease-out forwards",
        scaleIn: "scaleIn 0.5s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
