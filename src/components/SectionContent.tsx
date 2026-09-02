import { AnimatePresence, motion } from 'framer-motion'
import type { PortfolioSection } from '../data/sections'

type SectionContentProps = {
  section: PortfolioSection
}

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
