/**
 * About section copy.
 *
 * The three statements live here as data so the committed copy is assertable
 * without rendering, and so `About.tsx` renders whatever this module says rather
 * than hard-coding prose: program, focus, and internship target.
 *
 * `aboutStatements` is the render order; the keys exist so a test or component can
 * reference one statement without depending on array position.
 */

export const about = {
  program:
    'I am Wajeeh Alam, an Honours Computer Science co-op student at the University of Waterloo.',
  focus:
    'My focus is FinTech and AI/ML: training models and building the systems that serve them.',
  target:
    'I am targeting top-tier software/product engineering & AI internships for Summer 2027.',
} as const;

/** The About statements in render order. */
export const aboutStatements: readonly string[] = [
  about.program,
  about.focus,
  about.target,
] as const;
