/**
 * Application root: the seven sections stacked in document order on the site's
 * single route. No router, no providers, no state — every section reads its own
 * data module, so composition is all this file does.
 *
 * Three contracts live here because they cannot live anywhere else:
 *
 *   - `<MotionConfig reducedMotion="user">` makes every Framer animation beneath
 *     it animate opacity and color only under prefers-reduced-motion, skipping
 *     transforms. Framer re-subscribes to the media query internally, so a
 *     preference toggled mid-session applies live with no listener of ours.
 *   - `overflow-x-hidden` is a backstop against horizontal scroll at 320px, not
 *     the mechanism: the hero's `clamp` art box and mobile-first layouts are.
 *   - `bg-surface-base` paints the readable surface behind the whole page, so
 *     gaps between sections and the area below the last one stay on it instead
 *     of falling through to the browser default. Each `SectionShell` sets it
 *     too; the sections own their surface and the root matches the page to it.
 *
 * `SectionDivider` sits between adjacent content sections only — not after the
 * hero, which already ends on its own sky gradient and platform art where a
 * pixel stroke would read as a seam, and not after the footer, where there is
 * nothing left to divide.
 */
import { MotionConfig } from 'framer-motion';

import { About } from './components/About';
import { Awards } from './components/Awards';
import { Experience } from './components/Experience';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { Projects } from './components/Projects';
import { Skills } from './components/Skills';
import { SectionDivider } from './components/ui/SectionDivider';

export function App(): JSX.Element {
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen overflow-x-hidden bg-surface-base">
        <Hero />

        <About />
        <SectionDivider />

        <Experience />
        <SectionDivider />

        <Projects />
        <SectionDivider />

        <Skills />
        <SectionDivider />

        <Awards />
        <SectionDivider />

        <Footer />
      </div>
    </MotionConfig>
  );
}

export default App;
