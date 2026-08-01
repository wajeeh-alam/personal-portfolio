/**
 * The hero's sparkle layer: a field of original pixel sparkles built from
 * composited `<span>` elements.
 *
 * Every bit of motion lives in the stylesheet. `.sparkle` in `src/index.css`
 * declares the `sparkle-drift` and `sparkle-twinkle` keyframes, and the
 * `@media (prefers-reduced-motion: reduce)` block there drops the drift while
 * keeping the opacity twinkle. This module therefore registers no
 * `requestAnimationFrame` loop and no scroll listener at all; the only
 * subscription in play is the `matchMedia` listener inside `useSmallScreen`.
 *
 * Per-particle layout is passed to CSS as custom properties rather than concrete
 * `animation`/`transform` declarations, so the component never has to know which
 * keyframes are active — the stylesheet reads `--sparkle-*` from whichever
 * animation the current motion preference selected.
 *
 * Layout comes from `mulberry32` seeded with the fixed `SPARKLE_SEED`, so the
 * field is identical on every mount, reload, and test run.
 *
 * The layer is decorative: the root and its spans are `aria-hidden`, hold no
 * text, and contribute no accessible name. Fills come from the `--gold` custom
 * property in the stylesheet, so no color is introduced here.
 */
import type { CSSProperties } from 'react';

import { useSmallScreen } from '../../hooks/useSmallScreen';
import { mulberry32 } from '../../lib/seededRandom';

/** Particle count at or above the 768px small-screen boundary. */
export const SPARKLE_COUNT_LARGE = 20;

/** Reduced particle count below the small-screen boundary. */
export const SPARKLE_COUNT_SMALL = 8;

/** Fixed PRNG seed; changing it reshuffles the field for every visitor. */
export const SPARKLE_SEED = 0x5eed;

/** One sparkle's resolved layout, in the units the stylesheet expects. */
export interface Sparkle {
  /** Stable index within the field; used as the React key. */
  id: number;
  /** Horizontal offset as a percentage of the layer width. */
  leftPct: number;
  /** Vertical offset as a percentage of the layer height. */
  topPct: number;
  /** Animation delay in milliseconds, so particles fall out of phase. */
  delayMs: number;
  /** Drift cycle length in milliseconds. */
  durationMs: number;
  /** Multiplier applied inside the drift keyframe's `scale()`. */
  scale: number;
}

/**
 * Resolves the particle count for the current viewport class.
 *
 * @param isSmallScreen - `true` below 768 CSS pixels, per `useSmallScreen`.
 * @returns The number of sparkles to render; strictly smaller on small screens.
 */
export function sparkleCountFor(isSmallScreen: boolean): number {
  return isSmallScreen ? SPARKLE_COUNT_SMALL : SPARKLE_COUNT_LARGE;
}

/**
 * Builds `count` sparkles from the fixed seed.
 *
 * Pure and deterministic: the same `count` always yields the same array, and
 * the generator is created fresh per call so no state leaks between calls. The
 * vertical spread stops at 62% because the lower band of the hero is occupied by
 * the planet platform, where drifting particles would read as noise.
 *
 * @param count - Number of sparkles to generate; `0` yields an empty array.
 * @returns The sparkle layout, ordered by `id`.
 */
export function buildSparkles(count: number): Sparkle[] {
  const rand = mulberry32(SPARKLE_SEED);
  return Array.from({ length: count }, (_unused, index) => ({
    id: index,
    leftPct: rand() * 100,
    topPct: rand() * 62,
    delayMs: Math.round(rand() * 4000),
    durationMs: 3200 + Math.round(rand() * 2800),
    scale: 0.6 + rand() * 0.9,
  }));
}

/**
 * Projects one sparkle onto the `--sparkle-*` custom properties consumed by
 * `.sparkle`. The cast is required because `CSSProperties` has no index
 * signature for custom properties.
 */
export function sparkleStyle(sparkle: Sparkle): CSSProperties {
  return {
    '--sparkle-x': `${sparkle.leftPct}%`,
    '--sparkle-y': `${sparkle.topPct}%`,
    '--sparkle-delay': `${sparkle.delayMs}ms`,
    '--sparkle-duration': `${sparkle.durationMs}ms`,
    '--sparkle-scale': `${sparkle.scale}`,
  } as CSSProperties;
}

export interface SparkleLayerProps {
  /** Extra positioning classes for the root; `.sparkle-layer` already insets it. */
  className?: string;
}

/**
 * Renders the sparkle field.
 *
 * The array is derived during render rather than memoized: it is a handful of
 * arithmetic operations, and deriving it keeps the output a pure function of
 * the viewport class, so crossing the 768px boundary mid-session re-resolves the
 * density on the next render.
 *
 * @param className - Appended to `.sparkle-layer` on the root `<div>`.
 */
export const SparkleLayer = ({ className }: SparkleLayerProps): JSX.Element => {
  const sparkles = buildSparkles(sparkleCountFor(useSmallScreen()));

  return (
    <div
      className={className ? `sparkle-layer ${className}` : 'sparkle-layer'}
      aria-hidden="true"
    >
      {sparkles.map((sparkle) => (
        <span key={sparkle.id} className="sparkle" style={sparkleStyle(sparkle)} />
      ))}
    </div>
  );
};
