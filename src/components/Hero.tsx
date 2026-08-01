/**
 * `Hero` is the full-viewport first screen of the site.
 *
 * It composes four things and owns none of their internals: the sky gradient
 * (`.hero-sky` in `src/index.css`), the decorative art layer from
 * `src/components/art/`, the gradient-filled name from `ui/HeroLettering`, and
 * two `EnergyOrbButton` calls to action. Anything needing CSS beyond Tailwind
 * utilities lives in the stylesheet, so this file stays layout plus copy.
 *
 * Sizing: the art wrapper is one `w-[clamp(240px,78vw,640px)]` square and every
 * decoration is placed and sized in percentages of it, so the scene scales
 * continuously with the viewport instead of snapping at breakpoints and cannot
 * overflow horizontally on small screens. The CTA row is the only element with a
 * breakpoint modifier: it stacks by default, becoming a centered row at `sm`.
 *
 * Motion: the platform float resolves the registry's `planetFloat` target
 * against the live motion preference, whose `reduce` variant is empty, so the
 * transform channel disappears rather than being slowed. The sparkles, the orb
 * pulse, and the portal glow each handle reduced motion themselves, so there is
 * no other preference branching here.
 */
import { motion } from 'framer-motion';

import { MascotSprite } from './art/MascotSprite';
import { PixelTree } from './art/PixelTree';
import { PlanetPlatform } from './art/PlanetPlatform';
import { PortalOrb } from './art/PortalOrb';
import { SparkleLayer } from './art/SparkleLayer';
import { EnergyOrbButton } from './ui/EnergyOrbButton';
import { HeroLettering } from './ui/HeroLettering';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { resolveMotion } from '../motion/variants';
import { lettering } from '../theme/tokens';

/** `id` of the Projects section, the "View Projects" scroll target. */
export const PROJECTS_SECTION_ID = 'projects';

/** Rendered verbatim. The dash is an em dash, not a hyphen. */
export const HERO_TAGLINE =
  'Computer Science @ University of Waterloo — Software Engineer & AI/ML Builder';

/**
 * Scrolls the Projects section into view and moves keyboard focus to it.
 *
 * One handler covers both mouse and keyboard because a `click` event fires for
 * `Enter` and `Space` on a real `<button>`, so no key handler is needed. The
 * Projects section carries `tabIndex={-1}`, which makes it a programmatic focus
 * target without entering the tab order, and `preventScroll: true` stops
 * `focus()` from fighting the smooth scroll it was just asked to perform.
 *
 * Exported rather than inlined so the behavior is testable directly, including
 * the two defensive paths: a missing target returns without throwing, and an
 * engine (or a jsdom test environment) without `scrollIntoView` falls back to a
 * hash navigation, which still lands the visitor on the section.
 *
 * @param prefersReduced - `true` under prefers-reduced-motion, which swaps the
 *   smooth scroll for an instant jump.
 */
export function focusProjects(prefersReduced: boolean): void {
  const target = document.getElementById(PROJECTS_SECTION_ID);
  if (!target) {
    return;
  }

  if (typeof target.scrollIntoView === 'function') {
    target.scrollIntoView({
      behavior: prefersReduced ? 'auto' : 'smooth',
      block: 'start',
    });
  } else {
    window.location.hash = `#${PROJECTS_SECTION_ID}`;
  }

  if (typeof target.focus === 'function') {
    target.focus({ preventScroll: true });
  }
}

export function Hero(): JSX.Element {
  const reduce = useReducedMotion();

  return (
    <section
      className="hero-sky relative flex min-h-[100svh] flex-col items-center justify-center gap-8 overflow-hidden px-4 py-16"
      aria-label="Introduction"
    >
      {/*
        Art layer. The wrapper is square so each decoration can be placed with
        percentage offsets against a stable box; the clamp is the only width
        declaration in the scene.
      */}
      <div className="relative mx-auto aspect-square w-[clamp(240px,78vw,640px)]">
        <SparkleLayer />

        {/* Planet platform float: transform-only, dropped entirely under `reduce`. */}
        <motion.div
          className="absolute inset-x-0 bottom-0 top-[22%]"
          animate={resolveMotion('planetFloat', reduce)}
        >
          <PlanetPlatform className="h-full w-full" />

          {/* Trees sit on the disc, sized as a fraction of the platform box. */}
          <PixelTree className="absolute left-[16%] top-[26%] h-auto w-[11%]" />
          <PixelTree className="absolute right-[13%] top-[38%] h-auto w-[9%]" />

          {/* Mascot stands on the road, centered on the disc. */}
          <MascotSprite className="absolute left-[46%] top-[8%] h-auto w-[20%] -translate-x-1/2" />
        </motion.div>

        {/* Portal orb hangs in the sky above the platform. */}
        <PortalOrb className="absolute right-[8%] top-[4%] h-auto w-[18%]" />
      </div>

      {/* Copy layer: the single `h1`, the tagline, and the two CTAs. */}
      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center gap-6 text-center">
        <HeroLettering text="Wajeeh Alam" />

        {/*
          Bold red-orange sans-serif. The hue comes from the `lettering` token
          export, which sits outside the decorative palette as content color, and
          the face is `font-body` (Inter) so the pixel face stays confined to
          small control labels.
        */}
        <p
          className="font-body text-lg font-bold leading-snug sm:text-xl"
          style={{ color: lettering.flareRed }}
        >
          {HERO_TAGLINE}
        </p>

        <div className="flex w-full flex-col items-stretch gap-4 sm:flex-row sm:justify-center">
          <EnergyOrbButton
            label="View Projects"
            onClick={() => {
              focusProjects(reduce);
            }}
          />
          <EnergyOrbButton label="Resume" href="/resume.pdf" />
        </div>
      </div>
    </section>
  );
}

export default Hero;
