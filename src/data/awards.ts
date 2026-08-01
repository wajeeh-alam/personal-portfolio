/**
 * Awards section content.
 *
 * `placement` is a verbatim display string, not a computed rank: `AwardBadge`
 * renders it as visible text exactly as written here.
 */

import type { Award } from '../types';

export const awards: readonly Award[] = [
  {
    id: 'genzcanhack',
    name: 'GenZCanHack',
    placement: '4th / 48',
    description:
      'Built a carbon emissions tracker that measures vehicle movement and reports trip-level emissions.',
    technologies: ['ESP32', 'MPU6050', 'Node.js'],
  },
  {
    /**
     * Only the placement is confirmed for this entry, so the description stays
     * factual and generic; verify the project details before sharing the site.
     */
    id: 'uoft-high-school-design-competition',
    name: 'UofT High School Design Competition',
    placement: '5th / 30',
    description:
      'Team entry in the University of Toronto engineering design competition, judged on design approach and presentation.',
    technologies: [],
  },
] as const;
