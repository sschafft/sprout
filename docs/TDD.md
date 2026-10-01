# Technical design: scottschaffter.com rebuild (`sapling`)

Status: implemented on branch `sapling` · October 2026

## 1. Goals

1. Implement the Claude Design project (`Home`, `Project`, `About`, and the Pelicash mock) faithfully, using its copy.
2. Keep content and design separate, so copy and images can be edited as Markdown, YAML and image files without touching components.
3. Stay on Astro and Netlify.
4. Add PostHog web analytics.

Non-goals: a blog (the old `/writing/` section held theme sample posts and is redirected), a CMS, light mode (the design is dark only), and server-side features.

## 2. What was there before

Astro 4 with Tailwind 3, MDX, expressive-code, astro-icon, and both the Netlify and Vercel adapters, running in `output: 'server'` on Netlify edge middleware. Home page copy was hardcoded in `src/pages/index.astro`. It was a blog theme carrying a one-page portfolio.

Everything was removed except `LICENSE`, the favicons and the social card.

## 3. Decisions

### 3.1 Static output, no adapter

Every page is known at build time, so the site is prerendered to `dist/` and Netlify serves files. This drops the Netlify adapter, the edge middleware and the Vercel packages. There is no cold start, nothing to run, and the site would move to any static host unchanged.

Trade-off: anything dynamic later (a contact form, for example) needs a Netlify function or the adapter added back. That is a small, local change.

### 3.2 Astro 7

The site moves from Astro 4 to the current major. It brings the content layer (`src/content.config.ts` with loaders), responsive images for Markdown, and Sätteri, the new native Markdown processor. Node 22.12+ is required; Netlify is pinned to Node 24 in `netlify.toml`.

### 3.3 Content model

The design prototype keeps all copy in two JavaScript files, with tuples such as `['Client', 'CGAP']` and logic interleaved with text. That is quick to prototype and unpleasant to edit. The rebuild splits it by who edits what:

| File | Holds | Why this format |
| --- | --- | --- |
| `content/projects/*.md` | One case study each: facts in front matter, narrative in the body | Long prose reads and diffs best as Markdown. One file per project keeps edits isolated. |
| `content/pages/about.md` | The long About page | Same reason. |
| `content/home.yaml` | Headline, fact cards, experience, special thanks, About blurb | Short structured strings. YAML has less punctuation than JSON and allows comments. |
| `content/site.yaml` | Name, nav, footer links, group and tag labels | Shared by every page. |
| `content/people.yaml` | Extra chips, links and opt-outs for the People grid | See 3.5. |

Each file is an Astro content collection with a Zod schema. A missing field, an unknown `kind`, or a wrong image path fails the build with the file named. That is the main safety net for hand-edited content, and it is why YAML files are loaded as collections instead of imported directly.

Components contain no copy apart from a few interface labels ("Case study →", "Credits", "Previous / Next").

### 3.4 Case study bodies are plain Markdown

The design lays each section out as a numbered three-column row, with an image grid between sections. Two options were considered for getting that from Markdown:

- MDX with `<Section>` and `<Gallery>` components. Rejected: it puts markup back into the content and makes authors learn component syntax.
- Plain Markdown, with layout done in CSS. Chosen.

The Markdown renders as flat siblings (`h2`, `p`, `p`, …). In `global.css`, `.prose` is a three-column grid: headings sit in the left columns, paragraphs in the right, and a CSS counter numbers the sections. Authors write `## Heading` and text.

Captioned image grids need one small transform, `src/lib/markdown-gallery.mjs`: a paragraph containing only images becomes a `<div class="gallery">` of figures, with the alt text reused as the caption. It runs before Astro's image step, so gallery images are still optimised.

Trade-off: the plugin targets Sätteri's plugin API, which is new. It is 40 lines and isolated; if the API changes, that one file changes.

### 3.5 People are derived, with overrides

The prototype builds the People grid from project credits plus hand-kept lists. The rebuild keeps that idea and makes it explicit. In a project file, a credit is either `people: [...]` (individuals) or `note: ...` (an organisation or free text). Individuals appear in the grid automatically with a chip per project. `people.yaml` adds extra chips, personal links and `hidden: true`.

Crediting someone on a project is therefore a single edit. The prototype's approach of inferring "is this a person?" from the role name is replaced by the explicit `people` / `note` choice.

### 3.6 Sorting

The work list is ordered by group (the order groups appear in `site.yaml`), then most recently ended, then most recently started. `ongoing: true` ranks above finished work from the same year, and `priority` breaks exact ties. The result matches the prototype's order and numbering without hand-kept numbers, so adding a project renumbers the list by itself.

### 3.7 Styling: plain CSS with tokens

The prototype uses inline styles with about fifteen repeated values. Those became custom properties in `src/styles/global.css` (surfaces, text, accent, tag colours, radii, spacing). Shared patterns (section bar, cards, prose) are global classes; everything else is scoped `<style>` in its component.

Tailwind was dropped. With three page templates and a small token set, it would add a dependency and a config for little gain, and scoped CSS keeps each component readable next to its markup.

### 3.8 Fonts

IBM Plex Sans is self-hosted through `@fontsource` rather than loaded from Google Fonts: no third-party request, no layout dependency on another host. Inter and Newsreader are loaded only by the Pelicash mock, so only pages showing it pay for them.

### 3.9 Project previews

A project's tile and lead image come from its `hero` image, or from the built-in Pelicash `mock`. Projects with a live site use a static 1280×800 screenshot stored in `src/assets/work/<id>-site.png`.

Change from the prototype, which embedded each live site in a scaled-down `<iframe>`: nothing is embedded. Embeds loaded seven third-party pages on the home page, three of the sites refuse to be framed and showed browser error boxes, and any site could change or break the page at any time. Screenshots are fast, predictable and under the site's control.

Trade-off: a screenshot goes stale when the site changes and has to be retaken by hand.

The Pelicash mock is a fixed-size component scaled with CSS `zoom` by a 15-line script in `BaseLayout.astro`, replacing the prototype's hard-coded zoom factors so it holds at any width.

### 3.10 Images

Images live in `src/assets/work/` and go through `astro:assets`: resized, converted to WebP, given `srcset`, width and height. `image.layout: 'constrained'` applies the same to Markdown images. Sources are never upscaled.

Two hero images that the prototype hot-linked from Høst's CDN are now local files, so the site does not depend on that CDN.

### 3.11 JavaScript

No UI framework. Three small inline scripts: the work filter, the Pelicash tabs, and scaling the Pelicash mock. With JavaScript off, all projects are listed and all text is readable. Filtering is client-side because the full list is 15 rows; separate filtered pages would add routes for no benefit.

Routing changed from the prototype's `Project.dc.html?p=id` to real pages at `/work/<id>/`, which gives each case study its own URL, title, description and sitemap entry.

### 3.12 Analytics

`src/components/Analytics.astro` initialises `posthog-js` (US cloud) when `PUBLIC_POSTHOG_KEY` is present at build time, and renders nothing otherwise.

- The key is set in `netlify.toml` under `context.production` only. Deploy previews, branch deploys and local dev do not send data.
- The project token is committed. It is a public, write-only client key that ships in the page source regardless.
- The npm package is used rather than the pasted loader snippet: it is version-pinned, type-checked, and loaded with a dynamic import so it never blocks rendering.
- `person_profiles: 'identified_only'` keeps visitors anonymous; nobody signs in.

Trade-off: the library is served from the site's own bundle, so updates come with `npm update` rather than automatically.

### 3.13 Accessibility

Kept from the previous site's accessibility work and extended: a skip link, one `h1` per page, real `button`s with `aria-pressed` for filters and tabs, visible focus rings, `aria-hidden` and `inert` on decorative tiles, alt text on lead images, captions on gallery images, and reduced-motion respected.

### 3.14 Redirects

`/writing/about-me-detail/` goes to `/about/`; other `/writing/` URLs go to the home page (301s in `netlify.toml`).

## 4. Structure

```
src/
  content.config.ts        schemas: the contract for everything in content/
  content/                 words (Markdown and YAML)
  assets/work/             images
  styles/global.css        design tokens, shared patterns, prose layout
  layouts/BaseLayout.astro head, header, footer, analytics
  components/              Header, Footer, KindTag, ProjectPreview, PelicashMock, Analytics
  lib/content.ts           sorting, numbering, People derivation
  lib/markdown-gallery.mjs image paragraphs to captioned grids
  pages/                   index, work/[id], about, 404
```

## 5. Known gaps

- The Micronutrient Survey Toolkit case study has two captioned image slots in the prototype with no image supplied; they are omitted.
- The social card is the previous site's and does not match the new design.
- No automated tests. `npm run build` type-checks and validates all content; visual checks were manual.
