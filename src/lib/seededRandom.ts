/**
 * Deterministic pseudo-random number generation.
 *
 * The hero sparkle layout is derived from a fixed seed so the same particle
 * positions render on every mount, every reload, and in every test run. That
 * determinism is what lets the sparkle tests assert exact layout values instead of
 * ranges, and it keeps React double-invocation under StrictMode from shuffling the
 * scene.
 *
 * `mulberry32` is a 32-bit generator: tiny, dependency-free, and more than
 * adequate for decorative layout. It is not cryptographically secure and must
 * never be used for tokens, identifiers, or anything security-sensitive.
 *
 * Reference: https://github.com/bryc/code/blob/master/jshash/PRNGs.md#mulberry32
 */

/**
 * Creates a seeded generator producing a deterministic sequence of numbers in
 * `[0, 1)`.
 *
 * Each returned generator carries its own internal state, so two generators
 * built from the same seed emit identical sequences independently of one
 * another. The seed is coerced with `>>> 0`, meaning any finite number is
 * accepted (negatives and fractions included) and reduced to an unsigned 32-bit
 * integer; `NaN` and non-finite values collapse to `0`.
 *
 * @param seed - Seed value, reduced to an unsigned 32-bit integer.
 * @returns A generator function returning the next value in `[0, 1)` on each call.
 *
 * @example
 * const rand = mulberry32(0x5eed);
 * const a = rand(); // always the same first value for this seed
 * const b = rand(); // deterministic successor
 */
export function mulberry32(seed: number): () => number {
  // Coerce to an unsigned 32-bit integer; this is the generator's entire state.
  let state = seed >>> 0;

  return function next(): number {
    // Advance the state by the golden-ratio increment (2^32 / phi).
    state = (state + 0x6d2b79f5) >>> 0;

    // Mix: two rounds of multiply-xor-shift over the 32-bit state.
    let mixed = state;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);

    // Map the 32-bit result into [0, 1): 2^32 = 4294967296.
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}
