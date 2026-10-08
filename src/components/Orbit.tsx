import { useLayoutEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Ball } from './Ball'
import type { PortfolioSection } from '../data/sections'

type OrbitProps = {
  activeIndex: number
  isNavigating: boolean
  onSelect: (index: number) => void
  sections: PortfolioSection[]
}

export function Orbit({ activeIndex, isNavigating, onSelect, sections }: OrbitProps) {
  const previousIndexRef = useRef(activeIndex)
  const [rotationSteps, setRotationSteps] = useState(0)
  const prefersReducedMotion = useReducedMotion()
  const stepAngle = 360 / sections.length
  const transitionDuration = prefersReducedMotion ? 0 : 0.42

  useLayoutEffect(() => {
    const previousIndex = previousIndexRef.current
    if (previousIndex === activeIndex) return

    let stepDelta = activeIndex - previousIndex
    if (stepDelta > sections.length / 2) stepDelta -= sections.length
    if (stepDelta < -sections.length / 2) stepDelta += sections.length

    setRotationSteps((current) => current + stepDelta)
    previousIndexRef.current = activeIndex
  }, [activeIndex, sections.length])

  const wheelRotation = rotationSteps * -stepAngle

  return (
    <nav
      aria-label="Portfolio sections"
      aria-busy={isNavigating}
      className="orbit"
    >
      <div aria-hidden="true" className="orbit-path" />
      <motion.div
        animate={{ rotate: wheelRotation }}
        className="orbit-wheel"
        style={{ transform: 'translateZ(0)' }}
        transition={{ duration: transitionDuration, ease: [0.22, 0.8, 0.25, 1] }}
      >
        {sections.map((section, index) => {
          const angle = -90 + index * stepAngle

          return (
            <Ball
              angle={angle}
              index={index}
              isActive={index === activeIndex}
              isDisabled={isNavigating}
              key={section.id}
              label={section.label}
              onClick={() => onSelect(index)}
              transitionDuration={transitionDuration}
              wheelRotation={wheelRotation}
            />
          )
        })}
      </motion.div>
    </nav>
  )
}
