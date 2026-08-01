/**
 * Live media query subscription.
 *
 * The reduced-motion strategy is media-query-first: nothing snapshots the
 * visitor's preference at load. This hook is the TypeScript half of that,
 * re-rendering whenever the query's match state flips so behavior tracks the new
 * value mid-session. It is also how the sparkle layer learns it is on a small
 * screen.
 */
import { useEffect, useState } from 'react';

/**
 * Reads `window.matchMedia` when it exists, and `undefined` otherwise — during
 * server-side rendering there is no `window`, and some engines (and jsdom) ship
 * no `matchMedia` implementation at all.
 */
function getMediaQueryList(query: string): MediaQueryList | undefined {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return undefined;
  }
  return window.matchMedia(query);
}

/**
 * Tracks whether `query` currently matches, updating on every `change` event.
 *
 * When media queries are unavailable the hook reports `false` rather than
 * throwing, which degrades to "the query does not match" — full motion, desktop
 * sparkle density — instead of breaking the render.
 *
 * @param query - A CSS media query string, e.g. `'(min-width: 768px)'`.
 * @returns `true` while the query matches, `false` otherwise.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => getMediaQueryList(query)?.matches ?? false,
  );

  useEffect(() => {
    const mql = getMediaQueryList(query);
    if (!mql) {
      // No engine support: stay at `false` and register nothing to clean up.
      setMatches(false);
      return;
    }

    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);

    // Re-read on mount: the state may have changed between the lazy
    // initializer and this effect, and on a query change the previous
    // subscription's value is stale.
    setMatches(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}
