/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0A",
        surface: "#111111",
        "surface-2": "#1A1A1A",
        accent: "#A3E635",
        "accent-dim": "#4D6B19",
        primary: "#F5F5F5",
        muted: "#555555",
        destructive: "#EF4444",
        success: "#A3E635",
        overtime: "#B91C1C",
        "overtime-mid": "#DC2626",
      },
      borderRadius: {
        card: "1.25rem",
        button: "0.75rem",
        control: "0.75rem",
      },
      fontFamily: {
        sans: ["System"],
      },
      spacing: {
        "block": "3rem",
      },
    },
  },
  plugins: [],
};
