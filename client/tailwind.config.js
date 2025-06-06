/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors'
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: colors.blue,
        darkPrimary: colors.neutral,
      },
    },
  },
  plugins: [],
}
//背景 50
//focus ring 400
//按鈕600 :hover 700
//取消紐gray-300 :hover400
//文字900
