/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#0D1321",
        surface: "#1A2332",
        surfaceBorder: "#2D3A4D",
        accent: "#C45C52",
        accentEnd: "#A84A42",
        primary: "#E8EAED",
        muted: "#8B95A5",
        success: "#2D9D78",
      },
      borderRadius: {
        card: "1rem",
        button: "0.75rem",
        control: "0.625rem",
      },
      fontFamily: {
        sans: ["System"],
      },
    },
  },
  plugins: [],
};
