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
          animate={{ opacity: 1 }}
          className="section-copy"
          initial={{ opacity: 0 }}
          key={section.id}
          transition={{ duration: 0.24, ease: 'easeOut' }}
        >
          <p className="section-eyebrow">{section.eyebrow}</p>
          <h1 id={`${section.id}-title`}>{section.title}</h1>
          <p className="section-description">{section.description}</p>
          {section.id === 'impact' && (
            <div aria-label="Contribution activity placeholder" className="contribution-placeholder">
              <span>Contribution activity</span>
              <div className="contribution-grid">
                {Array.from({ length: 35 }, (_, index) => <i key={index} />)}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
