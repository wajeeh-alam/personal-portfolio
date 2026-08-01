/**
 * Project grid data source: the curated floor merged with build-time GitHub data.
 *
 * The merge is a pure function that lives here rather than in the fetch script,
 * so it is testable without filesystem or network mocks. Curated entries are
 * authoritative for `name`, `description`, and `technologies`; GitHub only ever
 * contributes `repoUrl` (when the curated entry has none), `stars`, and
 * `language`. An empty `repos` list is the base case, not a special case, so
 * zero fetched repositories yields exactly the curated entries in order.
 */

import type { Project, RepoSummary } from '../types';
import { curatedProjects } from './curatedProjects';
// Stable path: `npm run data` overwrites this module in place, so a regenerated
// file drops in without touching any import.
import { generatedProjectData } from './generated/projects.generated';

/**
 * Collapses a name to lowercase alphanumerics so `drawOff`, `draw-off`, and
 * `DrawOff` all match as `drawoff`. Curated `repoAliases` are authored
 * pre-normalized and are not re-normalized here.
 */
export const norm = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]/g, '');

/** Default cap on discovered repositories appended after the curated floor. */
const DEFAULT_MAX_EXTRAS = 4;

/** Turns an unmatched repository into a project grid entry. */
export function repoToProject(repo: RepoSummary): Project {
  return {
    id: `github-${norm(repo.name)}`,
    name: repo.name,
    description: repo.description ?? '',
    technologies: repo.language ? [repo.language] : [],
    repoUrl: repo.htmlUrl,
    origin: 'github',
    stars: repo.stars,
    language: repo.language,
  };
}

/**
 * Merges fetched repositories into the curated floor.
 *
 * Every curated entry is emitted exactly once, in the given order, with its
 * `name`, `description`, and `technologies` untouched. Repositories that match no
 * curated entry are appended as extras, but only when they carry a description and
 * only up to `maxExtras`.
 */
export function mergeProjects(
  curated: readonly Project[],
  repos: readonly RepoSummary[],
  maxExtras = DEFAULT_MAX_EXTRAS,
): Project[] {
  const byKey = new Map(repos.map((r) => [norm(r.name), r]));
  const consumed = new Set<string>();

  const enriched = curated.map((project) => {
    const keys = [norm(project.name), ...(project.repoAliases ?? [])];
    const match = keys.map((k) => byKey.get(k)).find(Boolean);
    if (!match) return project;
    consumed.add(norm(match.name));
    return {
      ...project,
      repoUrl: project.repoUrl ?? match.htmlUrl,
      stars: match.stars,
      language: match.language,
    };
  });

  const extras = repos
    .filter((r) => !consumed.has(norm(r.name)) && r.description !== null)
    .slice(0, maxExtras)
    .map(repoToProject);

  return [...enriched, ...extras];
}

/** The project grid's data source. */
export const projects: readonly Project[] = mergeProjects(
  curatedProjects,
  generatedProjectData.repos,
);
