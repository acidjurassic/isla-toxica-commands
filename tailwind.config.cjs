/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        toxic: {
          50:  "#eafff6",
          100: "#c6ffe7",
          200: "#8effcf",
          300: "#4dffb3",
          400: "#1aff9b",
          500: "#00ff99",   // primary neon
          600: "#00d17f",
          700: "#00a565",
          800: "#007b4d",
          900: "#065f3f",
        },
        botgoid: {
          400: "#ffa257",
          500: "#ff8a3d",
          600: "#ff7a1f",
        },
        panel: {
          bg: "#1b1b1b",
          card: "#222222",
        },
      },
      boxShadow: {
        neon: "0 0 18px rgba(0,255,153,0.45)",
        neonSoft: "0 0 12px rgba(0,255,153,0.25)",
        insetSoft: "inset 0 0 12px rgba(0,0,0,0.35)",
      },
      borderRadius: {
        panel: "22px",
        pill: "18px",
      },
    },
  },
  plugins: [],
};
