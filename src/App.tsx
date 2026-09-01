import { useState } from 'react'
import { Scene } from './components/Scene'
import { SectionContent } from './components/SectionContent'
import { sections } from './data/sections'

function App() {
  const [activeIndex, setActiveIndex] = useState(0)

  const cycle = (direction: 1 | -1) => {
    setActiveIndex((current) => (current + direction + sections.length) % sections.length)
  }

  return (
    <main className="portfolio-shell">
      <SectionContent section={sections[activeIndex]} />
      <Scene
        activeIndex={activeIndex}
        onNext={() => cycle(1)}
        onPrevious={() => cycle(-1)}
        onSelect={setActiveIndex}
        sections={sections}
      />
    </main>
  )
}

export default App
