/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                'accent-pink': '#E83D8E',
                'dark-grey': '#333333',
                'background-light': '#ffffff',
                'background-dark': '#121212',
                'text-light': '#333333',
                'text-dark': '#ffffff',
            },
            fontFamily: {
                sans: ['"Montserrat"', 'sans-serif'],
                japanese: ['"Noto Sans JP"', '"Montserrat"', 'sans-serif'],
            },
            borderRadius: {
                DEFAULT: '8px',
            },
            animation: {
                'fade-in-out': 'fadeInOut 12s infinite',
                'slide1': 'slide1 15s infinite',
                'slide2': 'slide2 15s infinite',
                'slide3': 'slide3 15s infinite',
                'indicator1': 'indicator1 15s infinite',
                'indicator2': 'indicator2 15s infinite',
                'indicator3': 'indicator3 15s infinite',
            },
            keyframes: {
                fadeInOut: {
                    '0%, 25%': { opacity: '1' },
                    '33.33%, 100%': { opacity: '0' },
                },
                slide1: {
                    '0%': { opacity: '0' },
                    '5%': { opacity: '1' },
                    '33%': { opacity: '1' },
                    '38%': { opacity: '0' },
                    '100%': { opacity: '0' },
                },
                slide2: {
                    '0%': { opacity: '0' },
                    '33%': { opacity: '0' },
                    '38%': { opacity: '1' },
                    '66%': { opacity: '1' },
                    '71%': { opacity: '0' },
                    '100%': { opacity: '0' },
                },
                slide3: {
                    '0%': { opacity: '0' },
                    '66%': { opacity: '0' },
                    '71%': { opacity: '1' },
                    '95%': { opacity: '1' },
                    '100%': { opacity: '0' },
                },
                indicator1: {
                    '0%, 33%': { backgroundColor: 'white', transform: 'scale(1.2)' },
                    '34%, 100%': { backgroundColor: 'rgba(255,255,255,0.5)', transform: 'scale(1)' },
                },
                indicator2: {
                    '0%, 33%': { backgroundColor: 'rgba(255,255,255,0.5)', transform: 'scale(1)' },
                    '34%, 66%': { backgroundColor: 'white', transform: 'scale(1.2)' },
                    '67%, 100%': { backgroundColor: 'rgba(255,255,255,0.5)', transform: 'scale(1)' },
                },
                indicator3: {
                    '0%, 66%': { backgroundColor: 'rgba(255,255,255,0.5)', transform: 'scale(1)' },
                    '67%, 100%': { backgroundColor: 'white', transform: 'scale(1.2)' },
                },
            }
        },
    },
    plugins: [],
}
