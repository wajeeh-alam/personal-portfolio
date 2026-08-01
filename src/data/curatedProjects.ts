/**
 * The authoritative floor of the project grid.
 *
 * These three entries always render, in this order, regardless of what the GitHub
 * fetch script returns. `mergeProjects` only ever enriches `repoUrl`, `stars`, and
 * `language`; the `name`, `description`, and `technologies` here are
 * recruiter-facing copy and are never overwritten by API values.
 *
 * The technology list for drawOff is a best-effort reconstruction rather than a
 * confirmed stack. The README flags it as a value to verify before sharing the
 * site.
 */

import type { Project } from '../types';

/**
 * `repoAliases` entries MUST be pre-normalized: lowercase, alphanumeric only.
 * `mergeProjects` compares them against `norm(repo.name)` without normalizing
 * them again, so `'draw-off'` would never match while `'drawoff'` does.
 * `norm(project.name)` is always tried first, so aliases only need to cover
 * repository names that genuinely diverge from the display name.
 */
export const curatedProjects: readonly Project[] = [
  {
    id: 'drawoff',
    name: 'drawOff',
    description:
      'Real-time multiplayer drawing game where players sketch prompts and race to guess each other’s drawings.',
    // Best-effort: confirm against the repository before sharing (README).
    technologies: ['TypeScript', 'React', 'Node.js', 'Socket.IO'],
    origin: 'curated',
    repoAliases: ['drawoffgame', 'drawoffapp'],
  },
  {
    id: 'studyquest',
    name: 'StudyQuest',
    description:
      'Gamified learning iOS app that awards experience points for study sessions and ranks learners on a leaderboard, with real-time progress tracking and an analytics dashboard.',
    technologies: ['React Native', 'Expo', 'Firebase'],
    origin: 'curated',
    repoAliases: ['studyquestapp', 'studyquestios'],
  },
  {
    id: 'voca',
    name: 'Voca',
    description:
      'Vocal processing and pitch-training platform that tracks hand gestures for live control and scores sung pitch with autocorrelation-based detection.',
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Mediapipe', 'Tone.js'],
    origin: 'curated',
    repoAliases: ['vocaapp', 'vocapitch'],
  },
] as const;
