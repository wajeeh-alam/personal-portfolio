/**
 * `Skills` renders the three skill groups as rows of accented pills.
 *
 * It renders `skillGroups` from `src/data/skills.ts` as given: every group in
 * data order, every skill in group order, one `SkillPill` per skill string. No
 * filtering, no de-duplication, no group membership logic lives here, so the
 * rendered pill count is the skill count by construction and copy edits happen in
 * the data module alone.
 *
 * The accent travels from the group's `PaletteAccent` key into `SkillPill`, which
 * resolves it through the palette registry, so no color value appears here.
 * `SkillPill` renders an `<li>`, hence the `<ul>` per group. Group labels are
 * `h3` because `SectionShell` owns the section's only `h2`, which continues the
 * outline without skipping a level.
 */

import { skillGroups } from '../data/skills';
import { SectionShell } from './ui/SectionShell';
import { SkillPill } from './ui/SkillPill';

/** Renders the skills inventory: three labeled groups of skill pills. */
export function Skills(): JSX.Element {
  return (
    <SectionShell id="skills" eyebrow="inventory" heading="Skills">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {skillGroups.map((group) => (
          <div key={group.label}>
            <h3 className="font-display text-xl tracking-wide text-gold sm:text-2xl">
              {group.label}
            </h3>

            <ul className="mt-3 flex flex-wrap gap-2">
              {group.skills.map((skill) => (
                <SkillPill key={skill} skill={skill} accent={group.accent} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

export default Skills;
