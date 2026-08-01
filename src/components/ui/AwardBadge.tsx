/**
 * `AwardBadge` renders one `Award` from `src/data/awards.ts`.
 *
 * The `placement` string is printed exactly as authored — it is display copy,
 * not a computed rank, so this component never reformats, recomputes, or splits
 * it. `data-testid="award-placement"` is a stable hook onto that visible text
 * node for the tests.
 *
 * The award name is an `h3`: `SectionShell` owns the section's only `h2`, so
 * nesting one level below keeps the outline a single descending sequence under
 * the hero's lone `h1`. The name uses `font-display` and everything else
 * `font-body`; `font-pixel` is reserved for eyebrow and control labels. Accents
 * come from the palette tokens (`text-gold`, `text-blue`), each of which clears
 * 4.5:1 on the panel surface.
 */
import type { Award } from '../../types';

export interface AwardBadgeProps {
  /** The award to render. */
  readonly award: Award;
  /** Extra layout classes; the badge chrome is always applied. */
  readonly className?: string;
}

/** Badge chrome: pixel-art border on the readable panel surface, mobile-first. */
const BADGE_BASE = [
  'flex flex-col gap-2',
  'rounded-lg border-2 border-outline bg-surface-panel',
  'p-4 sm:p-5',
].join(' ');

/** Renders one award: name, verbatim placement, description, and technologies. */
export function AwardBadge({ award, className }: AwardBadgeProps): JSX.Element {
  const { name, placement, description, technologies } = award;

  return (
    <article
      data-testid="award-badge"
      className={[BADGE_BASE, className ?? ''].filter(Boolean).join(' ').trim()}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-xl tracking-wide text-gold sm:text-2xl">{name}</h3>
        <span
          data-testid="award-placement"
          className="font-body text-sm font-semibold text-gold sm:text-base"
        >
          {placement}
        </span>
      </div>

      <p className="font-body text-sm leading-relaxed text-ink-primary sm:text-base">
        {description}
      </p>

      {technologies.length > 0 ? (
        <div className="mt-1 flex flex-wrap gap-2">
          {technologies.map((technology) => (
            <span
              key={technology}
              data-testid="award-technology"
              className="rounded border border-blue px-2 py-0.5 font-body text-xs leading-none text-blue"
            >
              {technology}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}

export default AwardBadge;
