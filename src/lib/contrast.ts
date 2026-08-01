/**
 * WCAG 2.1 contrast utilities.
 *
 * Used by the theme token test to prove that body copy and accent colors clear
 * 4.5:1 against the readable surfaces. Kept as a dependency-free pure module so
 * the assertions read as arithmetic rather than as trust in a third-party
 * library.
 *
 * Reference: https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */

/** An sRGB color with 8-bit channels, each in `[0, 255]`. */
export interface Rgb {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

/** Matches `#abc`, `abc`, `#aabbcc`, or `aabbcc`, case-insensitively. */
const HEX_PATTERN = /^#?(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

/**
 * Parses a 3- or 6-digit hex color, with or without a leading `#`, into 8-bit
 * sRGB channels. Shorthand digits are expanded by duplication, so `#e8c`
 * becomes `#ee88cc`.
 *
 * This is the guard the other exports rely on: a typo in a token never
 * silently degrades to black, it throws.
 *
 * @param hex - Hex color string, e.g. `'#e91e8c'`, `'e91e8c'`, `'#e8c'`.
 * @returns The color's red, green, and blue channels in `[0, 255]`.
 * @throws {Error} When `hex` is not a string, or is not a 3- or 6-digit hex color.
 */
export function parseHex(hex: string): Rgb {
  if (typeof hex !== 'string') {
    throw new Error(
      `parseHex: expected a hex color string, received ${typeof hex}.`,
    );
  }

  const trimmed = hex.trim();
  if (!HEX_PATTERN.test(trimmed)) {
    throw new Error(
      `parseHex: malformed hex color ${JSON.stringify(hex)}. ` +
        'Expected 3 or 6 hex digits, optionally prefixed with "#" ' +
        '(for example "#e91e8c", "e91e8c", or "#e8c").',
    );
  }

  const digits = trimmed.startsWith('#') ? trimmed.slice(1) : trimmed;
  const full =
    digits.length === 3
      ? // Shorthand expansion: each digit is duplicated.
        digits
          .split('')
          .map((digit) => digit + digit)
          .join('')
      : digits;

  return {
    r: Number.parseInt(full.slice(0, 2), 16),
    g: Number.parseInt(full.slice(2, 4), 16),
    b: Number.parseInt(full.slice(4, 6), 16),
  };
}

/**
 * Converts one 8-bit sRGB channel to its linear-light value, per the WCAG 2.1
 * relative luminance definition.
 *
 * @param channel - Channel value in `[0, 255]`.
 * @returns Linearized channel value in `[0, 1]`.
 */
function linearizeChannel(channel: number): number {
  const srgb = channel / 255;
  return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
}

/**
 * Relative luminance of a hex color, per WCAG 2.1:
 * `L = 0.2126 R + 0.7152 G + 0.0722 B` over linearized channels.
 *
 * @param hex - Hex color string accepted by {@link parseHex}.
 * @returns Relative luminance in `[0, 1]` — `0` for black, `1` for white.
 * @throws {Error} When `hex` is malformed.
 */
export function relativeLuminance(hex: string): number {
  const { r, g, b } = parseHex(hex);
  return (
    0.2126 * linearizeChannel(r) +
    0.7152 * linearizeChannel(g) +
    0.0722 * linearizeChannel(b)
  );
}

/**
 * Contrast ratio between two hex colors, per WCAG 2.1:
 * `(Llighter + 0.05) / (Ldarker + 0.05)`. The result is order-independent and
 * ranges from `1` (identical colors) to `21` (black against white).
 *
 * @param hexA - First hex color, in either role (foreground or background).
 * @param hexB - Second hex color.
 * @returns Contrast ratio in `[1, 21]`.
 * @throws {Error} When either color is malformed.
 */
export function contrastRatio(hexA: string, hexB: string): number {
  const luminanceA = relativeLuminance(hexA);
  const luminanceB = relativeLuminance(hexB);
  const lighter = Math.max(luminanceA, luminanceB);
  const darker = Math.min(luminanceA, luminanceB);
  return (lighter + 0.05) / (darker + 0.05);
}
