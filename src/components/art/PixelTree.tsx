/**
 * Pixel tree decoration: an original inline-SVG tree built from square cells.
 * Decoration only, so the root is `aria-hidden` with `focusable="false"`, carries
 * no `<title>`/`<desc>`, and contributes no accessible name. No external image
 * asset is imported.
 *
 * The canopy uses `grass` and `grassLight`, the silhouette and trunk use the black
 * `outline` token, and no other color value appears in this file.
 */

import { palette } from '../../theme/tokens';

export interface PixelTreeProps {
  /** Rendered width in pixels; height follows the 16×24 cell grid (1.5×). */
  readonly size?: number;
  /** Forwarded to the SVG root so the hero can position each instance. */
  readonly className?: string;
}

/** Grid dimensions of the sprite, in cells. */
const GRID_WIDTH = 16;
const GRID_HEIGHT = 24;

/** Default rendered width, matching the small decorative trees in the hero. */
const DEFAULT_SIZE = 48;

interface Cell {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/** Canopy blocks, widest through the middle rows. */
const CANOPY: readonly Cell[] = [
  { x: 5, y: 2, width: 6, height: 2 },
  { x: 3, y: 4, width: 10, height: 2 },
  { x: 2, y: 6, width: 12, height: 4 },
  { x: 3, y: 10, width: 10, height: 2 },
  { x: 5, y: 12, width: 6, height: 2 },
] as const;

/** Trunk and root flare. */
const TRUNK: readonly Cell[] = [
  { x: 7, y: 14, width: 2, height: 6 },
  { x: 5, y: 20, width: 6, height: 2 },
] as const;

/** Lit cells on the upper-left of the canopy. */
const HIGHLIGHTS: readonly Cell[] = [
  { x: 6, y: 4, width: 2, height: 2 },
  { x: 4, y: 6, width: 2, height: 2 },
  { x: 3, y: 8, width: 2, height: 2 },
] as const;

/** Grows a cell by one unit on every side to build the black silhouette. */
function outlineOf(cell: Cell): Cell {
  return {
    x: cell.x - 1,
    y: cell.y - 1,
    width: cell.width + 2,
    height: cell.height + 2,
  };
}

function cellKey(prefix: string, cell: Cell): string {
  return `${prefix}-${cell.x}-${cell.y}-${cell.width}-${cell.height}`;
}

export function PixelTree({
  size = DEFAULT_SIZE,
  className,
}: PixelTreeProps): JSX.Element {
  const height = (size * GRID_HEIGHT) / GRID_WIDTH;

  return (
    <svg
      className={className}
      width={size}
      height={height}
      viewBox={`0 0 ${GRID_WIDTH} ${GRID_HEIGHT}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      shapeRendering="crispEdges"
    >
      {/* Silhouette first: overlapping black cells, so no internal seams show
          the way per-shape strokes would. */}
      {[...CANOPY, ...TRUNK].map((cell) => {
        const grown = outlineOf(cell);
        return (
          <rect
            key={cellKey('outline', cell)}
            x={grown.x}
            y={grown.y}
            width={grown.width}
            height={grown.height}
            fill={palette.outline}
          />
        );
      })}

      {CANOPY.map((cell) => (
        <rect
          key={cellKey('canopy', cell)}
          x={cell.x}
          y={cell.y}
          width={cell.width}
          height={cell.height}
          fill={palette.grass}
        />
      ))}

      {HIGHLIGHTS.map((cell) => (
        <rect
          key={cellKey('highlight', cell)}
          x={cell.x}
          y={cell.y}
          width={cell.width}
          height={cell.height}
          fill={palette.grassLight}
        />
      ))}

      {TRUNK.map((cell) => (
        <rect
          key={cellKey('trunk', cell)}
          x={cell.x}
          y={cell.y}
          width={cell.width}
          height={cell.height}
          fill={palette.outline}
        />
      ))}
    </svg>
  );
}

export default PixelTree;
