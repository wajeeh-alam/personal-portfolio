/**
 * The hero name lettering.
 *
 * The gradient fill, the black outline layer, and the drop shadow all live in
 * `.hero-name` in `src/index.css`, because `background-clip: text` cannot be
 * expressed as a Tailwind utility and the outline has to be painted on a
 * separate `::before` layer. That layer reads its glyphs from `data-text`, so
 * the attribute and the text child must always carry the identical string:
 * rendering `text` in both places from one prop is what keeps them in step.
 *
 * The element is a real `h1` with the text as its only child, so it remains the
 * document's single level-one heading and its accessible name is the plain name
 * string with no duplication from the outline layer.
 *
 * Sizing is a single `clamp()` with a `vw` middle term rather than breakpoint
 * steps: the lower bound keeps the name readable and the `12vw` term means the
 * glyph run scales with the viewport instead of overflowing it, so nothing scrolls
 * horizontally at 320 CSS pixels.
 */

export interface HeroLetteringProps {
  /** The name to render; also mirrored into `data-text` for the outline layer. */
  readonly text: string;
  /** Extra classes for layout; the visual contract classes are always applied. */
  readonly className?: string;
}

export function HeroLettering({ text, className }: HeroLetteringProps): JSX.Element {
  return (
    <h1
      data-text={text}
      className={[
        'hero-name font-display',
        'text-[clamp(2.5rem,12vw,7rem)] leading-none tracking-wide',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')
        .trim()}
    >
      {text}
    </h1>
  );
}

export default HeroLettering;
