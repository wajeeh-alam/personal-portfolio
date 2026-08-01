/**
 * `Experience` draws the three professional roles as a level-progression
 * sequence.
 *
 * It renders the `experience` export from `src/data/experience.ts`, already
 * ordered by `byRecency` there. No copy and no sort key lives here, so content
 * edits happen in the data module alone.
 *
 * The one thing this file owns visually is the timeline rail: a single vertical
 * connector behind the steps, in the `grass` accent the contrast plan reserves
 * for exactly this use. It is a 2px stroke rather than a section background, so
 * the platform green stays confined to `Hero.tsx` and `SectionDivider.tsx` as a
 * surface. Each `TimelineStep` draws its own marker and nothing else decorative,
 * which is why the rail lives here instead of being repeated per step.
 *
 * The steps sit in an `<ol>` because their order carries meaning: most recent
 * first. `TimelineStep` renders an `<article>`, so each step is wrapped in an
 * `<li>` here instead of the step emitting a list item of its own.
 */

import { experience } from '../data/experience';
import { SectionShell } from './ui/SectionShell';
import { TimelineStep } from './ui/TimelineStep';

/**
 * Horizontal offset shared by the rail and the step column. One constant for
 * both is what keeps the rail under the step markers when the gutter widens at
 * `md`: a step's marker is centered on its card's left edge, so the rail sits at
 * the same x as the column padding.
 */
const RAIL_POSITION = 'left-5 md:left-12';
const STEP_INDENT = 'pl-5 md:pl-12';

/** Renders the experience timeline as a rail of level-progression steps. */
export function Experience(): JSX.Element {
  return (
    <SectionShell id="experience" eyebrow="level progression" heading="Experience">
      <div className="relative">
        {/* Decorative connector: it conveys nothing beyond the layout, so it is
            hidden from assistive technology. */}
        <span
          aria-hidden="true"
          data-testid="timeline-rail"
          className={`absolute bottom-2 top-2 w-0.5 bg-grass ${RAIL_POSITION}`}
        />

        <ol className={`relative space-y-8 ${STEP_INDENT}`}>
          {experience.map((entry) => (
            <li key={entry.id}>
              <TimelineStep entry={entry} />
            </li>
          ))}
        </ol>
      </div>
    </SectionShell>
  );
}

export default Experience;
