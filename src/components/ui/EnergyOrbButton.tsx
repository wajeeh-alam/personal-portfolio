/**
 * The themed orb call-to-action used by the hero.
 *
 * One component covers both shapes the site needs, discriminated on props: an
 * `href` renders a real `<a>`, an `onClick` renders a real `<button>`. Neither
 * branch fakes the other with a `role`, so both are keyboard-reachable by default
 * and neither ever receives a negative `tabindex`.
 *
 * `FOCUS_RING` is exported rather than inlined so the site has one visible focus
 * indicator whose class string exists in exactly one place; `ProjectCard` and
 * `Footer` import it.
 *
 * Motion: `animate-orb-pulse` is a transform-only keyframe and the hover glow is
 * an `opacity` transition on the `.orb-glow::after` layer, never an animated
 * `box-shadow`, so both effects stay on the compositor. The stylesheet's
 * reduced-motion block zeroes the pulse and leaves the glow, so no JavaScript
 * branch is needed here.
 */

/**
 * The shared visible focus indicator. Imported by every other interactive
 * element so the rendered class string is byte-identical everywhere.
 */
export const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base';

/**
 * Orb chrome: pixel-art border, blue core, pixel label, and the two motion
 * hooks (`orb-glow` owns the hover glow layer, `animate-orb-pulse` the pulse).
 */
const ORB_BASE = [
  'orb-glow animate-orb-pulse',
  'inline-flex items-center justify-center gap-2',
  'rounded-full border-4 border-outline bg-blue',
  'px-6 py-3',
  'font-pixel text-[0.6875rem] uppercase leading-none tracking-wider sm:text-xs',
  'text-surface-base',
  'cursor-pointer select-none no-underline',
].join(' ');

interface EnergyOrbButtonBaseProps {
  /** Visible label, rendered in `font-pixel`. */
  readonly label: string;
  /** Extra layout classes; the orb chrome and focus ring are always applied. */
  readonly className?: string;
  /**
   * Overrides the accessible name when the visible label alone is not
   * destination-identifying.
   */
  readonly ariaLabel?: string;
}

interface EnergyOrbLinkProps extends EnergyOrbButtonBaseProps {
  /** Renders an `<a>` pointing here. */
  readonly href: string;
  /** Opens off-site destinations in a new tab with a safe `rel`. */
  readonly external?: boolean;
  readonly onClick?: never;
}

interface EnergyOrbActionProps extends EnergyOrbButtonBaseProps {
  /** Renders a `<button type="button">` invoking this. */
  readonly onClick: () => void;
  readonly href?: never;
  readonly external?: never;
}

export type EnergyOrbButtonProps = EnergyOrbLinkProps | EnergyOrbActionProps;

function classesFor(className: string | undefined): string {
  return [ORB_BASE, FOCUS_RING, className ?? ''].filter(Boolean).join(' ').trim();
}

export function EnergyOrbButton(props: EnergyOrbButtonProps): JSX.Element {
  const { label, className, ariaLabel } = props;
  const classes = classesFor(className);

  if (typeof props.href === 'string') {
    const { href, external } = props;

    return (
      <a
        href={href}
        className={classes}
        {...(ariaLabel === undefined ? {} : { 'aria-label': ariaLabel })}
        {...(external === true ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {label}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={props.onClick}
      className={classes}
      {...(ariaLabel === undefined ? {} : { 'aria-label': ariaLabel })}
    >
      {label}
    </button>
  );
}

export default EnergyOrbButton;
