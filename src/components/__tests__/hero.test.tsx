/**
 * Hero contract: the copy layer, the two call-to-actions, and the "View
 * Projects" scroll-and-focus behavior.
 *
 * The tagline is asserted against the `HERO_TAGLINE` export rather than a
 * retyped literal, so the test cannot silently disagree with the source about
 * which dash character is used.
 *
 * Two environment details shape these tests. jsdom implements no
 * `Element.prototype.scrollIntoView`, which is exactly the branch
 * `focusProjects` falls back to a hash navigation for: so the scroll assertions
 * install a `vi.fn()` on the target element, and one test deliberately leaves it
 * absent to exercise the fallback. And jsdom ships no `window.matchMedia`, so
 * the motion preference comes from the stub in `vitest.setup.ts`, arranged
 * before mount because `useReducedMotion` reads it during render.
 */
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { HERO_TAGLINE, Hero, PROJECTS_SECTION_ID, focusProjects } from '../Hero';
import { setMatchMedia } from '../../../vitest.setup';

/** The query `useReducedMotion` reads. */
const REDUCE_QUERY = '(prefers-reduced-motion: reduce)';

/** Scroll options `focusProjects` passes when motion is allowed. */
const SMOOTH = { behavior: 'smooth', block: 'start' };

/** Scroll options `focusProjects` passes under a `reduce` preference. */
const INSTANT = { behavior: 'auto', block: 'start' };

/**
 * Renders the Hero alongside the real scroll target, since `focusProjects`
 * resolves `#projects` from the document at activation time. `tabIndex={-1}`
 * matches the real Projects section: focusable programmatically, absent from the
 * tab order.
 */
function renderHeroWithTarget(): HTMLElement {
  render(
    <>
      <Hero />
      <section id={PROJECTS_SECTION_ID} tabIndex={-1} aria-label="Projects" />
    </>,
  );
  return document.getElementById(PROJECTS_SECTION_ID) as HTMLElement;
}

/** Installs a spy for the `scrollIntoView` jsdom does not provide. */
function stubScrollIntoView(target: HTMLElement): ReturnType<typeof vi.fn> {
  const spy = vi.fn();
  Object.defineProperty(target, 'scrollIntoView', {
    configurable: true,
    writable: true,
    value: spy,
  });
  return spy;
}

/** Tabs until the "View Projects" button holds focus, then presses Enter. */
async function activateViewProjectsByKeyboard(): Promise<unknown> {
  const user = userEvent.setup();
  const button = screen.getByRole('button', { name: 'View Projects' });

  // The CTA is reachable by sequential navigation, so tabbing gets there. The
  // bound is a guard against an infinite loop, not an expectation about how many
  // stops precede the button.
  for (let step = 0; step < 10 && document.activeElement !== button; step += 1) {
    await user.tab();
  }
  expect(button).toHaveFocus();

  try {
    // A real `<button>` fires `click` for Enter, which is why the component
    // needs no key handler.
    await user.keyboard('{Enter}');
    return null;
  } catch (error) {
    return error;
  }
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.location.hash = '';
});

describe('Hero: copy and call-to-actions', () => {
  it('fills the viewport and renders the name as the only level-one heading', () => {
    render(<Hero />);

    // `100svh` rather than `100vh` so mobile browser chrome cannot clip the
    // scene.
    const section = screen.getByRole('region', { name: 'Introduction' });
    expect(section.className).toContain('min-h-[100svh]');

    // One `h1`, named by the plain string, with the outline layer's glyph source
    // in step with the text child.
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    const heading = headings[0]!;
    expect(heading).toHaveAccessibleName('Wajeeh Alam');
    expect(heading).toHaveAttribute('data-text', 'Wajeeh Alam');
    expect(heading.textContent).toBe('Wajeeh Alam');
  });

  it('renders the tagline verbatim', () => {
    render(<Hero />);

    // The dash is an em dash; asserting it separately makes a hyphen regression
    // in the source obvious rather than invisible.
    expect(HERO_TAGLINE).toContain('—');
    expect(screen.getByText(HERO_TAGLINE)).toBeInTheDocument();
  });

  it('renders exactly two Energy_Orb_Buttons and nothing else interactive', () => {
    const { container } = render(<Hero />);

    // Two orbs, in order, and no third interactive element hiding in the art
    // layer.
    const orbs = [...container.querySelectorAll('.orb-glow')];
    expect(orbs).toHaveLength(2);
    expect([...container.querySelectorAll('a, button')]).toEqual(orbs);

    const action = orbs[0]!;
    const link = orbs[1]!;
    expect(action.tagName).toBe('BUTTON');
    expect(action).toHaveAttribute('type', 'button');
    expect(action).toHaveAccessibleName('View Projects');

    // A real link to the resume, not a scripted navigation.
    expect(link.tagName).toBe('A');
    expect(link).toHaveAccessibleName('Resume');
    expect(link).toHaveAttribute('href', '/resume.pdf');
  });
});

describe('Hero: View Projects activation', () => {
  it('scrolls to and focuses the projects section from the keyboard', async () => {
    const target = renderHeroWithTarget();
    const scrollIntoView = stubScrollIntoView(target);

    const thrown = await activateViewProjectsByKeyboard();
    expect(thrown).toBeNull();

    // Scrolled into view, smoothly, because no `reduce` preference is in effect.
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView).toHaveBeenCalledWith(SMOOTH);

    // Keyboard focus lands on the section, not left behind on the CTA.
    expect(target).toHaveFocus();
    expect(document.activeElement).toBe(target);
  });

  it('scrolls instantly under a reduce preference', async () => {
    // Arranged before mount: `useReducedMotion` reads the query during render.
    setMatchMedia(REDUCE_QUERY, true);

    const target = renderHeroWithTarget();
    const scrollIntoView = stubScrollIntoView(target);

    expect(await activateViewProjectsByKeyboard()).toBeNull();

    // The motion is removed, not slowed — `auto`, never `smooth`.
    expect(scrollIntoView).toHaveBeenCalledWith(INSTANT);
    expect(target).toHaveFocus();
  });

  it('falls back to a hash navigation when scrollIntoView is unavailable', async () => {
    // No stub installed, so the jsdom-native absence of `scrollIntoView` is the
    // condition under test.
    const target = renderHeroWithTarget();
    expect(typeof target.scrollIntoView).not.toBe('function');

    expect(await activateViewProjectsByKeyboard()).toBeNull();

    // The visitor still lands on the section, and focus still moves.
    expect(window.location.hash).toBe(`#${PROJECTS_SECTION_ID}`);
    expect(target).toHaveFocus();
  });

  it('does nothing and does not throw when the projects section is absent', async () => {
    render(<Hero />);
    expect(document.getElementById(PROJECTS_SECTION_ID)).toBeNull();

    const button = screen.getByRole('button', { name: 'View Projects' });
    expect(await activateViewProjectsByKeyboard()).toBeNull();

    // Focus stays where the visitor left it and no navigation happens.
    expect(button).toHaveFocus();
    expect(window.location.hash).toBe('');
  });

  it('exposes focusProjects as a directly callable no-op without a target', () => {
    expect(document.getElementById(PROJECTS_SECTION_ID)).toBeNull();
    expect(() => {
      focusProjects(false);
    }).not.toThrow();
    expect(() => {
      focusProjects(true);
    }).not.toThrow();
  });

  it('passes the preference straight through to scrollIntoView', () => {
    const target = document.createElement('section');
    target.id = PROJECTS_SECTION_ID;
    target.tabIndex = -1;
    document.body.append(target);
    const scrollIntoView = stubScrollIntoView(target);

    focusProjects(false);
    expect(scrollIntoView).toHaveBeenLastCalledWith(SMOOTH);

    focusProjects(true);
    expect(scrollIntoView).toHaveBeenLastCalledWith(INSTANT);

    target.remove();
  });
});
