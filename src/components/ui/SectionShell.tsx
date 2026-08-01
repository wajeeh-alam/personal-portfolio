/**
 * `SectionShell` is the single owner of the content-section contract. Every
 * non-hero section wraps its content here rather than re-declaring the surface,
 * rhythm, label, and reveal behavior six times over.
 *
 * The themed label is a `<p>` in `font-pixel`, not a heading, so gaming
 * vocabulary like "character select" never enters the document outline.
 * `data-testid="section-eyebrow"` marks it as the one paragraph on the site that
 * legitimately carries the pixel token, which is what lets the typography check
 * exempt it while holding every other paragraph to the body token.
 *
 * The reveal wrapper animates `whileInView` from
 * `resolveMotion('scrollReveal', reduce)`: opacity plus `y` normally, opacity
 * only under reduced motion. The initial state drops its `y` offset under
 * `reduce` too, otherwise the element would be left permanently translated once
 * the transform channel is suppressed.
 *
 * `tabIndex` is forwarded so `Projects` can pass `-1` and act as the programmatic
 * focus target for the hero's "View Projects" button without entering the tab
 * order; the caller pairs it with `focus:outline-none`, applied here by default.
 */
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

import { useReducedMotion } from '../../hooks/useReducedMotion';
import { resolveMotion } from '../../motion/variants';

export interface SectionShellProps {
  /** Section anchor id. The `h2` is given `${id}-heading`. */
  id: string;
  /** Themed pixel-font label rendered as a `<p>`, e.g. "character select". */
  eyebrow: string;
  /** Visible section heading, rendered as the section's only `h2`. */
  heading: string;
  /**
   * Forwarded to the `<section>`. Pass `-1` to make the section a programmatic
   * focus target without adding it to the tab order.
   */
  tabIndex?: number;
  /** Extra classes on the `<section>`; appended so callers can add spacing. */
  className?: string;
  /** Section body, revealed together with the label and heading. */
  children: ReactNode;
}

/** Vertical rhythm shared by every content section. Mobile-first. */
const RHYTHM = 'px-5 py-16 sm:px-8 md:py-24';

/**
 * Renders a content section: dark surface, pixel eyebrow, single `h2`, and the
 * scroll-reveal wrapper around the whole block.
 */
export const SectionShell = ({
  id,
  eyebrow,
  heading,
  tabIndex,
  className,
  children,
}: SectionShellProps): JSX.Element => {
  const reduce = useReducedMotion();
  const headingId = `${id}-heading`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      tabIndex={tabIndex}
      className={[
        'bg-surface-base text-ink-primary focus:outline-none',
        RHYTHM,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <motion.div
        className="mx-auto w-full max-w-5xl"
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
        whileInView={resolveMotion('scrollReveal', reduce)}
        viewport={{ once: true, amount: 0.2 }}
      >
        <p
          data-testid="section-eyebrow"
          className="font-pixel text-[0.625rem] uppercase tracking-widest text-magenta sm:text-xs"
        >
          {eyebrow}
        </p>
        <h2
          id={headingId}
          className="mt-3 font-display text-3xl tracking-wide text-gold sm:text-4xl md:text-5xl"
        >
          {heading}
        </h2>
        <div className="mt-8 font-body">{children}</div>
      </motion.div>
    </section>
  );
};
