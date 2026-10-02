/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f4f1fd",
          100: "#e8e3fb",
          200: "#d3c9f7",
          300: "#b7a8f0",
          400: "#927ce7",
          500: "#745edd",
          600: "#624ccd",
          700: "#503eb2",
          800: "#40338e",
          900: "#362d70",
          950: "#28224e",
        },
        // Landing-page accents (see src/components/landing/* and
        // src/features/landing/*). The admin area no longer has a palette of
        // its own: it shares `brand` with the rest of the signed-in app.
        lilac: {
          50: "#f6f3ff",
          100: "#eee9ff",
          200: "#ddd3ff",
          300: "#c4b5fb",
          400: "#a892f7",
          500: "#8b72f2",
          600: "#7455e6",
        },
        sun: {
          100: "#fff0df",
          400: "#f59a2e",
          500: "#ee7f22",
          600: "#d26a1b",
        },
        bloom: {
          400: "#ff6b9d",
          600: "#e8467c",
        },
        aqua: {
          400: "#4cc9f0",
          600: "#2a9fd6",
        },
        ink: {
          50: "#f4f4f5",
          100: "#e4e4e7",
          200: "#a1a1aa",
          300: "#71717a",
          400: "#52525b",
          500: "#3f3f46",
          600: "#27272a",
          700: "#1c1c1f",
          800: "#141416",
          900: "#0c0c0d",
          950: "#060607",
        },
        // App canvas: `deep` is the page behind the frame, `DEFAULT` the frame.
        canvas: {
          DEFAULT: "#f5f4fd",
          deep: "#e9e7f8",
        },
        gold: {
          50: "#fbf6e9",
          100: "#f5e9c2",
          200: "#ecd68c",
          300: "#e0bd56",
          400: "#d4a72f",
          500: "#c4941f",
          600: "#a37718",
          700: "#7d5b14",
          800: "#5c4310",
          900: "#3f2e0b",
        },
      },
      fontFamily: {
        sans: [
          "'Plus Jakarta Sans'",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      keyframes: {
        pop: {
          "0%": { opacity: "0", transform: "translateY(14px) scale(0.96)" },
          "100%": { opacity: "1", transform: "none" },
        },
        grow: {
          "0%": { transform: "scaleY(0)" },
          "100%": { transform: "scaleY(1)" },
        },
        // The notification panel opens downward from under the bell. On a
        // phone it slides; on desktop it is anchored to the bell and a slide
        // reads as lag, so that view opts out (see NotificationBell.jsx).
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-8px) scaleY(0.97)" },
          "100%": { opacity: "1", transform: "none" },
        },
        // Mobile nav: the active icon pops into the raised bubble, and the
        // "More" sheet rises from the bottom edge over a fading scrim.
        navPop: {
          "0%": { opacity: "0", transform: "scale(0.4) rotate(-14deg)" },
          "60%": { opacity: "1", transform: "scale(1.12) rotate(2deg)" },
          "100%": { opacity: "1", transform: "none" },
        },
        sheetUp: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "none" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        pop: "pop 0.65s cubic-bezier(0.2, 0.8, 0.2, 1) both",
        grow: "grow 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) both",
        "slide-down":
          "slideDown 0.18s cubic-bezier(0.2, 0.8, 0.2, 1) both",
        "nav-pop": "navPop 0.45s cubic-bezier(0.2, 0.8, 0.2, 1) both",
        "sheet-up": "sheetUp 0.32s cubic-bezier(0.2, 0.8, 0.2, 1) both",
        "fade-in": "fadeIn 0.2s ease-out both",
      },
      boxShadow: {
        card: "0 2px 4px rgba(65, 51, 125, 0.045), 0 8px 22px rgba(65, 51, 125, 0.085)",
        panel: "0 20px 60px rgba(24, 29, 70, 0.18)",
        soft: "0 3px 8px rgba(65, 51, 125, 0.055), 0 16px 30px -12px rgba(65, 51, 125, 0.14)",
        pop: "0 12px 24px -8px rgba(84, 104, 227, 0.35)",
      },
      borderRadius: {
        xl2: "1.25rem",
        xl3: "1.75rem",
      },
    },
  },
  plugins: [],
};
