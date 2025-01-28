export const navItems = [
  { name: 'Home', link: '#home' },
  { name: 'About', link: '#about' },
  { name: 'Projects', link: '#projects' },
  { name: 'Contact', link: '#contact' },
];

export const gridItems = [
  {
    id: 1,
    title: 'Click The Cookie!',
    description: '',
    className: 'lg:col-span-3 md:col-span-6 md:row-span-4 lg:min-h-[60vh]',
    imgClassName: 'w-30 h-30 md:w-48 md:h-48',
    titleClassName: '__#th Click',
    img: '/wajeehscookie.png', // this should be clickable and go up by 1 everytime it's clicked! # of users should be displayed after
    spareImg: '',
  },
  {
    id: 2,
    title: 'Download Resume',
    description: '',
    className: 'lg:col-span-2 md:col-span-3 md:row-span-2',
    imgClassName: '',
    titleClassName: 'justify-center',
    img: '',
    spareImg: '',
  },
  {
    id: 3,
    title: 'I\'m building a variety of projects; check them out below.',
    description: '',
    className: 'lg:col-span-2 md:col-span-3 md:row-span-1',
    imgClassName: '',
    titleClassName: 'justify-start',
    img: '/grid.svg',
    spareImg: '/b4.svg',
  },

  {
    id: 4,
    title: 'Connect With Me',
    description: 'My Socials',
    className: 'md:col-span-3 md:row-span-2',
    imgClassName: 'absolute right-0 bottom-0 md:w-96 w-60',
    titleClassName: 'justify-center md:justify-start lg:justify-center',
    img: '/b5.svg',
    spareImg: '/grid.svg',
  },
  {
    id: 5,
    title: 'Want to Work Together?',
    description: '',
    className: 'lg:col-span-2 md:col-span-3 md:row-span-1',
    imgClassName: '',
    titleClassName: 'justify-center md:max-w-full max-w-60 text-center',
    img: '',
    spareImg: '',
  },
];

export const projects = [
  {
    id: 1,
    title: 'StudyQuest',
    des: 'Gamified cross-platform productivity app helping students study through quests, progress tracking and more.',
    img: '/p1.svg',
    iconLists: [
      '/reactnative.svg',
      '/tailwind.svg',
      '/ts.svg',
      '/firebase.svg',
    ],
    link: 'https://github.com/Mr-W-Squidward/studyquest',
  },
  {
    id: 2,
    title: 'Carta A.I',
    des: 'An AI study buddy that works for any and all subjects.',
    img: '/p2.svg',
    iconLists: ['/js.svg', '/tail.svg', '/ts.svg'],
    link: 'https://github.com/Mr-W-Squidward/aiflashcards',
  },
  {
    id: 3,
    title: 'NumNudge',
    des: 'Full-stack tutoring website featuring sign-up/login, authentication, emailing features, SEO optimization, and more.',
    img: '/p3.svg',
    iconLists: ['/ts.svg', '/tail.svg', '/html.svg'],
    link: 'https://github.com/Mr-W-Squidward/NumNudge',
  },
  {
    id: 4,
    title: 'Alonzo',
    des: 'A custom AI chatbot built using NextJS, Gemini, and Firebase, complete with a custom built-from-scratch authentication system.',
    img: '/p4.svg',
    iconLists: ['/next.svg', '/tail.svg', '/ts.svg', '/gemini.svg', '/firebase.svg'],
    link: 'https://alonzo-one.vercel.app/',
  },
];

export const workExperience = [
  {
    id: 1,
    title: 'Web Developer',
    desc: 'SproutHacks development lead team. Using Typescript, Firebase, and React to build the hacker dashboard/auth system.',
    className: 'md:col-span-2',
    thumbnail: '/exp1.svg',
  },
  {
    id: 2,
    title: 'Machine Learning Intern',
    desc: 'STEMAway intern cross-collaborated on a machine learning project and led the disease classification for genes related to breast cancer.',
    className: 'md:col-span-2',
    thumbnail: '/exp2.svg',
  },
  {
    id: 3,
    title: 'Freelance App Dev Project',
    desc: 'Fellowship with Headstarter.AI; received feedback from engineers in Google, Y Combinator, Stanford, etc, developed 5 A.I project applications',
    className: 'md:col-span-2',
    thumbnail: '/exp3.svg',
  },
  {
    id: 4,
    title: 'Lead Frontend Developer',
    desc: 'Futura Sourcings - led the creation of the clothing sourcing feature/the dashboard for a startup in Bangladesh using Next.js, React, Framer Motion and Tailwind CSS.',
    className: 'md:col-span-2',
    thumbnail: '/exp4.svg',
  },
];