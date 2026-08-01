/**
 * Tests for the live media query hooks.
 *
 * The `window.matchMedia` stub these tests drive lives in `vitest.setup.ts`;
 * its helpers are available as globals but are imported explicitly here so the
 * types come along.
 */
import { act, cleanup, renderHook } from '@testing-library/react';
import fc from 'fast-check';
import { afterEach, describe, expect, it } from 'vitest';

import {
  dispatchMatchMediaChange,
  matchMediaListenerCount,
  removeMatchMedia,
  resetMatchMedia,
  setMatchMedia,
} from '../../../vitest.setup';
import { useMediaQuery } from '../useMediaQuery';
import { useReducedMotion } from '../useReducedMotion';
import { useSmallScreen } from '../useSmallScreen';

const REDUCE = '(prefers-reduced-motion: reduce)';
const MD = '(min-width: 768px)';

afterEach(() => {
  cleanup();
});

describe('useMediaQuery', () => {
  it('reports the match state present at mount', () => {
    setMatchMedia(MD, true);
    const { result } = renderHook(() => useMediaQuery(MD));
    expect(result.current).toBe(true);
  });

  it('defaults to false for a query that was never set', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 1280px)'));
    expect(result.current).toBe(false);
  });

  /**
   * After any sequence of `change` events, the hook's reported value equals the
   * most recent event's `matches` value — checked after every single step, not
   * just at the end of the sequence.
   */
  it('Feature: dbz-pixel-portfolio, Property 13: Live preference tracking', () => {
    fc.assert(
      fc.property(
        fc.array(fc.boolean(), { minLength: 1, maxLength: 12 }),
        (sequence) => {
          resetMatchMedia();
          const { result, unmount } = renderHook(() => useMediaQuery(REDUCE));
          try {
            for (const next of sequence) {
              act(() => {
                dispatchMatchMediaChange(REDUCE, next);
              });
              expect(result.current).toBe(next);
            }
          } finally {
            unmount();
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('removes its change listener on unmount', () => {
    const { unmount } = renderHook(() => useMediaQuery(MD));
    expect(matchMediaListenerCount(MD)).toBe(1);

    unmount();
    expect(matchMediaListenerCount(MD)).toBe(0);
  });

  it('returns false without throwing when window.matchMedia is absent', () => {
    removeMatchMedia();
    try {
      expect(() => renderHook(() => useMediaQuery(REDUCE))).not.toThrow();
      const { result } = renderHook(() => useMediaQuery(REDUCE));
      expect(result.current).toBe(false);
    } finally {
      resetMatchMedia();
    }
  });
});

describe('useReducedMotion', () => {
  it('tracks the prefers-reduced-motion query live', () => {
    setMatchMedia(REDUCE, true);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);

    act(() => {
      dispatchMatchMediaChange(REDUCE, false);
    });
    expect(result.current).toBe(false);
  });
});

describe('useSmallScreen', () => {
  it('is the negation of the 768px breakpoint and tracks it live', () => {
    setMatchMedia(MD, true);
    const { result } = renderHook(() => useSmallScreen());
    expect(result.current).toBe(false);

    act(() => {
      dispatchMatchMediaChange(MD, false);
    });
    expect(result.current).toBe(true);
  });
});
