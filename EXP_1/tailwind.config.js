/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        panel: {
          DEFAULT: "#12141C",
          raised: "#181B26",
          line: "#262B3A",
        },
        ink: {
          DEFAULT: "#EDEDF2",
          dim: "#8A8FA3",
          faint: "#565C72",
        },
        signal: {
          DEFAULT: "#5EEAD4",
          dim: "#1F5B54",
        },
        flag: {
          DEFAULT: "#F5A623",
          dim: "#4A3418",
        },
        alert: "#F0567C",
      },
      fontFamily: {
        mono: ["'IBM Plex Mono'", "monospace"],
        sans: ["Manrope", "sans-serif"],
      },
      keyframes: {
        flash: {
          "0%": { boxShadow: "0 0 0 0 var(--flash-color, #5EEAD4)", borderColor: "var(--flash-color, #5EEAD4)" },
          "100%": { boxShadow: "0 0 0 0 transparent", borderColor: "transparent" },
        },
        sweep: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        flash: "flash 700ms ease-out",
        sweep: "sweep 2.4s linear infinite",
      },
    },
  },
  plugins: [],
};
