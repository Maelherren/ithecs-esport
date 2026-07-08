import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Palette ITHECS — thème sombre, dominante bleu foncé
        night: '#0a0f1e',
        abyss: '#0d1b3e',
        steel: '#1a2d5a',
        primary: '#2563eb',
        accent: '#3b82f6',
        gold: '#f5b301',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(59, 130, 246, 0.45)',
        'glow-lg': '0 0 40px rgba(59, 130, 246, 0.35)',
        'glow-gold': '0 0 20px rgba(245, 179, 1, 0.45)',
      },
      backgroundImage: {
        'grid-glow':
          'radial-gradient(circle at 50% 0%, rgba(37, 99, 235, 0.15), transparent 60%)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 12px rgba(59, 130, 246, 0.35)' },
          '50%': { boxShadow: '0 0 24px rgba(59, 130, 246, 0.7)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out both',
        'pulse-glow': 'pulse-glow 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
