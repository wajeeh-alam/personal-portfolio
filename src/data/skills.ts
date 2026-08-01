/**
 * Skills inventory content.
 *
 * Exactly three groups, in the order they render. Group membership is
 * authoritative copy: edit it here, never in `Skills.tsx`.
 *
 * Each group carries a `PaletteAccent` key rather than a hex value so `SkillPill`
 * resolves the color through the palette registry.
 */

import type { SkillGroup } from '../types';

export const skillGroups: readonly SkillGroup[] = [
  {
    label: 'Languages',
    accent: 'blue',
    skills: ['Python', 'C++', 'C#', 'Lua', 'HTML/CSS', 'JavaScript/TypeScript'],
  },
  {
    label: 'Frameworks',
    accent: 'gold',
    skills: [
      'PyTorch',
      'scikit-learn',
      'NumPy',
      'Pandas',
      'Pygame',
      'React Native',
      'React',
      'Node.js',
      'Docker',
    ],
  },
  {
    label: 'Tools',
    accent: 'grassLight',
    skills: ['Git/GitHub', 'CI/CD', 'PostgreSQL', 'MongoDB'],
  },
] as const;
