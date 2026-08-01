/**
 * `Footer` renders every entry in `src/data/links.ts` as an activatable link.
 *
 * There is exactly one anchor implementation here, `FooterLink`, and every entry
 * flows through it. That single seam is deliberate: the new-tab contract, the
 * `rel` token pair, the accessible name, and the shared focus ring are each
 * written once, so a link cannot be added later that quietly misses one of them.
 *
 * What the shared element derives from data rather than deciding itself:
 * `entry.external` alone drives `target="_blank"` and `rel="noopener
 * noreferrer"`, so the two off-origin profiles open a new context while the
 * `mailto:` address and the same-origin `/resume.pdf` do not.
 * `entry.accessibleName` becomes the `aria-label`, naming the destination
 * instead of leaving generic text like "Resume" to stand alone out of context.
 * `entry.isPlaceholder` renders `entry.placeholderNote` as adjacent visible
 * text. And the `download` attribute is applied by rule — a same-origin PDF —
 * rather than by naming the resume entry, so the resume link is not a special
 * case.
 *
 * `FOCUS_RING` is imported from `EnergyOrbButton` rather than retyped so the
 * rendered focus indicator is identical on every link and button on the site.
 */
import { FOCUS_RING } from './ui/EnergyOrbButton';
import { SectionShell } from './ui/SectionShell';
import { links } from '../data/links';
import type { LinkEntry } from '../types';

/**
 * Link chrome. `font-pixel` is permitted here because these are short control
 * labels, never body copy; the underline keeps the link distinguishable without
 * relying on color alone.
 */
const LINK_CLASSES = [
  'inline-flex items-center rounded',
  'border-2 border-outline bg-surface-panel px-3 py-2',
  'font-pixel text-[0.5rem] uppercase leading-none tracking-wide sm:text-[0.625rem]',
  'text-blue underline decoration-2 underline-offset-4',
  FOCUS_RING,
].join(' ');

interface FooterLinkProps {
  readonly entry: LinkEntry;
}

/** The site's one footer anchor. Every footer link renders through here. */
const FooterLink = ({ entry }: FooterLinkProps): JSX.Element => {
  const { href, label, accessibleName, external } = entry;
  // Same-origin PDFs are downloads; external destinations are navigations.
  const isDownload = !external && href.toLowerCase().endsWith('.pdf');

  return (
    <a
      href={href}
      aria-label={accessibleName}
      className={LINK_CLASSES}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...(isDownload ? { download: '' } : {})}
    >
      {label}
    </a>
  );
};

export const Footer = (): JSX.Element => (
  <SectionShell id="contact" eyebrow="stage select" heading="Connect">
    <ul className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
      {links.map((entry) => (
        <li key={entry.id} className="flex flex-wrap items-center gap-2 font-body">
          <FooterLink entry={entry} />
          {entry.isPlaceholder === true && entry.placeholderNote !== undefined && (
            <span className="font-body text-xs text-ink-muted">{entry.placeholderNote}</span>
          )}
        </li>
      ))}
    </ul>
  </SectionShell>
);

export default Footer;
