/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./App.{js,ts,tsx}', './components/**/*.{js,ts,tsx}', './app/**/*.{js,ts,tsx}'],

    presets: [require('nativewind/preset')],
    theme: {
        extend: {
            colors: {
                white: "#FFFFFF",
                primary: "#404040",
                secondary: "#C0C0C0",
                gray: "#E0E0E0",
            },
        },
    },
    plugins: [],
};
