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
      animation: {
        blob: "blob 7s infinite",
        "delay-2000": "delay-2000",
        "delay-3000": "delay-3000",
        "delay-4000": "delay-4000",
        "delay-5000": "delay-5000",
        "delay-6000": "delay-6000",
      },
      keyframes: {
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
        float: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100vw)' }
        }
      },
    },
  },
  plugins: [],
};
