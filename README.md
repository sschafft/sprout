# scottschaffter.com

Personal site for Scott Schaffter. Built with [Astro](https://astro.build), deployed on Netlify.

```sh
npm install
npm run dev       # http://localhost:4321
npm run build     # type-check, validate content, build to dist/
npm run preview   # serve the build
```

Needs Node 22.12 or newer.

## Editing the site

All words and images live in `src/content/` and `src/assets/`. You should not need to open a component to change copy.

| To change | Edit |
| --- | --- |
| Header links, footer links, group and tag labels | `src/content/site.yaml` |
| Home page headline, facts, experience, About blurb, special thanks | `src/content/home.yaml` |
| A case study, and its row in the work list | `src/content/projects/<id>.md` |
| The People grid (extra chips, links, who is hidden) | `src/content/people.yaml` |
| The long About page (the panda) | `src/content/pages/about.md` |
| Images | `src/assets/work/` |
| Colours, type, spacing | `src/styles/global.css` |

### Add a project

1. Copy an existing file in `src/content/projects/` and rename it. The filename is the URL: `tela.md` becomes `/work/tela/`.
2. Fill in the fields at the top. `group` and `kind` must match keys in `site.yaml`. `started`, `ended` and `ongoing` decide where it sorts.
3. Write the body. Each `## Heading` becomes a numbered section.

The preview tile shows the `hero` image. For a project with a live site, take a 1280×800 screenshot and use that; sites are never embedded.

### Add images to a case study

Put the file in `src/assets/work/` and reference it from the Markdown. Images on consecutive lines form a grid, and the alt text is shown as the caption:

```md
![Daily summary](../../assets/work/tela-summary.jpeg)
![Symptom data over time](../../assets/work/tela-data.jpeg)
```

Images are resized and converted to WebP at build time, so add the largest version you have.

### People

Anyone listed under `people:` in a project's credits appears in the People grid automatically. Use `people.yaml` to add extra chips (`also:`), a personal link (`href:`), or to keep someone out of the grid (`hidden: true`).

### If the build fails

Content is checked against the schemas in `src/content.config.ts`. The error names the file and the field, for example a `kind` that is not in `site.yaml` or an image path that does not exist.

## Analytics

PostHog loads only when `PUBLIC_POSTHOG_KEY` is set at build time. `netlify.toml` sets it for production deploys only, so local dev and deploy previews are not counted. To test locally, copy `.env.example` to `.env` and add the key.

## More

`docs/TDD.md` explains the architecture and why it is built this way.
