/**
 * Shared data types for the portfolio.
 *
 * Every content module in `src/data` and the build-time GitHub script speak
 * through these types, so copy can change without touching render logic.
 */

/**
 * Accent keys drawn from the palette in `src/theme/tokens.ts`.
 *
 * `outline` is intentionally excluded: it is the black stroke token for pixel art,
 * never an accent for content.
 */
export type PaletteAccent = 'magenta' | 'blue' | 'gold' | 'grass' | 'grassLight';

/** One role in the experience timeline. */
export interface ExperienceEntry {
  id: string;
  title: string;
  organization: string;
  /** Verbatim display range, e.g. `Jun 2025 – Present`. */
  dateRange: string;
  /** true when `dateRange` ends in "Present"; drives recency ordering. */
  ongoing: boolean;
  /** ISO year-month of the role's end, or null when ongoing. */
  endedAt: string | null;
  highlights: readonly string[];
  markerColor: PaletteAccent;
}

/**
 * One entry in the project grid.
 *
 * Curated entries are authoritative for `name`, `description`, and
 * `technologies`; the GitHub merge only enriches `repoUrl`, `stars`, and
 * `language`.
 */
export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: readonly string[];
  repoUrl?: string;
  liveUrl?: string;
  /** 'curated' entries are authoritative; 'github' entries are discovered extras. */
  origin: 'curated' | 'github';
  stars?: number;
  language?: string | null;
  /**
   * Normalized repository keys to match against when the repository name
   * diverges from the display name (e.g. `draw-off` for `drawOff`).
   */
  repoAliases?: readonly string[];
}

/** One row of the skills inventory. */
export interface SkillGroup {
  label: 'Languages' | 'Frameworks' | 'Tools';
  accent: PaletteAccent;
  skills: readonly string[];
}

/** One award or competition result. */
export interface Award {
  id: string;
  name: string;
  /** Rendered verbatim as visible text, e.g. "4th / 48". */
  placement: string;
  description: string;
  technologies: readonly string[];
}

/** One external or in-site destination rendered in the footer. */
export interface LinkEntry {
  id: string;
  /** Visible link text. */
  label: string;
  /** Accessible name identifying the destination. */
  accessibleName: string;
  href: string;
  /** true when the href leaves the origin; drives `target` and `rel`. */
  external: boolean;
  /** true for values awaiting replacement; renders a visible marker. */
  isPlaceholder?: boolean;
  /**
   * Visible marker text rendered adjacent to a placeholder link, so the
   * placeholder is legible on the page and not only in the data.
   */
  placeholderNote?: string;
}

/**
 * A single repository as emitted by the GitHub fetch script. Field-for-field the
 * surface that `mergeProjects` consumes; nothing else from the API payload is
 * carried through.
 */
export interface RepoSummary {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  htmlUrl: string;
}

/**
 * Contents of `src/data/generated/projects.generated.ts`. The script always emits
 * this shape, using `curated-fallback` with an empty `repos` list when the request
 * fails.
 */
export interface GeneratedProjectData {
  source: 'github' | 'curated-fallback';
  /** ISO 8601 timestamp of the fetch attempt. */
  fetchedAt: string;
  repos: readonly RepoSummary[];
}
