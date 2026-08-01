/**
 * Original glowing blue portal orb motif for the hero.
 *
 * The glow is the only animated part. Its target comes from the motion registry
 * via `resolveMotion('portalGlow', reduce)`, so the reduced-motion behavior lives
 * in one place instead of being re-derived here: the full target pulses opacity
 * and scale, the reduced target keeps the opacity pulse and drops the transform.
 * `useReducedMotion` tracks mid-session changes, so flipping the system
 * preference re-resolves the target on the next render. Only `opacity` and
 * `transform` animate, keeping the pulse on the compositor.
 *
 * The orb is decorative: the root `<svg>` is `aria-hidden`, holds no
 * `<title>`/`<desc>`, and contributes no accessible name. `focusable="false"`
 * keeps it out of the tab order on legacy engines. Fills come from the palette
 * tokens with black outline strokes.
 */
import { motion } from 'framer-motion';

import { useReducedMotion } from '../../hooks/useReducedMotion';
import { resolveMotion } from '../../motion/variants';
import { palette } from '../../theme/tokens';

const VIEWBOX = 32;
const CENTER = VIEWBOX / 2;

export interface PortalOrbProps {
  /** Sizing and positioning classes for the root `<svg>`. */
  className?: string;
}

/**
 * Renders the portal orb: a blue core with a black outline, a gold highlight,
 * and two pulsing halo rings.
 *
 * @param className - Classes applied to the root `<svg>`; the caller owns size
 *   and placement so the motif can scale down on small screens.
 */
export const PortalOrb = ({ className }: PortalOrbProps): JSX.Element => {
  const reduce = useReducedMotion();

  return (
    <svg
      className={className}
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {/*
        Halo group. `transformBox: 'fill-box'` plus a centered origin makes the
        scale channel breathe outward from the orb's middle rather than from the
        view-box corner, which is the SVG default.
      */}
      <motion.g
        animate={resolveMotion('portalGlow', reduce)}
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      >
        <circle
          cx={CENTER}
          cy={CENTER}
          r={14}
          fill="none"
          stroke={palette.blue}
          strokeWidth={1}
          opacity={0.45}
        />
        <circle
          cx={CENTER}
          cy={CENTER}
          r={11.5}
          fill="none"
          stroke={palette.blue}
          strokeWidth={2}
          opacity={0.7}
        />
      </motion.g>

      {/* Static core: blue body, black outline, gold highlight and rim pixels. */}
      <circle
        cx={CENTER}
        cy={CENTER}
        r={8}
        fill={palette.blue}
        stroke={palette.outline}
        strokeWidth={2}
      />
      <circle
        cx={CENTER}
        cy={CENTER}
        r={4.5}
        fill="none"
        stroke={palette.gold}
        strokeWidth={1}
        opacity={0.8}
      />
      <rect x={CENTER - 5} y={CENTER - 5} width={2} height={2} fill={palette.gold} />
      <rect x={CENTER + 2} y={CENTER + 3} width={2} height={2} fill={palette.magenta} />
    </svg>
  );
};
