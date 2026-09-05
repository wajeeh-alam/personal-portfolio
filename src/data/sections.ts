export type PortfolioSection = {
  id: string
  label: string
  eyebrow: string
}

export const sections: PortfolioSection[] = [
  {
    id: 'about',
    label: 'About Me',
    eyebrow: '01 / ABOUT ME',
  },
  {
    id: 'experience',
    label: 'Experience',
    eyebrow: '02 / EXPERIENCE',
  },
  {
    id: 'impact',
    label: 'Impact',
    eyebrow: '03 / IMPACT',
  },
  {
    id: 'projects',
    label: 'Projects',
    eyebrow: '04 / PROJECTS',
  },
  {
    id: 'skills',
    label: 'Skills',
    eyebrow: '05 / SKILLS',
  },
  {
    id: 'awards-interests',
    label: 'Awards/Interests',
    eyebrow: '06 / AWARDS & INTERESTS',
  },
  {
    id: 'contact',
    label: 'Contact',
    eyebrow: '07 / CONTACT',
  },
]
