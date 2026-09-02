import { AnimatePresence, motion } from 'framer-motion'
import type { PortfolioSection } from '../data/sections'

type SectionContentProps = {
  section: PortfolioSection
}

const aboutHighlights = [
  'UWaterloo CS [1A]',
  'Founding Engineer @ Oro',
  '1.8k+ followers (@wajeehalam._)',
]

export function SectionContent({ section }: SectionContentProps) {
  return (
    <section aria-labelledby={`${section.id}-title`} className="section-content">
      <AnimatePresence mode="wait">
        <motion.div
          className="section-copy"
          exit={{ opacity: 0 }}
          key={section.id}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          {section.id === 'about' ? (
            <>
              <h1 className="about-highlights" id={`${section.id}-title`}>
                {aboutHighlights.map((highlight, index) => (
                  <motion.span
                    animate={{ opacity: 1, y: 0 }}
                    initial={{ opacity: 0, y: 8 }}
                    key={highlight}
                    transition={{ delay: 1.3 + index * 0.18, duration: 0.58, ease: 'easeOut' }}
                  >{highlight}</motion.span>
                ))}
              </h1>
              <div aria-label="GitHub contribution history" className="github-history">
                <img
                  alt="Wajeeh Alam's GitHub contribution history"
                  className="github-chart-image"
                  decoding="async"
                  src="https://ghchart.rshah.org/58d68d/wajeeh-alam"
                />
              </div>
            </>
          ) : (
            <>
              <motion.p
                animate={{ opacity: 1, y: 0 }}
                className="section-eyebrow"
                initial={{ opacity: 0, y: -5 }}
                transition={{ delay: 0, duration: 0.55, ease: 'easeOut' }}
              >{section.eyebrow}</motion.p>
              <motion.h1
                animate={{ opacity: 1, y: 0 }}
                id={`${section.id}-title`}
                initial={{ opacity: 0, y: 7 }}
                transition={{ delay: 0.18, duration: 0.62, ease: 'easeOut' }}
              >{section.title}</motion.h1>
              <motion.p
                animate={{ opacity: 1, y: 0 }}
                className="section-description"
                initial={{ opacity: 0, y: 8 }}
                transition={{ delay: 0.36, duration: 0.58, ease: 'easeOut' }}
              >{section.description}</motion.p>
            </>
          )}
          {section.id === 'impact' && (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              aria-label="Contribution activity placeholder"
              className="contribution-placeholder"
              initial={{ opacity: 0, y: 8 }}
              transition={{ delay: 0.54, duration: 0.52, ease: 'easeOut' }}
            >
              <span>Contribution activity</span>
              <div className="contribution-grid">
                {Array.from({ length: 35 }, (_, index) => <i key={index} />)}
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
