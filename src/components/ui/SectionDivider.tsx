/**
 * The pixel stroke that separates two content sections.
 *
 * The magenta sky and green platform hues are scoped to the hero and to divider
 * accents. This file is the second half of that allowance and the only non-hero
 * component that reads those tokens, so the scoping stays structural: any other
 * component importing `palette.grass`, `palette.grassLight`, or the `skyGradient`
 * stops shows up in an import list rather than as a judgement call. Every color
 * comes from `src/theme/tokens.ts`; no hex literal appears here.
 *
 * The divider is pure decoration: `aria-hidden="true"` on the wrapper,
 * `focusable="false"` on the SVG, no `<title>`, no `<desc>`, no accessible name.
 * It contributes no text and no landmark.
 *
 * The gradient id is derived from `useId` so several dividers can sit on one page
 * without two `<defs>` colliding on the same fragment id.
 */

import { useId } from 'react';

import { palette, skyGradient } from '../../theme/tokens';

export interface SectionDividerProps {
  /** Extra layout classes; the divider chrome is always applied. */
  readonly className?: string;
}

/** Pixel grid: a 160×8 viewBox stretched across the full width. */
const BLOCK = 8;

/**
 * Pixel blocks riding the stroke, as `[column, accent]`. Alternating magenta and
 * the two greens is what makes the divider read as a continuation of the hero
 * art instead of a plain rule.
 */
const BLOCKS: readonly (readonly [column: number, accent: string])[] = [
  [2, palette.magenta],
  [5, palette.grassLight],
  [8, palette.grass],
  [11, palette.magenta],
  [14, palette.grassLight],
  [17, palette.grass],
] as const;

export function SectionDivider({ className }: SectionDividerProps): JSX.Element {
  const gradientId = `section-divider-${useId().replace(/:/g, '')}`;

  return (
    <div
      aria-hidden="true"
      className={['bg-surface-base', className ?? ''].filter(Boolean).join(' ').trim()}
    >
      <svg
        viewBox="0 0 160 8"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
        shapeRendering="crispEdges"
        className="block h-2 w-full sm:h-3"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={skyGradient.middle} />
            <stop offset="0.5" stopColor={palette.grassLight} />
            <stop offset="1" stopColor={palette.grass} />
          </linearGradient>
        </defs>

        {/* The stroke itself: magenta into the platform greens. */}
        <rect x="0" y="3" width="160" height="2" fill={`url(#${gradientId})`} />

        {BLOCKS.map(([column, accent]) => (
          <rect
            key={`block-${column}`}
            x={column * BLOCK}
            y="1"
            width={BLOCK / 2}
            height={BLOCK / 2 + 2}
            fill={accent}
          />
        ))}
      </svg>
    </div>
  );
}

export default SectionDivider;
