/**
 * One role in the experience timeline, drawn as a level-progression step.
 *
 *   - Title, organization, and date range are all visible text, never
 *     attribute-only metadata.
 *   - Exactly one marker element per step, tagged `data-testid="timeline-marker"`,
 *     whose accent resolves from `entry.markerColor` through `palette` in
 *     `src/theme/tokens.ts` rather than being written as a hex literal, leaving
 *     this file with no palette value of its own. The connecting rail belongs to
 *     `Experience.tsx`, which owns the timeline layout; a step draws one marker
 *     and nothing else decorative.
 *   - Highlights render as a real `<ul>`/`<li>` list in `font-body`, and no text
 *     here uses `font-pixel`, which stays on eyebrow, section, and control labels.
 *   - The heading is an `h3`: the hero owns the lone `h1` and `SectionShell` owns
 *     each section's `h2`, so `h3` continues the outline without skipping a level.
 *   - Colors come from the readable set: the `surfaces.panel` card, body copy in
 *     `text-ink-primary`, metadata in `text-ink-muted`, heading in `text-gold`.
 *     Magenta is never used as text here — it clears 4.5:1 on `base` but not on
 *     `panel`.
 *
 * The root is an `<article>`, not an `<li>`, so `Experience.tsx` can place steps
 * in any container without producing a list item outside a list.
 */

import type { ExperienceEntry } from '../../types';
import { palette } from '../../theme/tokens';

export interface TimelineStepProps {
  /** The role to render. Every visible string comes from this entry. */
  readonly entry: ExperienceEntry;
  /** Extra layout classes; the step chrome is always applied. */
  readonly className?: string;
}

/** Card chrome shared by every step. Mobile-first. */
const STEP_SURFACE = [
  'rounded-lg border-2 border-outline bg-surface-panel',
  'px-4 py-5 sm:px-6 sm:py-6',
].join(' ');

export function TimelineStep({ entry, className }: TimelineStepProps): JSX.Element {
  // `PaletteAccent` is a subset of the palette keys, so this lookup is total
  // and the accent can only ever be a palette member.
  const accent = palette[entry.markerColor];

  return (
    <article
      className={['relative font-body text-ink-primary', STEP_SURFACE, className ?? '']
        .filter(Boolean)
        .join(' ')
        .trim()}
    >
      {/* The step's single marker: decorative, so it carries no accessible name
          and is hidden from assistive technology. The visible role text below is
          what conveys the progression. */}
      <span
        data-testid="timeline-marker"
        data-accent={entry.markerColor}
        aria-hidden="true"
        style={{ backgroundColor: accent }}
        className="absolute -left-1 top-6 block h-3 w-3 border-2 border-outline sm:-left-2 sm:h-4 sm:w-4"
      />

      <h3 className="font-display text-xl tracking-wide text-gold sm:text-2xl">
        {entry.title}
      </h3>

      <p className="mt-1 text-sm font-semibold text-ink-primary sm:text-base">
        {entry.organization}
      </p>

      <p className="mt-1 text-xs text-ink-muted sm:text-sm">{entry.dateRange}</p>

      <ul className="mt-4 list-disc space-y-2 pl-5 font-body text-sm leading-relaxed text-ink-primary sm:text-base">
        {entry.highlights.map((highlight) => (
          <li key={highlight}>{highlight}</li>
        ))}
      </ul>
    </article>
  );
}

export default TimelineStep;
