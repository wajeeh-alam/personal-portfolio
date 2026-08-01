/**
 * `Awards` lists the competition results a recruiter uses to gauge performance
 * under constraints.
 *
 * The entries are not written here. `src/data/awards.ts` owns them and this
 * component renders every entry in that list — one `AwardBadge` per award, no
 * filtering and no slicing — so adding an award is a data change only.
 * `AwardBadge` prints `placement` verbatim as visible text; this component's job
 * is to make sure no entry is dropped on the way there.
 *
 * `SectionShell` supplies the dark surface, the readable body color, the section's
 * only `h2`, and the scroll reveal wrapper. Layout is mobile-first: one badge per
 * row at base width, two columns from `md` up.
 */
import { awards } from '../data/awards';
import { AwardBadge } from './ui/AwardBadge';
import { SectionShell } from './ui/SectionShell';

/** Renders the Awards section: one `AwardBadge` per committed award entry. */
export function Awards(): JSX.Element {
  return (
    <SectionShell id="awards" eyebrow="trophy room" heading="Awards">
      <ul className="grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-2">
        {awards.map((award) => (
          <li key={award.id} className="font-body">
            <AwardBadge award={award} className="h-full" />
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}

export default Awards;
