/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}", "/node_modules/flowbite/**/*.js"],
  theme: {
    extend: {
      screens: {
        '2xl': '1670px'
      } 
    },
    container: {
      center: true,
      padding: {
        DEFAULT: ".5rem",
        sm: "1rem",
        lg: "2.5rem",
        xl: "5rem",
        "2xl": "20rem",
      },
    },
  },
  plugins: [require("flowbite/plugin")],
  darkMode: 'class'
};
