/**
 * Sparkle layer density and listener behavior, plus the art contract shared by
 * every decorative component.
 *
 * The viewport class is driven through the `window.matchMedia` stub installed by
 * `vitest.setup.ts`: `setMatchMedia` arranges state before mount and
 * `dispatchMatchMediaChange` moves the boundary while mounted. Particle count is
 * a pure function of that class, so generating widths is what spans the
 * particle-count space.
 *
 * The art contract assertions are written generically over the component list —
 * every element with a `fill` or `stroke` attribute is checked — so the test
 * does not encode any sprite's pixel data and survives art edits.
 */
import { act, cleanup, render } from '@testing-library/react';
import fc from 'fast-check';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { MascotSprite } from '../MascotSprite';
import { PixelTree } from '../PixelTree';
import { PlanetPlatform } from '../PlanetPlatform';
import { PortalOrb } from '../PortalOrb';
import {
  buildSparkles,
  SparkleLayer,
  sparkleCountFor,
  SPARKLE_COUNT_LARGE,
  SPARKLE_COUNT_SMALL,
} from '../SparkleLayer';
import { palette } from '../../../theme/tokens';

/** The query `useSmallScreen` negates; matching it means "not a small screen". */
const MD_QUERY = '(min-width: 768px)';

/** The small-screen boundary, in CSS pixels. */
const BREAKPOINT = 768;

/** Puts the stub at `width`, which is the only input the layer's density reads. */
function setViewportWidth(width: number): void {
  setMatchMedia(MD_QUERY, width >= BREAKPOINT);
}

/** Moves the stub to `width` and notifies listeners, as a resize would. */
function moveViewportWidth(width: number): void {
  act(() => {
    dispatchMatchMediaChange(MD_QUERY, width >= BREAKPOINT);
  });
}

const sparkleNodeCount = (container: HTMLElement): number =>
  container.querySelectorAll('.sparkle').length;

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('sparkle layer: density', () => {
  it('Feature: dbz-pixel-portfolio, Property 14: Sparkle density scaling', () => {
    fc.assert(
      fc.property(
        // Widths on either side of the boundary; 320 and 3840 bracket the range
        // a browser can realistically report.
        fc.integer({ min: 320, max: BREAKPOINT - 1 }),
        fc.integer({ min: BREAKPOINT, max: 3840 }),
        (smallWidth, largeWidth) => {
          const smallCount = sparkleCountFor(smallWidth < BREAKPOINT);
          const largeCount = sparkleCountFor(largeWidth < BREAKPOINT);

          expect(
            smallCount,
            `width ${smallWidth} resolved ${smallCount} particles and width ` +
              `${largeWidth} resolved ${largeCount}; Requirement 12.7 requires ` +
              'strictly fewer particles below 768px.',
          ).toBeLessThan(largeCount);

          // The rendered field has to follow the resolution, including when the
          // viewport crosses the boundary while the layer is mounted.
          setViewportWidth(smallWidth);
          const { container } = render(<SparkleLayer />);
          expect(sparkleNodeCount(container)).toBe(smallCount);

          moveViewportWidth(largeWidth);
          expect(sparkleNodeCount(container)).toBe(largeCount);

          moveViewportWidth(smallWidth);
          expect(sparkleNodeCount(container)).toBe(smallCount);

          cleanup();
        },
      ),
      { numRuns: 100 },
    );
  });

  it('resolves the documented counts at and below the boundary', () => {
    expect(sparkleCountFor(true)).toBe(SPARKLE_COUNT_SMALL);
    expect(sparkleCountFor(false)).toBe(SPARKLE_COUNT_LARGE);
    expect(SPARKLE_COUNT_SMALL).toBeLessThan(SPARKLE_COUNT_LARGE);
  });

  it('builds an identical field on every call for the fixed seed', () => {
    // Determinism is what keeps the field stable across mounts, reloads, and
    // test runs, so the layout is a pure function of the count alone.
    expect(buildSparkles(SPARKLE_COUNT_LARGE)).toEqual(
      buildSparkles(SPARKLE_COUNT_LARGE),
    );
    expect(buildSparkles(0)).toEqual([]);

    // The generator is created fresh per call, so a smaller field is the prefix
    // of a larger one rather than a different draw.
    expect(buildSparkles(SPARKLE_COUNT_SMALL)).toEqual(
      buildSparkles(SPARKLE_COUNT_LARGE).slice(0, SPARKLE_COUNT_SMALL),
    );

    // Layout stays inside the bands the stylesheet expects.
    for (const sparkle of buildSparkles(SPARKLE_COUNT_LARGE)) {
      expect(sparkle.leftPct).toBeGreaterThanOrEqual(0);
      expect(sparkle.leftPct).toBeLessThan(100);
      expect(sparkle.topPct).toBeGreaterThanOrEqual(0);
      expect(sparkle.topPct).toBeLessThan(62);
    }
  });
});

describe('sparkle layer: listener ceiling', () => {
  it('Feature: dbz-pixel-portfolio, Property 16: Sparkle listener ceiling', () => {
    fc.assert(
      fc.property(
        // Width selects the particle count; the boolean selects the motion
        // preference. Neither may buy the layer a second subscription.
        fc.integer({ min: 320, max: 3840 }),
        fc.boolean(),
        (width, reduce) => {
          setViewportWidth(width);
          setMatchMedia('(prefers-reduced-motion: reduce)', reduce);

          const windowAdd = vi.spyOn(window, 'addEventListener');
          const documentAdd = vi.spyOn(document, 'addEventListener');
          const raf = vi.spyOn(window, 'requestAnimationFrame');

          const { container } = render(<SparkleLayer />);

          const scrollListeners = [
            ...windowAdd.mock.calls,
            ...documentAdd.mock.calls,
          ].filter(([type]) => type === 'scroll').length;

          expect(
            scrollListeners,
            `mounting the Sparkle_Layer at width ${width} (reduce=${reduce}) ` +
              `registered ${scrollListeners} scroll listeners; Requirement 14.4 ` +
              'allows at most one.',
          ).toBeLessThanOrEqual(1);

          expect(
            raf.mock.calls.length,
            `mounting the Sparkle_Layer at width ${width} (reduce=${reduce}) ` +
              `requested ${raf.mock.calls.length} animation frames; Requirement ` +
              '14.4 allows at most one.',
          ).toBeLessThanOrEqual(1);

          // The ceiling would be trivially satisfied by rendering nothing, so
          // confirm the field is actually present.
          expect(sparkleNodeCount(container)).toBe(
            sparkleCountFor(width < BREAKPOINT),
          );

          cleanup();
          vi.restoreAllMocks();
        },
      ),
      { numRuns: 100 },
    );
  });

  it('drives the field from the stylesheet rather than from JavaScript', () => {
    setViewportWidth(1280);
    const raf = vi.spyOn(window, 'requestAnimationFrame');
    const windowAdd = vi.spyOn(window, 'addEventListener');

    const { container } = render(<SparkleLayer className="extra" />);

    // No frame loop and no scroll listener at all: motion lives in `.sparkle`
    // keyframes, so the one-listener budget is spent on nothing.
    expect(raf).not.toHaveBeenCalled();
    expect(
      windowAdd.mock.calls.filter(([type]) => type === 'scroll'),
    ).toHaveLength(0);

    // Per-particle layout is handed to CSS as custom properties.
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toBe('sparkle-layer extra');
    const first = container.querySelector('.sparkle') as HTMLElement;
    expect(first.style.getPropertyValue('--sparkle-x')).not.toBe('');
    expect(first.style.getPropertyValue('--sparkle-duration')).not.toBe('');
  });
});

/**
 * Every art component, rendered with its defaults. The contract test walks this
 * list rather than asserting against any one sprite's geometry.
 */
const ART_COMPONENTS: readonly {
  readonly name: string;
  readonly render: () => JSX.Element;
}[] = [
  { name: 'SparkleLayer', render: () => <SparkleLayer /> },
  { name: 'PlanetPlatform', render: () => <PlanetPlatform /> },
  { name: 'PixelTree', render: () => <PixelTree /> },
  { name: 'MascotSprite', render: () => <MascotSprite /> },
  { name: 'PortalOrb', render: () => <PortalOrb /> },
] as const;

/** Palette members, lowercased for attribute comparison. */
const PALETTE_VALUES = new Set(
  Object.values(palette).map((value) => value.toLowerCase()),
);

/** Keywords that name no color of their own. */
const COLOR_KEYWORDS = new Set(['none', 'currentcolor', 'inherit', 'transparent']);

/** Attributes that would give a decorative root an accessible name. */
const NAMING_ATTRIBUTES = ['aria-label', 'aria-labelledby', 'title', 'role'] as const;

function isAllowedPaint(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  if (normalized === '') return true;
  if (COLOR_KEYWORDS.has(normalized)) return true;
  if (normalized.startsWith('url(')) return true; // clip/paint references, not colors
  return PALETTE_VALUES.has(normalized);
}

/** Every `fill`/`stroke` value painted by `root` and its descendants. */
function paintValues(root: Element): string[] {
  const values: string[] = [];
  for (const element of [root, ...root.querySelectorAll('*')]) {
    for (const attribute of ['fill', 'stroke'] as const) {
      const value = element.getAttribute(attribute);
      if (value !== null) values.push(value);
    }
    const style = (element as Partial<HTMLElement>).style;
    if (style) {
      if (style.fill) values.push(style.fill);
      if (style.stroke) values.push(style.stroke);
    }
  }
  return values;
}

describe('art components: palette and accessibility contract', () => {
  it('Feature: dbz-pixel-portfolio, Property 21: Palette discipline and art contract', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...ART_COMPONENTS.map((entry) => entry.name)),
        fc.boolean(),
        fc.integer({ min: 320, max: 3840 }),
        (name, reduce, width) => {
          const entry = ART_COMPONENTS.find((candidate) => candidate.name === name);
          expect(entry, `unknown art component ${name}`).toBeDefined();

          setViewportWidth(width);
          setMatchMedia('(prefers-reduced-motion: reduce)', reduce);

          const { container } = render(entry!.render());
          const root = container.firstElementChild;
          expect(root, `${name} rendered no root element`).not.toBeNull();

          // Decorative, so hidden from assistive technology and contributing no
          // accessible name.
          expect(
            root!.getAttribute('aria-hidden'),
            `${name} root is not aria-hidden; Requirement 16.3 hides decorative art.`,
          ).toBe('true');
          for (const attribute of NAMING_ATTRIBUTES) {
            expect(
              root!.hasAttribute(attribute),
              `${name} root declares "${attribute}", which would give decorative ` +
                'art an accessible name (Requirement 16.3).',
            ).toBe(false);
          }
          expect(
            root!.querySelector('title, desc'),
            `${name} contains a <title>/<desc>, which names decorative art ` +
              '(Requirement 16.3).',
          ).toBeNull();
          expect(root!.textContent?.trim() ?? '').toBe('');

          // Only palette values are painted, and wherever a component paints
          // color at all it carries the black outline token.
          const paints = paintValues(root!);
          for (const value of paints) {
            expect(
              isAllowedPaint(value),
              `${name} paints "${value}", which is not a Theme_Palette member ` +
                '(Requirement 2.4).',
            ).toBe(true);
          }

          const colorPaints = paints.filter(
            (value) => !COLOR_KEYWORDS.has(value.trim().toLowerCase()) &&
              !value.trim().toLowerCase().startsWith('url(') &&
              value.trim() !== '',
          );
          if (colorPaints.length > 0) {
            expect(
              colorPaints.some(
                (value) => value.trim().toLowerCase() === palette.outline,
              ),
              `${name} paints color but never uses the black outline token ` +
                '(Requirement 2.4).',
            ).toBe(true);
          }

          cleanup();
        },
      ),
      { numRuns: 100 },
    );
  });

  it('keeps every SVG root out of the tab order', () => {
    setViewportWidth(1280);
    for (const entry of ART_COMPONENTS) {
      const { container } = render(entry.render());
      const root = container.firstElementChild as Element;
      if (root.tagName.toLowerCase() === 'svg') {
        expect(root.getAttribute('focusable')).toBe('false');
      }
      expect(root.getAttribute('tabindex')).toBeNull();
      cleanup();
    }
  });
});
