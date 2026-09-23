/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef1fd",
          100: "#dde3fb",
          200: "#b6c1f6",
          300: "#8e9fef",
          400: "#6f81ea",
          500: "#5468e3",
          600: "#4453c9",
          700: "#3641a0",
          800: "#2b3480",
          900: "#232a63",
          950: "#181d46",
        },
        // Admin-only palette (see src/layouts/AdminLayout.jsx and
        // src/features/admin/*) — deliberately separate from `brand` so the
        // student/instructor blue theme is untouched.
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
      boxShadow: {
        card: "0 1px 2px rgba(24, 29, 70, 0.04), 0 8px 24px rgba(24, 29, 70, 0.06)",
        panel: "0 20px 60px rgba(24, 29, 70, 0.18)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
