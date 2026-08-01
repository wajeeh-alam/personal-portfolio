/**
 * `SkillPill` renders exactly one skill string as one pill element.
 *
 * One pill per call, deliberately: `Skills.tsx` maps a group's `skills` array
 * onto this component, so the rendered pill count is the skill count by
 * construction — no grouping, filtering, or de-duplication happens here.
 *
 * The accent arrives as a `PaletteAccent` key and resolves to a color through
 * `palette` in `src/theme/tokens.ts`; no hex literal appears in this file. The key
 * is mirrored onto `data-accent` so a test can assert which palette member a pill
 * claims without parsing styles.
 *
 * The label is a skill name, not chrome, so it renders in `font-body`. Accents
 * cover the border and the text, and every accent this component can receive
 * clears 4.5:1 on the panel background.
 *
 * Renders an `<li>`, so the caller must place pills inside a `<ul>`.
 */
import type { PaletteAccent } from '../../types';
import { palette } from '../../theme/tokens';

export interface SkillPillProps {
  /** The single skill name to display, rendered verbatim. */
  readonly skill: string;
  /** Palette key supplying the pill's accent. */
  readonly accent: PaletteAccent;
  /** Extra layout classes; the pill chrome is always applied. */
  readonly className?: string;
}

/**
 * Pill chrome. Mobile-first sizing, `font-body` text, and a pixel-flavored
 * border weight without a pixel font.
 */
const PILL_BASE = [
  'inline-flex items-center justify-center',
  'rounded-full border-2 bg-surface-panel',
  'px-3 py-1',
  'font-body text-xs leading-none sm:text-sm',
  'whitespace-nowrap',
].join(' ');

/** Renders one skill as one accented pill. */
export function SkillPill({ skill, accent, className }: SkillPillProps): JSX.Element {
  const accentColor = palette[accent];

  return (
    <li
      data-testid="skill-pill"
      data-accent={accent}
      style={{ borderColor: accentColor, color: accentColor }}
      className={[PILL_BASE, className ?? ''].filter(Boolean).join(' ').trim()}
    >
      {skill}
    </li>
  );
}

export default SkillPill;
