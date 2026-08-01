/**
 * Global Vitest setup.
 *
 * 1. Installs the `@testing-library/jest-dom` matchers.
 * 2. Installs a controllable `window.matchMedia` stub, because jsdom ships no
 *    implementation at all. The stub is what makes the live-preference and
 *    sparkle-density tests possible: match state is settable per query,
 *    registered `change` listeners are recorded, and `change` events can be
 *    dispatched on demand.
 *
 * ## matchMedia helper API
 *
 * Every helper is exported from this module *and* attached to `globalThis`, so
 * a test can either import it:
 *
 * ```ts
 * import { setMatchMedia, dispatchMatchMediaChange } from '../../../vitest.setup';
 * ```
 *
 * or use it as a global (Vitest runs with `globals: true`):
 *
 * ```ts
 * setMatchMedia('(prefers-reduced-motion: reduce)', true);
 * ```
 *
 * | Helper | Behavior |
 * | --- | --- |
 * | `setMatchMedia(query, matches)` | Sets the current match state for an exact query string. Does **not** notify listeners, so it is the right call for arranging state before mount. |
 * | `dispatchMatchMediaChange(query, matches)` | Sets the state *and* fires a `change` event carrying `{ matches, media }` at every listener registered for that query (`addEventListener('change', ...)`, the legacy `addListener(...)`, and `onchange`). |
 * | `matchMediaListenerCount(query)` | Number of listeners currently registered for a query. Drops back to 0 after a hook unmounts, so it doubles as a cleanup assertion. |
 * | `resetMatchMedia()` | Clears all query state and listeners and reinstalls the stub. Runs automatically before and after every test. |
 * | `removeMatchMedia()` | Deletes `window.matchMedia` entirely, for the "media queries unavailable" fallback path. `resetMatchMedia()` puts it back. |
 *
 * Unregistered queries default to `matches: false`, which mirrors a browser
 * that does not match the query rather than throwing.
 */
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach } from 'vitest';

type ChangeListener = (event: MediaQueryListEvent) => void;

interface QueryRecord {
  matches: boolean;
  listeners: Set<ChangeListener>;
  instances: Set<StubMediaQueryList>;
}

interface StubMediaQueryList {
  media: string;
  readonly matches: boolean;
  onchange: ChangeListener | null;
  addEventListener(type: string, listener: ChangeListener): void;
  removeEventListener(type: string, listener: ChangeListener): void;
  addListener(listener: ChangeListener): void;
  removeListener(listener: ChangeListener): void;
  dispatchEvent(event: Event): boolean;
}

const registry = new Map<string, QueryRecord>();

function recordFor(query: string): QueryRecord {
  const existing = registry.get(query);
  if (existing) return existing;
  const created: QueryRecord = { matches: false, listeners: new Set(), instances: new Set() };
  registry.set(query, created);
  return created;
}

function createMediaQueryList(query: string): StubMediaQueryList {
  const record = recordFor(query);

  const mql: StubMediaQueryList = {
    media: query,
    get matches(): boolean {
      // Read through to the registry so state set after construction is visible.
      return recordFor(query).matches;
    },
    onchange: null,
    addEventListener(type: string, listener: ChangeListener): void {
      if (type !== 'change') return;
      record.listeners.add(listener);
    },
    removeEventListener(type: string, listener: ChangeListener): void {
      if (type !== 'change') return;
      record.listeners.delete(listener);
    },
    addListener(listener: ChangeListener): void {
      record.listeners.add(listener);
    },
    removeListener(listener: ChangeListener): void {
      record.listeners.delete(listener);
    },
    dispatchEvent(event: Event): boolean {
      if (event.type !== 'change') return true;
      notify(query, recordFor(query).matches);
      return true;
    },
  };

  record.instances.add(mql);
  return mql;
}

function notify(query: string, matches: boolean): void {
  const record = recordFor(query);
  const event = { type: 'change', media: query, matches } as unknown as MediaQueryListEvent;
  for (const listener of [...record.listeners]) listener(event);
  for (const instance of [...record.instances]) instance.onchange?.call(instance, event);
}

/** Sets the match state for `query` without notifying listeners. */
export function setMatchMedia(query: string, matches: boolean): void {
  recordFor(query).matches = matches;
}

/** Sets the match state for `query` and fires a `change` event at its listeners. */
export function dispatchMatchMediaChange(query: string, matches: boolean): void {
  recordFor(query).matches = matches;
  notify(query, matches);
}

/** Listeners currently registered for `query`; 0 once subscribers have cleaned up. */
export function matchMediaListenerCount(query: string): number {
  return registry.get(query)?.listeners.size ?? 0;
}

/** Reads the current match state for `query` (`false` when never set). */
export function getMatchMedia(query: string): boolean {
  return registry.get(query)?.matches ?? false;
}

/** Clears all recorded state and listeners, then reinstalls the stub. */
export function resetMatchMedia(): void {
  registry.clear();
  installMatchMedia();
}

/** Removes `window.matchMedia` to exercise the unsupported-engine fallback. */
export function removeMatchMedia(): void {
  if (typeof window === 'undefined') return;
  Reflect.deleteProperty(window, 'matchMedia');
}

function installMatchMedia(): void {
  // Node-environment suites (the build-time script tests) have no DOM to stub.
  if (typeof window === 'undefined') return;

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string): MediaQueryList => createMediaQueryList(query) as unknown as MediaQueryList,
  });
}

installMatchMedia();

// Every test starts and ends with a clean stub: no leaked match state, no
// listeners left over from an unmounted component.
beforeEach(() => {
  resetMatchMedia();
});

afterEach(() => {
  resetMatchMedia();
});

const helpers = {
  setMatchMedia,
  dispatchMatchMediaChange,
  matchMediaListenerCount,
  getMatchMedia,
  resetMatchMedia,
  removeMatchMedia,
} as const;

Object.assign(globalThis, helpers);

declare global {
  /* eslint-disable no-var */
  var setMatchMedia: (query: string, matches: boolean) => void;
  var dispatchMatchMediaChange: (query: string, matches: boolean) => void;
  var matchMediaListenerCount: (query: string) => number;
  var getMatchMedia: (query: string) => boolean;
  var resetMatchMedia: () => void;
  var removeMatchMedia: () => void;
  /* eslint-enable no-var */
}
