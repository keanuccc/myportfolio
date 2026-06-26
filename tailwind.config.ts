import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Apple 风格颜色系统
        apple: {
          bg: '#ffffff',
          bgSecondary: '#f5f5f7',
          text: '#1d1d1f',
          textSecondary: '#86868b',
        },
        // Light theme (保持兼容)
        bglight: "#ffffff",
        cardlight: "#ffffff",
        textlight: "#f0f5fa",
        marrsgreen: "#2b7a4b",
        marrslight: "#3a9d60",
        marrsdark: "#1e5c36",
        // Dark theme (保持兼容)
        bgdark: "#000000",
        carddark: "#1d1d1f",
        textdark: "#86868b",
        carrigreen: "#58d5a3",
        carrilight: "#7ee0b8",
        carridark: "#3cb882",
      },
      fontFamily: {
        jost: ["Jost", "sans-serif"],
      },
      borderRadius: {
        'card': '18px',
        'button': '980px',
        'tag': '20px',
      },
      boxShadow: {
        'card': '0 4px 20px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.12)',
        'card-dark': '0 4px 20px rgba(0, 0, 0, 0.3)',
        'card-dark-hover': '0 8px 30px rgba(0, 0, 0, 0.5)',
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
