// @vitest-environment node
/**
 * Tests for the GitHub fetch script.
 *
 * The script's contract is about the artifact it leaves behind, so the
 * round-trip tests actually run `main()` and import the emitted module rather
 * than inspecting an in-memory value.
 *
 * ## Harness notes
 *
 * `FETCH_GITHUB_OUT` redirects the emitted module into a throwaway directory,
 * so the checked-in `src/data/generated/projects.generated.ts` is never touched.
 * That directory lives under this test directory rather than the OS temp dir
 * because Vite's module graph only loads files beneath the project root, and
 * the emitted module has to be *imported* for the round trip to prove anything.
 * The import specifier is relative for the same reason, with a cache-busting
 * query so each run reads the file just written instead of a cached module.
 *
 * `main()` reports success through `process.exitCode` and arms an unref'd
 * `process.exit(0)` watchdog (see `exitZero`), so the assertions read
 * `process.exitCode`, `setTimeout` is faked so no watchdog ever runs, and
 * `process.exit` is overridden for the whole file as a backstop: a watchdog
 * firing mid-property would otherwise tear down the test worker.
 *
 * The suite runs in the `node` environment (see the docblock pragma above): the
 * script resolves its default output path from `import.meta.url`, which is not
 * a `file:` URL under jsdom.
 */
import { mkdtempSync, rmSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import fc from 'fast-check';
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { GeneratedProjectData } from '../../src/types';
import {
  buildHeaders,
  CURATED_KEYS,
  ENDPOINT,
  fetchRepos,
  main,
  MAX_EMITTED,
  norm,
  resolveOutPath,
  selectRepos,
  USERNAME,
  type RawRepo,
} from '../fetch-github';

const TEST_DIR = dirname(fileURLToPath(import.meta.url));

/** Throwaway output directory, inside the project root so Vite can load from it. */
const tempDir = mkdtempSync(join(TEST_DIR, '__tmp-fetch-github-'));
const outPath = join(tempDir, 'projects.generated.ts');

/** Relative specifier for the emitted module; Vite resolves it against this file. */
const OUT_SPECIFIER = `./${relative(TEST_DIR, outPath).replace(/\\/g, '/')}`;

const ORIGINAL_TOKEN = process.env.GITHUB_TOKEN;
const ORIGINAL_OUT = process.env.FETCH_GITHUB_OUT;

/**
 * `exitZero` arms a `process.exit(0)` watchdog on every `main()` call. Faking
 * `setTimeout` keeps those timers from ever running, and this override is the
 * backstop for any that escape the fake clock — Vitest turns a real
 * `process.exit` into a thrown error that would fail an unrelated test.
 */
const REAL_EXIT = process.exit;
process.exit = ((): void => undefined) as unknown as typeof process.exit;

let fetchMock = vi.fn();
let warnSpy = vi.spyOn(console, 'warn');
let previousExitCode: typeof process.exitCode;
let importCount = 0;

/** Imports the module just written, bypassing the module cache from prior runs. */
async function importGenerated(): Promise<GeneratedProjectData> {
  const loaded = (await import(`${OUT_SPECIFIER}?run=${importCount++}`)) as {
    generatedProjectData: GeneratedProjectData;
  };
  return loaded.generatedProjectData;
}

/** Minimal stand-in for the parts of `Response` the script reads. */
function response(init: {
  status?: number;
  statusText?: string;
  rateLimitReset?: string | null;
  json: () => Promise<unknown>;
}) {
  const status = init.status ?? 200;
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: init.statusText ?? 'OK',
    headers: {
      get: (name: string): string | null =>
        name.toLowerCase() === 'x-ratelimit-reset' ? (init.rateLimitReset ?? null) : null,
    },
    json: init.json,
  };
}

/** A 200 response carrying `payload` as its JSON body. */
function okResponse(payload: unknown) {
  return response({ json: () => Promise.resolve(payload) });
}

/** Repository fixture with every field the script reads. */
function raw(overrides: Partial<RawRepo> & { name: string }): RawRepo {
  return {
    description: 'A fetched repository.',
    language: 'TypeScript',
    stargazers_count: 0,
    html_url: `https://github.com/${USERNAME}/${overrides.name}`,
    fork: false,
    archived: false,
    private: false,
    pushed_at: new Date().toISOString(),
    ...overrides,
  };
}

beforeEach(() => {
  // Only `setTimeout` is faked: `Date` stays real so the freshness ranking the
  // script computes matches the one the assertions recompute.
  vi.useFakeTimers({ toFake: ['setTimeout'] });

  process.env.FETCH_GITHUB_OUT = outPath;
  previousExitCode = process.exitCode;
  process.exitCode = undefined;

  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);

  warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  vi.spyOn(console, 'log').mockImplementation(() => undefined);
});

afterEach(() => {
  // Discards every watchdog timer armed during the test.
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  process.exitCode = previousExitCode;

  if (ORIGINAL_TOKEN === undefined) delete process.env.GITHUB_TOKEN;
  else process.env.GITHUB_TOKEN = ORIGINAL_TOKEN;

  if (ORIGINAL_OUT === undefined) delete process.env.FETCH_GITHUB_OUT;
  else process.env.FETCH_GITHUB_OUT = ORIGINAL_OUT;
});

afterAll(() => {
  process.exit = REAL_EXIT;
  rmSync(tempDir, { recursive: true, force: true });
});

/**
 * Payload generator.
 *
 * `pushed_at` stays inside the 400-day freshness window so no score is clamped
 * to zero: every score then shifts by the same amount as the clock advances,
 * which keeps the ranking the script computed identical to the one the
 * assertion recomputes moments later.
 */
const FRESH_WINDOW_MS = 200 * 86_400_000;

const rawRepo: fc.Arbitrary<RawRepo> = fc.record({
  name: fc.oneof(
    { arbitrary: fc.constantFrom(...CURATED_KEYS), weight: 2 },
    { arbitrary: fc.string({ minLength: 1, maxLength: 16 }), weight: 5 },
  ),
  description: fc.option(fc.string({ maxLength: 40 }), { nil: null }),
  language: fc.option(fc.constantFrom('TypeScript', 'Python', 'Lua', 'C++'), { nil: null }),
  stargazers_count: fc.nat({ max: 5_000 }),
  html_url: fc.webUrl(),
  fork: fc.boolean(),
  archived: fc.boolean(),
  private: fc.boolean(),
  pushed_at: fc
    .integer({ min: 0, max: FRESH_WINDOW_MS })
    .map((age) => new Date(Date.now() - age).toISOString()),
});

/** Includes the empty payload and payloads longer than the emitted cap. */
const rawPayload = fc.array(rawRepo, { maxLength: MAX_EMITTED + 4 });

describe('fetch-github: output redirection', () => {
  it('writes to the redirected path, never to the checked-in generated module', () => {
    expect(resolveOutPath()).toBe(outPath);
    expect(resolveOutPath()).not.toContain(join('src', 'data', 'generated'));
  });
});

describe('fetch-github: success path', () => {
  beforeEach(() => {
    process.env.GITHUB_TOKEN = 'harness-token';
  });

  it('Feature: dbz-pixel-portfolio, Property 8: Generated data round trip', async () => {
    await fc.assert(
      fc.asyncProperty(rawPayload, async (payload) => {
        fetchMock.mockResolvedValue(okResponse(payload));

        await main();
        const data = await importGenerated();
        const expected = selectRepos(payload);

        expect(data.source).toBe('github');
        expect(
          data.repos,
          'the emitted list must hold exactly the selected repositories.',
        ).toHaveLength(expected.length);

        expected.forEach((repo, index) => {
          const emitted = data.repos[index];
          expect(emitted).toBeDefined();
          expect(emitted?.name).toBe(repo.name);
          expect(emitted?.description).toBe(repo.description);
          expect(emitted?.language).toBe(repo.language);
          expect(emitted?.stars).toBe(repo.stars);
          expect(emitted?.htmlUrl).toBe(repo.htmlUrl);
        });
      }),
      { numRuns: 100 },
    );
  });

  it('requests the owner repository list for the configured user (Req 6.2)', async () => {
    fetchMock.mockResolvedValue(okResponse([]));

    await fetchRepos();

    expect(fetchMock.mock.calls[0]?.[0]).toBe(ENDPOINT);
    expect(ENDPOINT).toContain(USERNAME);
  });
});

describe('fetch-github: authorization', () => {
  /** Any token whose trimmed form is non-empty; `buildHeaders` trims before use. */
  const token = fc.string({ minLength: 1, maxLength: 40 }).filter((value) => value.trim() !== '');

  it('Feature: dbz-pixel-portfolio, Property 9: Token authorization passthrough', async () => {
    await fc.assert(
      fc.asyncProperty(token, async (value) => {
        process.env.GITHUB_TOKEN = value;
        fetchMock.mockResolvedValue(okResponse([]));

        await fetchRepos();

        const call = fetchMock.mock.calls.at(-1);
        const headers = (call?.[1]?.headers ?? {}) as Record<string, string | undefined>;
        expect(headers.Authorization).toContain(value.trim());
        expect(headers.Authorization).toBe(`Bearer ${value.trim()}`);
      }),
      { numRuns: 100 },
    );
  });

  it('logs the 60-requests-per-hour ceiling when no token is set (Req 6.4)', () => {
    delete process.env.GITHUB_TOKEN;

    const headers = buildHeaders();

    expect(headers.Authorization).toBeUndefined();
    expect(headers.Accept).toBe('application/vnd.github+json');
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('60 requests per hour'));
  });
});

/** One way the request can fail, as fed to the `fetch` stub. */
type FailureMode =
  | { kind: 'reject'; message: string }
  | { kind: 'status'; status: number; statusText: string; rateLimitReset: string | null }
  | { kind: 'parse'; detail: string }
  | { kind: 'shape'; body: unknown };

/** Every status outside 2xx, weighted toward the ones worth calling out. */
const nonSuccessStatus = fc.oneof(
  { arbitrary: fc.constantFrom(403, 429, 404), weight: 4 },
  { arbitrary: fc.constantFrom(301, 401, 418, 500, 502, 503), weight: 2 },
  {
    arbitrary: fc.integer({ min: 100, max: 599 }).filter((status) => status < 200 || status > 299),
    weight: 1,
  },
);

/** Valid JSON that is not an array of repository shapes. */
const notARepoArray: fc.Arbitrary<unknown> = fc.oneof(
  fc.constant(null),
  fc.string({ maxLength: 20 }),
  fc.integer(),
  fc.boolean(),
  fc.record({ message: fc.string({ maxLength: 20 }), documentation_url: fc.webUrl() }),
  fc.array(fc.oneof(fc.integer(), fc.string({ maxLength: 8 }), fc.constant(null)), {
    minLength: 1,
    maxLength: 4,
  }),
  // Array of objects that miss or mistype the required repository fields.
  fc.array(fc.record({ name: fc.integer(), html_url: fc.integer() }), {
    minLength: 1,
    maxLength: 3,
  }),
);

const failureMode: fc.Arbitrary<FailureMode> = fc.oneof(
  fc.record({
    kind: fc.constant('reject' as const),
    message: fc.string({ minLength: 1, maxLength: 24 }),
  }),
  fc.record({
    kind: fc.constant('status' as const),
    status: nonSuccessStatus,
    statusText: fc.constantFrom('Forbidden', 'Not Found', 'Internal Server Error', ''),
    rateLimitReset: fc.option(fc.integer({ min: 0 }).map(String), { nil: null }),
  }),
  fc.record({
    kind: fc.constant('parse' as const),
    detail: fc.string({ minLength: 1, maxLength: 24 }),
  }),
  fc.record({ kind: fc.constant('shape' as const), body: notARepoArray }),
);

/** Points the `fetch` stub at one failure mode. */
function arrangeFailure(mode: FailureMode): void {
  fetchMock.mockReset();

  switch (mode.kind) {
    case 'reject':
      fetchMock.mockRejectedValue(new Error(mode.message));
      return;
    case 'status':
      fetchMock.mockResolvedValue(
        response({
          status: mode.status,
          statusText: mode.statusText,
          rateLimitReset: mode.rateLimitReset,
          json: () => Promise.resolve({}),
        }),
      );
      return;
    case 'parse':
      fetchMock.mockResolvedValue(
        response({ json: () => Promise.reject(new SyntaxError(mode.detail)) }),
      );
      return;
    case 'shape':
      fetchMock.mockResolvedValue(okResponse(mode.body));
      return;
  }
}

describe('fetch-github: failure paths', () => {
  beforeEach(() => {
    // A token keeps the unauthenticated notice out of the warning assertions.
    process.env.GITHUB_TOKEN = 'harness-token';
  });

  it('Feature: dbz-pixel-portfolio, Property 10: Fallback totality', async () => {
    await fc.assert(
      fc.asyncProperty(failureMode, async (mode) => {
        arrangeFailure(mode);
        warnSpy.mockClear();
        process.exitCode = undefined;

        await main();

        const warnings = warnSpy.mock.calls.map((call) => String(call[0]));
        expect(warnings, `${mode.kind} should log a warning.`).not.toHaveLength(0);
        expect(
          warnings.some(
            (warning) =>
              warning.includes('[fetch-github]') &&
              warning.includes('Falling back to curated project data.'),
          ),
          `${mode.kind} should log the fallback warning.`,
        ).toBe(true);

        if (mode.kind === 'status' && mode.status === 404) {
          expect(
            warnings.join('\n'),
            'the 404 warning must name the requested user.',
          ).toContain(USERNAME);
        }

        // Importing the emitted module is the syntactic-validity check.
        const data = await importGenerated();
        expect(data.source).toBe('curated-fallback');
        expect(data.repos).toEqual([]);
        expect(typeof data.fetchedAt).toBe('string');

        expect(process.exitCode, 'a failed fetch must still exit 0.').toBe(0);
      }),
      { numRuns: 100 },
    );
  });
});

describe('fetch-github: selection', () => {
  it('drops forks, archived, and private repositories', () => {
    const selected = selectRepos([
      raw({ name: 'kept' }),
      raw({ name: 'forked', fork: true }),
      raw({ name: 'retired', archived: true }),
      raw({ name: 'hidden', private: true }),
    ]);

    expect(selected.map((repo) => repo.name)).toEqual(['kept']);
  });

  it('keeps a curated repository ahead of fresher, more popular ones', () => {
    const stale = new Date(Date.now() - 900 * 86_400_000).toISOString();
    const rivals = Array.from({ length: MAX_EMITTED + 6 }, (_, index) =>
      raw({ name: `rival-${index}`, stargazers_count: 4_000 + index }),
    );

    const selected = selectRepos([
      raw({ name: 'draw-off', stargazers_count: 0, pushed_at: stale }),
      ...rivals,
    ]);

    expect(CURATED_KEYS.map(norm)).toContain(norm('draw-off'));
    expect(selected[0]?.name).toBe('draw-off');
  });

  it('matches curated entries through their aliases', () => {
    const selected = selectRepos([
      raw({ name: 'studyquestapp', stargazers_count: 0 }),
      ...Array.from({ length: MAX_EMITTED + 2 }, (_, index) =>
        raw({ name: `rival-${index}`, stargazers_count: 2_000 }),
      ),
    ]);

    expect(CURATED_KEYS).toContain('studyquestapp');
    expect(selected.map((repo) => repo.name)).toContain('studyquestapp');
  });

  it('caps the emitted list at twelve repositories', () => {
    const selected = selectRepos(
      Array.from({ length: 25 }, (_, index) => raw({ name: `repo-${index}` })),
    );

    expect(MAX_EMITTED).toBe(12);
    expect(selected).toHaveLength(12);
  });
});
