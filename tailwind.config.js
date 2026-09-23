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
