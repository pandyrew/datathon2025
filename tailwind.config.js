/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        geist: ["var(--font-geist-sans)"],
        "geist-mono": ["var(--font-geist-mono)"],
        sentient: ["var(--font-sentient)"],
      },
      backgroundColor: {
        r: "#FFCDD2",
      },
      colors: {
        coral: {
          500: "#FF7F5C", // Adjust this hex value to match your desired coral color
        },
      },
    },
  },
  plugins: [],
};
