/**
 * `ProjectCard` renders one entry of the project grid.
 *
 * Technology chips are `<span>` elements inside a plain `<div>`, never `<li>`
 * elements inside a `<ul>`, and they resolve `font-body`: `font-pixel` is
 * reserved for eyebrow, section, and control labels, and every list item has to
 * resolve the body token, so a pixel-font `<li>` breaks both rules. `AwardBadge`
 * renders its labels the same way for the same reason — do not reintroduce list
 * markup or the pixel token here.
 *
 * The repository anchor exists if and only if `repoUrl` is defined, and its
 * `href` is exactly that value. Being off-origin it carries `target="_blank"`
 * plus `rel="noopener noreferrer"` and an accessible name naming the project.
 *
 * Hover glow is `.card-glow` from `index.css`, a pre-composited pseudo-element
 * whose `opacity` is transitioned rather than an animated `box-shadow`, so the
 * interaction stays on the compositor. It also reacts to `:focus-within`, which
 * surfaces the same highlight when the repository link takes focus.
 *
 * `stars` and `language` are optional enrichment from the GitHub merge and render
 * as muted metadata only when present; `language` is `string | null`, so null is
 * treated as absent.
 */
import { FOCUS_RING } from './EnergyOrbButton';
import type { Project } from '../../types';

export interface ProjectCardProps {
  /** The project to render. Curated copy is authoritative for the text fields. */
  readonly project: Project;
}

/** Card surface: dark panel, pixel-art border, and the glow layer hook. */
const CARD_SURFACE = [
  'card-glow',
  'flex h-full flex-col gap-3',
  'rounded-lg border-4 border-outline bg-surface-panel',
  'p-5',
].join(' ');

/**
 * One technology label. `font-body`, not `font-pixel`: these are content labels
 * rather than controls, so the pixel token stays off them.
 */
const CHIP =
  'inline-flex items-center rounded border-2 border-outline bg-surface-base px-2 py-1 font-body text-[0.625rem] uppercase leading-none tracking-wide text-blue sm:text-xs';

export const ProjectCard = ({ project }: ProjectCardProps): JSX.Element => {
  const { name, description, technologies, repoUrl, stars, language } = project;
  const hasStars = typeof stars === 'number';
  const hasLanguage = typeof language === 'string' && language.length > 0;

  return (
    <article className={CARD_SURFACE}>
      <h3 className="font-display text-2xl tracking-wide text-gold">{name}</h3>

      <p className="font-body text-sm leading-relaxed text-ink-primary sm:text-base">
        {description}
      </p>

      {technologies.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {technologies.map((technology) => (
            <span key={technology} data-testid="project-technology" className={CHIP}>
              {technology}
            </span>
          ))}
        </div>
      )}

      {(hasStars || hasLanguage) && (
        <p className="font-body text-xs text-ink-muted">
          {hasLanguage && <span>{language}</span>}
          {hasLanguage && hasStars && <span aria-hidden="true"> · </span>}
          {hasStars && <span>{`${stars} ${stars === 1 ? 'star' : 'stars'}`}</span>}
        </p>
      )}

      {repoUrl !== undefined && (
        <a
          href={repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${name} repository on GitHub`}
          className={[
            'mt-auto inline-flex w-fit items-center gap-1',
            'font-pixel text-[0.5rem] uppercase leading-none tracking-wide sm:text-[0.625rem]',
            'text-magenta underline decoration-2 underline-offset-4',
            FOCUS_RING,
          ].join(' ')}
        >
          View Repository
        </a>
      )}
    </article>
  );
};

export default ProjectCard;
