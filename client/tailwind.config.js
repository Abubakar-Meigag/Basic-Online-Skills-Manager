/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // 1. CYF BRAND COLORS
      colors: {
        "brand-red": "#EE4434",
        "dark-brand-red": "#B4001B",
        "light-brand-red": "#FF786F",
        "body-text": "#333333",
        "grey-light": "#F3F3F3",
        "border-1": "#E3E3E3",
        "border-2": "#A9A9A9",
        "primary-blue": "#304FFE",
        "primary-blue-dark": "#0026CA",
        "error-red": "#FF0000",
      },
      // 2. CYF BRAND SPACING (MULTIPLE OF 5)
      spacing: {
        5: "5px",
        10: "10px",
        15: "15px",
        20: "20px",
        25: "25px",
        30: "30px",
        35: "35px",
      },
      // 3. CYF FONT FAMILIES
      fontFamily: {
        heading: ["Raleway", "sans-serif"],
        body: ["Lato", "sans-serif"],
      },
      // 4. CYF CORNER RADIUS
      borderRadius: {
        brand: "2px",
        chip: "4px",
      },
    },
  },
  plugins: [],
};
