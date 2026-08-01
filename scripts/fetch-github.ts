/**
 * Build-time project enrichment.
 *
 * Requests the public repository list for `Mr-W-Squidward` from the GitHub REST
 * API and emits `src/data/generated/projects.generated.ts`. Runs under `tsx`;
 * Node 20's native `fetch` and `AbortSignal.timeout` keep it free of runtime
 * dependencies.
 *
 * Every failure path — unreachable network, rate limit, missing account, any
 * other non-2xx, an unparseable body, or a body that is not an array of
 * repositories — logs a warning, writes the curated fallback module, and exits
 * `0`, so a build never fails because GitHub is unavailable. The single
 * deliberate exception is a filesystem write failure, which is rethrown: an
 * unwritable output path would only resurface downstream as a confusing
 * module-not-found error.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { curatedProjects } from '../src/data/curatedProjects';
import type { GeneratedProjectData, RepoSummary } from '../src/types';

/** GitHub user whose public repositories drive the Projects section. */
export const USERNAME = 'Mr-W-Squidward';

/**
 * Owner-only repository listing, freshest first. `per_page=100` fits the whole
 * account in one request, so no pagination loop is needed.
 */
export const ENDPOINT =
  `https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=pushed&type=owner`;

/** Request budget; a hanging network surfaces as a rejection instead of stalling CI. */
export const REQUEST_TIMEOUT_MS = 10_000;

/**
 * The subset of the GitHub repository payload this script reads. Everything
 * else in the response is ignored, and `validateRepos` checks this shape
 * before any field is trusted.
 */
export interface RawRepo {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  html_url: string;
  fork: boolean;
  archived: boolean;
  private: boolean;
  /** ISO 8601 timestamp of the last push; drives the freshness score. */
  pushed_at: string;
}

/**
 * Builds the request headers, adding `Authorization` when a non-empty
 * `GITHUB_TOKEN` is available and warning about the unauthenticated rate ceiling
 * when it is not.
 */
export function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': `${USERNAME}-portfolio-build`,
  };

  const token = process.env.GITHUB_TOKEN?.trim();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn(
      '[fetch-github] No GITHUB_TOKEN set; unauthenticated GitHub rate limit is 60 requests per hour.',
    );
  }

  return headers;
}

/**
 * A non-2xx GitHub response. Carries the status and the `x-ratelimit-reset`
 * header (when the response supplied one) so `describe` can render the right
 * warning without re-reading the response.
 */
export class GitHubStatusError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly rateLimitReset: string | null;

  constructor(status: number, statusText: string, rateLimitReset: string | null) {
    super(`GitHub responded with HTTP ${status}`);
    this.name = 'GitHubStatusError';
    this.status = status;
    this.statusText = statusText;
    this.rateLimitReset = rateLimitReset;
  }
}

/** The response body could not be parsed as JSON. */
export class ResponseParseError extends Error {
  constructor(readonly detail: string) {
    super(`GitHub response body is not valid JSON: ${detail}`);
    this.name = 'ResponseParseError';
  }
}

/** The parsed body is not an array of repository shapes. */
export class RepoShapeError extends Error {
  constructor() {
    super('GitHub response body is not an array of repository objects');
    this.name = 'RepoShapeError';
  }
}

/**
 * Issues the repository request and returns the parsed body.
 *
 * Failures are classified here so the caller owns exactly one `catch`: a
 * rejected `fetch` or an abort from the timeout propagates untouched, a non-2xx
 * status becomes a `GitHubStatusError`, and an unparseable body becomes a
 * `ResponseParseError`. Shape validation is the caller's step, since it needs
 * the parsed value either way.
 */
export async function fetchRepos(): Promise<unknown> {
  const response = await fetch(ENDPOINT, {
    headers: buildHeaders(),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new GitHubStatusError(
      response.status,
      response.statusText,
      response.headers?.get('x-ratelimit-reset') ?? null,
    );
  }

  try {
    return await response.json();
  } catch (error) {
    throw new ResponseParseError(error instanceof Error ? error.message : String(error));
  }
}

/**
 * Collapses a name to lowercase alphanumerics so `drawOff`, `draw-off`, and
 * `DrawOff` all match as `drawoff`. Mirrors `norm` in `src/data/projects.ts`;
 * the two are kept separate so the script pulls in no runtime code from the
 * app bundle.
 */
export const norm = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]/g, '');

/** Hard cap on how many repositories reach the generated module. */
export const MAX_EMITTED = 12;

/** Freshness window: a push older than this contributes nothing to the score. */
const FRESHNESS_WINDOW_DAYS = 400;

/** Score weight per star; the curated boost is far larger than any plausible total. */
const STARS_WEIGHT = 50;

/** Outranks any achievable stars-plus-freshness total, so curated repos always survive. */
const CURATED_BOOST = 1_000_000;

const MS_PER_DAY = 86_400_000;

/**
 * Curated match keys: every curated display name plus its `repoAliases`.
 * Aliases are authored pre-normalized, and `norm` is idempotent, so passing
 * both through the same normalization is safe.
 */
export const CURATED_KEYS: readonly string[] = curatedProjects.flatMap((project) => [
  project.name,
  ...(project.repoAliases ?? []),
]);

/**
 * Whole and fractional days between `pushed_at` and now. A missing or
 * unparseable timestamp reports `Infinity`, which zeroes the freshness term
 * instead of throwing.
 */
export function daysSince(iso: string, now: number = Date.now()): number {
  if (!iso) return Number.POSITIVE_INFINITY;
  const pushed = Date.parse(iso);
  if (Number.isNaN(pushed)) return Number.POSITIVE_INFINITY;
  return Math.max(0, (now - pushed) / MS_PER_DAY);
}

/** Projects a raw payload entry onto the five fields the app consumes. */
export function toSummary(repo: RawRepo): RepoSummary {
  return {
    name: repo.name,
    description: repo.description ?? null,
    language: repo.language ?? null,
    stars: repo.stargazers_count,
    htmlUrl: repo.html_url,
  };
}

/**
 * Filters, ranks, and caps the fetched repositories.
 *
 * Forks, archived, and private repositories are dropped outright. What remains
 * is ranked by a curated boost that dominates stars and freshness, so the
 * curated projects are retained whatever their star count, with a name
 * tiebreak keeping the order deterministic for equal scores.
 */
export function selectRepos(
  raw: readonly RawRepo[],
  curatedNames: readonly string[] = CURATED_KEYS,
  now: number = Date.now(),
): RepoSummary[] {
  const curatedKeys = new Set(curatedNames.map(norm));
  const eligible = raw.filter((repo) => !repo.fork && !repo.archived && !repo.private);

  const score = (repo: RawRepo): number => {
    const curatedBoost = curatedKeys.has(norm(repo.name)) ? CURATED_BOOST : 0;
    const freshness = Math.max(0, FRESHNESS_WINDOW_DAYS - daysSince(repo.pushed_at, now));
    return curatedBoost + repo.stargazers_count * STARS_WEIGHT + freshness;
  };

  return [...eligible]
    .sort((a, b) => score(b) - score(a) || a.name.localeCompare(b.name))
    .slice(0, MAX_EMITTED)
    .map(toSummary);
}

/**
 * Hand-written type guard for one repository entry, keeping the script free of
 * a schema dependency. Only the fields the script reads are checked; the
 * booleans and `pushed_at` are consumed defensively above, so a payload missing
 * them degrades to "not curated, not fresh" rather than failing validation.
 */
export function isRawRepo(value: unknown): value is RawRepo {
  if (typeof value !== 'object' || value === null) return false;
  const repo = value as Record<string, unknown>;
  return (
    typeof repo.name === 'string' &&
    typeof repo.html_url === 'string' &&
    typeof repo.stargazers_count === 'number' &&
    (typeof repo.description === 'string' || repo.description === null) &&
    (typeof repo.language === 'string' || repo.language === null)
  );
}

/**
 * Guards the whole payload. GitHub's error bodies are objects rather than arrays,
 * so an unexpected body shape lands here rather than in selection.
 */
export function validateRepos(value: unknown): value is RawRepo[] {
  return Array.isArray(value) && value.every(isRawRepo);
}

/** Path of the emitted module, relative to this script. */
const DEFAULT_OUT_PATH = fileURLToPath(
  new URL('../src/data/generated/projects.generated.ts', import.meta.url),
);

/**
 * Resolves the output path. `FETCH_GITHUB_OUT` overrides the default so tests
 * can redirect the emitted module into a temporary directory.
 */
export function resolveOutPath(): string {
  const override = process.env.FETCH_GITHUB_OUT?.trim();
  return override ? resolve(override) : DEFAULT_OUT_PATH;
}

/** Success payload: the selected repositories stamped with the fetch time. */
export function successData(repos: readonly RepoSummary[]): GeneratedProjectData {
  return {
    source: 'github',
    fetchedAt: new Date().toISOString(),
    repos,
  };
}

/**
 * Fallback payload. An empty `repos` list — rather than curated entries reshaped
 * into repository form — keeps `mergeProjects` on one code path, where the curated
 * floor is the base case.
 */
export function fallbackData(): GeneratedProjectData {
  return {
    source: 'curated-fallback',
    fetchedAt: new Date().toISOString(),
    repos: [],
  };
}

/**
 * Writes the generated module. `JSON.stringify` produces the literal, so no
 * string escaping is hand-rolled.
 *
 * A write failure is logged and rethrown rather than swallowed: an unwritable
 * output path stops the build here with a clear cause instead of surfacing as a
 * module-not-found error later.
 */
export function write(data: GeneratedProjectData, outPath: string = resolveOutPath()): void {
  const contents = `/**
 * AUTO-GENERATED by \`npm run data\` (scripts/fetch-github.ts). Do not edit.
 *
 * This path is gitignored and is overwritten on every \`dev\`, \`test\`,
 * \`typecheck\`, and \`build\` run. A \`source\` of \`curated-fallback\` with an empty
 * \`repos\` list means the GitHub request did not yield usable data, in which
 * case \`mergeProjects\` renders exactly the curated floor.
 */

import type { GeneratedProjectData } from '../../types';

export const generatedProjectData: GeneratedProjectData = ${JSON.stringify(data, null, 2)};
`;

  try {
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, contents, 'utf8');
  } catch (error) {
    console.error(
      `[fetch-github] Failed to write ${outPath}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    throw error;
  }
}

/**
 * Renders one warning sentence per row of the failure table, so the log names
 * the actual cause instead of a generic "fetch failed".
 */
export function describe(error: unknown): string {
  if (error instanceof GitHubStatusError) {
    if (error.status === 403 || error.status === 429) {
      const reset = error.rateLimitReset;
      const resetNote = reset ? ` x-ratelimit-reset=${reset}.` : '';
      return `GitHub rate limit reached (HTTP ${error.status}).${resetNote}`;
    }
    if (error.status === 404) {
      return `GitHub returned HTTP 404 for user ${USERNAME}; the account or its repository list could not be read.`;
    }
    const statusText = error.statusText ? ` ${error.statusText}` : '';
    return `GitHub returned HTTP ${error.status}${statusText}.`;
  }

  if (error instanceof ResponseParseError) {
    return `Could not parse the GitHub response body as JSON: ${error.detail}.`;
  }

  if (error instanceof RepoShapeError) {
    return 'The GitHub response body did not match the expected repository shape.';
  }

  if (error instanceof Error) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      return `The GitHub request timed out after ${REQUEST_TIMEOUT_MS} ms.`;
    }
    return `The GitHub request could not be completed: ${error.message}.`;
  }

  return `The GitHub request could not be completed: ${String(error)}.`;
}

/** Backstop before the process is forced down; see `exitZero`. */
export const FORCED_EXIT_DELAY_MS = 500;

/**
 * Ends the run with status `0`.
 *
 * `process.exitCode` is the primary mechanism rather than a bare
 * `process.exit(0)`: Node on Windows aborts with a libuv assertion
 * (`!(handle->flags & UV_HANDLE_CLOSING)`) when the process is torn down while
 * the sockets from a just-completed `fetch` are still closing, which would
 * report a crash code for an otherwise successful run. Letting the loop drain
 * exits cleanly at `0`, and the unref'd timer forces `process.exit(0)` if some
 * handle refuses to release, so the script can never hang a build either.
 */
export function exitZero(): void {
  process.exitCode = 0;
  setTimeout(() => process.exit(0), FORCED_EXIT_DELAY_MS).unref();
}

/**
 * Entry point. One `try/catch` covers every failure mode; the catch logs the
 * specific cause and writes the curated fallback. The exit code is always `0`, so
 * an unreachable GitHub never fails a build.
 */
export async function main(): Promise<void> {
  try {
    const body = await fetchRepos();
    if (!validateRepos(body)) throw new RepoShapeError();

    const repos = selectRepos(body);
    if (repos.length === 0) {
      console.log(
        '[fetch-github] GitHub returned no eligible repositories; emitting an empty repository list.',
      );
    }
    write(successData(repos));
  } catch (error) {
    console.warn(`[fetch-github] ${describe(error)} Falling back to curated project data.`);
    write(fallbackData());
  }

  exitZero();
}

/**
 * Only run when invoked as the process entry point, so importing this module in
 * a test does not fire a request or overwrite the generated file.
 */
function isEntryPoint(): boolean {
  const invoked = process.argv[1];
  if (!invoked) return false;
  try {
    return resolve(invoked) === fileURLToPath(import.meta.url);
  } catch {
    return false;
  }
}

if (isEntryPoint()) {
  await main();
}
