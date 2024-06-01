/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx}', // Include all JavaScript and TypeScript files in the src directory
    './public/index.html', // Include the main HTML file
    './components/**/*.{js,ts,jsx,tsx}', // Include all files in a components directory, if you have one
    './pages/**/*.{js,ts,jsx,tsx}' // Include files in a pages directory, if you have one
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}