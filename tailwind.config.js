const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require("./src/utils/colorsTW");
const svgToDataUri = require("mini-svg-data-uri");
const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts}"],
  theme: {
    extend: {
      colors,
      fontFamily: {
        sans: ['"Neue Haas Grotesk"', ...defaultTheme.fontFamily.sans],
      },
      gridTemplateColumns: {
        // fucking SDGs they gotta be 17 huh? They could not make it 16
        17: "repeat(17, minmax(0, 1fr))",
        18: "repeat(18, minmax(0, 1fr))",
      },
      // font size
      fontSize: {
        xxs: ".500rem",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    plugin(function ({ addComponents, theme }) {
      const baseIcon = (strokeColor) =>
        svgToDataUri(
          `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
          <path stroke="${strokeColor}" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 8l4 4 4-4"/>
        </svg>`,
        );

      addComponents({
        select: {
          "background-image": `url("${baseIcon(theme("colors.gray.900"))}")`,
        },
        "select:hover": {
          "background-image": `url("${baseIcon(theme("colors.white"))}")`,
        },
        "select.dark": {
          "background-image": `url("${baseIcon(theme("colors.white"))}")`,
        },
        "select:disabled": {
          "background-image": `url("${baseIcon(theme("colors.gray.600"))}")`,
        },
      });
    }),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
  ],
};
