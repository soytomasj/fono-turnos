/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        linen: '#F3EDDF',
        paper: '#FFFDF6',
        ink: '#262724',
        muted: '#8C8674',
        line: '#E6DECB',
        teal: {
          DEFAULT: '#2D6360',
          deep: '#1F4A47',
          tint: '#E2EDE9',
          faint: '#F0F5F1',
        },
        clay: {
          DEFAULT: '#BF5B36',
          deep: '#9C4526',
          tint: '#F8E5DA',
        },
        ocre: {
          DEFAULT: '#A9761B',
          deep: '#7D5712',
          tint: '#F5E9CD',
        },
      },
      fontFamily: {
        display: ['"Young Serif"', 'Georgia', 'serif'],
        sans: ['Karla', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(38, 39, 36, 0.05)',
        card: '0 1px 3px rgba(38, 39, 36, 0.05), 0 10px 28px -16px rgba(38, 39, 36, 0.12)',
        lift: '0 6px 24px -8px rgba(38, 39, 36, 0.18)',
        modal: '0 24px 64px -16px rgba(38, 39, 36, 0.32)',
      },
      keyframes: {
        rise: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'none' },
        },
        sheet: {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        fade: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        pop: {
          from: { opacity: '0', transform: 'scale(0.96) translateY(8px)' },
          to: { opacity: '1', transform: 'none' },
        },
      },
      animation: {
        rise: 'rise 0.4s cubic-bezier(0.22, 1, 0.36, 1) both',
        sheet: 'sheet 0.35s cubic-bezier(0.22, 1, 0.36, 1) both',
        fade: 'fade 0.25s ease both',
        pop: 'pop 0.3s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
}
