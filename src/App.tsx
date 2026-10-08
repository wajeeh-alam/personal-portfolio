import { useEffect, useRef, useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { Scene } from './components/Scene'
import { SectionContent } from './components/SectionContent'
import { sections } from './data/sections'

function App() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isNavigating, setIsNavigating] = useState(false)
  const isNavigatingRef = useRef(false)
  const navigationTimerRef = useRef<number | null>(null)

  useEffect(() => () => {
    if (navigationTimerRef.current !== null) window.clearTimeout(navigationTimerRef.current)
  }, [])

  const beginNavigation = (navigate: () => void) => {
    if (isNavigatingRef.current) return

    isNavigatingRef.current = true
    setIsNavigating(true)
    navigate()
    navigationTimerRef.current = window.setTimeout(() => {
      isNavigatingRef.current = false
      setIsNavigating(false)
    }, 440)
  }

  const cycle = (direction: 1 | -1) => {
    beginNavigation(() => {
      setActiveIndex((current) => (current + direction + sections.length) % sections.length)
    })
  }

  const selectSection = (index: number) => {
    if (index === activeIndex || isNavigatingRef.current) return
    beginNavigation(() => setActiveIndex(index))
  }

  return (
    <main className="portfolio-shell">
      <div aria-label="Wajeeh" className="portfolio-name">WAJEEH</div>
      <SectionContent section={sections[activeIndex]} />
      <Scene
        activeIndex={activeIndex}
        isNavigating={isNavigating}
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
