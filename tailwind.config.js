/** @type {import('tailwindcss').Config} */
module.exports = {
   content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        default: "#444444",
        primary: "#3624A7",
        secondary: "#657ED4",
        danger: "#FF331F",
        muted: "#909090",
        disabled: "#C4C4C4",
        defaultAccent: "#EEEEEE",
        // primaryAccent: "#FF331F",
        primaryAccent: "#E2E7FA",
        dangerAccent: "#FBD2E0",
        white: "#FFFFFF",
      },
    },
  },
  plugins: [],
};
