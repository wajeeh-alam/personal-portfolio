import { useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { Scene } from './components/Scene'
import { SectionContent } from './components/SectionContent'
import { sections } from './data/sections'

function App() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [navigationDirection, setNavigationDirection] = useState<0 | 1 | -1>(0)

  const cycle = (direction: 1 | -1) => {
    setNavigationDirection(direction)
    setActiveIndex((current) => (current + direction + sections.length) % sections.length)
  }

  const selectSection = (index: number) => {
    if (index === activeIndex) return

    const forwardDistance = (index - activeIndex + sections.length) % sections.length
    const backwardDistance = (activeIndex - index + sections.length) % sections.length
    setNavigationDirection(forwardDistance <= backwardDistance ? 1 : -1)
    setActiveIndex(index)
  }

  return (
    <main className="portfolio-shell">
      <div aria-label="Wajeeh" className="portfolio-name">WAJEEH</div>
      <SectionContent section={sections[activeIndex]} />
      <Scene
        activeIndex={activeIndex}
        navigationDirection={navigationDirection}
        onNext={() => cycle(1)}
        onPrevious={() => cycle(-1)}
        onSelect={selectSection}
        sections={sections}
      />
      <Analytics />
    </main>
  )
}

export default App
