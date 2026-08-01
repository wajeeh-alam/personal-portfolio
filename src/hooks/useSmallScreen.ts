/**
 * Small-screen detection, expressed as the negation of the 768px breakpoint so the
 * threshold matches the Tailwind `md` modifier used throughout the layout.
 */
import { useMediaQuery } from './useMediaQuery';

/**
 * @returns `true` while the viewport is narrower than 768 CSS pixels, which is what
 *   drives the reduced sparkle particle count. `false` when media queries are
 *   unavailable, so the desktop density renders.
 */
export const useSmallScreen = (): boolean => !useMediaQuery('(min-width: 768px)');
