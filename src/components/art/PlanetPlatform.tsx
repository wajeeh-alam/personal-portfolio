/**
 * An original inline-SVG floating green disc with a winding road, drawn from
 * scratch as blocky pixel cells. No external image asset, no `<title>`/`<desc>`,
 * and no accessible name — the platform is pure decoration, so the root is
 * `aria-hidden` and `focusable="false"`.
 *
 * Every `fill` and `stroke` below is a `palette` member read from
 * `src/theme/tokens.ts`. The road's gray reads as gray because the black outline
 * token is painted at partial `fill-opacity` over the grass, so the color set
 * stays palette-only and no new hex value appears in this file.
 */

import { palette } from '../../theme/tokens';

export interface PlanetPlatformProps {
  /** Forwarded to the SVG root so the hero can size and animate the platform. */
  readonly className?: string;
}

/** Pixel grid: the 160×160 viewBox is 20 cells of 8 units on each axis. */
const CELL = 8;

/**
 * Winding road, one entry per grid row as `[row, firstColumn, lastColumn]`.
 * The columns drift right, tuck back left near the middle, then drift right
 * again, which is what makes the road read as winding rather than as a
 * diagonal stripe. Rows are ordered bottom-to-top.
 */
const ROAD_ROWS: readonly (readonly [row: number, from: number, to: number])[] = [
  [16, 2, 5],
  [15, 3, 6],
  [14, 4, 7],
  [13, 5, 8],
  [12, 5, 8],
  [11, 6, 9],
  [10, 7, 10],
  [9, 8, 11],
  [8, 8, 11],
  [7, 7, 10],
  [6, 7, 10],
  [5, 8, 11],
  [4, 9, 12],
] as const;

/** Center-line dashes, one per entry as `[row, column]`. */
const ROAD_MARKINGS: readonly (readonly [row: number, column: number])[] = [
  [15, 4],
  [13, 6],
  [11, 7],
  [9, 9],
  [7, 8],
  [5, 9],
] as const;

/** Grass highlight cells on the lit upper-left of the disc. */
const HIGHLIGHT_CELLS: readonly (readonly [column: number, row: number, width: number])[] = [
  [4, 3, 5],
  [3, 4, 4],
  [2, 5, 3],
  [13, 6, 3],
  [14, 7, 2],
] as const;

export function PlanetPlatform({ className }: PlanetPlatformProps): JSX.Element {
  return (
    <svg
      className={className}
      viewBox="0 0 160 160"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      shapeRendering="crispEdges"
    >
      <defs>
        {/* Everything painted on the disc is clipped to it, so the pixel rows
            can overhang without spilling past the platform edge. */}
        <clipPath id="planet-platform-disc">
          <circle cx="80" cy="80" r="70" />
        </clipPath>
      </defs>

      <g clipPath="url(#planet-platform-disc)">
        <circle cx="80" cy="80" r="70" fill={palette.grass} />

        {HIGHLIGHT_CELLS.map(([column, row, width]) => (
          <rect
            key={`highlight-${column}-${row}`}
            x={column * CELL}
            y={row * CELL}
            width={width * CELL}
            height={CELL}
            fill={palette.grassLight}
          />
        ))}

        {ROAD_ROWS.map(([row, from, to]) => (
          <rect
            key={`road-${row}`}
            x={from * CELL}
            y={row * CELL}
            width={(to - from + 1) * CELL}
            height={CELL}
            fill={palette.outline}
            fillOpacity={0.42}
          />
        ))}

        {ROAD_MARKINGS.map(([row, column]) => (
          <rect
            key={`marking-${row}-${column}`}
            x={column * CELL}
            y={row * CELL + CELL / 4}
            width={CELL}
            height={CELL / 2}
            fill={palette.gold}
          />
        ))}

        {/* Shaded underside: the same outline token at a heavier opacity, which
            grounds the disc without adding a color. */}
        <rect
          x="0"
          y="136"
          width="160"
          height="24"
          fill={palette.outline}
          fillOpacity={0.25}
        />
      </g>

      {/* Outline drawn last so it stays crisp over the clipped pixel rows. */}
      <circle
        cx="80"
        cy="80"
        r="70"
        fill="none"
        stroke={palette.outline}
        strokeWidth="6"
      />
    </svg>
  );
}

export default PlanetPlatform;
