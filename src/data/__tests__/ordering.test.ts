/**
 * Experience timeline ordering invariants.
 *
 * The committed timeline is three entries long, so a hand-written assertion on
 * the shipped order proves only that today's array is right. The real claim is
 * about the comparator: `byRecency` must place *any* set of roles most-recent
 * first, which is why the shipped order is checked as a concrete case and the
 * comparator is checked as a property over generated lists.
 *
 * Start dates cannot drive this order — the ongoing UTSC role starts before the
 * completed MakerKids role — so the recency key is "ongoing outranks every
 * completed role, and completed roles rank by `endedAt` descending".
 */
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import type { ExperienceEntry, PaletteAccent } from '../../types';
import { byRecency, experience } from '../experience';

/** Accents an entry's marker may draw from, mirroring `PaletteAccent`. */
const ACCENTS: readonly PaletteAccent[] = [
  'magenta',
  'blue',
  'gold',
  'grass',
  'grassLight',
];

/**
 * Sentinel key for an ongoing role. Lexicographically above every `YYYY-MM`
 * value the generator or the data can produce, which is exactly the intended
 * ranking: an in-progress role is more recent than any finished one.
 */
const ONGOING_KEY = '9999-99';

/**
 * The single comparable value `byRecency` orders by. Expressing the comparator's
 * intent as a key lets the property assert monotonicity directly instead of
 * re-implementing the comparator's branches.
 */
const recencyKey = (entry: ExperienceEntry): string =>
  entry.ongoing ? ONGOING_KEY : (entry.endedAt ?? '');

/** ISO year-month strings, the only shape `endedAt` carries in the data. */
const isoYearMonth = fc
  .record({
    year: fc.integer({ min: 1990, max: 2099 }),
    month: fc.integer({ min: 1, max: 12 }),
  })
  .map(({ year, month }) => `${year}-${String(month).padStart(2, '0')}`);

/**
 * An `ExperienceEntry` whose `ongoing`/`endedAt` pair stays consistent with the
 * type contract: ongoing roles have no end date, completed roles always do.
 * Years and months are drawn from a narrow range on purpose, so generated lists
 * collide on end dates often enough to exercise ties.
 */
const experienceEntryArb = (): fc.Arbitrary<ExperienceEntry> =>
  fc
    .record({
      id: fc.string({ minLength: 1, maxLength: 12 }),
      title: fc.string({ minLength: 1, maxLength: 20 }),
      organization: fc.string({ minLength: 1, maxLength: 20 }),
      dateRange: fc.string({ minLength: 1, maxLength: 24 }),
      ongoing: fc.boolean(),
      endedAt: isoYearMonth,
      highlights: fc.array(fc.string({ minLength: 1, maxLength: 40 }), {
        maxLength: 3,
      }),
      markerColor: fc.constantFrom(...ACCENTS),
    })
    .map((entry) => ({
      ...entry,
      endedAt: entry.ongoing ? null : entry.endedAt,
    }));

describe('experience ordering: byRecency', () => {
  it('Feature: dbz-pixel-portfolio, Property 2: Timeline recency ordering', () => {
    fc.assert(
      fc.property(
        fc.array(experienceEntryArb(), { maxLength: 12 }),
        (entries) => {
          const sorted = [...entries].sort(byRecency);

          // 1. The recency key never increases as the list is walked.
          for (let index = 0; index + 1 < sorted.length; index += 1) {
            const current = sorted[index];
            const next = sorted[index + 1];
            if (!current || !next) continue;
            expect(
              recencyKey(current).localeCompare(recencyKey(next)),
              `position ${index} (key ${recencyKey(current)}) ranks below ` +
                `position ${index + 1} (key ${recencyKey(next)}).`,
            ).toBeGreaterThanOrEqual(0);
          }

          // 2. Ongoing roles occupy a prefix: no completed role precedes one.
          const lastOngoing = sorted.reduce(
            (last, entry, index) => (entry.ongoing ? index : last),
            -1,
          );
          const ongoingCount = sorted.filter((entry) => entry.ongoing).length;
          expect(
            lastOngoing + 1,
            'ongoing roles should form an unbroken prefix of the sorted list.',
          ).toBe(ongoingCount);

          // 3. Completed roles descend by end date.
          const completedEnds = sorted
            .filter((entry) => !entry.ongoing)
            .map((entry) => entry.endedAt ?? '');
          const descending = [...completedEnds].sort((a, b) => b.localeCompare(a));
          expect(completedEnds).toEqual(descending);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('orders the committed roles UTSC → MakerKids → SproutHacks', () => {
    expect(experience.map((entry) => entry.id)).toEqual([
      'utsc-senior-coding-instructor',
      'makerkids-computer-robotics-instructor',
      'sprouthacks-lead-web-developer',
    ]);

    // The ongoing role leads despite MakerKids ending later, which is the case
    // a start-date sort would get wrong.
    const [first] = experience;
    expect(first?.ongoing).toBe(true);
    expect(first?.endedAt).toBeNull();
  });
});
