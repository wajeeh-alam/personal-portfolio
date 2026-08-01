/**
 * Accessibility and typography contracts over the fully composed `App`.
 *
 * These read the real page — all seven sections in document order — rather than
 * a primitive in isolation, because each invariant is a whole-document claim: a
 * heading sequence, a link set, a typeface split. Rendering one section at a
 * time would let a violation hide in the seam between two of them.
 *
 * Environment notes:
 *
 * 1. jsdom ships no `IntersectionObserver` and Framer Motion's `whileInView`
 *    constructs one unguarded, so a no-op stub stands in (same stub as
 *    `sections.test.tsx`). Without it, rendering `App` throws. Because the stub
 *    never reports an intersection, each section's scroll reveal stays at its
 *    initial inline `opacity: 0`, so visibility is never asserted through
 *    computed style — only attributes, class strings, and text nodes.
 * 2. jsdom ships no `window.matchMedia` either; the stub from `vitest.setup.ts`
 *    covers it, arranged here as `no-preference`, the branch that renders the
 *    most motion-driven markup.
 * 3. Typeface resolution is computed from class strings, not from
 *    `getComputedStyle`: Tailwind utilities are never compiled in jsdom, so
 *    `font-family` would come back empty. Walking ancestors for the nearest
 *    `font-pixel` / `font-body` / `font-display` class mirrors what the cascade
 *    does with those single-declaration utilities.
 */
import { cleanup, render } from '@testing-library/react';
import fc from 'fast-check';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { App } from '../../App';
import { FOCUS_RING } from '../ui/EnergyOrbButton';
import { setMatchMedia } from '../../../vitest.setup';

/** Framer Motion's viewport feature observes unguarded; jsdom has no observer. */
class NoopIntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin = '';
  readonly thresholds: readonly number[] = [];
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

beforeAll(() => {
  vi.stubGlobal('IntersectionObserver', NoopIntersectionObserver);
});

afterAll(() => {
  vi.unstubAllGlobals();
});

afterEach(() => {
  cleanup();
});

/** Renders the whole site with prefers-reduced-motion off. */
function renderApp(): HTMLElement {
  setMatchMedia('(prefers-reduced-motion: reduce)', false);
  const { container } = render(<App />);
  return container;
}

/** Class attribute as a string; SVG elements expose `className` as an object. */
const classOf = (element: Element): string => element.getAttribute('class') ?? '';

/** A readable identifier for a failing element, for the assertion message. */
function describeElement(element: Element): string {
  const id = element.id === '' ? '' : `#${element.id}`;
  const testId = element.getAttribute('data-testid');
  const text = (element.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 40);
  return `<${element.tagName.toLowerCase()}${id}${testId === null ? '' : `[data-testid=${testId}]`}>` +
    (text === '' ? '' : ` "${text}"`);
}

// ---------------------------------------------------------------------------
// Link integrity
// ---------------------------------------------------------------------------

/**
 * The accessible name of a link, computed the way an assistive technology would
 * for the shapes this site produces: `aria-label` wins, otherwise the text
 * content, otherwise `title`.
 */
function accessibleName(element: Element): string {
  const label = element.getAttribute('aria-label');
  if (label !== null && label.trim() !== '') return label.trim();

  const text = (element.textContent ?? '').replace(/\s+/g, ' ').trim();
  if (text !== '') return text;

  return (element.getAttribute('title') ?? '').trim();
}

/**
 * True when `href` is an absolute http(s) URL whose host differs from the
 * document's. `mailto:` fails the protocol test and `/resume.pdf` fails the host
 * test, so neither is treated as leaving the origin.
 */
function isOffOrigin(href: string): boolean {
  let url: URL;
  try {
    url = new URL(href, window.location.href);
  } catch {
    return false;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
  return url.host !== window.location.host;
}

describe('link integrity', () => {
  it('Feature: dbz-pixel-portfolio, Property 7: Link integrity', () => {
    const container = renderApp();
    const anchors = [...container.querySelectorAll('a')];

    // The site has anchors at all: an empty set would make the property vacuous.
    expect(anchors.length).toBeGreaterThan(0);
    // And at least one of them leaves the origin, which is the interesting half.
    expect(
      anchors.filter((anchor) => isOffOrigin(anchor.getAttribute('href') ?? '')).length,
    ).toBeGreaterThan(0);

    fc.assert(
      fc.property(fc.nat({ max: anchors.length - 1 }), (index) => {
        const anchor = anchors[index];
        expect(anchor).toBeDefined();
        if (!anchor) return;

        const href = anchor.getAttribute('href') ?? '';
        const label = describeElement(anchor);

        // Every link names its destination, whatever it points at.
        expect(
          accessibleName(anchor),
          `${label} has an empty accessible name; Requirement 9.6 asks every ` +
            'link to name its destination.',
        ).not.toBe('');

        if (!isOffOrigin(href)) return;

        // Off-origin destinations open in a new browsing context…
        expect(
          anchor.getAttribute('target'),
          `${label} points off-origin at "${href}" without target="_blank" ` +
            '(Requirement 9.5).',
        ).toBe('_blank');

        // …and sever the opener relationship in both directions.
        const rel = (anchor.getAttribute('rel') ?? '').toLowerCase().split(/\s+/);
        expect(
          rel,
          `${label} points off-origin at "${href}" and its rel ` +
            `${JSON.stringify(anchor.getAttribute('rel'))} is missing "noopener" ` +
            '(Requirement 9.5).',
        ).toContain('noopener');
        expect(
          rel,
          `${label} points off-origin at "${href}" and its rel ` +
            `${JSON.stringify(anchor.getAttribute('rel'))} is missing "noreferrer" ` +
            '(Requirement 9.5).',
        ).toContain('noreferrer');
      }),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Image attribute completeness
// ---------------------------------------------------------------------------

// All art on the site is inline SVG today, so this check is currently vacuous.
// It exists to catch the first raster image somebody adds.
describe('image attributes', () => {
  it('Feature: dbz-pixel-portfolio, Property 17: Image attribute completeness', () => {
    const container = renderApp();
    const hero = container.querySelector('section.hero-sky');
    expect(hero, 'the Hero_Scene section should be present in the composed App').not.toBeNull();

    const images = [...container.querySelectorAll('img')];

    for (const image of images) {
      const label = describeElement(image);

      // Intrinsic dimensions are declared, so no layout shift on load.
      expect(
        image.getAttribute('width'),
        `${label} declares no width; Requirement 14.1 asks for explicit dimensions.`,
      ).not.toBeNull();
      expect(
        image.getAttribute('height'),
        `${label} declares no height; Requirement 14.1 asks for explicit dimensions.`,
      ).not.toBeNull();

      // An `alt` attribute exists; empty is valid for decoration.
      expect(
        image.hasAttribute('alt'),
        `${label} has no alt attribute; Requirement 16.4 asks for one on every ` +
          'image, empty for decorative art.',
      ).toBe(true);

      // Below-the-fold images defer their fetch.
      if (hero?.contains(image) === true) continue;
      expect(
        image.getAttribute('loading'),
        `${label} renders outside the Hero_Scene without loading="lazy" ` +
          '(Requirement 14.3).',
      ).toBe('lazy');
    }
  });
});

// ---------------------------------------------------------------------------
// Heading hierarchy integrity
// ---------------------------------------------------------------------------

describe('heading hierarchy', () => {
  it('Feature: dbz-pixel-portfolio, Property 18: Heading hierarchy integrity', () => {
    const container = renderApp();

    const headings = [...container.querySelectorAll('h1, h2, h3, h4, h5, h6')];
    const levels = headings.map((heading) => Number.parseInt(heading.tagName.slice(1), 10));

    expect(levels.length, 'the composed App should render headings').toBeGreaterThan(0);

    // Exactly one `h1`, and the outline opens with it.
    expect(
      levels.filter((level) => level === 1),
      `document-order heading levels were ${JSON.stringify(levels)}; Requirement ` +
        '16.5 allows exactly one level-one heading.',
    ).toHaveLength(1);
    expect(
      levels[0],
      `the first heading in document order is an h${levels[0] ?? 0}; the outline ` +
        'must begin with the lone h1 (Requirement 16.5).',
    ).toBe(1);

    // No skipped levels anywhere in the sequence.
    levels.forEach((level, index) => {
      if (index === 0) return;
      const previous = levels[index - 1] ?? 1;
      expect(
        level - previous,
        `heading ${index} (${describeElement(headings[index] as Element)}) jumps from ` +
          `h${previous} to h${level}; Requirement 16.5 allows an increase of at most ` +
          'one level.',
      ).toBeLessThanOrEqual(1);
    });
  });
});

// ---------------------------------------------------------------------------
// Interactive element reachability
// ---------------------------------------------------------------------------

/**
 * True when the element takes focus from sequential keyboard navigation: an
 * anchor needs an `href`, a button must not be disabled, and neither may sit
 * behind a negative `tabindex`.
 */
function isSequentiallyFocusable(element: Element): boolean {
  const tabIndexAttribute = element.getAttribute('tabindex');
  if (tabIndexAttribute !== null && Number.parseInt(tabIndexAttribute, 10) < 0) return false;

  if (element.tagName === 'A') {
    const href = element.getAttribute('href');
    return href !== null && href !== '';
  }
  if (element.tagName === 'BUTTON') return !element.hasAttribute('disabled');
  return false;
}

describe('interactive element reachability', () => {
  it('Feature: dbz-pixel-portfolio, Property 19: Interactive element reachability', () => {
    const container = renderApp();
    const interactive = [...container.querySelectorAll('a, button')];

    expect(interactive.length, 'the composed App should render interactive elements')
      .toBeGreaterThan(0);

    for (const element of interactive) {
      const label = describeElement(element);

      // Reachable by Tab, never removed from the tab order.
      expect(
        isSequentiallyFocusable(element),
        `${label} is not reachable by sequential keyboard navigation ` +
          '(Requirement 16.1).',
      ).toBe(true);

      const tabIndexAttribute = element.getAttribute('tabindex');
      if (tabIndexAttribute !== null) {
        expect(
          Number.parseInt(tabIndexAttribute, 10),
          `${label} carries tabindex="${tabIndexAttribute}"; a negative value ` +
            'removes it from the tab order (Requirement 16.1).',
        ).toBeGreaterThanOrEqual(0);
      }

      // The element actually accepts focus in a real DOM, not just on paper.
      (element as HTMLElement).focus();
      expect(
        document.activeElement,
        `${label} did not accept focus (Requirement 16.1).`,
      ).toBe(element);

      // One visible focus indicator, identical on every control. `FOCUS_RING` is
      // imported from `EnergyOrbButton` rather than retyped, so this compares
      // against the one authoritative string.
      expect(
        classOf(element),
        `${label} does not declare the shared focus-ring utility ` +
          '(Requirement 16.2).',
      ).toContain(FOCUS_RING);
    }
  });
});

// ---------------------------------------------------------------------------
// Typography role separation
// ---------------------------------------------------------------------------

/** The three typeface utilities in play; the nearest one on an ancestor wins. */
const FONT_TOKENS = ['font-pixel', 'font-body', 'font-display'] as const;
type FontToken = (typeof FONT_TOKENS)[number];

/**
 * The typeface token an element resolves to: the nearest declaration on itself
 * or an ancestor, `null` when nothing in the chain sets one.
 */
function resolvedFont(element: Element, root: Element): FontToken | null {
  let cursor: Element | null = element;
  while (cursor !== null) {
    const classes = classOf(cursor).split(/\s+/);
    const token = FONT_TOKENS.find((candidate) => classes.includes(candidate));
    if (token !== undefined) return token;
    if (cursor === root) break;
    cursor = cursor.parentElement;
  }
  return null;
}

/**
 * True for the only roles the pixel token is permitted on: the section eyebrow
 * label, and control labels — which on this site means links and buttons and the
 * elements inside them.
 */
function isLabelRole(element: Element): boolean {
  if (element.closest('[data-testid="section-eyebrow"]') !== null) return true;
  return element.closest('a, button') !== null;
}

describe('typography role separation', () => {
  it('Feature: dbz-pixel-portfolio, Property 22: Typography role separation', () => {
    const container = renderApp();
    const root = container.firstElementChild ?? container;

    // The pixel face is confined to eyebrow and control labels.
    const pixelElements = [...container.querySelectorAll('*')].filter((element) =>
      classOf(element).split(/\s+/).includes('font-pixel'),
    );

    expect(
      pixelElements.length,
      'the pixel token should appear somewhere; an empty set would make the ' +
        'role restriction vacuous.',
    ).toBeGreaterThan(0);

    for (const element of pixelElements) {
      expect(
        isLabelRole(element),
        `${describeElement(element)} uses font-pixel but is neither a section ` +
          'eyebrow nor a control label (Requirement 2.1).',
      ).toBe(true);
    }

    // Prose reads in the body face. The eyebrow is the one exempt paragraph, so
    // it is excluded here rather than weakening the rule for every other `<p>`.
    const prose = [...container.querySelectorAll('p, li, article p')].filter(
      (element) => element.closest('[data-testid="section-eyebrow"]') === null,
    );

    expect(prose.length, 'the composed App should render prose elements').toBeGreaterThan(0);

    for (const element of prose) {
      const label = describeElement(element);
      const font = resolvedFont(element, root);

      expect(
        font,
        `${label} resolves no typeface token; Requirement 2.2 puts prose in the ` +
          'body face.',
      ).not.toBeNull();
      expect(
        font,
        `${label} resolves "${font ?? 'none'}"; Requirement 2.2 puts every ` +
          'paragraph, list item, and card description in the body face and keeps ' +
          'the pixel face off them.',
      ).toBe('font-body');
    }
  });
});

// ---------------------------------------------------------------------------
// Trademark-free copy
// ---------------------------------------------------------------------------

/**
 * Dragon Ball trademarks and character names the copy must avoid.
 *
 * Every entry is distinctive enough that a match means the term itself, not an
 * accidental substring of ordinary copy — which is why short or ambiguous
 * fragments ("ki", "trunks") are absent: they would fire on unrelated words and
 * turn the property into noise rather than a real guard.
 */
const TRADEMARK_DENYLIST = [
  'dragon ball',
  'dragonball',
  'goku',
  'kakarot',
  'vegeta',
  'saiyan',
  'super saiyan',
  'kamehameha',
  'namek',
  'frieza',
  'krillin',
  'gohan',
  'shenron',
  'capsule corp',
  'akira toriyama',
  'bulma',
  'piccolo',
  'beerus',
  'senzu',
] as const;

describe('trademark-free copy', () => {
  it('Feature: dbz-pixel-portfolio, Property 23: Trademark-free copy', () => {
    const container = renderApp();

    // Attribute-borne copy counts too: an `aria-label` or `alt` is read aloud.
    const attributeText = [...container.querySelectorAll('*')]
      .flatMap((element) => [
        element.getAttribute('aria-label'),
        element.getAttribute('alt'),
        element.getAttribute('title'),
      ])
      .filter((value): value is string => value !== null)
      .join(' ');

    const rendered = `${container.textContent ?? ''} ${attributeText}`.toLowerCase();
    expect(rendered.trim().length, 'the composed App should render text').toBeGreaterThan(0);

    fc.assert(
      fc.property(fc.constantFrom(...TRADEMARK_DENYLIST), (term) => {
        expect(
          rendered.includes(term),
          `rendered copy contains the denied term "${term}"; Requirement 17.2 ` +
            'allows an inspired theme but no trademark or character name.',
        ).toBe(false);
      }),
      { numRuns: 100 },
    );
  });
});
