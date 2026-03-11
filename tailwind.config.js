/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#0D0D0D",
        surface: "#1A1A2E",
        accent: "#E8453C",
        primary: "#F0F0F0",
        muted: "#888888",
        success: "#27AE60",
      },
    },
  },
  plugins: [],
};
