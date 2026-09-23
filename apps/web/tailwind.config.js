/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        border: 'var(--border)',
        accent: {
          DEFAULT: 'var(--accent)',
          hover: '#25584b',
          light: '#e8f2ef',
        },
        'accent-warm': {
          DEFAULT: 'var(--accent-warm)',
          hover: '#ae6d25',
          light: '#fbf4ea',
        },
        severity: {
          weak: '#B4523A',
          'weak-bg': '#fbf1ef',
          mid: '#C77E2C',
          'mid-bg': '#fbf4ea',
          strong: '#2F6D5D',
          'strong-bg': '#e8f2ef',
        },
      },
      fontFamily: {
        heading: ['var(--font-space-grotesk)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
        mono: ['monospace'],
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '16px',
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(27, 29, 28, 0.06)',
        panel: '0 8px 30px rgba(27, 29, 28, 0.08)',
      },
    },
  },
  plugins: [],
};
