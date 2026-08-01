/**
 * Committed copy contract for the content data modules.
 *
 * The copy is checked against the data modules rather than through rendered
 * markup, because the section components read these modules verbatim, so a copy
 * regression is a data regression.
 *
 * Two assertion styles, used deliberately:
 *
 * - Exact equality for values that are quoted verbatim (titles, organizations,
 *   date ranges, technology lists, group membership, placement strings). These
 *   must not drift silently.
 * - Substring checks for descriptive claims where the wording is free (impact
 *   numbers, stack mentions). Copy can be rewritten around them; the facts have
 *   to survive the rewrite.
 */

import { describe, expect, it } from 'vitest';

import { about, aboutStatements } from '../about';
import { awards } from '../awards';
import { curatedProjects } from '../curatedProjects';
import { experience, experienceEntries } from '../experience';
import { skillGroups } from '../skills';

/** Joined copy for substring checks that may span statements. */
const aboutCopy = aboutStatements.join(' ');

describe('About copy (Req 3.1–3.3)', () => {
  it('states the Honours Computer Science co-op program at Waterloo', () => {
    expect(about.program).toContain('Honours Computer Science');
    expect(about.program).toContain('co-op');
    expect(about.program).toContain('University of Waterloo');
    expect(aboutCopy).toContain('Wajeeh Alam');
  });

  it('states the FinTech and AI/ML focus', () => {
    expect(about.focus).toContain('FinTech');
    expect(about.focus).toContain('AI/ML');
  });

  it('states the Summer 2027 top-tier software/product engineering and AI internship target', () => {
    expect(about.target).toContain('top-tier software/product engineering & AI internships');
    expect(about.target).toContain('Summer 2027');
  });

  it('exposes exactly the three statements in render order', () => {
    expect(aboutStatements).toEqual([about.program, about.focus, about.target]);
  });
});

describe('Experience copy (Req 4.1–4.4)', () => {
  it('commits exactly three roles', () => {
    expect(experienceEntries).toHaveLength(3);
    expect(experience).toHaveLength(3);
  });

  it('gives every role a title, an organization, and a date range', () => {
    for (const entry of experienceEntries) {
      expect(entry.title.length).toBeGreaterThan(0);
      expect(entry.organization.length).toBeGreaterThan(0);
      expect(entry.dateRange.length).toBeGreaterThan(0);
      expect(entry.highlights.length).toBeGreaterThan(0);
    }
  });

  it('commits the Senior Coding Instructor role at UTSC (Req 4.2)', () => {
    const role = experienceEntries.find((e) => e.organization === 'University of Toronto Scarborough');
    expect(role).toBeDefined();
    if (!role) return;

    expect(role.title).toBe('Senior Coding Instructor');
    expect(role.organization).toBe('University of Toronto Scarborough');
    expect(role.dateRange).toBe('Jun 2025 – Present');
    expect(role.ongoing).toBe(true);
    expect(role.endedAt).toBeNull();

    const highlights = role.highlights.join(' ');
    expect(highlights).toContain('Python and Scratch');
    expect(highlights).toContain('workshops');
    expect(highlights).toContain('300 children');
    expect(highlights).toContain('teaching tools');
    expect(highlights).toContain('40 percent');
  });

  it('commits the Computer & Robotics Instructor role at MakerKids (Req 4.3)', () => {
    const role = experienceEntries.find((e) => e.organization === 'MakerKids');
    expect(role).toBeDefined();
    if (!role) return;

    expect(role.title).toBe('Computer & Robotics Instructor');
    expect(role.organization).toBe('MakerKids');
    expect(role.dateRange).toBe('Feb 2026 – Apr 2026');
    expect(role.ongoing).toBe(false);
    expect(role.endedAt).toBe('2026-04');

    const highlights = role.highlights.join(' ');
    expect(highlights).toContain('Scratch, Python, Arduino, and Minecraft');
    expect(highlights).toContain('grades 1 through 8');
    expect(highlights).toContain('multi-session');
    expect(highlights).toContain('classroom logistics');
  });

  it('commits the Lead Web Developer role at SproutHacks (Req 4.4)', () => {
    const role = experienceEntries.find((e) => e.organization === 'SproutHacks');
    expect(role).toBeDefined();
    if (!role) return;

    expect(role.title).toBe('Lead Web Developer');
    expect(role.organization).toBe('SproutHacks');
    expect(role.dateRange).toBe('Jun 2024 – Sept 2024');
    expect(role.ongoing).toBe(false);
    expect(role.endedAt).toBe('2024-09');

    const highlights = role.highlights.join(' ');
    expect(highlights).toContain('responsive web application');
    expect(highlights).toContain('authentication system');
    expect(highlights).toContain('React, Tailwind CSS, and TypeScript');
    expect(highlights).toContain('Firebase');
    expect(highlights).toContain('REST API');
    expect(highlights).toContain('two lead developers');
    expect(highlights).toContain('hundreds of users');
  });

  it('marks the ongoing role from its date range and nothing else', () => {
    // `ongoing` drives recency ordering, so it has to agree with the display
    // copy rather than being set by hand independently of it.
    for (const entry of experienceEntries) {
      expect(entry.ongoing).toBe(entry.dateRange.endsWith('Present'));
      expect(entry.endedAt === null).toBe(entry.ongoing);
    }
  });
});

describe('Curated project copy (Req 5.5–5.8)', () => {
  it('commits exactly the three curated entries in order', () => {
    expect(curatedProjects.map((p) => p.name)).toEqual(['drawOff', 'StudyQuest', 'Voca']);
    for (const project of curatedProjects) {
      expect(project.origin).toBe('curated');
      expect(project.description.length).toBeGreaterThan(0);
    }
  });

  it('commits drawOff as a multiplayer drawing game (Req 5.5)', () => {
    const project = curatedProjects.find((p) => p.name === 'drawOff');
    expect(project).toBeDefined();
    if (!project) return;

    expect(project.description).toContain('multiplayer drawing game');
    expect(project.technologies).toEqual(['TypeScript', 'React', 'Node.js', 'Socket.IO']);
  });

  it('commits StudyQuest as a gamified learning iOS app (Req 5.6)', () => {
    const project = curatedProjects.find((p) => p.name === 'StudyQuest');
    expect(project).toBeDefined();
    if (!project) return;

    expect(project.description).toContain('Gamified learning iOS app');
    expect(project.description).toContain('experience points');
    expect(project.description).toContain('leaderboard');
    expect(project.description).toContain('real-time progress tracking');
    expect(project.description).toContain('analytics dashboard');
    expect(project.technologies).toEqual(['React Native', 'Expo', 'Firebase']);
  });

  it('commits Voca as a vocal processing and pitch-training platform (Req 5.7)', () => {
    const project = curatedProjects.find((p) => p.name === 'Voca');
    expect(project).toBeDefined();
    if (!project) return;

    expect(project.description).toContain('Vocal processing and pitch-training platform');
    expect(project.description).toContain('hand gestures');
    expect(project.description).toContain('autocorrelation-based');
    expect(project.technologies).toEqual([
      'React',
      'TypeScript',
      'Tailwind CSS',
      'Mediapipe',
      'Tone.js',
    ]);
  });

  it('keeps repository aliases pre-normalized so merge matching works', () => {
    // `mergeProjects` compares aliases against `norm(repo.name)` without
    // normalizing them again, so an alias with punctuation or capitals would
    // silently never match.
    for (const project of curatedProjects) {
      for (const alias of project.repoAliases ?? []) {
        expect(alias, `alias "${alias}" on ${project.name} must be lowercase alphanumerics`).toMatch(
          /^[a-z0-9]+$/,
        );
      }
    }
  });
});

describe('Skills membership (Req 7.1–7.4)', () => {
  it('commits exactly three groups in the documented order', () => {
    expect(skillGroups.map((group) => group.label)).toEqual([
      'Languages',
      'Frameworks',
      'Tools',
    ]);
  });

  it('commits the Languages membership exactly (Req 7.2)', () => {
    expect(skillGroups.find((g) => g.label === 'Languages')?.skills).toEqual([
      'Python',
      'C++',
      'C#',
      'Lua',
      'HTML/CSS',
      'JavaScript/TypeScript',
    ]);
  });

  it('commits the Frameworks membership exactly (Req 7.3)', () => {
    expect(skillGroups.find((g) => g.label === 'Frameworks')?.skills).toEqual([
      'PyTorch',
      'scikit-learn',
      'NumPy',
      'Pandas',
      'Pygame',
      'React Native',
      'React',
      'Node.js',
      'Docker',
    ]);
  });

  it('commits the Tools membership exactly (Req 7.4)', () => {
    expect(skillGroups.find((g) => g.label === 'Tools')?.skills).toEqual([
      'Git/GitHub',
      'CI/CD',
      'PostgreSQL',
      'MongoDB',
    ]);
  });

  it('lists every skill once across all groups', () => {
    const all = skillGroups.flatMap((group) => group.skills);
    expect(new Set(all).size).toBe(all.length);
  });
});

describe('Award copy (Req 8.1–8.2)', () => {
  it('commits exactly the two award entries', () => {
    expect(awards.map((award) => award.name)).toEqual([
      'GenZCanHack',
      'UofT High School Design Competition',
    ]);
  });

  it('commits GenZCanHack with its carbon tracker stack and 4th / 48 placement (Req 8.1)', () => {
    const award = awards.find((a) => a.name === 'GenZCanHack');
    expect(award).toBeDefined();
    if (!award) return;

    expect(award.placement).toBe('4th / 48');
    expect(award.description).toContain('carbon emissions tracker');
    expect(award.technologies).toEqual(['ESP32', 'MPU6050', 'Node.js']);
  });

  it('commits the UofT High School Design Competition with a 5th / 30 placement (Req 8.2)', () => {
    const award = awards.find((a) => a.name === 'UofT High School Design Competition');
    expect(award).toBeDefined();
    if (!award) return;

    expect(award.placement).toBe('5th / 30');
    expect(award.description.length).toBeGreaterThan(0);
  });

  it('keeps every placement a non-empty verbatim string', () => {
    // `placement` is rendered as visible text exactly as written, so an empty
    // or computed-looking value would surface directly in the UI.
    for (const award of awards) {
      expect(award.placement).toMatch(/^\d+(st|nd|rd|th) \/ \d+$/);
    }
  });
});
