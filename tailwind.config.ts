import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'game-red': '#dc2626',
        'game-yellow': '#fbbf24',
      },
    },
  },
  plugins: [],
} satisfies Config;