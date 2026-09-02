export type PortfolioSection = {
  id: string
  label: string
  eyebrow: string
  title: string
  description: string
}

export const sections: PortfolioSection[] = [
  {
    id: 'about',
    label: 'About Me',
    eyebrow: '01 / ABOUT ME',
    title: 'A developer building bright, useful things.',
    description: 'A short introduction will live here. This MVP keeps the scene focused while the final portfolio story is written.',
  },
  {
    id: 'experience',
    label: 'Experience',
    eyebrow: '02 / EXPERIENCE',
    title: 'Selected roles and collaborations.',
    description: 'A concise timeline of experience, responsibilities, and the teams I have worked with.',
  },
  {
    id: 'impact',
    label: 'Impact',
    eyebrow: '03 / IMPACT',
    title: 'Impact, measured in outcomes.',
    description: 'From teaching code to shipping live products, my work directly leads teams into success.',
  },
  {
    id: 'projects',
    label: 'Projects',
    eyebrow: '04 / PROJECTS',
    title: 'A few things I am proud to ship.',
    description: 'Project cards, case studies, and links will replace this stub once portfolio content is ready.',
  },
  {
    id: 'skills',
    label: 'Skills',
    eyebrow: '05 / SKILLS',
    title: 'Tools that help turn ideas into product.',
    description: 'A focused skills list will go here, with room for the technologies and practices behind the work.',
  },
  {
    id: 'awards-interests',
    label: 'Awards/Interests',
    eyebrow: '06 / AWARDS & INTERESTS',
    title: 'The details beyond the work.',
    description: 'Awards, side quests, and a few personal interests will make this section more human later.',
  },
  {
    id: 'contact',
    label: 'Contact',
    eyebrow: '07 / CONTACT',
    title: 'Let’s make something memorable.',
    description: 'A direct way to get in touch will live here. For now, this is a simple content placeholder.',
  },
]
