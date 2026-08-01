/**
 * Theme token invariants.
 *
 * The token registry is data, so the two rules that govern it are checkable as
 * arithmetic rather than as review comments:
 *
 * - Every foreground token permitted for body copy clears WCAG 4.5:1 against
 *   both readable section surfaces.
 * - Every decorative token is a palette member or a documented tint/shade of
 *   exactly one palette member, with the `lettering` export as the single
 *   documented exclusion.
 *
 * Both run over generated token pairs with `fast-check` at 100 runs, which is
 * what makes "every token" a claim about the whole registry instead of a
 * hand-picked sample that drifts when a token is added.
 */
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { contrastRatio, parseHex, relativeLuminance } from '../../lib/contrast';
import {
  derivedTints,
  heroOnlyTokens,
  ink,
  isAllowedDecorativeColor,
  isPaletteMember,
  lettering,
  palette,
  skyGradient,
  surfaces,
  type PaletteName,
} from '../tokens';

/** WCAG 2.1 AA minimum for normal-size text. */
const MIN_BODY_CONTRAST = 4.5;

/** The two background tokens body copy is painted on. */
const READABLE_SURFACES = [
  { name: 'surfaces.base', value: surfaces.base },
  { name: 'surfaces.panel', value: surfaces.panel },
] as const;

/**
 * Foreground tokens permitted for body copy and prose-length text on a content
 * section surface.
 *
 * Two palette members are deliberately absent:
 *
 * - `palette.magenta` measures 4.70:1 on `surfaces.base` but 4.41:1 on
 *   `surfaces.panel`, so it does not clear 4.5:1 everywhere body copy can sit.
 *   The design already restricts it to "section eyebrow labels and accents
 *   only, never body copy", so it is asserted separately against `base` rather
 *   than lowering the threshold for the whole set.
 * - `palette.outline` (`#000000`) is 1.07:1 on `base`. It is the art stroke
 *   token, never a text color, so it is excluded by role, not by exception.
 */
const BODY_COPY_FOREGROUNDS = [
  { name: 'ink.primary', value: ink.primary },
  { name: 'ink.muted', value: ink.muted },
  { name: 'palette.gold', value: palette.gold },
  { name: 'palette.blue', value: palette.blue },
  { name: 'palette.grassLight', value: palette.grassLight },
  { name: 'palette.grass', value: palette.grass },
] as const;

/**
 * Every decorative color the registry can hand to a component: the palette
 * itself, the documented tints, the hero sky stops, and the hero-scoped tokens.
 * The palette discipline check walks this list; it never reads `lettering`,
 * which is the exclusion the token file documents at its definition site.
 */
const DECORATIVE_TOKENS: readonly { name: string; value: string }[] = [
  ...Object.entries(palette).map(([key, value]) => ({ name: `palette.${key}`, value })),
  ...Object.entries(skyGradient).map(([key, value]) => ({ name: `skyGradient.${key}`, value })),
  ...Object.keys(derivedTints).map((value) => ({ name: `derivedTints["${value}"]`, value })),
  ...heroOnlyTokens.map((token) => ({ name: token.name, value: token.value })),
];

/**
 * Chroma as `(max channel - min channel) / 255`. Used instead of HSL/HSV
 * saturation because very dark colors report high saturation for a one-step
 * channel spread: `#0d0a12` is 0.44 in HSV but 0.03 here, which matches the
 * intent — it carries no perceptible hue.
 */
function chroma(hex: string): number {
  const { r, g, b } = parseHex(hex);
  return (Math.max(r, g, b) - Math.min(r, g, b)) / 255;
}

/** Above this, a value carries a visible hue and has to come from the palette. */
const NEUTRAL_CHROMA_MAX = 0.12;

/** Hue angle in degrees, `0` for achromatic values. */
function hue(hex: string): number {
  const { r, g, b } = parseHex(hex);
  const [rn, gn, bn] = [r / 255, g / 255, b / 255];
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  if (delta === 0) return 0;
  let degrees: number;
  if (max === rn) degrees = 60 * (((gn - bn) / delta) % 6);
  else if (max === gn) degrees = 60 * ((bn - rn) / delta + 2);
  else degrees = 60 * ((rn - gn) / delta + 4);
  return degrees < 0 ? degrees + 360 : degrees;
}

/** Smallest angular distance between two hues, in degrees. */
function hueDistance(a: number, b: number): number {
  const raw = Math.abs(a - b) % 360;
  return raw > 180 ? 360 - raw : raw;
}

/**
 * A `color-mix(in oklab, base X%, white|black)` shifts lightness, not hue, so a
 * documented tint stays within a couple of degrees of its base. 5 degrees is
 * loose enough for oklab rounding and tight enough to reject a second hue
 * smuggled in as a "tint".
 */
const MAX_TINT_HUE_DRIFT = 5;

describe('theme tokens: readable surface contrast', () => {
  it('Feature: dbz-pixel-portfolio, Property 20: Readable surface contrast', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...BODY_COPY_FOREGROUNDS),
        fc.constantFrom(...READABLE_SURFACES),
        (foreground, surface) => {
          const ratio = contrastRatio(foreground.value, surface.value);
          expect(
            ratio,
            `${foreground.name} (${foreground.value}) on ${surface.name} (${surface.value}) ` +
              `measures ${ratio.toFixed(2)}:1, below the ${MIN_BODY_CONTRAST}:1 minimum.`,
          ).toBeGreaterThanOrEqual(MIN_BODY_CONTRAST);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('renders panel lighter than base so base ratios bound card ratios', () => {
    expect(relativeLuminance(surfaces.panel)).toBeGreaterThan(
      relativeLuminance(surfaces.base),
    );

    // Both surfaces are darker than every body-copy foreground, so the lighter
    // surface always yields the smaller ratio. That ordering is what lets the
    // design quote a single table of ratios against `base` as a conservative
    // bound for text on cards.
    for (const foreground of BODY_COPY_FOREGROUNDS) {
      expect(
        contrastRatio(foreground.value, surfaces.base),
        `${foreground.name} should contrast at least as well on base as on panel.`,
      ).toBeGreaterThan(contrastRatio(foreground.value, surfaces.panel));
    }
  });

  it('restricts magenta to accents: it clears 4.5:1 on base only', () => {
    // Magenta is permitted for eyebrow labels and accent strokes on the base
    // surface, and is not a body-copy token, which the panel ratio makes
    // non-negotiable rather than stylistic.
    expect(contrastRatio(palette.magenta, surfaces.base)).toBeGreaterThanOrEqual(
      MIN_BODY_CONTRAST,
    );
    expect(contrastRatio(palette.magenta, surfaces.panel)).toBeLessThan(
      MIN_BODY_CONTRAST,
    );
    expect(BODY_COPY_FOREGROUNDS.map((token) => token.value)).not.toContain(
      palette.magenta,
    );
  });

  it('excludes the art outline token from the body-copy set', () => {
    expect(BODY_COPY_FOREGROUNDS.map((token) => token.value)).not.toContain(
      palette.outline,
    );
    expect(contrastRatio(palette.outline, surfaces.base)).toBeLessThan(
      MIN_BODY_CONTRAST,
    );
  });
});

describe('theme tokens: palette discipline', () => {
  it('Feature: dbz-pixel-portfolio, Property 21: Palette discipline and art contract', () => {
    fc.assert(
      fc.property(fc.constantFrom(...DECORATIVE_TOKENS), (token) => {
        expect(
          isAllowedDecorativeColor(token.value),
          `${token.name} (${token.value}) is neither a Theme_Palette member nor a ` +
            'documented tint/shade of one.',
        ).toBe(true);

        const member = isPaletteMember(token.value);
        const derived = token.value.toLowerCase() in derivedTints;

        // Exactly one classification: a value cannot be both a palette member
        // and a derivation of one, so the registry has no ambiguous entries.
        expect(
          [member, derived].filter(Boolean),
          `${token.name} should be classified as exactly one of palette member or derived tint.`,
        ).toHaveLength(1);

        if (derived) {
          const tint = derivedTints[token.value.toLowerCase()];
          expect(tint).toBeDefined();
          if (!tint) return;

          const baseValue = palette[tint.base as PaletteName];
          expect(
            isPaletteMember(baseValue),
            `${token.name} records base "${tint.base}", which is not a palette member.`,
          ).toBe(true);
          expect(['white', 'black']).toContain(tint.mix);
          expect(tint.basePercent).toBeGreaterThan(0);
          expect(tint.basePercent).toBeLessThan(100);

          // The documented derivation has to match the value: same hue family
          // (one base member, not a blend of two) and lightness moved in the
          // direction the recorded mix claims.
          expect(
            hueDistance(hue(token.value), hue(baseValue)),
            `${token.name} drifts too far from ${tint.base} to be a tint or shade of it alone.`,
          ).toBeLessThanOrEqual(MAX_TINT_HUE_DRIFT);

          const derivedLuminance = relativeLuminance(token.value);
          const baseLuminance = relativeLuminance(baseValue);
          if (tint.mix === 'white') {
            expect(derivedLuminance).toBeGreaterThan(baseLuminance);
          } else {
            expect(derivedLuminance).toBeLessThan(baseLuminance);
          }
        }
      }),
      { numRuns: 100 },
    );
  });

  it('treats lettering as the only export excluded from the decorative check', () => {
    // Surfaces and ink are exempt by role, not by exception: they are the
    // section backgrounds and body-copy colors, and they carry no perceptible
    // hue, so they introduce no decorative color.
    const nonDecorativeExports = {
      surfaces,
      ink,
      lettering,
    } as const;

    const saturatedExclusions = new Set<string>();

    for (const [exportName, group] of Object.entries(nonDecorativeExports)) {
      for (const [key, value] of Object.entries(group)) {
        if (isAllowedDecorativeColor(value)) continue;
        if (chroma(value) >= NEUTRAL_CHROMA_MAX) {
          saturatedExclusions.add(exportName);
          continue;
        }
        expect(
          chroma(value),
          `${exportName}.${key} (${value}) is outside the palette, so it must stay ` +
            'near-neutral to avoid introducing a decorative hue.',
        ).toBeLessThan(NEUTRAL_CHROMA_MAX);
      }
    }

    expect([...saturatedExclusions]).toEqual(['lettering']);

    // The exclusion is exactly one value: `flareYellow` is `palette.gold`, so
    // only the hero's red sits outside the palette.
    expect(isPaletteMember(lettering.flareYellow)).toBe(true);
    expect(lettering.flareYellow).toBe(palette.gold);
    expect(isAllowedDecorativeColor(lettering.flareRed)).toBe(false);
    expect(Object.keys(derivedTints)).not.toContain(lettering.flareRed);
  });

  it('scopes the hero sky stops and platform greens through heroOnlyTokens', () => {
    const heroValues = heroOnlyTokens.map((token) => token.value);
    expect(heroValues).toEqual(
      expect.arrayContaining([
        skyGradient.top,
        skyGradient.middle,
        skyGradient.bottom,
        palette.grass,
        palette.grassLight,
      ]),
    );
    // Every hero-scoped value still comes from the palette.
    for (const token of heroOnlyTokens) {
      expect(isAllowedDecorativeColor(token.value)).toBe(true);
    }
  });

  it('rejects colors outside the registry and accepts case variants', () => {
    expect(isPaletteMember('#E91E8C')).toBe(true);
    expect(isAllowedDecorativeColor('  #f26bb0  ')).toBe(true);
    expect(isAllowedDecorativeColor('#123456')).toBe(false);
    expect(isPaletteMember('#f26bb0')).toBe(false);
  });
});
