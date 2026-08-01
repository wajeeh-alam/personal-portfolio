/**
 * `mergeProjects` invariants.
 *
 * The merge is the only place where GitHub data can reach the project grid, so
 * the curated floor is asserted as a property rather than as a handful of
 * samples: for any fetched repository list, including the empty one, every
 * curated entry is emitted exactly once, in curated order, with its name,
 * description, and technologies untouched.
 *
 * The generator deliberately mixes real curated names, curated aliases, casing
 * and punctuation variants, and arbitrary strings, so the normalized matching
 * path is exercised as often as the no-match path instead of almost never.
 *
 * The example tests below pin the enrichment rules the property says nothing
 * about: which fields GitHub may contribute, that a curated `repoUrl` wins, and
 * how extras are filtered and capped.
 */
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import type { Project, RepoSummary } from '../../types';
import { curatedProjects } from '../curatedProjects';
import { mergeProjects, norm, repoToProject } from '../projects';

/** Every key a curated entry can be matched by: display name plus aliases. */
const CURATED_MATCH_KEYS: readonly string[] = curatedProjects.flatMap((project) => [
  project.name,
  ...(project.repoAliases ?? []),
]);

/**
 * Real-world spellings of the same repositories: `norm` collapses all of these
 * onto a curated key, which is exactly the collision the merge must survive.
 */
const NAME_VARIANTS = [
  'drawoff',
  'draw-off',
  'DrawOff',
  'draw off',
  'study_quest',
  'VOCA',
  'voca-pitch',
] as const;

/**
 * Repository names weighted toward keys that collide with the curated floor.
 * Arbitrary strings still get a share so unmatched extras are generated too.
 */
const repoName = fc.oneof(
  { arbitrary: fc.constantFrom(...CURATED_MATCH_KEYS), weight: 3 },
  { arbitrary: fc.constantFrom(...NAME_VARIANTS), weight: 3 },
  { arbitrary: fc.string({ minLength: 1, maxLength: 16 }), weight: 4 },
);

const repoSummary: fc.Arbitrary<RepoSummary> = fc.record({
  name: repoName,
  // `null` is the "no description" case the extras filter excludes.
  description: fc.option(fc.string({ maxLength: 40 }), { nil: null }),
  language: fc.option(fc.constantFrom('TypeScript', 'Python', 'Lua', 'C++'), { nil: null }),
  stars: fc.nat({ max: 5_000 }),
  htmlUrl: fc.webUrl(),
});

/** Includes the empty array, which is the fallback case. */
const repoList = fc.array(repoSummary, { maxLength: 10 });

/** Minimal repository fixture for the example tests. */
function repo(overrides: Partial<RepoSummary> & { name: string }): RepoSummary {
  return {
    description: 'A fetched repository.',
    language: 'TypeScript',
    stars: 0,
    htmlUrl: `https://github.com/Mr-W-Squidward/${overrides.name}`,
    ...overrides,
  };
}

describe('mergeProjects: curated floor', () => {
  it('Feature: dbz-pixel-portfolio, Property 11: Curated floor', () => {
    fc.assert(
      fc.property(repoList, (repos) => {
        const merged = mergeProjects(curatedProjects, repos);

        // Curated order, and the floor occupies the leading positions.
        expect(
          merged.slice(0, curatedProjects.length).map((project) => project.id),
          'the curated entries must lead the merged list in curated order.',
        ).toEqual(curatedProjects.map((project) => project.id));

        for (const curated of curatedProjects) {
          const matches = merged.filter((project) => project.id === curated.id);
          expect(
            matches,
            `curated entry "${curated.name}" should appear exactly once in the merge.`,
          ).toHaveLength(1);

          const [entry] = matches;
          expect(entry).toBeDefined();
          if (!entry) return;

          expect(entry.name).toBe(curated.name);
          expect(entry.description).toBe(curated.description);
          expect(entry.technologies).toEqual(curated.technologies);
          expect(entry.origin).toBe('curated');
        }
      }),
      { numRuns: 100 },
    );
  });

  it('returns exactly the curated entries for an empty repository list', () => {
    expect(mergeProjects(curatedProjects, [])).toEqual([...curatedProjects]);
  });
});

describe('mergeProjects: enrichment', () => {
  it('takes repoUrl, stars, and language from a matched repository', () => {
    const merged = mergeProjects(curatedProjects, [
      repo({ name: 'drawOff', stars: 42, language: 'TypeScript' }),
    ]);

    const drawOff = merged.find((project) => project.id === 'drawoff');
    expect(drawOff?.repoUrl).toBe('https://github.com/Mr-W-Squidward/drawOff');
    expect(drawOff?.stars).toBe(42);
    expect(drawOff?.language).toBe('TypeScript');
  });

  it('keeps a curated repoUrl in preference to the fetched html url', () => {
    const curated: readonly Project[] = [
      {
        id: 'voca',
        name: 'Voca',
        description: 'Curated copy.',
        technologies: ['React'],
        repoUrl: 'https://example.com/curated-voca',
        origin: 'curated',
      },
    ];

    const [merged] = mergeProjects(curated, [
      repo({ name: 'voca', stars: 7, language: 'Lua' }),
    ]);

    expect(merged?.repoUrl).toBe('https://example.com/curated-voca');
    // Enrichment still applies to the fields the curated entry leaves open.
    expect(merged?.stars).toBe(7);
    expect(merged?.language).toBe('Lua');
  });

  it('never reads a fetched description over the curated copy', () => {
    const merged = mergeProjects(curatedProjects, [
      repo({ name: 'studyquest', description: null }),
    ]);

    const studyQuest = merged.find((project) => project.id === 'studyquest');
    expect(studyQuest?.description).toBe(curatedProjects[1]?.description);
    // A curated-matched repo is consumed, so it is not also appended as an extra.
    expect(merged).toHaveLength(curatedProjects.length);
  });
});

describe('mergeProjects: matching', () => {
  it.each(['drawoff', 'draw-off', 'DrawOff', 'draw off'])(
    'matches the drawOff entry against the repository name %s',
    (name) => {
      const merged = mergeProjects(curatedProjects, [repo({ name, stars: 3 })]);

      expect(merged.find((project) => project.id === 'drawoff')?.stars).toBe(3);
      // Matched repositories are never duplicated into the extras tail.
      expect(merged).toHaveLength(curatedProjects.length);
    },
  );

  it('matches through repoAliases when the repository name diverges', () => {
    const merged = mergeProjects(curatedProjects, [
      repo({ name: 'voca-pitch', stars: 11, language: 'TypeScript' }),
    ]);

    const voca = merged.find((project) => project.id === 'voca');
    expect(voca?.stars).toBe(11);
    expect(voca?.repoUrl).toBe('https://github.com/Mr-W-Squidward/voca-pitch');
    expect(merged).toHaveLength(curatedProjects.length);
  });

  it('collapses names to lowercase alphanumerics', () => {
    expect(norm('draw-off')).toBe('drawoff');
    expect(norm('DrawOff')).toBe('drawoff');
    expect(norm('Voca Pitch')).toBe('vocapitch');
  });
});

describe('mergeProjects: extras', () => {
  it('excludes repositories with a null description', () => {
    const merged = mergeProjects(curatedProjects, [
      repo({ name: 'described-extra' }),
      repo({ name: 'silent-extra', description: null }),
    ]);

    const extras = merged.slice(curatedProjects.length);
    expect(extras.map((project) => project.name)).toEqual(['described-extra']);
  });

  it('caps extras at four', () => {
    const repos = Array.from({ length: 9 }, (_, index) =>
      repo({ name: `extra-${index}` }),
    );

    const merged = mergeProjects(curatedProjects, repos);
    const extras = merged.slice(curatedProjects.length);

    expect(extras).toHaveLength(4);
    expect(extras.map((project) => project.name)).toEqual([
      'extra-0',
      'extra-1',
      'extra-2',
      'extra-3',
    ]);
    expect(extras.every((project) => project.origin === 'github')).toBe(true);
  });

  it('maps an unmatched repository onto a github-origin project', () => {
    const source = repo({ name: 'Pixel-Tools', stars: 5, language: 'Lua' });

    expect(repoToProject(source)).toEqual({
      id: 'github-pixeltools',
      name: 'Pixel-Tools',
      description: 'A fetched repository.',
      technologies: ['Lua'],
      repoUrl: 'https://github.com/Mr-W-Squidward/Pixel-Tools',
      origin: 'github',
      stars: 5,
      language: 'Lua',
    });
  });

  it('leaves technologies empty when the repository has no language', () => {
    expect(repoToProject(repo({ name: 'no-lang', language: null }))).toMatchObject({
      technologies: [],
      language: null,
    });
  });
});
