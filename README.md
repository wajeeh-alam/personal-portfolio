# DBZ Portfolio

An interactive Dragon Ball–inspired portfolio built with React, TypeScript, Vite, Framer Motion, and custom artwork.

## Features

- Seven-ball navigation between portfolio sections
- Responsive illustrated scene with Goku and the Flying Nimbus
- Animated Nimbus entrance and accessible controls
- Custom Dragon Ball star constellations

## Run locally

```bash
npm install
npm run dev
```

## Likes service

The portfolio's radar likes use Supabase. Apply `supabase/migrations/20261008_portfolio_likes.sql` to the linked project, then add these values to `.env.local` and restart Vite:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-or-anon-key
```

`VITE_SUPABASE_PUBLISHABLE_KEY` is also supported for newer Supabase projects. Do not put a service-role key in a Vite environment file.

## Available scripts

```bash
npm run build
npm run lint
npm run typecheck
```

Artwork used by the site is stored in `assets/`.
