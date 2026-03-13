/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        surface: "#0D0D0D",
        surfaceBorder: "#1A1A1A",
        accent: "#E8453C",
        primary: "#F0F0F0",
        muted: "#6B6B6B",
        success: "#27AE60",
      },
      fontFamily: {
        sans: ["System"],
      },
    },
  },
  plugins: [],
};
