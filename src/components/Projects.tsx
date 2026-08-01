/**
 * `Projects` renders one `ProjectCard` per entry in the merged `projects` list.
 *
 * Data comes from `src/data/projects.ts`, already the curated floor merged with
 * build-time GitHub data. Zero fetched repositories is the base case of that
 * merge, so an empty generated list yields exactly the curated entries with no
 * branch in this file. Card structure — name, description, technology chips,
 * repository anchor, hover glow — belongs to `ProjectCard`, and surface, eyebrow,
 * heading, and scroll reveal belong to `SectionShell`; passing `id="projects"`
 * gives the shell's `<section>` both the anchor and its `aria-labelledby`
 * wiring.
 *
 * `tabIndex={-1}` is the one thing that sets this section apart from its
 * siblings: the hero's "View Projects" button calls `focus()` on `#projects`
 * after scrolling, and a negative tab index makes the section a programmatic
 * focus target without inserting it into the tab order.
 */
import { ProjectCard } from './ui/ProjectCard';
import { SectionShell } from './ui/SectionShell';
import { projects } from '../data/projects';

/** Single-column on small screens, multi-column from 768px up. */
const GRID = 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3';

export const Projects = (): JSX.Element => (
  <SectionShell id="projects" tabIndex={-1} eyebrow="character select" heading="Projects">
    <div className={GRID}>
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  </SectionShell>
);

export default Projects;
