/**
 * Tailwind configuration. Colors are imported from `src/theme/tokens.ts` rather
 * than re-declared here, so the utility classes and the palette-discipline test
 * read from the same registry and cannot drift.
 *
 * Keyframes declared here animate `transform` and `opacity` only, keeping every
 * continuous animation on the compositor. Breakpoints are left at the Tailwind
 * defaults: base styles target small screens and every widening rule is a
 * `sm` / `md` / `lg` modifier.
 */
import type { Config } from 'tailwindcss';
import { ink, palette, surfaces } from './src/theme/tokens';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /* Palette accents, flat so `ring-gold` and `text-magenta` work. */
        magenta: palette.magenta,
        blue: palette.blue,
        gold: palette.gold,
        grass: palette.grass,
        /* Keyed by the token name so a `PaletteAccent` value maps straight to a
           class, with the hyphenated alias for idiomatic Tailwind usage. */
        grassLight: palette.grassLight,
        'grass-light': palette.grassLight,
        outline: palette.outline,

        /* Content section surfaces: `bg-surface-panel`,
           `ring-offset-surface-base`. */
        surface: {
          base: surfaces.base,
          panel: surfaces.panel,
        },

        /* Body and metadata text: `text-ink-primary`, `text-ink-muted`. */
        ink: {
          primary: ink.primary,
          muted: ink.muted,
        },
      },
      fontFamily: {
        /* Hero name and section headings. */
        display: ['Bangers', 'system-ui', 'sans-serif'],
        /* Eyebrow labels, orb button labels, small UI chips only. */
        pixel: ['"Press Start 2P"', 'ui-monospace', 'monospace'],
        /* All prose. */
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        /* Sparkle drift: transform only, so it drops out entirely under
           reduced motion. */
        'sparkle-drift': {
          from: { transform: 'translate3d(0, 0, 0) scale(var(--sparkle-scale, 1))' },
          to: { transform: 'translate3d(-18px, 26px, 0) scale(var(--sparkle-scale, 1))' },
        },
        /* Sparkle twinkle: opacity only, so it survives reduced motion. */
        'sparkle-twinkle': {
          from: { opacity: '0.15' },
          to: { opacity: '1' },
        },
        /* Orb button pulse: transform only. */
        'orb-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
      animation: {
        'sparkle-drift':
          'sparkle-drift var(--sparkle-duration, 4200ms) linear var(--sparkle-delay, 0ms) infinite',
        'sparkle-twinkle':
          'sparkle-twinkle 1.9s ease-in-out var(--sparkle-delay, 0ms) infinite alternate',
        'orb-pulse': 'orb-pulse 2.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
