/**
 * Theme token registry — the single source of truth for every color on the site.
 * `tailwind.config.ts` imports it instead of re-declaring hex values, and the
 * palette-discipline test imports it too. One registry, two consumers, no drift.
 */

/** The fixed decorative color set. */
export const palette = {
  magenta: '#e91e8c',
  blue: '#29b6f6',
  gold: '#ffd54f',
  grass: '#4caf50',
  grassLight: '#66bb6a',
  outline: '#000000',
} as const;

/** Content section surfaces. Not decorative accents. */
export const surfaces = {
  base: '#0d0a12', // section background
  panel: '#171122', // cards, timeline steps
} as const;

/** Body and metadata text colors. Not decorative accents. */
export const ink = {
  primary: '#f5f3f7',
  muted: '#c9c2d4',
} as const;

/**
 * Hero name lettering and tagline hues.
 *
 * The yellow-to-red gradient fill on the name and the red-orange tagline are
 * content hues that lie outside the decorative palette, so they live in this
 * separate export. The palette-discipline check excludes them by construction: it
 * walks the decorative registry (`palette` plus `derivedTints`) and never reads
 * `lettering`. Scoped to the hero lettering and tagline only — nothing else may
 * consume these values.
 */
export const lettering = {
  flareYellow: palette.gold,
  flareRed: '#e5342b',
} as const;

/**
 * Hero sky gradient stops. No new hue is introduced: each stop is a tint or shade
 * of `palette.magenta`, matching the `color-mix(in oklab, ...)` values in
 * `.hero-sky` with these literals declared first as the fallback.
 */
export const skyGradient = {
  top: '#f26bb0', // magenta 62% + white
  middle: palette.magenta,
  bottom: '#b6166d', // magenta 78% + black
} as const;

export type PaletteName = keyof typeof palette;

/** A decorative value derived from exactly one palette member. */
export interface DerivedTint {
  /** The single palette member this value is derived from. */
  readonly base: PaletteName;
  /** Whether the base was mixed toward white (tint) or black (shade). */
  readonly mix: 'white' | 'black';
  /** Percentage of the base retained in the `color-mix(in oklab, ...)` call. */
  readonly basePercent: number;
}

/**
 * Documented tints and shades, keyed by the literal hex they resolve to.
 * Every decorative color that is not a `palette` member must appear here with
 * its single base member recorded, which is what makes the palette-discipline
 * check decidable rather than a judgement call.
 */
export const derivedTints: Readonly<Record<string, DerivedTint>> = {
  [skyGradient.top]: { base: 'magenta', mix: 'white', basePercent: 62 },
  [skyGradient.bottom]: { base: 'magenta', mix: 'black', basePercent: 78 },
} as const;

/** A color value that is scoped to the hero and section dividers. */
export interface HeroOnlyToken {
  /** Stable name used in structural assertions and error messages. */
  readonly name: string;
  readonly value: string;
}

/**
 * Colors confined to the hero and section divider accents: the magenta sky
 * gradient stops and the platform greens. The structural check for hero-scoped
 * colors reads this list rather than re-listing hex values.
 */
export const heroOnlyTokens: readonly HeroOnlyToken[] = [
  { name: 'skyGradient.top', value: skyGradient.top },
  { name: 'skyGradient.middle', value: skyGradient.middle },
  { name: 'skyGradient.bottom', value: skyGradient.bottom },
  { name: 'palette.grass', value: palette.grass },
  { name: 'palette.grassLight', value: palette.grassLight },
] as const;

/** True when `value` is a palette member, case-insensitively. */
export function isPaletteMember(value: string): boolean {
  const hex = value.trim().toLowerCase();
  return Object.values(palette).some((member) => member === hex);
}

/**
 * True when `value` is permitted as a decorative color: a palette member, or a
 * documented tint/shade of exactly one palette member.
 */
export function isAllowedDecorativeColor(value: string): boolean {
  const hex = value.trim().toLowerCase();
  return isPaletteMember(hex) || hex in derivedTints;
}
