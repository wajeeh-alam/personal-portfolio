# dbz-pixel-portfolio

Single-page pixel-art portfolio for Wajeeh Alam. React 18 + Vite + Tailwind CSS + Framer Motion, TypeScript in strict mode, tested with Vitest and fast-check.

The page is one scrolling stage: hero, about, skills, projects, experience, awards, footer. All art is inline SVG and CSS — no image assets. Every animation is limited to `transform` and `opacity`, and each one has a reduced-motion variant honoring `prefers-reduced-motion`.

The Projects grid is built from four curated entries that always render, enriched at build time with live GitHub metadata (stars, language, repo URL).

## Local setup

```bash
npm ci        # install exact dependency versions from package-lock.json
npm run dev   # fetch project data, then start the Vite dev server
npm run build # fetch project data, typecheck, then emit dist/
```

Requires Node 20 or newer (the fetch script uses native `fetch` and `AbortSignal.timeout`).

Other scripts:

| Script | What it does |
| --- | --- |
| `npm run data` | Runs `scripts/fetch-github.ts` and regenerates `src/data/generated/projects.generated.ts` |
| `npm run typecheck` | `tsc --noEmit` under strict mode |
| `npm test` | Vitest single run, including the property tests |
| `npm run preview` | Serves the built `dist/` locally |

`dev`, `build`, `typecheck`, and `test` all run `npm run data` first, because the generated project module is gitignored and must exist before anything typechecks the full source tree.

## Project data and `GITHUB_TOKEN`

`scripts/fetch-github.ts` reads the public repositories for `Mr-W-Squidward` and writes `src/data/generated/projects.generated.ts`.

`GITHUB_TOKEN` is **optional**. Copy `.env.example` to `.env` and set it to raise the API rate limit:

- **With a token** — the request is sent with an `Authorization: Bearer` header, which lifts the ceiling well above the unauthenticated limit. A fine-grained token with no scopes is enough; only public data is read.
- **Without a token** — the script runs unauthenticated at **60 requests per hour** and logs a warning saying so.

The script never fails the build. If the request is rate-limited, times out, errors, or returns an unusable body, it logs a warning and emits the **curated fallback**: the four entries from `src/data/curatedProjects.ts` with no GitHub enrichment. `npm run build` still exits 0 and the site still renders a complete Projects section, so the build works offline.

Curated copy always wins. GitHub values only ever fill in `repoUrl`, `stars`, and `language` — never `name`, `description`, or `technologies`.

## Placeholders

Two values must be replaced before this site is shared:

| # | Value | Location | Action |
| --- | --- | --- | --- |
| 1 | Resume PDF | `public/resume.pdf` | A committed stub, not the real resume. Overwrite the file with the real PDF; the footer link to `/resume.pdf` needs no change. |
| 2 | `wajeeh.placeholder@example.com` | `src/data/links.ts` (`PLACEHOLDER_EMAIL`) | Replace with the real address, then delete `isPlaceholder` and `placeholderNote` from the `email` entry and drop "placeholder" from its `accessibleName`. While those fields are set, the footer renders a visible placeholder marker beside the link. |

### Values to confirm

Not a placeholder, but a best-effort reconstruction rather than a verified stack. Check this technology list in `src/data/curatedProjects.ts` against the repository:

- **drawOff** — `TypeScript`, `React`, `Node.js`, `Socket.IO`

### Provisional art: the mascot sprite

`src/components/art/MascotSprite.tsx` renders a deliberately crude blocky humanoid so the hero has correct geometry to lay out against. It is a stand-in for hand-designed art, not a finished sprite.

Swapping in the real sprite means editing two exported constants and nothing else:

1. **`SPRITE_ROWS`** — the pixel grid, one string per pixel row. Every row must be the same length; that length becomes the sprite width and the row count becomes the height. A `.`, or any glyph missing from `PIXEL_FILL`, renders transparent. Replace the grid wholesale.
2. **`PIXEL_FILL`** — the glyph → fill legend. Add one entry per new color. Keep every value a token from `palette` in `src/theme/tokens.ts`, and draw the silhouette in `palette.outline`.

Everything below those constants stays as-is. The run-length renderer derives the `viewBox` from the grid and collapses each row into horizontal `<rect>` runs, so any grid size works. The accessibility contract is fixed and needs no change either: the root `<svg>` stays `aria-hidden="true"` and `focusable="false"` with no `<title>` or `<desc>`, so the decoration contributes no accessible name.

`validateSpriteRows` is exported for asserting the equal-row-length invariant, and a dev-only check throws at module load if it is violated.

## Deployment (Vercel)

Vercel is the only deployment target. There are no GitHub Actions workflows and no SPA redirect shim.

1. In the Vercel dashboard, choose **Add New → Project** and import this Git repository.
2. Framework preset: **Vite** (auto-detected).
3. Build command: `npm run build`
4. Output directory: `dist`
5. Install command: `npm ci` (the default).
6. Optionally add `GITHUB_TOKEN` under **Settings → Environment Variables** so production builds fetch GitHub metadata at the authenticated rate limit. Without it, builds still succeed on the curated fallback.
7. Deploy. Later pushes to the default branch redeploy automatically.

`base` is `/` in `vite.config.ts`, so the site must be served from a domain root, which is what Vercel does.
