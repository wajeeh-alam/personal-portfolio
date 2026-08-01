/**
 * Live `prefers-reduced-motion` read, for the places a TypeScript conditional is
 * genuinely needed. CSS keyframe blocks and Framer's `reducedMotion="user"` mode
 * handle the rest without JavaScript.
 */
import { useMediaQuery } from './useMediaQuery';

/**
 * @returns `true` while the visitor prefers reduced motion, tracking changes made
 *   during the session. `false` when media queries are unavailable.
 */
export const useReducedMotion = (): boolean =>
  useMediaQuery('(prefers-reduced-motion: reduce)');
