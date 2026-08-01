/**
 * Repository structure invariants.
 *
 * Everything asserted here is a fact about files on disk rather than about
 * rendered output, so the tests read the repository directly instead of
 * importing modules:
 *
 * - Each of the seven section component files opens with a block comment
 *   stating that component's purpose.
 * - Every `@keyframes` block in `src/index.css` animates `transform` and
 *   `opacity` only. The Framer half of the same rule lives in
 *   `src/motion/__tests__/variants.test.ts`.
 * - Fixed structure: the seven section files exist under their exact names,
 *   `vite.config.ts` pins `base: '/'` and `outDir: 'dist'`, `tsconfig.json`
 *   sets `strict: true`, the resume stub is committed, the README documents
 *   setup / token / placeholders / deployment, and no GitHub Pages or Actions
 *   deployment artifact is present.
 *
 * The repository root is derived from this file's own URL, not `process.cwd()`,
 * so the suite passes regardless of the directory Vitest is invoked from.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

/** `<root>/src/__tests__/structure.test.ts` → `<root>`. */
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

/** Read a repository-relative text file, dropping a leading BOM if present. */
function readText(relativePath: string): string {
  return readFileSync(resolve(ROOT, relativePath), 'utf8').replace(/^\uFEFF/, '');
}

/** The seven section component file names, in document order. */
const SECTION_FILES = [
  'Hero.tsx',
  'About.tsx',
  'Experience.tsx',
  'Projects.tsx',
  'Skills.tsx',
  'Awards.tsx',
  'Footer.tsx',
] as const;

const COMPONENTS_DIR = 'src/components';

// ---------------------------------------------------------------------------
// Section component documentation
// ---------------------------------------------------------------------------

/** The leading `/** ... *\/` comment of a source file, or `null` if absent. */
function leadingBlockComment(source: string): string | null {
  const text = source.replace(/^\s+/, '');
  if (!text.startsWith('/**')) return null;
  const end = text.indexOf('*/');
  if (end === -1) return null;
  return text.slice(0, end + 2);
}

describe('Property 24: Section component documentation', () => {
  it('Feature: dbz-pixel-portfolio, Property 24: Section component documentation', () => {
    fc.assert(
      fc.property(fc.constantFrom(...SECTION_FILES), (fileName) => {
        const source = readText(`${COMPONENTS_DIR}/${fileName}`);
        const comment = leadingBlockComment(source);

        // The file opens with a closed block comment...
        expect(comment, `${fileName} must open with a /** ... */ block comment`).not.toBeNull();
        const body = (comment as string).slice(3, -2);

        // ...that names the component it documents...
        const componentName = fileName.replace(/\.tsx$/, '');
        expect(body, `${fileName} header comment must name ${componentName}`).toContain(
          componentName,
        );

        // ...and states a purpose rather than sitting there as a stub.
        expect(body.trim().length).toBeGreaterThan(40);

        // Code follows the comment, so it documents a component, not a file
        // that was left empty.
        const afterComment = source.slice(source.indexOf('*/') + 2).trim();
        expect(afterComment.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Animation channel restriction (stylesheet half)
// ---------------------------------------------------------------------------

/** One parsed `@keyframes` block: its name and every property it declares. */
interface KeyframesBlock {
  readonly name: string;
  readonly properties: readonly string[];
}

/** Drop `/* ... *\/` comments so braces inside prose cannot skew the parse. */
function stripCssComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

/** Index of the `}` closing the `{` at `openIndex`, counting nested braces. */
function matchingBrace(source: string, openIndex: number): number {
  let depth = 0;
  for (let i = openIndex; i < source.length; i += 1) {
    const char = source[i];
    if (char === '{') depth += 1;
    else if (char === '}') {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  throw new Error(`Unbalanced braces in stylesheet at index ${openIndex}`);
}

/**
 * Property names declared inside a `@keyframes` body.
 *
 * The body holds keyframe selector blocks (`from { ... }`, `0%, 100% { ... }`),
 * so declarations sit one level down; deeper nesting is walked recursively.
 */
function declaredProperties(body: string): string[] {
  const properties: string[] = [];
  let cursor = 0;

  while (cursor < body.length) {
    const open = body.indexOf('{', cursor);
    if (open === -1) break;
    const close = matchingBrace(body, open);
    const inner = body.slice(open + 1, close);

    if (inner.includes('{')) {
      properties.push(...declaredProperties(inner));
    } else {
      for (const declaration of inner.split(';')) {
        const colon = declaration.indexOf(':');
        if (colon === -1) continue;
        const name = declaration.slice(0, colon).trim().toLowerCase();
        if (name.length > 0) properties.push(name);
      }
    }

    cursor = close + 1;
  }

  return properties;
}

/** Every `@keyframes` block in a stylesheet. */
function parseKeyframes(css: string): KeyframesBlock[] {
  const source = stripCssComments(css);
  const header = /@keyframes\s+([A-Za-z_][\w-]*)\s*\{/g;
  const blocks: KeyframesBlock[] = [];

  let match = header.exec(source);
  while (match !== null) {
    const name = match[1] as string;
    const open = source.indexOf('{', match.index);
    const close = matchingBrace(source, open);
    blocks.push({ name, properties: declaredProperties(source.slice(open + 1, close)) });
    header.lastIndex = close + 1;
    match = header.exec(source);
  }

  return blocks;
}

/** The only channels a continuous animation may touch. */
const COMPOSITED_CHANNELS = new Set(['transform', 'opacity']);

const KEYFRAMES = parseKeyframes(readText('src/index.css'));

describe('Property 15: Animation channel restriction (stylesheet)', () => {
  it('parses the stylesheet keyframes', () => {
    // A parser that silently found nothing would make the property vacuous.
    expect(KEYFRAMES.length).toBeGreaterThan(0);
    expect(KEYFRAMES.map((block) => block.name)).toEqual(
      expect.arrayContaining(['sparkle-drift', 'sparkle-twinkle', 'orb-pulse']),
    );
  });

  it('Feature: dbz-pixel-portfolio, Property 15: Animation channel restriction', () => {
    fc.assert(
      fc.property(fc.constantFrom(...KEYFRAMES), (block) => {
        // Every block animates something...
        expect(block.properties.length, `@keyframes ${block.name} declares nothing`).toBeGreaterThan(
          0,
        );

        // ...and only ever `transform` or `opacity`.
        const offenders = block.properties.filter((name) => !COMPOSITED_CHANNELS.has(name));
        expect(offenders, `@keyframes ${block.name} animates off-compositor properties`).toEqual([]);
      }),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Fixed repository structure
// ---------------------------------------------------------------------------

describe('section component files (Req 18.1)', () => {
  it('holds the seven sections under their exact names', () => {
    const present = readdirSync(resolve(ROOT, COMPONENTS_DIR));
    for (const fileName of SECTION_FILES) {
      expect(present, `${COMPONENTS_DIR}/${fileName} is missing`).toContain(fileName);
    }
  });
});

describe('build configuration (Req 11.1, 11.2, 18.5)', () => {
  const viteConfig = readText('vite.config.ts');

  it("sets Vite base to '/'", () => {
    expect(viteConfig).toMatch(/base:\s*'\/'/);
  });

  it("emits the static build into 'dist'", () => {
    expect(viteConfig).toMatch(/outDir:\s*'dist'/);
  });

  it('compiles the app sources in strict mode', () => {
    // tsconfig.json carries comments, so it is matched as text, not parsed.
    expect(readText('tsconfig.json')).toMatch(/"strict"\s*:\s*true/);
  });
});

describe('placeholder assets (Req 10.1)', () => {
  it('commits a non-empty resume stub at public/resume.pdf', () => {
    const resume = resolve(ROOT, 'public', 'resume.pdf');
    expect(existsSync(resume)).toBe(true);
    expect(statSync(resume).size).toBeGreaterThan(0);
  });
});

describe('README documentation (Req 10.2)', () => {
  const readme = readText('README.md');

  /** Body of the `## ` section whose heading matches `pattern`. */
  function section(pattern: RegExp): string {
    const parts = readme.split(/^## /m);
    const found = parts.find((part) => pattern.test(part.split('\n')[0] ?? ''));
    expect(found, `README has no '## ' section matching ${pattern}`).toBeDefined();
    return found as string;
  }

  it('documents local setup with install, dev, and build commands', () => {
    const setup = section(/^Local setup$/);
    expect(setup).toContain('npm ci');
    expect(setup).toContain('npm run dev');
    expect(setup).toContain('npm run build');
  });

  it('documents the optional GITHUB_TOKEN and its effect', () => {
    const token = section(/GITHUB_TOKEN/);
    expect(token).toContain('optional');
    expect(token).toContain('60 requests per hour');
    expect(token).toContain('scripts/fetch-github.ts');
  });

  it('names the two values that must be replaced', () => {
    const placeholders = section(/^Placeholders$/);
    expect(placeholders).toContain('public/resume.pdf');
    expect(placeholders).toContain('wajeeh.placeholder@example.com');
  });

  it('documents the Vercel import steps and build settings', () => {
    const deployment = section(/^Deployment \(Vercel\)$/);
    expect(deployment).toMatch(/import this Git repository/i);
    expect(deployment).toContain('npm run build');
    expect(deployment).toContain('dist');
  });
});

describe('deployment artifact exclusions (Req 11.3, 11.4)', () => {
  it('ships no GitHub Actions deployment workflow', () => {
    const workflows = resolve(ROOT, '.github', 'workflows');
    const files = existsSync(workflows)
      ? readdirSync(workflows).filter((name) => /\.ya?ml$/i.test(name))
      : [];
    expect(files, 'Vercel is the only deployment target').toEqual([]);
  });

  it('ships no GitHub Pages SPA redirect shim', () => {
    expect(existsSync(resolve(ROOT, 'public', '404.html'))).toBe(false);
  });
});
