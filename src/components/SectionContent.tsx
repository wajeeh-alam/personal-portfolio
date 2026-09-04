import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { PortfolioSection } from '../data/sections'
import radar from '../../assets/images/dragonball_radar.png'
import resume from '../../assets/Wajeeh_Alam-CV.pdf'

type SectionContentProps = {
  section: PortfolioSection
}

export function SectionContent({ section }: SectionContentProps) {
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [radarLikes, setRadarLikes] = useState<number | null>(null)
  const [likeError, setLikeError] = useState('')

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

  useEffect(() => {
    const timer = window.setTimeout(() => setIsInitialLoad(false), 1850)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!supabaseUrl || !supabaseKey) return

    const loadLikes = async () => {
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/page_likes?slug=eq.portfolio&select=like_count&limit=1`, {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        })
        if (!response.ok) return

        const rows = await response.json() as Array<{ like_count: number }>
        setRadarLikes((current) => current === null ? rows[0]?.like_count ?? 0 : Math.max(current, rows[0]?.like_count ?? 0))
      } catch {
        // The button reports a clear error if the visitor tries to like while offline.
      }
    }

    void loadLikes()
  }, [supabaseKey, supabaseUrl])

  const addRadarLike = async () => {
    if (!supabaseUrl || !supabaseKey) {
      setLikeError('Likes are not connected yet. Restart the local dev server and try again.')
      return
    }

    setLikeError('')
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/increment_portfolio_likes`, {
        body: JSON.stringify({}),
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })
      if (!response.ok) {
        setLikeError('Could not save that like. Please try again.')
        return
      }

      const updatedLikes = await response.json() as number
      setRadarLikes((current) => current === null ? updatedLikes : Math.max(current, updatedLikes))
    } catch {
      setLikeError('Could not reach the likes service. Please try again.')
    }
  }

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
              <motion.p
                animate={{ opacity: 1, y: 0 }}
                className="section-eyebrow"
                initial={{ opacity: 0, y: -5 }}
                transition={{ delay: isInitialLoad ? 1.18 : 0, duration: 0.55, ease: 'easeOut' }}
              >{section.eyebrow}</motion.p>
              <h1 className="about-highlights" id={`${section.id}-title`}>
                <motion.span
                  animate={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 8 }}
                  transition={{ delay: isInitialLoad ? 1.3 : 0.12, duration: 0.58, ease: 'easeOut' }}
                >UWaterloo CS [1A]</motion.span>
                <motion.span
                  animate={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 8 }}
                  transition={{ delay: isInitialLoad ? 1.48 : 0.24, duration: 0.58, ease: 'easeOut' }}
                >Founding Engineer @ Oro</motion.span>
                <motion.span
                  animate={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 8 }}
                  transition={{ delay: isInitialLoad ? 1.66 : 0.36, duration: 0.58, ease: 'easeOut' }}
                >
                  1.8k+ followers (
                  <a href="https://www.instagram.com/wajeehalam._/" rel="noreferrer" target="_blank">@wajeehalam._</a>
                  )
                </motion.span>
              </h1>
              <div aria-label="GitHub contribution history" className={`github-history${isInitialLoad ? ' initial-about-load' : ''}`}>
                <img
                  alt="Wajeeh Alam's GitHub contribution history"
                  className="github-chart-image"
                  decoding="async"
                  src="https://ghchart.rshah.org/58d68d/wajeeh-alam"
                />
              </div>
              <div className="about-cta">
                <motion.p
                  animate={{ opacity: 1, y: 0 }}
                  className="internship-message"
                  initial={{ opacity: 0, y: 8 }}
                  transition={{ delay: isInitialLoad ? 2.72 : 0.16, duration: 0.42, ease: 'easeOut' }}
                >Seeking Summer 2027 Internship Opportunities</motion.p>
                <motion.button
                  animate={{ opacity: 1, y: 0 }}
                  aria-label={`Like Wajeeh's portfolio. ${radarLikes ?? 'Loading'} likes so far.`}
                  className="radar-like-button"
                  initial={{ opacity: 0, y: 8 }}
                  onClick={addRadarLike}
                  transition={{ delay: isInitialLoad ? 2.88 : 0.28, duration: 0.42, ease: 'easeOut' }}
                  type="button"
                >
                  <img alt="" aria-hidden="true" src={radar} />
                  <span>Like my portfolio?</span>
                  <strong>{radarLikes ?? '…'}</strong>
                </motion.button>
                {likeError && <p className="like-error" role="alert">{likeError}</p>}
              </div>
            </>
          ) : section.id === 'experience' ? (
            <>
              <motion.p animate={{ opacity: 1, y: 0 }} className="section-eyebrow" initial={{ opacity: 0, y: -5 }} transition={{ duration: 0.55, ease: 'easeOut' }}>{section.eyebrow}</motion.p>
              <motion.h1 animate={{ opacity: 1, y: 0 }} id={`${section.id}-title`} initial={{ opacity: 0, y: 7 }} transition={{ delay: 0.18, duration: 0.62, ease: 'easeOut' }}>Experience</motion.h1>
              <motion.ol animate={{ opacity: 1, y: 0 }} className="experience-timeline" initial={{ opacity: 0, y: 8 }} transition={{ delay: 0.36, duration: 0.58, ease: 'easeOut' }}>
                <li><time>JUL 2026 — PRESENT</time><strong>Founding Engineer · Oro</strong></li>
                <li><time>JUN — AUG 2025 · JUN — AUG 2026</time><strong>Senior Coding Instructor · UofT</strong></li>
                <li><time>DEC 2024 — MAR 2025</time><strong>Lead Web Developer · SproutHacks</strong></li>
                <li><time>JUN 2024 — SEP 2024</time><strong>Machine Learning Intern · STEMAway</strong></li>
              </motion.ol>
              <motion.a animate={{ opacity: 1, y: 0 }} className="resume-link" href={resume} initial={{ opacity: 0, y: 8 }} rel="noreferrer" target="_blank" transition={{ delay: 0.54, duration: 0.48, ease: 'easeOut' }}>View resume ↗</motion.a>
            </>
          ) : section.id === 'impact' ? (
            <>
              <motion.p animate={{ opacity: 1, y: 0 }} className="section-eyebrow" initial={{ opacity: 0, y: -5 }} transition={{ duration: 0.55, ease: 'easeOut' }}>{section.eyebrow}</motion.p>
              <motion.h1 animate={{ opacity: 1, y: 0 }} className="impact-title" id={`${section.id}-title`} initial={{ opacity: 0, y: 7 }} transition={{ delay: 0.18, duration: 0.62, ease: 'easeOut' }}>Impact, measured in outcomes.</motion.h1>
              <motion.div animate={{ opacity: 1, y: 0 }} aria-label="Impact metrics" className="impact-metrics" initial={{ opacity: 0, y: 8 }} transition={{ delay: 0.36, duration: 0.52, ease: 'easeOut' }}>
                <div><strong>300+</strong><span>students taught to code</span></div>
                <div><strong>3</strong><span>software internships</span></div>
                <div><strong>~$100K+</strong><span>in scholarships earned</span></div>
                <div><strong>1,000+</strong><span>hours building with code</span></div>
              </motion.div>
            </>
          ) : section.id === 'projects' ? (
            <>
              <motion.p animate={{ opacity: 1, y: 0 }} className="section-eyebrow" initial={{ opacity: 0, y: -5 }} transition={{ duration: 0.55, ease: 'easeOut' }}>{section.eyebrow}</motion.p>
              <motion.h1 animate={{ opacity: 1, y: 0 }} className="compact-title" id={`${section.id}-title`} initial={{ opacity: 0, y: 7 }} transition={{ delay: 0.18, duration: 0.62, ease: 'easeOut' }}>Things I’m building.</motion.h1>
              <motion.div animate={{ opacity: 1, y: 0 }} className="project-list" initial={{ opacity: 0, y: 8 }} transition={{ delay: 0.36, duration: 0.58, ease: 'easeOut' }}>
                <a aria-label="View Oro" href="https://www.buildingoro.ca/" rel="noreferrer" target="_blank"><article><h2>Oro <span>A.I. fashion stylist (2k+ downloads)</span><b aria-hidden="true">↗</b></h2><p>Personalized outfit discovery and styling with AI.</p><small>Python · Typescript · React Native · NodeJS · PostgreSQL · Supabase</small></article></a>
                <a aria-label="View drawOff" href="https://drawoff.vercel.app/" rel="noreferrer" target="_blank"><article><h2>drawOff <span>scaling toward 1M+ users</span><b aria-hidden="true">↗</b></h2><p>A real-time multiplayer drawing game with AI judging and live spectator voting.</p><small>React · TypeScript · Tailwind · Node.js · Socket.io</small></article></a>
                <a aria-label="View StudyQuest on GitHub" href="https://github.com/wajeeh-alam/studyquest" rel="noreferrer" target="_blank"><article><h2>StudyQuest <span>iOS</span><b aria-hidden="true">↗</b></h2><p>A gamified study companion designed for focused learning.</p><small>React Native · Expo · Firebase</small></article></a>
              </motion.div>
            </>
          ) : section.id === 'skills' ? (
            <>
              <motion.p animate={{ opacity: 1, y: 0 }} className="section-eyebrow" initial={{ opacity: 0, y: -5 }} transition={{ duration: 0.55, ease: 'easeOut' }}>{section.eyebrow}</motion.p>
              <motion.h1 animate={{ opacity: 1, y: 0 }} className="compact-title" id={`${section.id}-title`} initial={{ opacity: 0, y: 7 }} transition={{ delay: 0.18, duration: 0.62, ease: 'easeOut' }}>My toolkit.</motion.h1>
              <motion.div animate={{ opacity: 1, y: 0 }} className="skill-groups" initial={{ opacity: 0, y: 8 }} transition={{ delay: 0.36, duration: 0.58, ease: 'easeOut' }}>
                <div><h2>Languages</h2><p>TypeScript · JavaScript · HTML/CSS · Python · Lua · C++</p></div>
                <div><h2>Frameworks & data</h2><p>React · React Native · Node.js · Express · SQL/PostgreSQL · Redis · MongoDB · Firebase</p></div>
                <div><h2>Workflow</h2><p>Git · GitHub · CI/CD pipelines</p></div>
              </motion.div>
            </>
          ) : section.id === 'contact' ? (
            <>
              <motion.p animate={{ opacity: 1, y: 0 }} className="section-eyebrow" initial={{ opacity: 0, y: -5 }} transition={{ duration: 0.55, ease: 'easeOut' }}>{section.eyebrow}</motion.p>
              <motion.h1 animate={{ opacity: 1, y: 0 }} className="compact-title" id={`${section.id}-title`} initial={{ opacity: 0, y: 7 }} transition={{ delay: 0.18, duration: 0.62, ease: 'easeOut' }}>Let’s make something memorable.</motion.h1>
              <motion.nav animate={{ opacity: 1, y: 0 }} aria-label="Contact links" className="contact-cards" initial={{ opacity: 0, y: 8 }} transition={{ delay: 0.36, duration: 0.58, ease: 'easeOut' }}>
                <a href="https://www.linkedin.com/in/wajeeh-alam" rel="noreferrer" target="_blank"><span>LinkedIn</span><strong>linkedin.com/in/wajeeh-alam</strong></a>
                <a href="tel:+16472857970"><span>Phone</span><strong>+1 (647) 285-7970</strong></a>
                <a href="mailto:w5alam@uwaterloo.ca"><span>Email</span><strong>w5alam@uwaterloo.ca</strong></a>
                <a href="https://www.instagram.com/wajeehalam._/" rel="noreferrer" target="_blank"><span>Instagram</span><strong>@wajeehalam._</strong></a>
              </motion.nav>
            </>
          ) : section.id === 'awards-interests' ? (
            <>
              <motion.p animate={{ opacity: 1, y: 0 }} className="section-eyebrow" initial={{ opacity: 0, y: -5 }} transition={{ duration: 0.55, ease: 'easeOut' }}>{section.eyebrow}</motion.p>
              <motion.h1 animate={{ opacity: 1, y: 0 }} className="compact-title" id={`${section.id}-title`} initial={{ opacity: 0, y: 7 }} transition={{ delay: 0.18, duration: 0.62, ease: 'easeOut' }}>Beyond the build.</motion.h1>
              <motion.div animate={{ opacity: 1, y: 0 }} className="awards-interests" initial={{ opacity: 0, y: 8 }} transition={{ delay: 0.36, duration: 0.58, ease: 'easeOut' }}>
                <div><h2>Awards</h2><ul><li>Top 4 / 60 · GenZCanHack</li><li>TDSSAA Regional Frisbee Champion</li><li>Queen’s Chancellor Scholarship · $48K+</li></ul></div>
                <div><h2>Interests</h2><ul><li>Dragon Ball Z & anime</li><li>Pop & hip-hop music</li><li>Personal finance</li><li>Long walks</li></ul></div>
              </motion.div>
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
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
