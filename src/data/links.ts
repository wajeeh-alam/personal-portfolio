/**
 * The footer link table.
 *
 * `external` is the single source of truth for `target="_blank"` and
 * `rel="noopener noreferrer"`: the two off-origin profiles are external, while
 * the `mailto:` address and the same-origin `/resume.pdf` are not, so neither
 * opens a new browsing context.
 *
 * `accessibleName` names the destination rather than repeating generic link text,
 * so each link is distinguishable out of context.
 */

import type { LinkEntry } from '../types';

/**
 * The email address is a placeholder awaiting the real value; `isPlaceholder`
 * plus `placeholderNote` let the footer render a visible marker beside it.
 * Replacing the address means clearing both fields.
 */
export const PLACEHOLDER_EMAIL = 'w5alam@uwaterloo.ca';

export const links: readonly LinkEntry[] = [
  {
    id: 'github',
    label: 'GitHub',
    accessibleName: 'GitHub profile for Wajeeh Alam (opens in a new tab)',
    href: 'https://github.com/Mr-W-Squidward',
    external: true,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    accessibleName: 'LinkedIn profile for Wajeeh Alam (opens in a new tab)',
    href: 'https://www.linkedin.com/in/wajeeh-alam-9442b82bb/',
    external: true,
  },
  {
    id: 'email',
    label: 'Email',
    accessibleName: `Email Wajeeh Alam at the placeholder address ${'w5alam@uwaterloo.ca'}`,
    href: `mailto:${'w5alam@uwaterloo.ca'}`,
    external: false,
  },
  {
    id: 'resume',
    label: 'Resume',
    accessibleName: 'Download the resume of Wajeeh Alam as a PDF',
    href: '/resume.pdf',
    external: false,
  },
] as const;
