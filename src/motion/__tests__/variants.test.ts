/**
 * Motion registry invariants.
 *
 * The registry is data, so the two rules that govern it are checkable over
 * every entry rather than spot-checked per component:
 *
 * - Resolving any entry under a reduced-motion preference yields a target with
 *   no transform-family key, and every entry that animates opacity at
 *   `no-preference` keeps its opacity channel under `reduce`.
 * - In either mode, the animated property set of every entry is a subset of the
 *   transform family plus `opacity`, so continuous motion stays on the
 *   compositor.
 *
 * `transition` (and `transitionEnd`) are Framer configuration keys, not
 * animated channels: `transition` is excluded from the animated set, while the
 * keys nested inside `transitionEnd` are folded into it because those values do
 * get applied to the element.
 */
import type { TargetAndTransition } from 'framer-motion';
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import {
  motionRegistry,
  resolveMotion,
  TRANSFORM_KEYS,
  type MotionId,
} from '../variants';

/** Every registry key, so the properties grow with the registry. */
const MOTION_IDS = Object.keys(motionRegistry) as MotionId[];

/** Framer keys that configure a transition instead of naming a channel. */
const CONFIG_KEYS = new Set(['transition', 'transitionEnd']);

/**
 * Transform-family channels Framer accepts, a superset of `TRANSFORM_KEYS`.
 *
 * `TRANSFORM_KEYS` is the suppression list the reduced-motion property asserts
 * against; this wider set is what the channel restriction permits, so an entry
 * cannot slip a `rotateX`-style channel past that restriction just because the
 * suppression list does not spell it out. The containment assertion below keeps
 * the two lists from drifting apart.
 */
const TRANSFORM_FAMILY_KEYS = new Set([
  'x',
  'y',
  'z',
  'translateX',
  'translateY',
  'translateZ',
  'scale',
  'scaleX',
  'scaleY',
  'scaleZ',
  'rotate',
  'rotateX',
  'rotateY',
  'rotateZ',
  'skew',
  'skewX',
  'skewY',
  'originX',
  'originY',
  'originZ',
  'perspective',
  'transformPerspective',
  'transform',
]);

/** The only channels a continuous animation may touch. */
const COMPOSITED_KEYS = new Set([...TRANSFORM_FAMILY_KEYS, 'opacity']);

/**
 * Channels a target actually animates: its own keys minus Framer's transition
 * configuration, plus anything applied through `transitionEnd`.
 */
function animatedKeys(target: TargetAndTransition): string[] {
  const own = Object.keys(target).filter((key) => !CONFIG_KEYS.has(key));
  const end = target.transitionEnd ? Object.keys(target.transitionEnd) : [];
  return [...new Set([...own, ...end])];
}

/** `true` when the target drives the opacity channel. */
const animatesOpacity = (target: TargetAndTransition): boolean =>
  animatedKeys(target).includes('opacity');

describe('motion registry: reduced-motion resolution', () => {
  it('Feature: dbz-pixel-portfolio, Property 12: Motion preference resolution', () => {
    fc.assert(
      fc.property(fc.constantFrom(...MOTION_IDS), (id) => {
        const full = resolveMotion(id, false);
        const reduced = resolveMotion(id, true);

        // Nothing transform-family survives the `reduce` resolution.
        for (const key of TRANSFORM_KEYS) {
          expect(
            animatedKeys(reduced),
            `${id} animates transform-family key "${key}" under reduce; ` +
              'Requirement 12.4 suppresses every Transform_Animation.',
          ).not.toContain(key);
        }

        // The opacity channel is preserved, not dropped along with the
        // transforms.
        if (animatesOpacity(full)) {
          expect(
            animatesOpacity(reduced),
            `${id} animates opacity at no-preference but loses it under reduce; ` +
              'Requirements 12.5 and 12.6 retain the opacity channel.',
          ).toBe(true);
        }
      }),
      { numRuns: 100 },
    );
  });

  it('resolves to the full target while the preference is no-preference', () => {
    // The transform-driven animations are present, and the `reduce` branch is
    // the only one that strips them.
    for (const id of MOTION_IDS) {
      expect(resolveMotion(id, false)).toBe(motionRegistry[id].full);
      expect(resolveMotion(id, true)).toBe(motionRegistry[id].reduced);
    }

    expect(animatedKeys(motionRegistry.planetFloat.full)).toEqual(['y']);
    expect(animatedKeys(motionRegistry.portalGlow.full).sort()).toEqual([
      'opacity',
      'scale',
    ]);
    expect(animatedKeys(motionRegistry.scrollReveal.full).sort()).toEqual([
      'opacity',
      'y',
    ]);
  });

  it('leaves a transform-only entry with nothing to animate under reduce', () => {
    // The planet platform float is pure transform, so suppressing it empties
    // the target rather than substituting another channel.
    expect(animatedKeys(motionRegistry.planetFloat.reduced)).toEqual([]);
    expect(animatesOpacity(motionRegistry.planetFloat.full)).toBe(false);

    // The scroll reveal becomes opacity-only and the portal orb keeps its
    // opacity pulse.
    expect(animatedKeys(motionRegistry.scrollReveal.reduced)).toEqual(['opacity']);
    expect(animatedKeys(motionRegistry.portalGlow.reduced)).toEqual(['opacity']);
  });
});

describe('motion registry: animation channels', () => {
  it('Feature: dbz-pixel-portfolio, Property 15: Animation channel restriction', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...MOTION_IDS),
        fc.boolean(),
        (id, reduce) => {
          const target = resolveMotion(id, reduce);

          for (const key of animatedKeys(target)) {
            expect(
              COMPOSITED_KEYS.has(key),
              `${id} (${reduce ? 'reduce' : 'no-preference'}) animates "${key}", ` +
                'which is outside the transform and opacity channels Requirement ' +
                '14.2 permits.',
            ).toBe(true);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('keeps the suppression list inside the permitted transform family', () => {
    // If a key were added to TRANSFORM_KEYS without landing here, the channel
    // restriction would quietly stop covering it.
    for (const key of TRANSFORM_KEYS) {
      expect(TRANSFORM_FAMILY_KEYS.has(key)).toBe(true);
    }
    expect(COMPOSITED_KEYS.has('opacity')).toBe(true);
    expect(COMPOSITED_KEYS.has('backgroundColor')).toBe(false);
    expect(COMPOSITED_KEYS.has('top')).toBe(false);
  });

  it('treats transition as configuration rather than an animated channel', () => {
    // Every entry carries a `transition`; none of them may count as a channel,
    // otherwise the channel restriction would fail on configuration alone.
    for (const id of MOTION_IDS) {
      expect(animatedKeys(motionRegistry[id].full)).not.toContain('transition');
      expect(animatedKeys(motionRegistry[id].reduced)).not.toContain('transition');
    }
    expect(motionRegistry.planetFloat.full.transition).toBeDefined();
  });
});
