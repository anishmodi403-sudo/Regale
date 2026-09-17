/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        canvas: 'rgb(var(--bg-canvas) / <alpha-value>)',
        panel: 'rgb(var(--bg-panel) / <alpha-value>)',
        card: 'rgb(var(--surface-card) / <alpha-value>)',
        hairline: 'rgb(var(--border) / <alpha-value>)',

        primary: 'rgb(var(--primary) / <alpha-value>)',
        'primary-alt': 'rgb(var(--primary-alt) / <alpha-value>)',
        'primary-contrast': 'rgb(var(--primary-contrast) / <alpha-value>)',
        gold: 'rgb(var(--brand-gold) / <alpha-value>)',

        danger: 'rgb(var(--danger) / <alpha-value>)',
        warning: 'rgb(var(--warning) / <alpha-value>)',
        success: 'rgb(var(--success) / <alpha-value>)',
        info: 'rgb(var(--info) / <alpha-value>)',

        'text-primary': 'rgb(var(--text-primary) / <alpha-value>)',
        'text-secondary': 'rgb(var(--text-secondary) / <alpha-value>)',

        'danger-tint': 'rgb(var(--danger-tint) / <alpha-value>)',
        'warning-tint': 'rgb(var(--warning-tint) / <alpha-value>)',
        'success-tint': 'rgb(var(--success-tint) / <alpha-value>)',
        'info-tint': 'rgb(var(--info-tint) / <alpha-value>)',
        'primary-tint': 'rgb(var(--primary-tint) / <alpha-value>)',

        // Barely-there column-grouping backgrounds — deliberately separate
        // from the "-tint" pill/badge colors above (Iteration §5).
        'danger-wash': 'rgb(var(--danger-wash) / <alpha-value>)',
        'warning-wash': 'rgb(var(--warning-wash) / <alpha-value>)',
        'success-wash': 'rgb(var(--success-wash) / <alpha-value>)',
        'info-wash': 'rgb(var(--info-wash) / <alpha-value>)',
        'primary-wash': 'rgb(var(--primary-wash) / <alpha-value>)',
      },
      borderRadius: {
        card: 'var(--radius-card)',
        button: 'var(--radius-button)',
        pill: 'var(--radius-pill)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        hover: 'var(--shadow-hover)',
      },
      letterSpacing: {
        label: '0.06em',
      },
    },
  },
  plugins: [],
}
