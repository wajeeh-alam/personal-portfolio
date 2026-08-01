/**
 * `About` is the concise statement of program, focus, and internship target a
 * recruiter reads immediately after the hero.
 *
 * The prose is not written here. `src/data/about.ts` owns the copy and
 * `aboutStatements` fixes its render order, so this component maps over that
 * list rather than inlining sentences. That keeps the committed-copy assertions
 * in `src/data/__tests__/content.test.ts` meaningful: the strings the tests
 * check are the strings the page renders.
 *
 * `SectionShell` supplies the dark `surfaces.base` background, the
 * `text-ink-primary` body color that clears 4.5:1 on it, the single `h2`, and
 * the scroll reveal wrapper. Every statement is a `<p>` inheriting `font-body`
 * from the shell's content wrapper; `font-pixel` is reserved for the eyebrow and
 * never touches prose.
 */
import { aboutStatements } from '../data/about';
import { SectionShell } from './ui/SectionShell';

/** Renders the About section from the committed `aboutStatements` copy. */
export function About(): JSX.Element {
  return (
    <SectionShell id="about" eyebrow="power-up" heading="About">
      <div className="flex max-w-3xl flex-col gap-4">
        {aboutStatements.map((statement) => (
          <p
            key={statement}
            data-testid="about-statement"
            className="font-body text-base leading-relaxed text-ink-primary sm:text-lg"
          >
            {statement}
          </p>
        ))}
      </div>
    </SectionShell>
  );
}

export default About;
