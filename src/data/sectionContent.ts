export const sectionContent = {
  fallback: {
    title: 'Section unavailable.',
    description: 'This section is not available.',
  },
  about: {
    highlights: ['UWaterloo CS [1A]', 'Founding Engineer @ Oro', '1.8k+ followers'],
    socialHandle: '@wajeehalam._',
    internshipMessage: 'Seeking Summer 2027 Internship Opportunities',
  },
  experience: {
    title: 'Experience',
    roles: [
      ['JUL 2026 — PRESENT', 'Founding Engineer · Oro'],
      ['JUN — AUG 2025 · JUN — AUG 2026', 'Senior Coding Instructor · UofT'],
      ['DEC 2024 — MAR 2025', 'Lead Web Developer · SproutHacks'],
      ['JUN 2024 — SEP 2024', 'Machine Learning Intern · STEMAway'],
    ],
    resumeLabel: 'View resume ↗',
  },
  impact: {
    title: 'Impact, measured in outcomes.',
    metrics: [
      ['300+', 'students taught to code'],
      ['3', 'software internships'],
      ['~$100K+', 'in scholarships earned'],
      ['1,000+', 'hours building with code'],
    ],
  },
  projects: {
    title: 'Things I’m building.',
    items: [
      {
        name: 'Oro',
        detail: 'A.I. fashion stylist (2k+ downloads)',
        url: 'https://www.buildingoro.ca/',
        description: 'Personalized outfit discovery and styling with AI.',
        technologies: 'Python · Typescript · React Native · NodeJS · PostgreSQL · Supabase',
      },
      {
        name: 'drawOff',
        detail: 'scaling toward 1M+ users',
        url: 'https://drawoff.vercel.app/',
        description: 'A real-time multiplayer drawing game with AI judging and live spectator voting.',
        technologies: 'React · TypeScript · Tailwind · Node.js · Socket.io',
      },
      {
        name: 'StudyQuest',
        detail: 'iOS',
        url: 'https://github.com/wajeeh-alam/studyquest',
        description: 'A gamified study companion designed for focused learning.',
        technologies: 'React Native · Expo · Firebase',
      },
    ],
  },
  skills: {
    title: 'My toolkit.',
    groups: [
      ['Languages', 'TypeScript · JavaScript · HTML/CSS · Python · Lua · C++'],
      ['Frameworks & data', 'React · React Native · Node.js · Express · SQL/PostgreSQL · Redis · MongoDB · Firebase'],
      ['Workflow', 'Git · GitHub · CI/CD pipelines'],
    ],
  },
  contact: {
    title: 'Let’s make something memorable.',
    links: [
      ['LinkedIn', 'linkedin.com/in/wajeeh-alam', 'https://www.linkedin.com/in/wajeeh-alam'],
      ['Phone', '+1 (647) 285-7970', 'tel:+16472857970'],
      ['Email', 'w5alam@uwaterloo.ca', 'mailto:w5alam@uwaterloo.ca'],
      ['Instagram', '@wajeehalam._', 'https://www.instagram.com/wajeehalam._/'],
    ],
  },
  awardsInterests: {
    title: 'Beyond the build.',
    awards: ['Top 4 / 60 · GenZCanHack', 'TDSSAA Regional Frisbee Champion', 'Queen’s Chancellor Scholarship · $48K+'],
    interests: ['Dragon Ball Z & anime', 'Pop & hip-hop music', 'Personal finance', 'Long walks'],
  },
} as const