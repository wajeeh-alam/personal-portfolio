/**
 * PLACEHOLDER: the mascot art in this file is provisional.
 * ---------------------------------------------------------------------------
 * The character sprites are being designed by hand and will replace what is
 * here. The blocky figure below is a stand-in so the hero has correct geometry to
 * lay out against; it is not finished art.
 *
 * To swap in the real sprite, edit two constants and nothing else:
 *
 *   1. `SPRITE_ROWS` — the pixel grid, one string per pixel row. Every row MUST
 *      be the same length (that length becomes the sprite width, and the row
 *      count becomes the height). `.` — or any glyph missing from `PIXEL_FILL` —
 *      renders as transparent.
 *   2. `PIXEL_FILL` — the glyph → fill legend. Add a glyph per new color, keeping
 *      every value a `palette` token from `src/theme/tokens.ts` and the
 *      silhouette in `palette.outline`.
 *
 * Nothing below those two constants needs to change: the run-length renderer
 * derives the `viewBox` from the grid, the root `<svg>` stays
 * `aria-hidden="true"` / `focusable="false"` with no `<title>`/`<desc>` so the
 * decoration contributes no accessible name, and the markup stays inline with no
 * external image asset.
 * ---------------------------------------------------------------------------
 */
import { palette } from '../../theme/tokens';

/**
 * Glyph → fill legend. Exported so the swap point is discoverable from tests
 * and from the real sprite work. Any glyph absent from this map is transparent.
 */
export const PIXEL_FILL: Readonly<Record<string, string>> = {
  '#': palette.outline,
  b: palette.blue,
  g: palette.gold,
  m: palette.magenta,
};

/**
 * PLACEHOLDER grid: a deliberately crude blocky humanoid — square head, boxy
 * torso with a magenta band marking it as provisional, stub arms and two legs.
 * 16 columns wide, 20 rows tall. Replace wholesale with the real sprite.
 */
export const SPRITE_ROWS: readonly string[] = [
  '................',
  '.....######.....',
  '.....#gggg#.....',
  '.....#gggg#.....',
  '.....#gggg#.....',
  '.....######.....',
  '...##########...',
  '...#b#bbbb#b#...',
  '...#b#bbbb#b#...',
  '...#b#mmmm#b#...',
  '...#b#bbbb#b#...',
  '...##########...',
  '.....#bbbb#.....',
  '.....#bbbb#.....',
  '.....######.....',
  '.....#b##b#.....',
  '.....#b##b#.....',
  '.....#b##b#.....',
  '.....######.....',
  '................',
];

/**
 * True when every row of `rows` has the same length, which is what the
 * renderer assumes when it derives the `viewBox` width from the first row.
 * Pure, so the real-sprite work can assert on it directly.
 */
export const validateSpriteRows = (rows: readonly string[]): boolean =>
  rows.every((row) => row.length === (rows[0]?.length ?? 0));

if (import.meta.env.DEV && !validateSpriteRows(SPRITE_ROWS)) {
  throw new Error(
    'MascotSprite: every string in SPRITE_ROWS must have the same length.',
  );
}

const SPRITE_WIDTH = SPRITE_ROWS[0]?.length ?? 0;
const SPRITE_HEIGHT = SPRITE_ROWS.length;

/** A horizontal run of same-colored pixels, rendered as one `<rect>`. */
interface PixelRun {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly fill: string;
}

/**
 * Collapses each grid row into horizontal runs so the sprite renders as a few
 * dozen rects instead of one per pixel. Pure and evaluated once at module load.
 */
const toPixelRuns = (rows: readonly string[]): readonly PixelRun[] => {
  const runs: PixelRun[] = [];

  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const fill = PIXEL_FILL[row[x] ?? ''];
      if (fill === undefined) {
        x += 1;
        continue;
      }

      let width = 1;
      while (PIXEL_FILL[row[x + width] ?? ''] === fill) {
        width += 1;
      }

      runs.push({ x, y, width, fill });
      x += width;
    }
  });

  return runs;
};

const SPRITE_RUNS = toPixelRuns(SPRITE_ROWS);

export interface MascotSpriteProps {
  /** Sizing and positioning classes for the root `<svg>`. */
  className?: string;
}

/**
 * Renders the placeholder mascot as inline SVG.
 *
 * @param className - Classes applied to the root `<svg>`; the caller owns size
 *   and placement so the sprite can scale down on small screens.
 */
export const MascotSprite = ({ className }: MascotSpriteProps): JSX.Element => (
  <svg
    className={className}
    viewBox={`0 0 ${SPRITE_WIDTH} ${SPRITE_HEIGHT}`}
    shapeRendering="crispEdges"
    aria-hidden="true"
    focusable="false"
  >
    {SPRITE_RUNS.map((run) => (
      <rect
        key={`${run.x}-${run.y}-${run.width}`}
        x={run.x}
        y={run.y}
        width={run.width}
        height={1}
        fill={run.fill}
      />
    ))}
  </svg>
);
