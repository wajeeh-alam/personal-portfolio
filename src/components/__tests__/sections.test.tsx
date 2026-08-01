/**
 * Section rendering: every section renders every entry its data module hands it,
 * with nothing dropped, duplicated, or hidden in an attribute.
 *
 * The properties generate data and drive the primitives (`TimelineStep`,
 * `ProjectCard`, `SkillPill`, `AwardBadge`) because the section components read
 * fixed committed modules and so span a single input. The example tests below
 * close that gap from the other side: they mount the real sections over the
 * committed data and assert the same shape, plus the responsive grid classes.
 *
 * Generated strings carry an index-derived tag ("role 0", "tech 1 2"), which
 * makes every string on the page distinct without weakening the generator: a
 * cardinality assertion like "exactly one pill per skill" only says something
 * when identical strings cannot collide by accident.
 *
 * "Visible text" is asserted as an exposed text node — the value is the element's
 * own text content and no `aria-hidden` ancestor conceals it — rather than as a
 * computed style. `SectionShell` wraps its children in a scroll reveal that
 * starts at `opacity: 0`, so a style-based check would report every section's
 * copy as invisible in jsdom regardless of markup correctness. jsdom also ships
 * no `IntersectionObserver` and Framer Motion's `whileInView` calls it
 * unguarded, so a no-op stub stands in and the reveal never fires.
 */
import { cleanup, render, screen, within } from '@testing-library/react';
import fc from 'fast-check';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { Awards } from '../Awards';
import { Experience } from '../Experience';
import { Projects } from '../Projects';
import { Skills } from '../Skills';
import { AwardBadge } from '../ui/AwardBadge';
import { ProjectCard } from '../ui/ProjectCard';
import { SkillPill } from '../ui/SkillPill';
import { TimelineStep } from '../ui/TimelineStep';
import { awards } from '../../data/awards';
import { experience } from '../../data/experience';
import { projects } from '../../data/projects';
import { skillGroups } from '../../data/skills';
import { palette } from '../../theme/tokens';
import type {
  Award,
  ExperienceEntry,
  PaletteAccent,
  Project,
  SkillGroup,
} from '../../types';

/** Framer Motion's viewport feature observes unguarded; jsdom has no observer. */
class NoopIntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin = '';
  readonly thresholds: readonly number[] = [];
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

beforeAll(() => {
  vi.stubGlobal('IntersectionObserver', NoopIntersectionObserver);
});

afterAll(() => {
  vi.unstubAllGlobals();
});

afterEach(() => {
  cleanup();
});

/** Collapses whitespace the way Testing Library's text matcher does. */
const normalize = (value: string): string => value.replace(/\s+/g, ' ').trim();

/** jsdom reports inline colors as `rgb(...)`, so hex tokens are converted. */
function hexToRgb(hex: string): string {
  const value = hex.replace('#', '');
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

/** Accent keys a content component may receive (`outline` is art-only). */
const PALETTE_ACCENTS: readonly PaletteAccent[] = [
  'magenta',
  'blue',
  'gold',
  'grass',
  'grassLight',
];

const accentArb = fc.constantFrom<PaletteAccent>(...PALETTE_ACCENTS);

/**
 * Content characters: letters, digits, spaces, and the punctuation real copy
 * uses. Wide enough to exercise the matcher, narrow enough that a failure names
 * a readable counterexample.
 */
const CONTENT_CHARS = [
  ...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,+#/&()-',
];

/** A raw content fragment; may be empty or whitespace-only before tagging. */
const phrase = fc.stringOf(fc.constantFrom(...CONTENT_CHARS), { maxLength: 14 });

/**
 * Tags a fragment with its position, yielding a non-empty string that is
 * distinct from every other tagged string in the same render.
 */
const tagged = (raw: string, tag: string): string => normalize(`${raw} ${tag}`);

/** The palette value a marker or pill claiming `accent` must paint. */
const accentRgb = (accent: PaletteAccent): string => hexToRgb(palette[accent]);

/** True when `accent` names a palette member. */
const isPaletteAccent = (accent: string | undefined): boolean =>
  accent !== undefined && Object.hasOwn(palette, accent);

/**
 * Asserts `value` is exposed exactly once as text and is not hidden from
 * assistive technology.
 */
function expectVisibleTextOnce(value: string, label: string): void {
  const matches = screen.getAllByText(value);
  expect(matches, `${label} "${value}" should render exactly once as text`).toHaveLength(1);
  expect(
    matches[0]?.closest('[aria-hidden="true"]'),
    `${label} "${value}" renders inside an aria-hidden subtree, so it is not visible text`,
  ).toBeNull();
}

// ---------------------------------------------------------------------------
// Generators
// ---------------------------------------------------------------------------

const experienceEntriesArb: fc.Arbitrary<readonly ExperienceEntry[]> = fc
  .array(
    fc.record({
      title: phrase,
      organization: phrase,
      dateRange: phrase,
      highlights: fc.array(phrase, { maxLength: 3 }),
      markerColor: accentArb,
    }),
    { minLength: 1, maxLength: 4 },
  )
  .map((rows) =>
    rows.map((row, index): ExperienceEntry => ({
      id: `entry-${index}`,
      title: tagged(row.title, `role ${index}`),
      organization: tagged(row.organization, `org ${index}`),
      dateRange: tagged(row.dateRange, `range ${index}`),
      ongoing: false,
      endedAt: null,
      highlights: row.highlights.map((highlight, position) =>
        tagged(highlight, `highlight ${index} ${position}`),
      ),
      markerColor: row.markerColor,
    })),
  );

const projectArbAt = (index: number): fc.Arbitrary<Project> =>
  fc
    .record({
      name: phrase,
      description: phrase,
      technologies: fc.array(phrase, { maxLength: 4 }),
      repoUrl: fc.option(fc.webUrl(), { nil: undefined }),
    })
    .map(
      (row): Project => ({
        id: `project-${index}`,
        name: tagged(row.name, `project ${index}`),
        description: tagged(row.description, `description ${index}`),
        technologies: row.technologies.map((technology, position) =>
          tagged(technology, `tech ${index} ${position}`),
        ),
        repoUrl: row.repoUrl,
        origin: 'curated',
      }),
    );

const projectListArb: fc.Arbitrary<readonly Project[]> = fc
  .integer({ min: 1, max: 4 })
  .chain((count) =>
    fc.tuple(...Array.from({ length: count }, (_, index) => projectArbAt(index))),
  );

const skillGroupsArb: fc.Arbitrary<readonly SkillGroup[]> = fc
  .uniqueArray(
    fc.constantFrom<SkillGroup['label']>('Languages', 'Frameworks', 'Tools'),
    { minLength: 1, maxLength: 3 },
  )
  .chain((labels) =>
    fc.tuple(
      fc.constant(labels),
      fc.array(
        fc.record({
          accent: accentArb,
          skills: fc.array(phrase, { minLength: 1, maxLength: 5 }),
        }),
        { minLength: labels.length, maxLength: labels.length },
      ),
    ),
  )
  .map(([labels, rows]) =>
    labels.map((label, index): SkillGroup => {
      const row = rows[index];
      return {
        label,
        accent: row?.accent ?? 'blue',
        skills: (row?.skills ?? []).map((skill, position) =>
          tagged(skill, `skill ${index} ${position}`),
        ),
      };
    }),
  );

const awardsArb: fc.Arbitrary<readonly Award[]> = fc
  .array(
    fc.record({
      name: phrase,
      placement: phrase,
      description: phrase,
      technologies: fc.array(phrase, { maxLength: 3 }),
    }),
    { minLength: 1, maxLength: 4 },
  )
  .map((rows) =>
    rows.map((row, index): Award => ({
      id: `award-${index}`,
      name: tagged(row.name, `award ${index}`),
      placement: tagged(row.placement, `placement ${index}`),
      description: tagged(row.description, `description ${index}`),
      technologies: row.technologies.map((technology, position) =>
        tagged(technology, `tech ${index} ${position}`),
      ),
    })),
  );

// ---------------------------------------------------------------------------
// Render helpers
// ---------------------------------------------------------------------------

/** Steps in the list markup `Experience.tsx` places them in. */
const renderTimeline = (entries: readonly ExperienceEntry[]) =>
  render(
    <ol>
      {entries.map((entry) => (
        <li key={entry.id}>
          <TimelineStep entry={entry} />
        </li>
      ))}
    </ol>,
  );

/** Cards in the grid container `Projects.tsx` places them in. */
const renderGrid = (list: readonly Project[]) =>
  render(
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {list.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>,
  );

/** Pills in the per-group lists `Skills.tsx` places them in. */
const renderPills = (groups: readonly SkillGroup[]) =>
  render(
    <div>
      {groups.map((group) => (
        <ul key={group.label}>
          {group.skills.map((skill) => (
            <SkillPill key={skill} skill={skill} accent={group.accent} />
          ))}
        </ul>
      ))}
    </div>,
  );

/** Badges in the list markup `Awards.tsx` places them in. */
const renderBadges = (list: readonly Award[]) =>
  render(
    <ul>
      {list.map((award) => (
        <li key={award.id}>
          <AwardBadge award={award} />
        </li>
      ))}
    </ul>,
  );

// ---------------------------------------------------------------------------
// Properties
// ---------------------------------------------------------------------------

describe('Experience_Timeline rendering', () => {
  it('Feature: dbz-pixel-portfolio, Property 1: Timeline step completeness', () => {
    fc.assert(
      fc.property(experienceEntriesArb, (entries) => {
        cleanup();
        renderTimeline(entries);

        for (const entry of entries) {
          expectVisibleTextOnce(entry.title, 'job title');
          expectVisibleTextOnce(entry.organization, 'organization');
          expectVisibleTextOnce(entry.dateRange, 'date range');
        }

        // One themed marker per step, no more and no fewer.
        const markers = screen.getAllByTestId('timeline-marker');
        expect(
          markers,
          `${entries.length} entries rendered ${markers.length} markers; ` +
            'Requirement 4.6 gives each step exactly one marker.',
        ).toHaveLength(entries.length);

        markers.forEach((marker, index) => {
          const entry = entries[index];
          expect(entry).toBeDefined();
          expect(marker.dataset.accent).toBe(entry?.markerColor);
          expect(
            isPaletteAccent(marker.dataset.accent),
            `marker accent "${marker.dataset.accent ?? ''}" is not a Theme_Palette ` +
              'member (Requirement 4.6).',
          ).toBe(true);
          expect(marker.style.backgroundColor).toBe(
            accentRgb(entry?.markerColor ?? 'gold'),
          );
        });

        cleanup();
      }),
      { numRuns: 100 },
    );
  });
});

describe('Project_Grid rendering', () => {
  it('Feature: dbz-pixel-portfolio, Property 3: Project grid completeness', () => {
    fc.assert(
      fc.property(projectListArb, (list) => {
        cleanup();
        const { container } = renderGrid(list);

        const cards = [...container.querySelectorAll('article')];
        expect(
          cards,
          `${list.length} projects rendered ${cards.length} cards; Requirement 5.1 ` +
            'gives each entry exactly one card.',
        ).toHaveLength(list.length);

        cards.forEach((card, index) => {
          const project = list[index];
          expect(project).toBeDefined();
          if (!project) return;

          const scope = within(card);
          expect(scope.getAllByText(project.name)).toHaveLength(1);
          expect(scope.getAllByText(project.description)).toHaveLength(1);

          // Every technology label present, in order, one chip each.
          const chips = scope
            .queryAllByTestId('project-technology')
            .map((chip) => normalize(chip.textContent ?? ''));
          expect(
            chips,
            `card for "${project.name}" rendered technology labels ` +
              `${JSON.stringify(chips)} for data ${JSON.stringify(project.technologies)}.`,
          ).toEqual([...project.technologies]);
        });

        // Exactly one card per project across the whole grid, not just locally.
        for (const project of list) {
          expectVisibleTextOnce(project.name, 'project name');
          expectVisibleTextOnce(project.description, 'project description');
        }

        cleanup();
      }),
      { numRuns: 100 },
    );
  });

  it('Feature: dbz-pixel-portfolio, Property 4: Repository anchor matches data', () => {
    fc.assert(
      fc.property(projectArbAt(0), (project) => {
        cleanup();
        render(<ProjectCard project={project} />);

        const links = screen.queryAllByRole('link');
        const accessibleName = `${project.name} repository on GitHub`;

        if (project.repoUrl === undefined) {
          // No repository link in the data means no anchor at all.
          expect(
            links,
            `project "${project.name}" defines no repoUrl but rendered ` +
              `${links.length} anchors.`,
          ).toHaveLength(0);
          expect(screen.queryByLabelText(accessibleName)).toBeNull();
        } else {
          expect(links).toHaveLength(1);
          const anchor = screen.getByLabelText(accessibleName);
          expect(links[0]).toBe(anchor);
          expect(
            anchor.getAttribute('href'),
            `anchor href does not match repoUrl for "${project.name}".`,
          ).toBe(project.repoUrl);
        }

        cleanup();
      }),
      { numRuns: 100 },
    );
  });
});

describe('Skills_Inventory rendering', () => {
  it('Feature: dbz-pixel-portfolio, Property 5: Skill pill totality', () => {
    fc.assert(
      fc.property(skillGroupsArb, (groups) => {
        cleanup();
        renderPills(groups);

        const expectedSkills = groups.flatMap((group) => [...group.skills]);
        const pills = screen.getAllByTestId('skill-pill');

        expect(
          pills.map((pill) => normalize(pill.textContent ?? '')),
          `${expectedSkills.length} skills rendered ${pills.length} pills; ` +
            'Requirement 7.5 gives each skill exactly one pill.',
        ).toEqual(expectedSkills);

        // No skill omitted, none duplicated, each accent from the palette.
        let cursor = 0;
        for (const group of groups) {
          for (const skill of group.skills) {
            expectVisibleTextOnce(skill, 'skill');
            const pill = pills[cursor];
            expect(pill).toBeDefined();
            expect(pill?.dataset.accent).toBe(group.accent);
            expect(
              isPaletteAccent(pill?.dataset.accent),
              `pill accent "${pill?.dataset.accent ?? ''}" is not a Theme_Palette ` +
                'member (Requirement 7.5).',
            ).toBe(true);
            expect(pill?.style.borderColor).toBe(accentRgb(group.accent));
            cursor += 1;
          }
        }

        cleanup();
      }),
      { numRuns: 100 },
    );
  });
});

describe('Awards_Section rendering', () => {
  it('Feature: dbz-pixel-portfolio, Property 6: Award placement visibility', () => {
    fc.assert(
      fc.property(awardsArb, (list) => {
        cleanup();
        renderBadges(list);

        const placements = screen.getAllByTestId('award-placement');
        expect(
          placements.map((node) => normalize(node.textContent ?? '')),
          `${list.length} awards rendered ${placements.length} placements; ` +
            'Requirement 8.3 shows each placement as visible text.',
        ).toEqual(list.map((award) => award.placement));

        for (const award of list) {
          expectVisibleTextOnce(award.placement, 'placement');
          expectVisibleTextOnce(award.name, 'award name');
        }

        cleanup();
      }),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Committed data: the sections render the real content modules
// ---------------------------------------------------------------------------

describe('sections render their committed data', () => {
  it('renders every experience role with its marker and the timeline rail', () => {
    render(<Experience />);

    expect(screen.getAllByTestId('timeline-marker')).toHaveLength(experience.length);
    expect(screen.getByTestId('timeline-rail')).toBeInTheDocument();

    for (const entry of experience) {
      expectVisibleTextOnce(entry.title, 'job title');
      expectVisibleTextOnce(entry.organization, 'organization');
      expectVisibleTextOnce(entry.dateRange, 'date range');
    }
  });

  it('renders one card per merged project, with matching repository anchors', () => {
    const { container } = render(<Projects />);

    expect(container.querySelectorAll('article')).toHaveLength(projects.length);

    for (const project of projects) {
      expectVisibleTextOnce(project.name, 'project name');
      const anchor = screen.queryByLabelText(`${project.name} repository on GitHub`);
      if (project.repoUrl === undefined) {
        expect(anchor).toBeNull();
      } else {
        expect(anchor?.getAttribute('href')).toBe(project.repoUrl);
      }
    }
  });

  it('renders the three skill groups with one pill per skill', () => {
    render(<Skills />);

    const labels = screen
      .getAllByRole('heading', { level: 3 })
      .map((heading) => normalize(heading.textContent ?? ''));
    expect(labels).toEqual(skillGroups.map((group) => group.label));

    const expectedSkills = skillGroups.flatMap((group) => [...group.skills]);
    expect(
      screen.getAllByTestId('skill-pill').map((pill) => normalize(pill.textContent ?? '')),
    ).toEqual(expectedSkills);
  });

  it('renders every award placement as visible text', () => {
    render(<Awards />);

    expect(
      screen.getAllByTestId('award-placement').map((node) => normalize(node.textContent ?? '')),
    ).toEqual(awards.map((award) => award.placement));

    for (const award of awards) {
      expectVisibleTextOnce(award.placement, 'placement');
    }
  });

  it('lays out the grids single-column at base width and multi-column from 768px', () => {
    // One column on small screens, two at `md`, three at `lg`.
    const projectsRender = render(<Projects />);
    const projectGrid = projectsRender.container.querySelector('[class*="md:grid-cols-2"]');
    expect(projectGrid?.className).toBe('grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3');
    cleanup();

    // One group per row on small screens, three columns at `md`.
    const skillsRender = render(<Skills />);
    const skillsGrid = skillsRender.container.querySelector('[class*="md:grid-cols-3"]');
    expect(skillsGrid?.className).toContain('grid-cols-1');
    expect(skillsGrid?.className).toContain('md:grid-cols-3');
  });
});
