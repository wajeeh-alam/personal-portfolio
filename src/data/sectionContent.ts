export const sectionContent = {
  fallback: {
    title: 'Section unavailable.',
    description: 'This section is not available.',
  },
  about: {
    highlights: ['UWaterloo CS [1A]', 'Founding Engineer @ Oro', '2k+ followers'],
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
      ['3', 'SWE internships'],
      ['~$100K+', 'in scholarships earned'],
      ['1,500+', 'hours building with code'],
    ],
  },
  projects: {
    title: 'Things I’m building.',
    items: [
      {
        name: 'Oro',
        detail: 'AI fashion stylist (2k+ downloads)',
        url: 'https://www.buildingoro.ca/',
        description: 'Personalized outfit discovery and styling with AI.',
        technologies: 'Python · Typescript · React Native · NodeJS · PostgreSQL · Supabase',
      },
      {
        name: 'ClipRank',
        detail: 'scaling to 1M+ insta followers',
        url: 'https://github.com/wajeeh-alam/cliprank/',
        description: 'Long-form video -> viral, AI-scored clips for my social (@wajeehalam._), boosted views to 350k/monthly.',
        technologies: 'Ruby on Rails · Python · PostgreSQL · Whisper · OpenCV · Docker',
      },
      {
        name: 'VeloCity',
        detail: '',
        url: 'https://github.com/wajeeh-alam/VeloCity/',
        description: 'Trained a random forest model in Python using 754 GIS observations, improving prediction by 39%.',
        technologies: 'Python (Scikit-learn, Pandas, NumPy) · React · TypeScript · Vite',
      },
      {
        name: 'SnapStream',
        detail: '',
        url: 'https://github.com/wajeeh-alam/snapstream',
        description: 'A production-oriented social feed API built for horizontally scaled AWS deployment.',
        technologies: 'FastAPI · AWS · Terraform · ECS Fargate · PostgreSQL · Valkey · S3',
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
