/**
 * Central registry for every Framer-driven animation on the site.
 *
 * Keeping the variants as data in one module makes the transform-suppression rule
 * checkable instead of inferred from scattered JSX: each entry carries the target
 * used normally (`full`) alongside the target used under reduced motion
 * (`reduced`). Every `reduced` target is free of transform-family keys while
 * preserving the opacity channel wherever `full` animates opacity, and only
 * transform-family and `opacity` channels appear in either mode, so all continuous
 * motion stays on the compositor.
 *
 * At runtime `<MotionConfig reducedMotion="user">` at the App root already strips
 * transform channels when the visitor prefers reduced motion, so this registry is
 * the declarative source of truth rather than an extra guard; `resolveMotion`
 * exists for the spots where an explicit target is clearer.
 */
import type { TargetAndTransition } from 'framer-motion';

/** Identifier for each Framer-driven animation in the registry. */
export type MotionId = 'planetFloat' | 'scrollReveal' | 'portalGlow';

interface MotionEntry {
  /** Full motion. */
  full: TargetAndTransition;
  /** Reduced motion: opacity channel only. */
  reduced: TargetAndTransition;
}

/**
 * Transform-family animation keys. A `reduced` target must contain none of these;
 * the motion registry tests assert that over the whole registry.
 */
export const TRANSFORM_KEYS = [
  'x',
  'y',
  'z',
  'scale',
  'scaleX',
  'scaleY',
  'rotate',
  'skew',
] as const;

export const motionRegistry: Record<MotionId, MotionEntry> = {
  // Planet platform float: pure transform, so `reduce` leaves nothing to animate.
  planetFloat: {
    full: {
      y: [0, -12, 0],
      transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
    },
    reduced: {},
  },
  // Scroll reveal: opacity-only transition under `reduce`.
  scrollReveal: {
    full: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    reduced: { opacity: 1, transition: { duration: 0.35 } },
  },
  // Portal orb glow: keeps its opacity pulse under `reduce`, drops the scale.
  portalGlow: {
    full: {
      opacity: [0.7, 1, 0.7],
      scale: [1, 1.06, 1],
      transition: { duration: 3.2, repeat: Infinity },
    },
    reduced: {
      opacity: [0.7, 1, 0.7],
      transition: { duration: 3.2, repeat: Infinity },
    },
  },
};

/**
 * Picks the animation target for a registry entry under the current motion
 * preference.
 *
 * @param id - Registry entry to resolve.
 * @param reduce - `true` while the visitor prefers reduced motion.
 * @returns The `reduced` target when `reduce` is set, otherwise the `full` target.
 */
export const resolveMotion = (id: MotionId, reduce: boolean): TargetAndTransition =>
  reduce ? motionRegistry[id].reduced : motionRegistry[id].full;
