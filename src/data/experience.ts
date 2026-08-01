/**
 * Experience timeline content.
 *
 * The three roles live here as data, not markup, so `Experience.tsx` renders
 * whatever this module says. `dateRange` strings are display copy and are
 * rendered verbatim; `ongoing` and `endedAt` exist only so recency ordering is
 * computable and testable rather than a hand-maintained array order.
 */

import type { ExperienceEntry } from '../types';

/**
 * The roles in authoring order. Deliberately not pre-sorted — consumers read
 * the `experience` export below, which applies `byRecency`.
 */
export const experienceEntries: readonly ExperienceEntry[] = [
  {
    id: 'utsc-senior-coding-instructor',
    title: 'Senior Coding Instructor',
    organization: 'University of Toronto Scarborough',
    dateRange: 'Jun 2025 – Present',
    ongoing: true,
    endedAt: null,
    highlights: [
      'Delivered Python and Scratch workshops to over 300 children.',
      'Built teaching tools that increased participation by 40 percent.',
    ],
    markerColor: 'gold',
  },
  {
    id: 'makerkids-computer-robotics-instructor',
    title: 'Computer & Robotics Instructor',
    organization: 'MakerKids',
    dateRange: 'Feb 2026 – Apr 2026',
    ongoing: false,
    endedAt: '2026-04',
    highlights: [
      'Taught Scratch, Python, Arduino, and Minecraft to students in grades 1 through 8.',
      'Ran multi-session classroom logistics across recurring cohorts.',
    ],
    markerColor: 'blue',
  },
  {
    id: 'sprouthacks-lead-web-developer',
    title: 'Lead Web Developer',
    organization: 'SproutHacks',
    dateRange: 'Jun 2024 – Sept 2024',
    ongoing: false,
    endedAt: '2024-09',
    highlights: [
      'Built a responsive web application and authentication system with React, Tailwind CSS, and TypeScript on Firebase with a REST API.',
      'Delivered the platform to hundreds of users as one of two lead developers.',
    ],
    markerColor: 'magenta',
  },
] as const;

/**
 * Recency comparator: ongoing roles first, then completed roles by end date
 * descending. Start dates cannot drive this order — the ongoing UTSC role starts
 * before the completed MakerKids role.
 */
export const byRecency = (a: ExperienceEntry, b: ExperienceEntry): number => {
  if (a.ongoing !== b.ongoing) return a.ongoing ? -1 : 1;
  return (b.endedAt ?? '').localeCompare(a.endedAt ?? '');
};

/** The roles most recent first: UTSC → MakerKids → SproutHacks. */
export const experience: readonly ExperienceEntry[] = [...experienceEntries].sort(byRecency);
