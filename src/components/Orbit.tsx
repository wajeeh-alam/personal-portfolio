import { Ball } from './Ball'
import type { PortfolioSection } from '../data/sections'

type OrbitProps = {
  activeIndex: number
  navigationDirection: 0 | 1 | -1
  onSelect: (index: number) => void
  sections: PortfolioSection[]
}

export function Orbit({ activeIndex, navigationDirection, onSelect, sections }: OrbitProps) {
  return (
    <nav
      aria-label="Portfolio sections"
      className="orbit"
    >
      <div aria-hidden="true" className="orbit-path" />
      {sections.map((section, index) => (
        <Ball
          index={index}
          isActive={index === activeIndex}
          key={section.id}
          label={section.label}
          navigationDirection={navigationDirection}
          onClick={() => onSelect(index)}
          slot={(index - activeIndex + 3 + sections.length) % sections.length}
        />
      ))}
    </nav>
  )
}
